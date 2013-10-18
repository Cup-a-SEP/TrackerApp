var p = 0.02; //variable that holds the fraction for which the new speed counts
/**
 * Calculates the new average speed the user is going, based on the speed he is going 
 * @param {position} position consistion of coordinates and a timestamp
 */
function calculateNewSpeed(position) {
	var Str = localStorage['oldPosition'];
	var oldPos = $.evalJSON(Str);
	
	if ( oldPos != null ) {
		var speed = localStorage['walkSpeed'];
		if( speed == window.undefined) {
			speed = 25/18;
		} 
		var newSpeed = (1-p)*speed + p*calcSpeed(oldPos, position);
		localStorage['walkSpeed'] = newSpeed;
	}
	localStorage['oldPosition'] = $.toJSON(position);
}

/**
 * Calculates the speed the user is going using two positions and the times the user was there
 * @param {pos1} position consistion of coordinates and a timestamp
 * @param {pos2} position consistion of coordinates and a timestamp
 * @return {speed} the speed the user was going
 */
function calcSpeed(pos1, pos2) {
	var dist = calcDistance(pos1, pos2);
	var time = calcTime(pos1, pos2);
	return dist/time;
}
/**
 * Converts a value in degrees into a value in radians
 * @param {deg} value in degrees
 * @return {rad} value in radians corresponding to value in degrees
 */
function toRadians(deg) {
	return Math.PI*deg/180;
}
/**
 * Calculates the distance between two positions
 * @param {pos1} position consistion of coordinates and a timestamp
 * @param {pos2} position consistion of coordinates and a timestamp
 * @return {distance} distance beween the two parameters in meters
 */
function calcDistance(pos1, pos2) {
	var lat1 = pos1.coords.latitude;
	var lat2 = pos2.coords.latitude;
	var lng1 = pos1.coords.longitude;
	var lng2 = pos2.coords.longitude;

	var earthRadius = 3958.75;
    var dLat = toRadians(lat2-lat1);
    var dLng = toRadians(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var dist = earthRadius * c;

    var meterConversion = 1609;

    return dist * meterConversion;
}
/**
 * Calculates the time that passed between two timestamps
 * @param {pos1} position consistion of coordinates and a timestamp
 * @param {pos2} position consistion of coordinates and a timestamp
 * @return {time} time passed in seconds
 */
function calcTime(pos1, pos2) {
	var t1 = new Date(pos1.timestamp);
	var t2 = new Date(pos2.timestamp);
	return Math.abs((t1-t2)/1000);
}