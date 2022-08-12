function setCookie(cname, cvalue, exdays = 999) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

window.onload = function () {
    let lat = getCookie("lat");
    let lon = getCookie("lon");
    let zip = getCookie("zip");
    
    if (!zip) {
        document.getElementById("currLoc").innerHTML = "You are currently viewing data for your <strong>current location</strong>";
    }
    else {
        document.getElementById("currLoc").innerHTML = "You are currently viewing data for the following zip code: <strong>" + zip + "</strong>";
    }

    if (lat && lon) {
        getData(lat, lon)
    }

    else {
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        setCookie("lat", lat);
        setCookie("lon", lon);
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
                setCookie("lat", lat);
                setCookie("lon", lon);
                setCookie("zip", result.value[1])
                document.getElementById("currLoc").innerHTML = "You are currently viewing data for the following zip code: <strong>" + result.value[1] + "</strong>";
                getData(lat, lon)
            }
        })
    });
}
}

function getData(lat, lon, apikey="") {
    axios.get(`/get_energy_data/${lat}/${lon}${apikey}`)
    .then((resp) => {
        if (resp.data.error) {
            Swal.fire({
                title: 'We were unable to make a request to the API, and might have hit our ratelimit for this hour. You can try again at the next hour, or get your own API key.',
                text: "How can you get your own API key? Visit https://www.co2signal.com/, and sign up for a free api key. After you confirm your email, an api key will be sent to yuor email. Copy that api key and paste it below. ",
                icon: 'error',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Enter',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    let apikey = result.value
                    getData(lat, lon, "/"+apikey)
                }
            })
        }

        let respData = resp.data.data
        let co2 = Math.round(respData.carbonIntensity)
        let fossilfuel = Math.round(respData.fossilFuelPercentage)
        document.getElementById("carbonIntensity").innerHTML = `The carbon intensity for your energy grid is <strong>${co2} gCO2eq/kwh</strong>, which means it took about <strong>${co2} grams of carbon dioxide to make 1 killowatt-hour of electricity.</strong>`;
        document.getElementById("fossilFuel").innerHTML = `The fossil fuel percentage for your energy grid is <strong>${fossilfuel}%</strong>, which means about <strong>${fossilfuel}% of the energy produced was from fossil fuels.</strong>`;
        document.getElementById("spinner").setAttribute("style", "display: none;");
        document.getElementById("display").setAttribute("style", "display: block;");
    
    })
}


function changeLoc() {
    document.getElementById("spinner").setAttribute("style", "display: block;");
    document.getElementById("display").setAttribute("style", "display: none;");

    const swalWithBulmaBtns = Swal.mixin({
        customClass: {
          confirmButton: 'button is-primary',
          cancelButton: 'button is-link'
        },
        buttonsStyling: false
      })
      
      swalWithBulmaBtns.fire({
        title: 'Change Location',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Use current location',
        cancelButtonText: 'Enter zip code',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
            navigator.geolocation.getCurrentPosition((position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                setCookie("lat", lat);
                setCookie("lon", lon);
                setCookie("zip", "");
                document.getElementById("currLoc").innerHTML = "You are currently viewing data for your <strong>current location</strong>";
                getData(lat, lon);
        
            }, (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'We could not access your location.',
                })
            })

        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
            Swal.fire({
                title: 'Enter ZIP code:',
                icon: 'question',
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
                    setCookie("lat", lat);
                    setCookie("lon", lon);
                    setCookie("zip", result.value[1])
                    let zip = getCookie("zip")
                    document.getElementById("currLoc").innerHTML = "You are currently viewing data for the following zip code: <strong>" + zip + "</strong>";
                    getData(lat, lon)
                }
            })
        }
      })
}

window.changeLoc = changeLoc
