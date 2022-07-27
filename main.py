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
    lon = (180 + (180 + args.get("lon")))
    
    returnData = {
        "tasmax": {
            "winter": [],
            "summer": []
        },
        "tasmin": {
            "winter": [],
            "summer": []
        },
        "pr": {
            "winter": [],
            "summer": []
        }
    }

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
    pass


app.run()