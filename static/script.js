let data;
let dataList;
let chartData;
let chartId = 0;
const ctx = document.getElementById("chart");
let chartText = document.getElementById("text");
let chartSubtext = document.getElementById("subtext");
let prevBtn = document.getElementById("prevbtn");
let nextBtn = document.getElementById("nextbtn");

window.onload = function () {
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        axios.get(`/getData?lat=${lat}&lon=${lon}`)
        .then(function (response) {
            data = response.data;
            document.getElementById("spinner").setAttribute("style", "display: none;");
            document.getElementById("display").setAttribute("style", "display: block;");
            dataList = [
                {measure: "Max Temperature", unit: "Fahrenheit", month: "January", label: data.tasmax.winLabels, data: data.tasmax.winter}, 
                {measure: "Max Temperature", unit: "Fahrenheit", month: "July", label: data.tasmax.sumLabels, data: data.tasmax.summer}, 
                {measure: "Min Temperature", unit: "Fahrenheit", month: "January", label: data.tasmin.winLabels, data: data.tasmin.winter}, 
                {measure: "Min Temperature", unit: "Fahrenheit", month: "July", label: data.tasmin.sumLabels, data: data.tasmin.summer}, 
                {measure: "Precipitation Amount", unit: "mm per day", month: "January", label: data.pr.winLabels, data: data.pr.winter}, 
                {measure: "Precipitation Amount", unit: "mm per day", month: "July", label: data.pr.sumLabels, data: data.pr.summer}
            ];
            loadCharts();
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


function loadCharts(whereToStart="nochange") {

    if (chartData) chartData.destroy();

    if (whereToStart == "add") {
        chartId++;
    }
    if (whereToStart == "subtract") {
        chartId--;
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
    
    let unitToWrite = dataList[chartId].measure == "Precipitation Amount" ? "mm per day" : "°F"
    let lastVal = dataList[chartId].data[dataList[chartId].data.length-1]
    let measure = dataList[chartId].measure.toLowerCase()
    let comparison = dataList[chartId].data[0] > dataList[chartId].data[dataList[chartId].data.length-1] ? "will drop" : "will rise"

    let text = `The average <strong>${measure}</strong> during ${dataList[chartId].month} <strong>${comparison}</strong> from ${dataList[chartId].data[0]}${unitToWrite} to an average of <strong>${lastVal}${unitToWrite}</strong> by 2099.`
    chartText.innerHTML = text;

    let part1
    let comparison2 = comparison == "will rise" ? "hotter" : "colder"
    let rainComparison = comparison == "will rise" ? "more" : "less"

    if (dataList[chartId].measure == "Precipitation Amount") {
        part1 = " will rain "+rainComparison
    }
    else if (dataList[chartId].measure == "Max Temperature") {
        part1 = "'s peak will be "+comparison2
    }
    else if (dataList[chartId].measure == "Min Temperature") {
        part1 = " will end "+comparison2
    }

    let subtext = `This means that on average, each day${part1}.`
    chartSubtext.innerHTML = subtext

    for (let i=0; i<6; i++) {
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

window.loadCharts = loadCharts
