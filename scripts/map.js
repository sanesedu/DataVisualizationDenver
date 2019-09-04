mapboxgl.accessToken = "xyz" //to be replaced by your access token

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-104.9, 39.742043],
    zoom: 11
});

let data;
let hoods;
let hoodCount = {};
let hoodNames = {};
let i = 0;

map.on("load", async () => {
    data = await fetch("../data/resultTruncated.geojson").then(res => res.json());
    hoods = await fetch("../data/statistical_neighborhoods.json").then(res => res.json());
    colorHoods = await fetch("../data/colorHoodList.json").then(res => res.json());

    setCount(hoods);

    map.addSource("hoods", {
        "type": "geojson",
        "data": hoods
    });

    map.addLayer({
        "id": "hoods",
        "source": "hoods",
        "type": "fill",
        "paint": {
            "fill-color": getColor(),
            "fill-outline-color": "black",
            "fill-opacity": 0.2
        }
    });

    map.addSource("crimes", {
        "type": "geojson",
        "data": data
    });

    map.addLayer({
        "id": "crimes",
        "source": "crimes",
        "type": "circle",
        "paint": {
            "circle-radius": {
                'base': 5,
                'stops': [[12, 5], [22, 200]]
            },

            "circle-color": colorHoods
        }
    });

    /* map.addLayer({
        id: "crimes",
        source: "crimes",
        type: "symbol",
        layout: {
            'icon-image': 'police-15',
            'icon-allow-overlap': true,
          },
    }); */

});

let x;
let y;

var popup = new mapboxgl.Popup();
var a;

function getColor(name){
    console.log(i);
    if(hoodCount[hoodNames[i]] < 150){
        i++;
        return 'grey';
    } else {
        i++;
        return 'red';
    }
}

function setCount(hoods){
    a = hoods;  
    for(let i = 0; i < hoods.features.length; i++){
        pol = hoods.features[i].geometry;
        name = hoods.features[i].properties.NBHD_NAME;
        n = turf.pointsWithinPolygon(data, pol).features.length;
        hoodCount[name] = n;
        hoodNames[i] = name;
        console.log(name + "  -  " + String(n));
    }
}

console.log(hoodCount)

function getCount(name, pol){
    let n;
    if(name in hoodCount){
        n = hoodCount[name];
        console.log("retrieved")
    } else {
        n = turf.pointsWithinPolygon(data, pol).features.length;
        hoodCount[name] = n;
        console.log("computed")
    }

    return n;
}

map.on('click', "hoods", (e) => {
    popup = new mapboxgl.Popup();
    if (typeof map.getLayer('selectedCrime') !== "undefined" ){         
        map.removeLayer('selectedCrime')
        map.removeSource('selectedCrime');   
    }
    var features = map.queryRenderedFeatures(e.point, { layers: ['hoods'] });

    if (!features.length) {
        return;
    }
    if (typeof map.getLayer('selectedHood') !== "undefined" ){         
        map.removeLayer('selectedHood')
        map.removeSource('selectedHood');   
    }
    var feature = features[0];
    a = features
    n = getCount(e.features[0].properties.NBHD_NAME, features[0].geometry);

    map.addSource('selectedHood', {
        "type": "geojson",
        "data": feature.toJSON()
    });
    map.addLayer({
        "id": "selectedHood",
        "source": "selectedHood",
        "type": "fill",
        "paint": {
            "fill-color": "blue",
            "fill-outline-color": "black",
            "fill-opacity": 0.5
        }
    });

    popup.setLngLat([e.lngLat.lng, e.lngLat.lat]).setHTML("<p>" + e.features[0].properties.NBHD_NAME+ " - " + n + "</p>").addTo(map)
});

map.on('click', "crimes", (e) => {
    var features = map.queryRenderedFeatures(e.point, { layers: ['crimes'] });
    if (!features.length) {
        return;
    }
    if (typeof map.getLayer('selectedCrime') !== "undefined" ){         
        map.removeLayer('selectedCrime')
        map.removeSource('selectedCrime');   
    }
    var feature = features[0];

    console.log(feature.toJSON());
    map.addSource('selectedCrime', {
        "type":"geojson",
        "data": feature.toJSON()
    });
    map.addLayer({
        "id": "selectedCrime",
        "source": "selectedCrime",
        "type": "circle",
        "paint": {
            "circle-radius": 20,
            "circle-color": "yellow"
        }
    });

    popup.setLngLat([e.lngLat.lng, e.lngLat.lat]).setHTML("<p>" + e.features[0].properties.offense_id+"</p>").addTo(map)
});








