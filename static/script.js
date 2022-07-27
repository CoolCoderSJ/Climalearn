window.onload = function () {
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        axios.get(`/getData?lat=${lat}&lon=${lon}`)
        .then(function (response) {
            let data = response.data
            document.getElementById("spinner").setAttribute("style", "display: none;");

        })
        .catch(function (error) {
            console.error(error);
        });


    }, (error) => {
        Swal.fire({
            title: 'Error',
            text: 'We were unable to retrieve your location. Your location is used to get climate data for your area. If you blocked Climalearn from accessing your location, please go to your browser settings and enable the location permission. Then, reload this page.',
            icon: 'error',
            confirmButtonText: 'OK'
        })
    });
}