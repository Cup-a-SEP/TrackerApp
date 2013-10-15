/**
 * Route map page namespace
 * @namespace Page.Legmap 
 */
Page.Legmap = {};

/**
 * Initializes leg map page interface
 */
Page.Legmap.init = function PageLegmapInit()
{
	/**
	 * Coordinate System Projections, for ease of use
	 */
	var geometric = new OpenLayers.Projection("EPSG:4326");
	var mercator = new OpenLayers.Projection("EPSG:900913");
	
	/**
	 * Definition of the Style of a drawn Line 
	 */
	var lineStyle = {
		style: {
			strokeColor: "#ff0000",
			strokeWidth: 5
		}
	};
	
	/**
	 * Definitions for the Icon to be used by Markers 
	 */
	var size = new OpenLayers.Size(21,25);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var markerIcon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
	
	/**
	 * Creates a new Map object, with an OpenLayers Map, a new OSM Layer,
	 * and objects representing the used Projection.
	 * 
	 * @constructor
	 * @this {Map}
	 * @param {String} id The id of the HTML div element in which the map will be put
	 */
	function Map(id)
	{
		this.map = new OpenLayers.Map(id);
		this.layer = new OpenLayers.Layer.OSM();
		this.map.addLayer(this.layer);
		this.proj = {};
		this.proj.from = geometric;
		this.proj.to = this.map.getProjection();
	}
	
	/**
	 * Gets the Route Data and Leg Nr. from local storage and extracts the current Leg
	 * 
	 * @param {Integer} legNr The number of the leg to be shown
	 * @returns {String} the legGeometry of the Leg
	 */
	function getLegGeometry(legNr) {
		var string = localStorage['OTP data pending'];
		
		var data = $.evalJSON(string);
		
		return data.itineraries[0].legs[legNr].legGeometry.points;
	}
	
	/**
	 * Converts the given geometry string to a Feature Vector, which can immediately be
	 * imported in the Vector Layer of a Map
	 * 
	 * @param {String} geometry The legGeometry of the Leg
	 * @returns {[OpenLayers.Feature.Vector]} an array of Feature Vectors  
	 */
	function getFeatures(geometry) {
		var format = new OpenLayers.Format.EncodedPolyline();
		
		var feature = format.read(geometry);
		
		if(feature.constructor != Array) {
			feature = new Array(feature);
		}
		
		return feature;
	}
	
	/**
	 * Variables that are used over multiple methods:
	 * features: the list of Features, lines to be drawn
	 * map: the Map which is shown
	 * markerLayer: the layer to which markers are added
	 * vectorLayer: the layer to which lines are added
	 * bounds: the bounds in which all markers and lines are
	 */
	var featues;
	var map;
	var markerLayer;
	var vectorLayer;
	var bounds;
	
	/**
	 * Transforms all coordinates in the list of features to the projection of
	 * the map, assuming they are geometric coordinates 
	 */
	function transformFeatureCoordinates() {
		$.each(features, function(i, e) {
			e = e.geometry.transform(geometric, map.proj.to);
			//Expand the current bounds to include the feature
			if (!bounds) {
				bounds = e.getBounds();
			} else {
				bounds.extend(e.getBounds());
			}
		});
	}
	
	/**
	 * Initializes the features to contain the data of a single leg
	 */
	function showLeg(legNr) {
		var geometry = getLegGeometry(legNr);
		features = getFeatures(geometry);
		
		// Convert the Features points to coordinates used by the Map
		transformFeatureCoordinates();
	}
	
	/**
	 * Initializes the features to contain the data of the entire route 
	 */
	function showEntireRoute() {
		var string = localStorage['OTP data pending'];
		var data = $.evalJSON(string);
		features = new Array();
		
		$.each(data.itineraries[0].legs, function(i, e) {
			var feature = getFeatures(e.legGeometry.points);
			$.each(feature, function(i2, e2) {
				features.push(e2);
			});
		});
		
		transformFeatureCoordinates();
	}
	
	/**
	 * The initialization function of the page, which gets the leg info and geometry,
	 * creates a map and displays the leg on the map, after which it zooms to an appropriate
	 * level and pans to the appropriate location.
	 */
	$(function()
		{
			// Initialize the map and its layers
			map = new Map("mapDiv");
			vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", lineStyle);
			markerLayer = new OpenLayers.Layer.Markers("Marker Layer");
			
			map.map.addLayers([vectorLayer, markerLayer]);
			
			// Get the leg number, to see whether we should show the entire map
			// or just a single leg
			var legNr = localStorage['ShowMap'];
			
			if(legNr == -1) {
				showEntireRoute();
			} else {
				showLeg(legNr);
			}

			// Add the Features to the Map
			showRoute();
		}
	);
	
	/**
	 * Adds a marker to the map on the specified point
	 * 
	 * @param {Point} point The point to which the marker should be added 
	 */
	function addMarker(point) {
		markerLayer.addMarker(new OpenLayers.Marker(
			new OpenLayers.LonLat(point.x, point.y), 
			markerIcon.clone())
		);
	}
	
	/**
	 * Shows the specified features and for each feature a marker at the starting
	 * point and ending point 
	 */
	function showRoute() {
		vectorLayer.addFeatures(features);
		
		// Get the First point of the route
		var point1 = features[0].geometry.components[0];
		
		// Add the starting point as Marker
		addMarker(point1);
		
		// Add the last point of each feature as Marker
		$.each(features, function(i, e) {
			var l = e.geometry.components.length;
			addMarker(e.geometry.components[l-1]);
		});
		
		map.map.addLayers([vectorLayer, markerLayer]);
		
		// Zoom to exactly show the features
		map.map.zoomToExtent(bounds);
	}
};
