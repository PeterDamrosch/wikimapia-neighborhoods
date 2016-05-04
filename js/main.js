//////////////// MAP ////////////////

// Base layers
var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

// Initialize map

var map = new L.Map("map", {center: [31.95537, 35.9262], zoom: 13})
    .addLayer(CartoDB_DarkMatter);

// Baselayer control for map
var baseLayers = {
    "Carto Dark": CartoDB_DarkMatter,
    "Satellite": Esri_WorldImagery
};

// Toggle baselayers - Good tutorial that explains this on leafletjs.com
L.control.layers(baseLayers, null, {position: 'topleft'}).addTo(map);

// Create top part of the legend
var legendTitle = L.control({position: 'topright'});

legendTitle.onAdd =function(map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<div class="title"><b>Example Amman Neighborhoods<br/><small>Data from Wikimapia</div>';
    return div;
};

// Add Title Legend to Map
legendTitle.addTo(map);

// Empty global to hold neighborhood name
var neighborhoodName = "Example";

// Create Neighborhood Legend
var legendNeighborhood = L.control({position: 'topright'});

// Function that runs when Neighborhood Legend is added to map
legendNeighborhood.onAdd = function (map) {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<div class="title"><b>Neighborhood</b></div>';
    div.innerHTML += '<div class="title" id="name"><b>'+neighborhoodName+'</b></div>';

    // Return the Legend div containing the HTML content
    return div;
};

// Add Neighborhood Legend to Map
legendNeighborhood.addTo(map);

// Create marker
var marker = L.marker(new L.LatLng(31.95537,35.9262), {
    draggable: true
});
marker.addTo(map);

// Get coordinates on marker drag
marker.on('dragend', ondragend);
function ondragend() {
    var markerLocation = marker.getLatLng();
    console.log(markerLocation);
    showNeighborhood(markerLocation)
}

// Set initial coordinates call from ondragend
ondragend();

// Global for neighborhood and CartoDB info
var neighborhoodlocation = null;

// Display GeoJSON
function showNeighborhood(coordinates) {
    // Remove layer if it exists
    if(map.hasLayer(neighborhoodlocation)) {
        map.removeLayer(neighborhoodlocation)
    };

    // SQl Query
    var cartoDBUserName = "peterdamrosch";
    var sqlQueryClosest = "SELECT * FROM neighborhoodsapril27d ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+coordinates.lng+","+coordinates.lat+"), 4326) LIMIT 1";
    var sqlQueryIntersect = "SELECT * FROM neighborhoodsapril27d WHERE ST_Intersects(ST_SetSRID(ST_MakePoint("+coordinates.lng+","+coordinates.lat+"), 4326), the_geom)";

    // Get CartoDB neighborhood selection as GeoJSON and Add to Map. If no neighborhood exists, send a separate getJSON call using the Closest SQL. This can be refactored easily, just lazy now
    $.getJSON("https://"+cartoDBUserName+".cartodb.com/api/v2/sql?format=GeoJSON&q="+sqlQueryIntersect, function(data) {
        console.log(data);

        if (data.features.length > 0) {
            $("#name").html(data.features[0].properties.name);
            console.log(neighborhoodName);
            neighborhoodlocation = L.geoJson(data, {
                style: {
                    fillColor: "#00FFFF",
                    fillOpacity: 0.6,
                    color:"#00FFFF",
                    opacity: 1,
                    weight: 2
                }
            }).addTo(map);
        } else {
            $.getJSON("https://"+cartoDBUserName+".cartodb.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest, function(data2) {
                console.log(data2);
                data = data2;
                $("#name").html(data.features[0].properties.name);
                console.log(neighborhoodName);
                neighborhoodlocation = L.geoJson(data,{
                    style: {
                        fillColor: "#00FFFF",
                        fillOpacity: 0.6,
                        color: "#00FFFF",
                        opacity: 1,
                        weight: 2
                    }
                }).addTo(map);
            })
        }
    })
}


