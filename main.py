from flask import Flask, render_template, request, redirect, flash, jsonify
from xarray import broadcast
from analyze import generate_data
from flask_session import Session

app = Flask(__name__)
app.secret_key = "diphMmlucEgfAqCzvnCkDnnShdajfCjtWLKsClfdRlSHjtnDme"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True

Session(app)

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


app.run(debug=True)