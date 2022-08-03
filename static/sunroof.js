window.onload = function() {
    Swal.fire({
        title: 'Sunroof Data',
        text: 'Enter ZIP Code',
        input: 'text',
        icon: 'info',
        showCancelButton: false,
        confirmButtonText: 'Enter',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputAttributes: {
            autocapitalize: 'off'
        },
        preConfirm: (zip) => {
            return fetch(`/solutions/sunroof/data/${zip}`)
                .then(response => response.json())
                .then(jsonResp => {
                    console.log(jsonResp)

                    if (jsonResp['error']) {
                        throw new Error("Project Sunroof currently does not have any data for that zip code.")
                    }
                    return jsonResp;
                })
                .catch(error => {
                    Swal.showValidationMessage(
                        `Request failed: ${error}`
                    )
                })
        },
    }).then((result) => {
        if (result.isConfirmed) {
            let dataContainer = document.getElementById('data');
            let carbonOffset = document.getElementById("carbonOffset");
            let yearlykwh = document.getElementById("yearlykwh");

            carbonOffset.innerHTML = `If every roof that falls under this ZIP code was fully covered by solar panels, the amount of carbon dioxide emitted in the air would be <strong>${result.value.carbon_offset} metric tons less</strong>. Solar panels are a renewable, longer-lasting way to generate electricity for your home. Consider installing solar panels in your home to reduce your carbon footprint, as well as save money.`;
            yearlykwh.innerHTML = `Each year, the area covered by this ZIP code receives <strong>${result.value.yearly_sunlight_kwh} kilowatt hours</strong> of electricity. On average, this could distribute about <strong>${result.value.kwh_per_panel} kilowatt hours of electricity per solar panel per year</strong>. On average, a household uses 10, 715 kilowatt hours of electricity per year. (<a href="https://www.eia.gov/tools/faqs/faq.php?id=97&t=3#:~:text=In%202020%2C%20the%20average%20annual,about%20893%20kWh%20per%20month." target="_blank">Source</a>)`;
            dataContainer.setAttribute('style', 'display: block');
        }
    })
}

function getFullSunroofData() {
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        window.open(`https://sunroof.withgoogle.com/building/${lat}/${lon}`)

    }, (error) => {
        Swal.fire({
            title: 'We were unable to get your location',
            text: "Your location is needed to view data for your house. Please allow access from your browser settings and try again.",
            icon: 'error',
            confirmButtonText: 'OK'
        })
    })
}

window.getFullSunroofData = getFullSunroofData;