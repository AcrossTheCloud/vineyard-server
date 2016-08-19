//map.js - JavaScript for vineyardapp web map

/**
*@file LeafletJS map to display data from cognicity server (vineyardapp.org)
*@copyright (c) Tomas Holderness & SMART Infrastructure Facility January 2014-2016
*@module map
*/

var vineyardapp = {
	// Default configuration
	config: {
		// The ID of the element which will become the map
		elementId: "map",
		// The start of the URL for the web server serving the map resources (CSS, JS, HTML)
		urlPrefix: '/',
		// The start of the URL to the API server
		serverUrlPrefix: 'https://localhost/api/',
	},
	// Useful status variables
	status: {
		lang: null,
		embedded: null
	}
};

vineyardapp.start = function() {
	// Fetch the map HTML include from the server
	vineyardapp.status.lang = $("html").attr('lang') ? $("html").attr('lang') : 'id';
	vineyardapp.loadedIncludes = new RSVP.Promise( function(resolve, reject) {
		$("#includes").load(
			vineyardapp.config.urlPrefix + 'map-include.html',
			function( response, status, xhr ) {
				if (status==='error') {
					reject(status);
				} else {
					resolve();
				}
			}
		);
	}).catch( function(e) {
		// TODO Handle error
	});


  vineyardapp.isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

	//Check user location and alter map view accordingly
	if (vineyardapp.isTouch){
        L_PREFER_CANVAS = true; //Leaflet canvas rendering
	}

	// Labels for the layers in the legend, localised in start()
	vineyardapp.layernames = {};

	vineyardapp.layernames.sensors = 'Smart Sensor';

	// Create timestamp control
	vineyardapp.timestamp = L.control({'position':'topright'});

	/**
		Toggle timestamp on map based on checkbox behaviour

		@param {Boolean} checkbox - true/false representation of checkbox state
	*/
	vineyardapp.toggle_timestamp = function(checkbox){

		if (checkbox === true){
			vineyardapp.timestamp.addTo(vineyardapp.map);
		} else {
			if (vineyardapp.timestamp._map){
				vineyardapp.map.removeControl(vineyardapp.timestamp);
			}
		}
	};

	// Create timestamp text
	vineyardapp.timestamp.onAdd = function(map){
		var time = String(new Date()).slice(4,21);
		this._div = L.DomUtil.create('div', 'info timestamp');
		this._div.innerHTML = time;
		return this._div;
	};

	// map legend
	vineyardapp.mapLegend = L.control({position:'bottomright'});

	vineyardapp.mapLegend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML += '<div id="legendbox"><div class="sublegend"><div><span class="div-icon-confirmed-legend glyphicon glyphicon-tint" aria-hidden="true" style="margin-left:1px;"></span>&nbsp;'+vineyardapp.layernames.confirmed+'</div><div><span class="div-icon-verified-legend glyphicon glyphicon-tint" aria-hidden="true" style="margin-right:1px;"></span>'+vineyardapp.layernames.verified+'</div><div id="sensorLegend"></div<</div></div>';
		return div;
	};

	//sensor legend
	vineyardapp.sensorLegend = '<div><span class="div-icon-sensor-legend glyphicon glyphicon-record" aria-hidden="true"></span>&nbsp;'+vineyardapp.layernames.sensors+'</div>';

	// Reports control
	vineyardapp.reportsControl = L.control({position:'bottomleft'});
	vineyardapp.reportsControl.onAdd = function(map) {
	  var div = L.DomUtil.create('div', 'leaflet-control');

	  var reportsLink = L.DomUtil.create('a', 'leaflet-control-reports-button', div);
	  //reportsLink.textContent = "<span class='badge'>4</span>";
	  reportsLink.setAttribute('data-toggle', 'modal');
	  reportsLink.setAttribute('href', '#reportsModal');

		vineyardapp.reportsBadge = L.DomUtil.create('span', 'badge progress-bar-danger', reportsLink);

	  return div;
	};

	vineyardapp.infoControl = L.control({position:'bottomleft'});

	vineyardapp.infoControl.onAdd = function(map) {
	  var div = L.DomUtil.create('div', 'leaflet-control');
	  var infoLink = L.DomUtil.create('a', 'leaflet-control-info-button', div);
	  infoLink.textContent = "Information";
	  infoLink.setAttribute('data-toggle', 'modal');
	  infoLink.setAttribute('href', '#infoModal');

	  return div;
	};

	vineyardapp.locationControl = L.control({position:'bottomleft'});

	vineyardapp.locationControl.onAdd = function(map){
		var div = L.DomUtil.create('div', 'leaflet-control');
		var locationLink = L.DomUtil.create('a', 'leaflet-control-location-button', div);
		locationLink.textContent = 'Current Location';
		locationLink.setAttribute('href', '#');
		locationLink.setAttribute('onclick', 'navigator.geolocation.getCurrentPosition(vineyardapp.setViewJakarta); return false;');

		return div;
	};

	//Initialise map
	vineyardapp.latlon = new L.LatLng(-32.80, 149.95); //Centre Jakarta
	vineyardapp.map = L.map(vineyardapp.config.elementId, {zoomControl:true}).setView(vineyardapp.latlon, 12); // Initialise map
	vineyardapp.map.attributionControl.setPrefix('');
	L.control.scale({'position':'bottomright', 'imperial':false, 'maxWidth':200}).addTo(vineyardapp.map);

	//Specify default image path for Leaflet
	L.Icon.Default.imagePath = vineyardapp.config.urlPrefix+'css/images/';


	// Add controls to map
	vineyardapp.infoControl.addTo(vineyardapp.map);
	vineyardapp.reportsControl.addTo(vineyardapp.map);
	vineyardapp.locationControl.addTo(vineyardapp.map);

	// Basemap - check for HD/Retina display
	// See: http://www.robertprice.co.uk/robblog/2011/05/detecting_retina_displays_from_javascript_and_css-shtml/
	vineyardapp.tileformat = '.png128';
	if (window.devicePixelRatio > 1) {
		vineyardapp.tileformat = '@2x.png128';
	}
	vineyardapp.base = L.tileLayer('https://api.mapbox.com/v4/vineyardapp.lcf40klb/{z}/{x}/{y}'+vineyardapp.tileformat+'?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpwbW9wMDd5ejJ6cDZvczI2OXZyaiJ9.E8Pnyb_mNsbbfkOAb_jG6w').addTo(vineyardapp.map);
	vineyardapp.markerMap = {}; //Reference list of markers stored outside of Leaflet

	/**
	Listen for map events and load required layers
	*/
	vineyardapp.map.on('overlayremove', function(event){
		if (event.layer == vineyardapp.sensors) {
			$('#sensorLegend').empty();
		}
	});

	vineyardapp.map.on('overlayadd', function(event){
		else if (event.layer == vineyardapp.sensors) {
			$('#sensorLegend').append(vineyardapp.sensorLegend);
		}
	});

	/**
		Ask popups to render using Twitter embedded tweets
	*/
	vineyardapp.map.on('popupopen', function(popup){

		if ( $('#tweet-container').length ){
				twttr.widgets.load($('.leaflet-popup-content'));
			}
		if ( $('#floodgauge-container').length ){
			if (popup.popup._source.feature.properties !== null){
					var properties = popup.popup._source.feature.properties;
					var ctx = $("#gaugeChart").get(0).getContext("2d");
					var data = {
						labels : [],
						datasets : [{
							label: "",
							backgroundColor: "rgba(151,187,205,0.2)",
							borderColor: "rgba(151,187,205,1)",
							pointBackgroundColor: "rgba(151,187,205,1)",
							pointBorderColor: "#fff",
	            pointRadius: 4,
							data: []
						}]
					};
					/*
					for (var i = 0; i < properties.observations.length; i++){
						data.labels.push(properties.observations[i].measuredatetime.slice(11,16));
						data.datasets[0].data.push(properties.observations[i].depth);
					}*/
				}
			}
	});

	if (vineyardapp.isTouch){
		vineyardapp.map.locate({setView:false});
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(vineyardapp.setViewJakarta);
		}
	}

	//Load reports
	vineyardapp.map.spin(true);
	vineyardapp.layerControl = L.control.layers({}, {}, {position: 'bottomleft'}).addTo(vineyardapp.map);
	vineyardapp.loadPrimaryLayers(vineyardapp.layerControl).then(vineyardapp.loadSecondaryLayers);
	vineyardapp.getREM(vineyardapp.loadREM);

	// Finally, add the legend
	vineyardapp.mapLegend.addTo(vineyardapp.map);
};

