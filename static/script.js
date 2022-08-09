let data;
let dataList;
let chartData;
let chartId = 0;
let ctx
let chartText
let chartSubtext
let prevBtn
let nextBtn
let maxTempBtn
let minTempBtn
let precipBtn

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
    ctx = document.getElementById("chart");
    chartText = document.getElementById("text");
    chartSubtext = document.getElementById("subtext");
    prevBtn = document.getElementById("prevbtn");
    nextBtn = document.getElementById("nextbtn");
    maxTempBtn = document.getElementById("maxtemp");
    minTempBtn = document.getElementById("mintemp");
    precipBtn = document.getElementById("precip");

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
                getData(lat, lon)
            }
        })
    });
}
}

function getData(lat, lon) {
    axios.get(`/getData?lat=${lat}&lon=${lon}`)
        .then(function (response) {
            data = response.data;
            document.getElementById("spinner").setAttribute("style", "display: none;");
            document.getElementById("display").setAttribute("style", "display: block;");
            dataList = [
                { measure: "Max Temperature", unit: "Fahrenheit", month: "January", label: data.tasmax.winLabels, data: data.tasmax.winter },
                { measure: "Max Temperature", unit: "Fahrenheit", month: "July", label: data.tasmax.sumLabels, data: data.tasmax.summer },
                { measure: "Min Temperature", unit: "Fahrenheit", month: "January", label: data.tasmin.winLabels, data: data.tasmin.winter },
                { measure: "Min Temperature", unit: "Fahrenheit", month: "July", label: data.tasmin.sumLabels, data: data.tasmin.summer },
                { measure: "Precipitation Amount", unit: "mm per day", month: "January", label: data.pr.winLabels, data: data.pr.winter },
                { measure: "Precipitation Amount", unit: "mm per day", month: "July", label: data.pr.sumLabels, data: data.pr.summer }
            ];
            loadCharts();
        })
}


function loadCharts(whereToStart = "nochange") {

    if (chartData) chartData.destroy();

    if (whereToStart == "add") {
        chartId++;
    }
    if (whereToStart == "subtract") {
        chartId--;
    }

    if (whereToStart == "0") {
        chartId = 0
    }

    if (whereToStart == "2") {
        chartId = 2
    }

    if (whereToStart == "4") {
        chartId = 4
    }

    if (chartId != 0) {
        prevBtn.setAttribute("style", "display: block;");
    }
    else {
        prevBtn.setAttribute("style", "display: none;");
    }

    if (chartId != 5) {
        nextBtn.setAttribute("style", "display: block;");
    }
    else {
        nextBtn.setAttribute("style", "display: none;");
    }
    
    if (chartId == 0) {
        maxTempBtn.setAttribute("class", "button is-info");
        minTempBtn.setAttribute("class", "button is-info is-inverted");
        precipBtn.setAttribute("class", "button is-info is-inverted");
    }
    else if (chartId == 2) {
        maxTempBtn.setAttribute("class", "button is-info is-inverted");
        minTempBtn.setAttribute("class", "button is-info");
        precipBtn.setAttribute("class", "button is-info is-inverted");
    }
    else if (chartId == 4) {
        maxTempBtn.setAttribute("class", "button is-info is-inverted");
        minTempBtn.setAttribute("class", "button is-info is-inverted");
        precipBtn.setAttribute("class", "button is-info");
    }

    let unitToWrite = dataList[chartId].measure == "Precipitation Amount" ? "mm per day" : "°F"
    let lastVal = dataList[chartId].data[dataList[chartId].data.length - 1]
    let measure = dataList[chartId].measure.toLowerCase()
    let comparison = dataList[chartId].data[0] > dataList[chartId].data[dataList[chartId].data.length - 1] ? "is projected to drop" : "is projected to rise"

    let text = `The average <strong>${measure}</strong> during ${dataList[chartId].month} <strong>${comparison}</strong> from ${dataList[chartId].data[0]}${unitToWrite} to an average of <strong>${lastVal}${unitToWrite}</strong> by 2099.`
    chartText.innerHTML = text;

    let part1
    let comparison2 = comparison == "is projected to rise" ? "hotter" : "colder"
    let rainComparison = comparison == "is projected to rise" ? "more" : "less"

    if (dataList[chartId].measure == "Precipitation Amount") {
        part1 = " will rain " + rainComparison
    }
    else if (dataList[chartId].measure == "Max Temperature") {
        part1 = "'s peak will be " + comparison2
    }
    else if (dataList[chartId].measure == "Min Temperature") {
        part1 = " will end " + comparison2
    }

    let subtext = `This means that on average, each day${part1}.`
    chartSubtext.innerHTML = subtext

    for (let i = 0; i < 6; i++) {
        document.getElementById(`step${i}`).setAttribute("class", "steps-segment");
    }

    document.getElementById(`step${chartId}`).setAttribute("class", "steps-segment is-active");

    chartData = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataList[chartId].label,
            datasets: [{
                label: `Average ${dataList[chartId].measure} in ${dataList[chartId].unit} During ${dataList[chartId].month} From 2021 to 2099`,
                data: dataList[chartId].data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });

}

function changeLoc() {
    document.getElementById("spinner").setAttribute("style", "display: block;");
    document.getElementById("display").setAttribute("style", "display: none;");
    chartText.innerHTML = "";
    chartSubtext.innerHTML = "";
    chartId = 0;
    prevBtn.setAttribute("style", "display: none;");
    nextBtn.setAttribute("style", "display: block;");
    if (chartData) chartData.destroy();
    dataList = [
        { measure: "", unit: "", month: "", label: [], data: [] },
        { measure: "", unit: "", month: "", label: [], data: [] },
        { measure: "", unit: "", month: "", label: [], data: [] },
        { measure: "", unit: "", month: "", label: [], data: [] },
        { measure: "", unit: "", month: "", label: [], data: [] },
        { measure: "", unit: "", month: "", label: [], data: [] },
    ]

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

window.loadCharts = loadCharts
window.changeLoc = changeLoc
