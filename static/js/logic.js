function init() {
    var eqQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    var platesQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
    // Perform a GET request to the query URLs
    d3.json(eqQueryUrl, function (eqData) {
        //console.log(eqData)
        d3.json(platesQueryUrl, function(plateData){
            //console.log(plateData);
            createFeatures(eqData.features, plateData.features);
        });
    });

}

function createFeatures(earthquakeData, plateData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}<br>Date: ${new Date(feature.properties.time)}`);

    };

    function chooseColor(mag){
        return mag > 90 ? '#FF0D0D' :
        mag > 70  ? '#FF4E11' :
        mag > 50  ? '#FF8E15' :
        mag > 30  ? '#FAB733' :
        mag > 10  ? '#ACB334' :
        mag > -10 ? '#69B34C' :
                    '#006B3E';
    }
    
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3, // multiplied by constant to uniformly increase size
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });

    var legend = L.control({ position: 'bottomright' })
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend')
      var limits = [-10, 10, 30, 50, 70, 90]
      var labels = []
  
      div.innerHTML = '<div class="label-title"><h3>Depth</h3></div>'
      // Add min & max
      div.innerHTML += '<div class="labels"><div class="min">' + limits[0] + '</div> \
              <div class="max">' + limits[limits.length - 1] + '+</div></div>'
  
      limits.forEach(function (limit, index) {
        labels.push('<li style="background-color: ' + chooseColor(limits[index]) + '"></li>')
      })
  
      div.innerHTML += '<ul>' + labels.join('') + '</ul>'
      return div
    }

    var plates = L.geoJSON(plateData, {
        color: "#f0e130",
        fillColor: "none",
        weight: 3,
        opacity: 0.65
    })

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, plates, legend);
}

function createMap(earthquakes, plates, legend) {

    // Define streetmap, darkmap and satellite layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "light-v10",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "satellite-streets-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": streetmap,
        "Dark Map": darkmap,
        "Satellite Map": satellitemap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        TectonicPlates: plates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //add legend to map
    legend.addTo(myMap);
};

window.addEventListener('DOMContentLoaded', init);