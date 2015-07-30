/** Thanks to commenthol/gdal2tiles-leaflet **/

jQuery(document).ready(function($) {

	var floors = new Array(15);

	$("#floor").on("change", function(){
	    floors[$(this).val()].bringToFront();
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
	        map.addLayer(floors[i]);
	    }

	floors[7].bringToFront();
});