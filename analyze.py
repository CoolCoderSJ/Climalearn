import xarray as xr
import json, time

now = time.time()

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
    dsmodel = ds[model]

    for j in range(len(dsmodel)):
        if 12*j <= len(dsmodel)-1:
            winQuery.append(12*j)

        if 6+12*j <= len(dsmodel)-1:
            sumQuery.append(6+12*j)

    for ind in winQuery:
        print(ind)
        val = float(str(dsmodel[ind].sel({"lat": lat, "lon": lon}, method="nearest").values))
        
        if model != "pr":
            fahrenheit = round(((val - 273.15) * 9/5 + 32), 3)
            winter.append(fahrenheit)
        else:
            val = round(val*86400, 3)
            winter.append(val)

    for ind in sumQuery:
        val = float(str(dsmodel[ind].sel({"lat": lat, "lon": lon}, method="nearest").values))

        if model != "pr":
            fahrenheit = round(((val - 273.15) * 9/5 + 32), 3)
            summer.append(fahrenheit)
        
        else:
            val = round(val*86400, 3)
            summer.append(val)
            

    return winter, summer
