var map = L.map('map').setView([-32.805, 149.95], 15);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpwbW9wMDd5ejJ6cDZvczI2OXZyaiJ9.E8Pnyb_mNsbbfkOAb_jG6w', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.satellite'
}).addTo(map);

function getColour(pedality) {
	switch(pedality) {
		case 'F/P': return "#ff0000";
		case 'F/P-a': return "#ffa500";
		case 'D/I': return "#ffff00";
	}
}

function depthToRadius(depth) {
	switch (true) {
		case depth <= 50:
			return 5;
		case depth <= 100:
			return 6;
		case depth <= 150:
			return 7;
		default:
			return 8;
	}
}

function onEachFeature(feature, layer) {
	var popupContent = "";
	if (feature.properties) {
		switch (feature.properties.texture) {
			case "SCL":
				popupContent += "Sandy Clay Loam";
				break;
			case "SL":
				popupContent += "Sandy Loam";
				break;
			case "SC":
					popupContent += "Sandy Clay";
					break;
			case "LSCL":
				popupContent += "Light Sandy Clay Loam";
				break;
			case "CL":
				popupContent += "Clay Loam";
				break;
			case "LC":
				popupContent += "Light Clay";
				break;
			case "LMC":
				popupContent += "Light Medium Clay";
				break;
			case "MC":
				popupContent += "Medium Clay";
				break;
			case "NIL":
				popupContent += "No soil type data";
		}
		popupContent += ", Depth: " + String(feature.properties.depth) + "cm";
	}

	layer.bindPopup(popupContent);
}

var soil_data = new L.GeoJSON.AJAX("/data/api/soil", {

	style: function (feature) {
		return feature.properties && feature.properties.style;
	},

	onEachFeature: onEachFeature,

	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, {
			radius: depthToRadius(feature.properties.depth),
			fillColor: getColour(feature.properties.pedality),
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		});
	}
}).addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		pedality_short = ['F/P', 'F/P-a', 'D/I']
		pedality = ['Friable/Permeable', 'Friable/Permeable but requires amelioration', 'Dense/Impermeable'];

		// loop through the status values and generate a label with a coloured square for each value
		for (var i = 0; i < pedality.length; i++) {
			div.innerHTML +=
					 '<i class="circle" style="background:' + getColour(pedality_short[i]) + '"></i> ' +
						(pedality[i] ? pedality[i] + '<br>' : '+');
		}
		return div;
};
legend.addTo(map);