/**
	Format popup with an embedded tweet

	Keeping as may be useful for pop up data sheets on soil

	@param {object} feature - a GeoJSON feature representing a report

vineyardapp.tweetPopup = function(feature){
	var popup = '<div id="tweet-container" style="width:220px; height:auto; max-height:220px; overflow-y:scroll"><blockquote class="twitter-tweet" data-conversation="none"><a target="_blank"  href="'+feature.properties.url+'">'+feature.properties.text+'</a></blockquote></div>';
	if (feature.properties.status == 'verified'){
		popup = '<div style="padding:5px"><img src="'+vineyardapp.config.urlPrefix+'img/bpbd_dki.png" height="35px;"> @BPBDJakarta <i>Retweeted</i></div><div id="tweet-container" style="width:220px; height:auto; max-height:220px; overflow-y:scroll;"><blockquote class="twitter-tweet"><a target="_blank"  href="'+feature.properties.url+'">'+feature.properties.text+'</a></blockquote></div>';
	}
	return popup;
};

*/



/**
	Add a popup to the provided layer based on the provided feature's text property

	@param {object} feature - a GeoJSON feature
	@param {L.ILayer} layer - the layer to attach the popup to
*/
vineyardapp.markerPopup = function(feature, layer) {
	if (feature.properties) {
		vineyardapp.markerMap[feature.properties.pkey] = layer;
		// Render as tweet
		if (feature.properties.source == 'twitter'){
			layer.bindPopup(vineyardapp.tweetPopup(feature), {autoPanPadding:([0,140])});
		}
		// Render as Detik report
		else if (feature.properties.source == 'detik'){
			layer.bindPopup(vineyardapp.detikPopup(feature), {autoPanPadding:([0,60])});
		}

		// Render as Qlue
		else if (feature.properties.source == 'qlue'){
			layer.bindPopup(vineyardapp.qluePopup(feature), {autoPanPadding:([0,60])});
		}

		// Default to text rendering
		else {

			var message = "";
			if (feature.properties.title && feature.properties.title.length !== 0){
				message += feature.properties.title;
			}
			if (feature.properties.text && feature.properties.text.length !==0){
				message += '&#151'+feature.properties.text;
			}
			layer.bindPopup(message, {autoPanPadding:([0,60])});
		}
	}
};

