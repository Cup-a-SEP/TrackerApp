/**
 * Provides functions for resolving locations to geo-coordinates and back
 * @namespace Geo
 */
var Geo = {};

/**
 * Location to the lookup server
 * @attribute ServerPath
 * @readOnly
 * @type string
 */

//alternatively use google maps geocoding
Geo.ServerPath = 'http://bag42.nl/api/v0/geocode/json';
//Geo.ServerPath = 'http://maps.googleapis.com/maps/api/geocode/json';

/**
 * Callback for success in geo requests
 * @callback Geo~DoneCallback
 * @param {String} coords  - The received coordinates in "lat,long" format
 * @param {string} address - The received location name
 */

/**
 * Callback for failure in geo requests
 * @callback Geo~FailCallback
 * @param          errorCode    - An error identifier
 * @param {String} errorMessage - A human readable error message.
 */

/**
 * Converts an human readable location to geo-coordinates
 * @param {string} address - A human readable location designation
 * @return {object} jQuery deferred object
 */
Geo.code = function Geocode(address)
{
	var def = $.Deferred();
	
	$.getJSON(Geo.ServerPath,
	{
		address: address,
		sensor: true,
		region: 'nl'
	}).done(function(data)
	{
		if (data.status == 'OK')
		{
			data.results = Geo.filterType(Geo.matchCountry(data.results,'NL'), 'companyname');
			if (data.results.length < 1)
				def.reject('ZERO_RESULTS');
			else
			{
				var addresses = data.results[0].formatted_address;
				var loc = data.results[0].geometry.location;
				def.resolve(''+loc.lat+','+loc.lng, addresses);
			}
		}
		else
			def.reject(data.status);
	}).fail(function(jqxhr, textStatus, error)
	{
		def.reject(textStatus);
	});
	return def;
};

/**
 * Converts geo-coordinates to an human readable location
 * @param {string} latlng - A geo-location coordinate latitude,longitude
 * @return {object} jQuery deferred object
 */
Geo.decode = function Geodecode(latlng)
{
	var def = $.Deferred();
	
	$.getJSON(Geo.ServerPath,
	{
		latlng: latlng,
		sensor: true
	}).done(function(data)
	{
		if (data.status == 'OK')
		{
			var addresses = data.results[0].formatted_address;//data.results[0].address_components;
			//addresses = $.map(addresses, function(x) { return x.long_name; });
			var loc = data.results[0].geometry.location;
			def.resolve(''+loc.lat+','+loc.lng, addresses);
		}
		else
			def.reject(data.status);
	}).fail(function(jqxhr, textStatus, error)
	{
		def.reject(textStatus);
	});
	
	return def;
};

/**
 * Removes all unspecified countries from a Geocode results.
 * @param {object} results - Geocode results
 * @param {string} country - country code that should be kept in the results
 * @return {object} Geocode results (filtered by country)
 */
Geo.matchCountry = function(results, country)
{	
	return $.grep(results, function(x)
	{
		return $.map(x.address_components, function(y)
		{
			if ($.inArray('country',y.types) >= 0)
				return y.short_name;
		})[0] == country;
	});
};


/**
 * Removes all results in which types contains type.
 * @param {object} results - Geocode results
 * @param {string} type - type that should be removed from the results
 * @return {object} Geocode results (filtered by type)
 */
Geo.filterType = function(results, type)
{
	return $.grep(results, function(x)
	{
		return $.inArray(type,x.types) == -1;
	});
};