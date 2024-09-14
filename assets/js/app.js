function URLToArray(url) {
    var request = {};
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        if(!pairs[i])
            continue;
        var pair = pairs[i].split('=');
        request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
     }
     return request;
}

function ArrayToURL(array) {
  var pairs = [];
  for (var key in array)
    if (array.hasOwnProperty(key))

      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(array[key]));
  return pairs.join('&');
}


var floors = new Array(15);
var active = 7;
var minZoom = 3,
		maxZoom = 7,
		img = [
			2048,
			2304
		];
		

		
var mapcenter = [-7.7788042,110.4036713];
var map = L.map('map', {
	zoomControl: false, 
	minZoom: minZoom,
	maxZoom: maxZoom
	});


// Zoom Control
var zoomControl = L.control.zoom({
  position: "bottomright"
});
zoomControl.addTo(map);

// Leaflet Draw
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    poly : {
      allowIntersection : false
    }
  },
  draw: {
    circle: false,
    circlemarker: false,
    polygon : {
      allowIntersection: false,
      showArea:true
    }
  }
});
map.addControl(drawControl);

rc = new L.RasterCoords(map, img);
	rc.setMaxBounds();

map.setView(rc.unproject([img[0] / 2, img[1] / 2]), 4);
var layerBounds = L.layerGroup([
	L.marker(rc.unproject([0, 0])).bindPopup('[0,0]'),
	L.marker(rc.unproject(img)).bindPopup(JSON.stringify(img))
]);
map.addLayer(layerBounds);

for(i=0; i < 16; ++i){
	floors[i] = 
	L.tileLayer('img/mapfloor-'+i+'/{z}/{x}/{y}.png', {
			noWrap: true
		});
}

map.addLayer(floors[7]);

// Truncate value based on number of decimals
var _round = function(num, len) {
  return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
};
// Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
var strLatLng = function(latlng) {
  return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
};

// Generate popup content based on layer type
// - Returns HTML string, or null if unknown object
var getPopupContent = function(layer) {
  // Marker - add lat/long
  if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
    return strLatLng(layer.getLatLng());
  // Circle - lat/long, radius
  } else if (layer instanceof L.Circle) {
    var center = layer.getLatLng(),
      radius = layer.getRadius();
    return "Center: "+strLatLng(center)+"<br />"
      +"Radius: "+_round(radius, 2)+" m";
  // Rectangle/Polygon - area
  } else if (layer instanceof L.Polygon) {
    var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
      area = L.GeometryUtil.geodesicArea(latlngs);
    return "Area: "+L.GeometryUtil.readableArea(area, true);
  // Polyline - distance
  } else if (layer instanceof L.Polyline) {
    var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
      distance = 0;
    if (latlngs.length < 2) {
      return "Distance: N/A";
    } else {
      for (var i = 0; i < latlngs.length-1; i++) {
        distance += latlngs[i].distanceTo(latlngs[i+1]);
      }
      if (_round(distance, 2) > 1000) {
        return "Distance: "+_round(distance, 2)/1000 + " km"; // kilometers
      } else {
        return "Distance: "+_round(distance, 2) + " m"; // meters
      }
    }
  }
  return null;
};

// Object created - bind popup to layer, add to feature group
map.on(L.Draw.Event.CREATED, function(event) {
  var layer = event.layer;
  var content = getPopupContent(layer);
  if (content !== null) {
    layer.bindPopup(content);
  }

  // Add info to feature properties
  feature = layer.feature = layer.feature || {};
  feature.type = feature.type || "Feature";
  var props = feature.properties = feature.properties || {}; // Intialize feature.properties
  props.info = content;
  drawnItems.addLayer(layer);
  console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

// Object(s) edited - update popups
map.on(L.Draw.Event.EDITED, function(event) {
  var layers = event.layers,
    content = null;
  layers.eachLayer(function(layer) {
    content = getPopupContent(layer);
    if (content !== null) {
      layer.setPopupContent(content);
    }

    // Update info to feature properties
    var layer = layer;
    feature = layer.feature = layer.feature || {};
    var props = feature.properties = feature.properties || {};
    props.info = content;
  });
  console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

// Object(s) deleted - update console log
map.on(L.Draw.Event.DELETED, function(event) {
  console.log(JSON.stringify(drawnItems.toGeoJSON()));
});

// Map Title
var title = new L.Control({position: 'bottomleft'});
title.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};
title.update = function () {
  this._div.innerHTML = 'Create some features<br>with drawing tools<br>then export to geojson file'
};
title.addTo(map);

// Export Button
var showExport = '<a href="#" onclick="geojsonExport()" title="Export to GeoJSON File" type="button" class="btn btn-danger btn-sm text-light"><i class="fa fa-file-code-o" aria-hidden="true"></i> Export</a>';

var showExportButton = new L.Control({position: "topright"});
showExportButton.onAdd = function (map) {
  this._div = L.DomUtil.create('div');
  this._div.innerHTML = showExport
  return this._div;
};
showExportButton.addTo(map);

var layerDropdown = '<label for="floor"> <span> Floor:</span></label> <select id="floor"> <option value="0">7</option>            <option value="1">6</option>            <option value="2">5</option>            <option value="3">4</option>            <option value="4">3</option>            <option value="5">2</option>            <option value="6">1</option>            <option value="7" selected>0</option>            <option value="8">-1</option>            <option value="9">-2</option>            <option value="10">-3</option>            <option value="11">-4</option>            <option value="12">-5</option>            <option value="13">-6</option>            <option value="14">-7</option>            <option value="15">-8</option>        </select>';
var showlayerDropdown = new L.Control({position: "topright"});

showlayerDropdown.onAdd = function (map) {
  this._div = L.DomUtil.create('div');
  this._div.innerHTML = layerDropdown
  return this._div;
};
showlayerDropdown.addTo(map);

$("#floor").on("change", function(){
	map.removeLayer(floors[active]);
	map.addLayer(floors[$(this).val()]);
	floors[$(this).val()].bringToFront();
	active = $(this).val();	 
});


// Export to GeoJSON File
function geojsonExport(){
  let nodata = '{"type":"FeatureCollection","features":[]}';
  let jsonData = (JSON.stringify(drawnItems.toGeoJSON()));
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonData);
  let datenow = new Date();
  let datenowstr = datenow.toLocaleDateString('en-GB');
  let exportFileDefaultName = 'export_draw_'+ datenowstr + '.geojson';
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  if (jsonData == nodata) {
    alert('No features are drawn');
  } else {
    linkElement.click();
  }
}