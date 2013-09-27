var intervalID = null;  //Holds the ID that identifies the interval
var i = null;			//Holds a number representing the iteration the geolocator is on
var pos = null; 		//Local variable holding the last position to ensure it doesn't keep posting the same location over and over

/**
 * Retrieves the current location of the device asynchronously.
 * @return {position}  position consistion of coordinates and a timestamp
 */
function getPos() {
	navigator.geolocation.getCurrentPosition(onSuccessPoll, onErrorPoll, {
		timeout : 5000,
		maximumAge : 3000,
		enableHighAccuracy : true
	});
}

/**
 * Checks whether the parameter position is the same we already had. If it does, do nothing. If it doesn't, keep the new position and increment i
 * @param {position} position consistion of coordinates and a timestam
 */
function onSuccessPoll(position) {
	if (position == pos) {
	} else {
		pos = position;
		i = i + 1;
	}
}


/**
 * Shows the user the error, unless it is an timeout error which is not usefull for the user
 * @param {error} error thrown with an error code and a message
 */
function onErrorPoll(error) {
	if (error.code != 3) {
		alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	}
}

/**
 * Calls a method that calls the getPos function every 5 seconds
 */
function startTrackPoll(){
	intervalID = setInterval(getPos, 5000);
	i=0;
}
/**
 * Stops the method that calls the getPos function every 5 seconds
 */
function stopTrackPoll(){
	clearInterval(intervalID);
}

