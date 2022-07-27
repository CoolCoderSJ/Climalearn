import matplotlib.pyplot as plt
import xarray as xr
import json

start = 2021
end = 2099
lat = ... #redacted for privacy
lon = ... #redacted for privacy

def generate_data(start, end, lat, lon, model):
    netCDFFiles = []
    for i in range(int((end-start+2)/5)):
        current_start = start + 5*i
        if i == int((end-start+2)/5-1):
            current_end = end
        else:
            current_end = start + (i+1)*5 - 1
    
        filename = f"{model}__{current_start}_{current_end}.nc"
        netCDFFiles.append(filename)
    
    winter = []
    summer = []

    winQuery = []
    sumQuery = []

    ds = xr.open_mfdataset(netCDFFiles, engine="netcdf4")
    model = ds[model]

    for j in range(len(model)):
        if 12*j <= len(model)-1:
            winQuery.append(12*j)

        if 6+12*j <= len(model)-1:
            sumQuery.append(6+12*j)

    for ind in winQuery:
        val = float(str(model[ind].sel({"lat": lat, "lon": lon}, method="nearest").values))
        fahrenheit = round((val - 273.15) * 9/5 + 32, 3)
        winter.append(fahrenheit)
    
    for ind in sumQuery:
        val = float(str(model[ind].sel({"lat": lat, "lon": lon}, method="nearest").values))
        fahrenheit = round((val - 273.15) * 9/5 + 32, 3)
        summer.append(fahrenheit)

    return summer, winter