/**
	Add a text popup to the provided layer

	@param {object} feature - a GeoJSON feature
	@param {L.ILayer} layer - the layer to attach the popup to
*/
vineyardapp.infrastructureMarkerPopup = function(feature, layer){
	if (feature.properties){
		layer.bindPopup(feature.properties.name);
	}
};


/**
	Format popup with a floodgauge report

	@param {object} feature - a GeoJSON feature representing a report
*/
vineyardapp.floodgaugePopoup = function(feature){

	var label = 'Water Level (cm)';
	if (document.documentElement.lang == 'in' || document.documentElement.lang == 'id'){
			label = 'Tinggi Muka Air (cm)';
	}
	var popup = '';
	if (feature.properties !== null){
		popup = '<div id="floodgauge-container" style="width:220px; height:220px; overflow-y:scroll"><div class="media" style="margin-top:0;"><img class="media-object pull-left" src="'+vineyardapp.config.urlPrefix+'img/dki_jayaraya.png" height="22"/><img class="media-object pull-left" src="'+vineyardapp.config.urlPrefix+'img/bpbd_dki.png" height="22"/><h4 style="font-size:18px; line-height:1.2;" class="media-heading pull-left">'+feature.properties.gaugenameid+'</h4></div>'+label+'&nbsp;&nbsp|&nbsp;&nbsp;<span style="color:black; background-color:'+vineyardapp.getSiagaLevelIconography(feature.properties.observations[feature.properties.observations.length-1].warninglevel).color+'">'+feature.properties.observations[feature.properties.observations.length-1].warningnameid+'</span><canvas id="gaugeChart" class="chart" width="210" height="180" style="margin-top:3px;"></canvas></div>';
	}
	else {
		popup = 'Data not available | Tidak ada data';
	}
	return popup;
};

/**
	Add a text popup to the floodgauge layer

	@param {object} feature - a GeoJSON feature
	@param {L.ILayer} layer - the layer to attach the popup to
*/
vineyardapp.floodgaugeMarker = function(feature, layer){
	if (feature.properties){
		layer.bindPopup(vineyardapp.floodgaugePopoup(feature),{autoPanPadding:([0,60])});
	}
};

