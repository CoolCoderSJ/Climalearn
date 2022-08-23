from flask import Flask, render_template, request, jsonify, Response
from analyze import generate_data
import csv, requests, os

app = Flask(__name__)
app.secret_key = "diphMmlucEgfAqCzvnCkDnnShdajfCjtWLKsClfdRlSHjtnDme"

@app.route("/")
def intro():
    return render_template("intro.html")

@app.route("/sw.js")
def serve_sw():
    resp = Response(open("sw.js").read())
    resp.headers['Content-Type'] = 'text/javascript'
    return resp

@app.route("/home")
def home():
    return render_template("overview.html")

@app.route("/air")
def air():
    return render_template("air.html")

@app.route("/sealevel")
def sealevel():
    return render_template("sealevel.html")

@app.route("/drought")
def drought():
    return render_template("drought.html")

@app.route("/ocean")
def ocean():
    return render_template("ocean.html")

@app.route("/energy")
def energy_grid():
    return render_template("energy.html")

@app.route("/get_energy_data/<lat>/<lon>", defaults={"apikey": "rng6uxFGOv7Z99UQgkRthqhSZnTQ1lMg"})
@app.route("/get_energy_data/<lat>/<lon>/<apikey>")
def get_energy_data(lat, lon, apikey):
    r = requests.get(f"https://api.co2signal.com/v1/latest?lon={lon}&lat={lat}", headers={
        "auth-token": apikey
    })

    if r.status_code == 200:
        return r.json()
    else:
        return jsonify({"error": r.json()})

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
    for i in range(2099-2021+1):
        labels.append(str(2021+i))
    
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

@app.route("/solutions/transit")
def transit():
    return render_template("transit.html")

@app.route("/solutions/markets")
def markets():
    return render_template("markets.html")

@app.route("/solutions/markets/data/<lat>/<lon>")
def marketsData(lat, lon):
    r = requests.get(f"https://www.usdalocalfoodportal.com/api/get_searchresult_list/?mydata%5Bradius%5D=50&mydata%5Bdirectory%5D=farmersmarket&mydata%5Bx%5D={lon}&mydata%5By%5D={lat}", headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.77", 
        "accept": "text/html",
        })
    data = r.json()
    toReturn = []
    for elem in data['data']:
        data = {
            "image": f"https://www.usdalocalfoodportal.com/mywp/uploadimages/{elem['listing_image']}",
            "name": elem['listing_name'],
            "open": elem['brief_desc'].split("Open: ")[1].split("; <br>Available Products")[0],
            "produce": elem['brief_desc'].split("Available Products: ")[1].replace(";", ", "),
            "location": elem['location_address'],
            "location_url": f"https://www.google.com/maps/dir/Your+Location/{elem['location_address']}"
        }
        toReturn.append(data)
    
    return jsonify(toReturn)
    

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

app.run(debug=True, port=5003)