var System = {};

/*
 * Returns the current time 
 */
System.getTime = function SystemGetTime()
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var dt = new Date();
	return pad(dt.getHours()) + ':' + pad(dt.getMinutes());
};

/*
 * Returns the current date 
 */
System.getDate = function SystemGetDate()
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var dt = new Date();
	return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
};

/*
 * Return the current location (deferred)
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
