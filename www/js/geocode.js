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
Geo.ServerPath = 'http://maps.googleapis.com/maps/api/geocode/json';

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
			data.results = Geo.filterCountry(data.results, 'NL');
			if (data.results.length < 1)
				def.reject('ZERO_RESULTS');
			else
			{
				var addresses = data.results[0].formatted_address;//data.results[0].address_components;
				//addresses = $.map(addresses, function(x) { return x.long_name; });
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
 * Removes all unspecified countries from a Geocode result.
 * @param {object} result - Geocode result
 * @param {string} country - country code that is should be left in the results
 * @return {object} Geocode result (filtered by country)
 */
Geo.filterCountry = function(result, country)
{
	return $.grep(result, function(x)
	{
		return $.map(x.address_components, function(y)
		{
			if ($.inArray('country',y.types) >= 0)
				return y.short_name;
		})[0] == country;
	});
};
