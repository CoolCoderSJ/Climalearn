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

@app.route("/solutions")
def solutions():
    pass


app.run()