/**
	Get TopoJSON representing flooding reports from the server

	@param {string} type - the type of report to get: `'confirmed'` or `'uncomfirmed'`
	@param {function} callback - a function to be called when data is finished loading

	Converts TopoJson to GeoJson using topojson
*/
vineyardapp.getReports = function(type) {
	return new RSVP.Promise(function(resolve, reject) {
		// Use live data
		jQuery.getJSON(vineyardapp.config.serverUrlPrefix + 'data/api/v2/reports/'+type+'?format=topojson', function(data) {
			if (data.features !== null){
				//Convert topojson back to geojson for Leaflet
				resolve(topojson.feature(data, data.objects.collection));
			} else {
				resolve(null);
			}
		});
	});
};

/**
	Get GeoJSON representing a single confirmed flooding report

	@param {integer} id - the unique id of the confirmed report to get

	For single point feature GeoJSON is smaller than TopoJSON
*/
vineyardapp.getReport = function(id) {
	return new RSVP.Promise(function(resolve, reject){
		jQuery.getJSON(vineyardapp.config.serverUrlPrefix + 'data/api/v2/reports/confirmed/'+id+'?format=geojson', function(data){
			if (data.features !== null){
				resolve(data);
			}
				else {
					resolve(null);
				}
		});
	});
};

/**
	Get GeoJSON representing current flooding
	@param {function} callback - a function to be called when data is finished loading
*/
vineyardapp.getREM = function(callback) {
	jQuery.getJSON( vineyardapp.config.remServerUrlPrefix + 'data/api/v2/rem/flooded?format=topojson&minimum_state=1', function(data){
		if (data.features !== null){
			callback(topojson.feature(data, data.objects.collection));
		}
		else {
			callback(null);
		}
	})
	.fail(function(){
		console.log('getREM(): Error fetching REM data');
	});
};

/**
	Load GeoJSON representing current flooding
	@param {object} data - geojson polygon representation of affected areas
*/
vineyardapp.loadREM = function(data){
	vineyardapp.floodheights = L.geoJson(data, {clickable: false, style:function(feature){
		switch (feature.properties.state) {
			case 4: return {fillColor:"#CC2A41",weight:1,color:"#CC2A41", opacity:0.8,fillOpacity: 0.8};
			case 3: return {fillColor:"#FF8300",weight:1,color:"#FF8300", opacity:0.8,fillOpacity: 0.8};
			case 2: return {fillColor:"#FFFF00",weight:1,color:"#FFFF00", opacity:0.8,fillOpacity: 0.8};
			case 1: return {fillColor:"#A0A9F7", weight:1,color:"#A0A9F7",opacity:0.8,fillOpacity: 0.8};
			default: return {color:"rgba(0,0,0,0)",weight:0,fillOpacity:0};
		}
	}}).addTo(vineyardapp.map).bringToBack();

	$('#legendbox').append(vineyardapp.heightsLegend);
	vineyardapp.layerControl.addOverlay(vineyardapp.floodheights, vineyardapp.layernames.floodheights.title);
};

/** Style confirmed reports
		@param {object} feature - geojson report feature
*/
vineyardapp.iconConfirmedReports = function(feature){
	//default confirmed style
	var myicon = L.divIcon({className: 'div-icon-confirmed', html:'<p><span class="glyphicon glyphicon-tint" aria-hidden="true"></span></p>', popupAnchor:[5,0]});
	//else return verified style
	if (feature.properties.status == 'verified'){
		myicon = L.divIcon({className: 'div-icon-verified', html:'<p><span class="glyphicon glyphicon-tint" aria-hidden="true"></span></p>', popupAnchor:[5,0]});
	}
	return (myicon);
};

/**
	Plots confirmed points on the map as circular markers
	@param {object} reports - a GeoJSON object containing report locations
*/
vineyardapp.loadConfirmedPoints = function(reports) {
	if (reports) {
		vineyardapp.loadTable(reports); //sneaky loadTable function.
		// badge reports button
		vineyardapp.reportsBadge.textContent = reports.features.length;

		// create points
		vineyardapp.confirmedPoints = L.geoJson(reports, {
			pointToLayer: function(feature, latlng) {
				var zIndexOffset = 0;
				if (feature.properties.status == 'verified') zIndexOffset = 1000;
				return  L.marker(latlng, {icon:vineyardapp.iconConfirmedReports(feature), zIndexOffset: zIndexOffset});
			},
			onEachFeature: vineyardapp.markerPopup
		});
  } else {
		vineyardapp.confirmedPoints = L.geoJson(null, {
			pointToLayer: function(feature, latlng) {
				var zIndexOffset = 0;
				if (feature.properties.status == 'verified') zIndexOffset = 1000;
				return  L.marker(latlng, {icon:vineyardapp.iconConfirmedReports(feature), zIndexOffset: zIndexOffset});
			},
			onEachFeature: vineyardapp.markerPopup
		});
	}

	return vineyardapp.confirmedPoints;
};

