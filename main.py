from flask import Flask, render_template, request, jsonify
from analyze import generate_data
import csv

app = Flask(__name__)
app.secret_key = "diphMmlucEgfAqCzvnCkDnnShdajfCjtWLKsClfdRlSHjtnDme"

@app.route("/")
def intro():
    return render_template("intro.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/getData")
def getData():
    args = request.args

    lat = args.get("lat")
    lon = str((180 + (180 + float(args.get("lon")))))
    
    returnData = {
        "tasmax": {
            "winter": [],
            "winLabels": [],
            "summer": [],
            "sumLabels": []
        },
        "tasmin": {
            "winter": [],
            "winLabels": [],
            "summer": [],
            "sumLabels": []
        },
        "pr": {
            "winter": [],
            "winLabels": [],
            "summer": [],
            "sumLabels": []
        }
    }

    labels = []
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for i in range(len(2099-2021+1)):
        labels.append(months[i]+" "+str(2021+i))
    
    returnData['tasmax']['winLabels'] = labels
    returnData['tasmin']['winLabels'] = labels
    returnData['pr']['winLabels'] = labels
    returnData['tasmax']['sumLabels'] = labels
    returnData['tasmin']['sumLabels'] = labels
    returnData['pr']['sumLabels'] = labels

    winter, summer = generate_data(2021, 2099, lat, lon, "tasmax")
    returnData['tasmax']['winter'] = winter
    returnData['tasmax']['summer'] = summer

    winter, summer = generate_data(2021, 2099, lat, lon, "tasmin")
    returnData['tasmin']['winter'] = winter
    returnData['tasmin']['summer'] = summer

    winter, summer = generate_data(2021, 2099, lat, lon, "pr")
    returnData['pr']['winter'] = winter
    returnData['pr']['summer'] = summer

    return jsonify(returnData)

@app.route("/solutions")
def solutions():
    return render_template("solutions.html")

@app.route("/solutions/sunroof")
def sunroof():
    return render_template("sunroof.html")

@app.route("/solutions/sunroof/data/<zipCode>")
def sunroofdata(zipCode):
    data = {}
    with open("project-sunroof-postal_code.csv", newline='', encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        i = 0
        for row in reader:
            i += 1
            if row['region_name'] == zipCode:
                data['yearly_sunlight_kwh'] = "{:,}".format(round(float(row['yearly_sunlight_kwh_total']), 3))
                data['carbon_offset'] = "{:,}".format(round(float(row['carbon_offset_metric_tons']), 3))
                data['kwh_per_panel'] = "{:,}".format(round(float(row['yearly_sunlight_kwh_total']) / float(row['number_of_panels_total']), 3))
                break
        
        print(i)
    
    if data == {}:
        return {"error": "No data found for that zip code"}
    else:
        return jsonify(data)

app.run(debug=True)