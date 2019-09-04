import pickle, json

filename = "crime.csv"

data = []

with open(filename, "r") as f:
    lines = f.readlines()
    for l in lines:
        data.append(l.strip().replace('"', "").split(","))

obj = {
    "type": "FeatureCollection",
    "features": []
}

for line in data[1:5000]:

    if line[0] != "2017340564":

        try:
            float(line[12])
        except:
            continue

        obj["features"].append({

            "id": line[0],
            "geometry": {
                "type": "Point",
                "coordinates": [float(line[12]), float(line[13])]
            },
            "properties": {
                "hood": line[16],
                "offense_id": line[2],
                "date": line[8]
            }

        })

with open("resultTruncated.geojson", "w") as fout:
    json.dump(obj, fout)