/**
	If a unique ID is specified in the URL, zoom to this point, getting specified point if need.
 	@param {object} report - a GeoJSON object contiaing report location and metadata
*/
vineyardapp.showURLReport = function() {
	//Test if URL parameter present
	if ($.url('?report')){
			//Check if Integer
			var id = parseInt($.url('?report'));
			var err;
			if ( !validation.validateNumberParameter(id,1) ) err = new Error( "'report id parameter is invalid" );
			if (err) {
				console.log(err);
				return;
			}
			//Zoom to object if exists
			if (vineyardapp.markerMap.hasOwnProperty(id)){
				vineyardapp.centreMapOnPopup(id);

			}

			else {
				//Else attempt to get from server
				var promise = vineyardapp.getReport(id);
				promise.then(function(data){
					vineyardapp.confirmedPoints.addData(data);
					vineyardapp.centreMapOnPopup(id);
					});
				}
			}
};

/**
	Plots hydrological infrastructure on map

	@param {string} layer - string - name of infrastructure layer to load
	@param {object} infrastructure - a GeoJSON object containing infrastructure features
*/

vineyardapp.loadInfrastructure = function(layer, infrastructure){
	if(infrastructure) {
		if (layer == 'waterways'){
			vineyardapp[layer] = L.geoJson(infrastructure, {style:vineyardapp.styleInfrastructure[layer]});
		} else if (layer == 'floodgauges'){
			vineyardapp[layer] = L.geoJson(infrastructure, {
				pointToLayer: function(feature, latlng) {
					return L.marker(latlng, {icon: L.icon(
						{
							iconUrl:vineyardapp.config.urlPrefix+'img/'+vineyardapp.getSiagaLevelIconography(feature.properties.observations[feature.properties.observations.length-1].warninglevel).icon,
							iconSize: [22,22],
							iconAnchor: [11, 11],
							popupAnchor: [0, 0]
						}
					)});
				}, onEachFeature: vineyardapp.floodgaugeMarker
			}).addTo(vineyardapp.map);
			$('#legendbox').append(vineyardapp.gaugesLegend);
		} else {
			vineyardapp[layer] = L.geoJson(infrastructure, {
				pointToLayer: function(feature, latlng) {
					return L.marker(latlng, {icon: vineyardapp.styleInfrastructure[layer]});
				}, onEachFeature: vineyardapp.infrastructureMarkerPopup
			});
		}
	} else {
			vineyardapp[layer] = L.geoJson();
	}

	return vineyardapp[layer];
};

