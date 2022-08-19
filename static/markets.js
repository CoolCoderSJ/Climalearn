window.onload = function () {
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        getData(lat, lon);

    }, (error) => {
        Swal.fire({
            title: 'We were unable to get your location. Please input a zip code instead.',
            icon: 'error',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: false,
            confirmButtonText: 'Enter',
            showLoaderOnConfirm: true,
            preConfirm: (zip) => {
                return fetch(`https://public.opendatasoft.com/api/records/1.0/search/?dataset=georef-united-states-of-america-zc-point&q=${zip}&rows=1&exclude.stusps_code=PR`)
                    .then(response => response.json())
                    .then(jsonResp => {
                        console.log(jsonResp)

                        if (jsonResp['records'].length == 0) {
                            throw new Error("Zip code not found.")
                        }
                        if (jsonResp['records'][0]['fields']['zip_code'] != zip) {
                            throw new Error("Zip code not found.")
                        }

                        return [jsonResp['records'][0]['fields']['geo_point_2d'], zip];
                    })
                    .catch(error => {
                        Swal.showValidationMessage(
                            `Request failed: ${error}`
                        )
                    })
            },
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                let lat = result.value[0][0]
                let lon = result.value[0][1]
                getData(lat, lon)
            }
        })
    });
}

function getData(lat, lon) {
    axios.get(`/solutions/markets/data/${lat}/${lon}`)
        .then(function (response) {
            document.getElementById("spinner").setAttribute("style", "display: none;")
            let dataElem = document.getElementById("data")
            for (let i=0; i<response.data.length; i++) {
                let card = document.createElement("div")
                card.setAttribute("class", "card")

                let cardImage = document.createElement("div")
                cardImage.setAttribute("class", "card-image")
                
                let cardImageFigure = document.createElement("figure")
                cardImageFigure.setAttribute("class", "image is-4by3")

                let cardImageFigureImage = document.createElement("img")
                cardImageFigureImage.setAttribute("src", response.data[i]['image'])
                cardImageFigureImage.setAttribute("alt", "Placeholder image")

                cardImageFigure.appendChild(cardImageFigureImage)
                cardImage.appendChild(cardImageFigure)
                card.appendChild(cardImage)

                let cardContent = document.createElement("div")
                cardContent.setAttribute("class", "card-content")

                let cardContentMedia = document.createElement("div")
                cardContentMedia.setAttribute("class", "media")

                let cardContentMediaContent = document.createElement("div")
                cardContentMediaContent.setAttribute("class", "media-content")

                let cardContentMediaContentTitle = document.createElement("p")
                cardContentMediaContentTitle.setAttribute("class", "title is-4")
                cardContentMediaContentTitle.innerHTML = response.data[i]['name']

                cardContentMediaContent.appendChild(cardContentMediaContentTitle)
                cardContentMedia.appendChild(cardContentMediaContent)
                cardContent.appendChild(cardContentMedia)

                let cardContentContent = document.createElement("div")
                cardContentContent.setAttribute("class", "content")
                cardContentContent.innerHTML = `<strong>Open: </strong>${response.data[i].open}
                <br>
                <strong>Available Products: </strong>${response.data[i].produce}
                <br><br>
                <span><i class="fa-solid fa-location"></i> ${response.data[i].location}</span>`

                cardContent.appendChild(cardContentContent)
                card.appendChild(cardContent)

                let footer = document.createElement("footer")
                footer.setAttribute("class", "card-footer")
                footer.innerHTML = `<a class="button is-primary is-fullwidth m-4" href="${response.data[i].location_url}" target="blank">Get Directions To Market</a>`

                card.appendChild(footer)
                dataElem.appendChild(card)
            }
        })
    }