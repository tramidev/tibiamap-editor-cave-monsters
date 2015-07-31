/** 
Thanks to commenthol/gdal2tiles-leaflet

URLToArray compliments of casablanca @ http://stackoverflow.com/a/4297832/340843 
**/

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

jQuery(document).ready(function($) {

	var floors = new Array(15);
	var active = 7;

	$("#floor").on("change", function(){
		map.removeLayer(floors[active]);
		map.addLayer(floors[$(this).val()]);
		floors[$(this).val()].bringToFront();
		active = $(this).val();	 
	});
		
	    var minZoom = 3,
	        maxZoom = 7,
	        img = [
	            2048,
	            2304
	        ];

	    map = L.map('map', {
	        minZoom: minZoom,
	        maxZoom: maxZoom
	    });



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
});