/**
	Plots floodsensor data points on map

	@param {object} sensor data - a GeoJSON object containing sensor features
*/
vineyardapp.loadSensors = function(data){

	var icon = L.divIcon({className: 'div-icon-sensor', html:'<p><span class="glyphicon glyphicon-record" aria-hidden="true"></span></p>', popupAnchor:[5,0]});

	var labels = {
		id : {
			depth : 'Tinggi muka air (cm)',
			temp: 'Suhu udara (°C)',
			humid: 'Kelembaban (%)'
		},
		en : {
			depth : 'Water depth (cm)',
			temp: 'Air temperature (°C)',
			humid: 'Humidity (%)'
		}
	};

	vineyardapp.sensors = L.geoJson(data, {
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {icon:icon});
		},
		onEachFeature: function(feature, layer){
			layer.on('click', function(e){
				var properties = feature.properties;
				$('#sensorModal').modal('show').on('shown.bs.modal', function (event) {
					var ctx1 = $("#sensorChart1").get(0).getContext("2d");
					var ctx2 = $("#sensorChart2").get(0).getContext("2d");
					var depthData = {
						labels : [],
						datasets : [{
							label: labels[document.documentElement.lang].depth,
							backgroundColor: "rgba(151,187,205,0.2)",
							borderColor: "rgba(151,187,205,1)",
							pointBackgroundColor: "rgba(151,187,205,1)",
							pointBorderColor: "#fff",
	            pointRadius: 4,
							data: []
						}]
					};
					var metData = {
						labels : [],
						datasets : [{
							label: labels[document.documentElement.lang].temp,
							backgroundColor: "rgba(0,0,0,0)",
							borderColor: "rgba( 245, 176, 65 ,1)",
							pointBackgroundColor: "rgba( 245, 176, 65 ,1)",
							pointBorderColor: "#fff",
							pointRadius: 4,
							data: []
						}, {
							label: labels[document.documentElement.lang].humid,
							backgroundColor: "rgba(0,0,0,0)",
							borderColor: "rgba( 88, 214, 141 ,1)",
							pointBackgroundColor: "rgba( 88, 214, 141 ,1)",
							pointBorderColor: "#fff",
							pointRadius: 4,
							data: []
						}]
					};
					for (var i = 0; i < properties.measurements.length; i++){
						depthData.labels.push(properties.measurements[i].measurement_time.slice(11,16));
						depthData.datasets[0].data.push(properties.measurements[i].computed_depth);
						metData.labels.push(properties.measurements[i].measurement_time.slice(11,16));
						metData.datasets[0].data.push(properties.measurements[i].temperature);
						metData.datasets[1].data.push(properties.measurements[i].humidity);
					}
					var gaugeChart = new Chart(ctx1,
						{type: 'line',
						data:depthData,
						options: {
							bezierCurve:true,
							scaleLabel: "<%= ' ' + value%>",
							legend: {display:true}
							}
						});
					var metChart = new Chart(ctx2,
						{type: 'line',
						data:metData,
						options: {
							bezierCurve:true,
							scaleLabel: "<%= ' ' + value%>",
							legend: {display:true}
							}
						});
					});
				});
			}
	});

	return vineyardapp.sensors;
};



/**
	Centre the map on a given location and open a popup's text box.

	Turn on point layer if required.

	@param {string} pkey - the key of the marker to display
	@param {number} lat - latitude to center on
	@param {number} lon - longitude to center on
*/
vineyardapp.centreMapOnPopup = function(pkey,lat,lon) {
	if (vineyardapp.map.hasLayer(vineyardapp.confirmedPoints) === false){
		vineyardapp.confirmedPoints.addTo(vineyardapp.map).bringToFront();
	}

	var m = vineyardapp.markerMap[pkey];
	vineyardapp.map.setView(m._latlng, 17);
	m.openPopup();
};

/**
	Center the map on the user's location if they're in jakarta & add a pin to show location
	See http://leafletjs.com/examples/mobile.html for reference implementation.

	@param {Position} position - the user's position as provided by client browser
*/
vineyardapp.setViewJakarta = function(position) {
	if (position.coords.latitude >= -6.4354 && position.coords.latitude <= -5.9029 &&
		  position.coords.longitude >= 106.5894 && position.coords.longitude <= 107.0782) {
				vineyardapp.map.setView(L.latLng(position.coords.latitude,position.coords.longitude), 17, {animate:true}); // Set to the users current view
				// Color the user location button as feedback
				$('.leaflet-control-location-button').css("background-image", "url("+vineyardapp.config.urlPrefix+"img/location-icon-blue.png)");
				$('.leaflet-retina .leaflet-control-location-button').css("background-image", "url("+vineyardapp.config.urlPrefix+"img/location-icon-2x-blue.png)");

				//Remove existing marker if present
				if (vineyardapp.bluedot){
					vineyardapp.map.removeLayer(vineyardapp.bluedot);
				}
				// Add new marker
				vineyardapp.bluedot = L.marker([position.coords.latitude,position.coords.longitude]);
				vineyardapp.bluedot.addTo(vineyardapp.map);
	}
};

vineyardapp.loadPrimaryLayers = function(layerControl) {
	var layerPromises = {
		sensors: vineyardapp.getSensors()
			.then(function(sensors){
				return vineyardapp.loadSensors(sensors);
			})
	return new RSVP.Promise(function(resolve, reject) {
		RSVP.hash(layerPromises).then(function(overlays) {
			layerControl.addBaseLayer(overlays.sensors, vineyardapp.layernames.sensors);
			overlays.sensors.addTo(vineyardapp.map);
			vineyardapp.map.spin(false);

			resolve(layerControl);
		}, reject);
	});
	};
};
