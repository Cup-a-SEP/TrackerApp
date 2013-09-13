/**
* Converts an human readable location to geo-coordinates
*/
function Geocode(address, callback)
{
	$.getJSON('http://maps.googleapis.com/maps/api/geocode/json',
	{
		address: address,
		sensor: true
	}, function(data)
	{
		if (data.results[0])
			callback(data.results[0].geometry.location);
	});
}

/**
* Converts geo-coordinates to an human readable location
*/
function Geodecode(latlng, callback)
{
	$.getJSON('http://maps.googleapis.com/maps/api/geocode/json',
	{
		latlng: latlng.lat + ',' + latlng.lng,
		sensor: true
	}, function(data)
	{
		if (data.results[0])
			callback(data.results[0].formatted_address);
	});
}