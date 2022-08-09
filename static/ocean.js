window.onload = () => {
    const ctx = document.getElementById("chart");
    let labels = []
    let data = []

    axios.get("/static/nasa_ecco.json").then(response => {
        let jsonResp = response.data
        for (const [key, value] of Object.entries(jsonResp)) {
            let jtd = key.split("T")[0]
            let date = new Date(jtd)
            labels.push(date.toLocaleDateString())
            data.push(value)
        }
    })
    .then(() => {
        chartData = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Heat Content in the Oceans from 1992 to 2019`,
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });
    })
}