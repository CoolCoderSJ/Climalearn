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
        winter.append(float(str(model[ind].sel({"lat": lat, "lon": lon}, method="nearest").values)))
    
    for ind in sumQuery:
        summer.append(float(str(model[ind].sel({"lat": lat, "lon": lon}, method="nearest").values)))

    return summer, winter

tasmaxSummer, tasmaxWinter = generate_data(start, end, lat, lon, "tasmax")

print("TASMAX")
print(tasmaxSummer)
print(tasmaxWinter)
print("---")

tasminSummer, tasminWinter = generate_data(start, end, lat, lon, "tasmin")

print("TASMIN")
print(tasminSummer)
print(tasminWinter)
print("---")

prSummer, prWinter = generate_data(start, end, lat, lon, "pr")

print("PR")
print(prSummer)
print(prWinter)
print("---")