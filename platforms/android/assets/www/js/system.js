/**
 * Provides functions for device querying and manipulation
 * @namespace System 
 */
var System = {};

/**
 * Returns the current time
 * @return Current device time in hh:mm format 
 */
System.getTime = function SystemGetTime()
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var dt = new Date();
	return pad(dt.getHours()) + ':' + pad(dt.getMinutes());
};

/**
 * Returns the current date 
 * @return Current device date in yyyy-mm-dd format 
 */
System.getDate = function SystemGetDate()
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var dt = new Date();
	return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
};

/**
 * Return the current location (deferred)
 * @return {Deferred} jquery deferred object
 */
System.getLocation = function SystemGetLocation()
{
	var def = $.Deferred();
	
	navigator.geolocation.getCurrentPosition(function(position)
	{
		def.resolve(''+position.coords.latitude+','+position.coords.longitude);
	}, function(error)
	{
		def.reject(error.code, error.message);
	});
	
	return def;
};
