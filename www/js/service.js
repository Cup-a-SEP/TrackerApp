/**
 * Foreground services as a counterpart for the services that run in the background
 * @namespace Service
 */
var Service = {};

/**
 * Alarm service: functionality for firing alarms.
 * @namespace Service.Alarm 
 */
Service.Alarm = {};

/**
 * Callback for triggered alarms
 * @callback Service.Alarm~Callback
 * @param {String} alarmType - Alarm type: departure, embark or alight.
 * @param {OTP~Leg} leg      - An OTP leg object
 */

/**
 * Callback that is fired when an alarm is triggered
 * @attribute Callback
 * @type Service.Alarm~Callback
 */
Service.Alarm.Callback = Function();

/**
 * Recalculates the alarms (should be called when tracked trip data or alarm settings have changed). 
 */
Service.Alarm.refresh = function ServiceAlarmRefresh()
{
	var res = localStorage['OTP data'] && $.parseJSON(localStorage['OTP data']);
	if (!res)
		return;
	
	var legs = res.itineraries[0].legs;
	var predelay =
	{
		departure: Number(localStorage['Alarm departure time']) * 60e3,
		embark: Number(localStorage['Alarm embark time']) * 60e3,
		alight: Number(localStorage['Alarm alight time']) * 60e3,
	};
	var active =
	{
		departure: localStorage['Alarm departure setting'] == 'true',
		embark: localStorage['Alarm embark setting'] == 'true',
		alight: localStorage['Alarm alight setting'] == 'true',
	};
	
	// Add potential alarms
	var alarms = [];
	if (active.departure && legs.length)
		alarms.push(
		{
			type: 'departure',
			time: legs[0].startTime - predelay.departure,
			legid: 0
		});
	
	for (var i = 0; i < legs.length; ++i)
	{
		if (legs[i].mode == 'WALK')
			continue;
		
		if (active.embark)
			alarms.push(
			{
				type: 'embark',
				time: legs[i].startTime - predelay.embark,
				legid: i
			});
		if (active.alight)
			alarms.push(
			{
				type: 'alight',
				time: Math.max(legs[i].endTime - predelay.alight, legs[i].startTime),
				legid: i
			});
	}
	
	// Remove alarms that are in the past
	var now = new Date().getTime();
	alarms = alarms.filter(function(alarm)
	{
		return alarm.time >= now;
	});
	
	localStorage['Alarm data'] = $.toJSON(alarms);
	
	return alarms;
};

/**
 * Check if an alarm would fire and fire it if so
 * @return {Number} The time of the next alarm that would fire (unix timestamp) or else Infinity
 */
Service.Alarm.check = function ServiceAlarmCheck()
{
	var alarms = localStorage['Alarm data'] && $.parseJSON(localStorage['Alarm data']);
	if (!alarms || !alarms.length)
		return Infinity;
	
	var res = localStorage['OTP data'] && $.parseJSON(localStorage['OTP data']);
	if (!res)
		return Infinity;
	
	var now = new Date().getTime();
	while (alarms.length && alarms[0].time <= now)
	{
		var alarm = alarms.shift();
		Service.Alarm.Callback(alarm.type, res.itineraries[0].legs[alarm.legid]);
		localStorage['Alarm data'] = $.toJSON(alarms);
	}
	
	return alarms.length ? alarms[0].time : Infinity;
};

/**
 * Returns the type of the alarm that would fire at the specified timestamp
 * @param {Number} Time of the alarm (unix timestamp)
 * @return {String} alarm type ('departure', 'embark' or 'alight')
 */
Service.Alarm.type = function ServiceAlarmType(timestamp)
{
	var alarms = localStorage['Alarm data'] && $.parseJSON(localStorage['Alarm data']);
	if (!alarms || !alarms.length)
		return '';
	
	for (var i = 0; i < alarms.length; ++i)
		if (alarms[i].time == timestamp)
			return alarms[i].type;

	return '';
};

/**
 * Trip information update service to keep the trip data recent (uses onboard trip planning).
 * @namespace Service.Trip 
 */
Service.Trip = {};

/**
 * Plans a trip using OpenTripPlanner
 * @param {OTP~PlannerRequest} request - request object to use with planner.
 * @return {Object} jQuery deferred object 
 */
Service.Trip.plan = function ServiceTripPlan(request)
{
	var def = $.Deferred();
	
	if (!('maxWalkDistance' in request))
		request['maxWalkDistance'] = 5000;
	
	OTP.plan(request).done(function(data)
	{
		// TODO: strip data
		
		localStorage['OTP request pending'] = $.toJSON(request);
		localStorage['OTP data pending'] = $.toJSON(data);
		def.resolve(data);
	}).fail(function(error, message) { def.reject(error, message); });
	
	return def;
};

/**
 * Tracks the last planned trip (enables alarms and alerts)
 */
Service.Trip.track = function ServiceTripPlan()
{
	if (localStorage['OTP request pending'])
		localStorage['OTP request'] = localStorage['OTP request pending'];
	
	if (localStorage['OTP data pending'])
		localStorage['OTP data'] = localStorage['OTP data pending'];
	
	Service.Alarm.refresh();
};

/**
 * Cancels the planned trip (if any) 
 */
Service.Trip.cancel = function ServiceTripCancel()
{
	if (localStorage['OTP request'])
		delete localStorage['OTP request'];
	
	if (localStorage['OTP data'])
		delete localStorage['OTP data'];
	
	Service.Alarm.refresh();
};

/**
 * Recalculates the trip using the request issued by the tracked trip
 * @return {Object} jQuery deferred object 
 */
Service.Trip.update = function ServiceTripUpdate()
{
	var def = $.Deferred();
	
	var req = $.parseJSON(localStorage['OTP request']);
	if (!req)
		def.resolve();
	else
		OTP.plan(req).done(function(data)
		{
			localStorage['OTP data'] = $.toJSON(data);
			Service.Alarm.refresh();
			def.resolve();
		}).fail(function(error) { def.reject(error); });
	
	return def;
};

/**
 * Recalculates the trip using the expected current location (uses onboard trip planning)
 * @return {Object} jQuery deferred object
 */
Service.Trip.refresh = function ServiceTripRefresh()
{
	var def = $.Deferred();
	
	var req = $.parseJSON(localStorage['OTP request']);
	if (!req)
		return def.resolve();
	
	req.time = System.getTime();
	req.date = System.getDate();
	req.arriveBy = false;
	
	var leg = Service.Trip.currentLeg();
	if (leg == null)
		def.resolve();
	else if (leg.tripId == null) // We are presumably walking, check geolocation
		System.getLocation().done(function(coords)
		{
			req.fromPlace = coords;
			plan();
		}).fail(function() // No geolocation, use next leg
		{
			leg = Service.Trip.nextLeg();
			if (leg != null && leg.tripId != null)
			{
				delete req.fromPlace;
				//req.startTransitTripId = leg.agencyId + '_' + leg.tripId;
				req.startTransitTripId = 'ARR_' + leg.tripId; // Patch for OTP module bug
				plan().fail(function(code, error) { def.reject(code, error); });
			}
			else // No idea where we are and where to go next, fail
				def.reject();
		});
	else
	{
		delete req.fromPlace;
		//req.startTransitTripId = leg.agencyId + '_' + leg.tripId;
		req.startTransitTripId = 'ARR_' + leg.tripId; // Patch for OTP module bug
		plan();
	}
	
	function plan()
	{
		OTP.plan(req).done(function(data)
		{
			localStorage['OTP data'] = $.toJSON(data);
			Service.Alarm.refresh();
			def.resolve();
		}).fail(function(code, error) { def.reject(code, error); });
	}
	
	return def;
};

/**
 * Gets the leg from the current planned trip where the user is expected to be.
 * @returns {OTP~Leg} current leg or else null
 */
Service.Trip.currentLeg = function ServiceTripCurrentLeg()
{
	var res = localStorage['OTP data'] && $.parseJSON(localStorage['OTP data']);
	if (!res)
		return null;
	
	var now = new Date().getTime();
	var legs = res.itineraries[0].legs; 
	for (var i = 0; i < legs.length; ++i)
		if (legs[i].endTime >= now)
			return legs[i];
	
	return null;
};

/**
 * Gets the next leg from the current planned trip where the user is expected to go next.
 * @returns {OTP~Leg} current leg, on error null else when current is last leg: undefined
 */
Service.Trip.nextLeg = function ServiceTripCurrentLeg()
{
	var res = localStorage['OTP data'] && $.parseJSON(localStorage['OTP data']);
	if (!res)
		return null;
	
	var now = new Date().getTime();
	var legs = res.itineraries[0].legs; 
	for (var i = 0; i < legs.length; ++i)
		if (legs[i].endTime >= now)
			return legs[i + 1];
	
	return null;
};


//Actual communication with the background-service below.
/////////////////////////////////////////////////////////////////////////////////////////////


/*
 * Copyright 2013 Red Folder Consultancy Ltd
 *   
 * Licensed under the Apache License, Version 2.0 (the "License");   
 * you may not use this file except in compliance with the License.   
 * You may obtain a copy of the License at       
 * 
 * 	http://www.apache.org/licenses/LICENSE-2.0   
 *
 * Unless required by applicable law or agreed to in writing, software   
 * distributed under the License is distributed on an "AS IS" BASIS,   
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and   
 * limitations under the License.
 */

// Link to the native code through cordova
cordova.define(	'cordova/plugin/fritsService',	function(require, exports, module) {    
	CreateBackgroundService('com.phonegap.hello_world.FritsService', require, exports, module);
});
var fritsService = cordova.require('cordova/plugin/fritsService');
        	
// Always start the service even if it isn't neede yet.
document.addEventListener('deviceready', function() {
	// Make an API call and start the service on success, else handle error.
	fritsService.getStatus(	
		function(r){startBackgroundService(r);},
		function(e){handleError(e);}
	);
}, true);

// Something to do when an API call succeeds. Do nothing in our case.
function handleSuccess(data) {
	//console.log(data);
}

// Something to do when an API call fails. We log some messages.
function handleError(data) {
	console.log("Error: " + data.ErrorMessage);
	console.log(JSON.stringify(data));
}

// Start the service
function startService() {
	fritsService.startService(	function(r){handleSuccess(r);},
							function(e){handleError(e);});
}

// Enable the service timer with 20s interval
function enableTimer() {
	fritsService.enableTimer(	20000,
							function(r){handleSuccess(r);},
							function(e){handleError(e);});
}
 			
// Register the service to start on reboot of the device
function registerForBootStart() {
	fritsService.registerForBootStart(	function(r){handleSuccess(r);},
									function(e){handleError(e);});
}

/**
 * Public function to set the parameters for an alarm
 * @param {Number} NextAlarmTimestamp - time when alarm will trigger (unix timestamp)
 * @param {String} SBNTitle - statusbar notification title
 * @param {String} SBNBody - statusbar notification message
 */
function setBackgroundAlarm(NextAlarmTimestamp, SBNTitle, SBNBody) {
	//Default 20 second alarm
	NextAlarmTimestamp = NextAlarmTimestamp || (20 + new Date().getTime() / 1000);
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
					"SBNTitle" : SBNTitle,
					"SBNBody" : SBNBody
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r);},
								function(e){handleError(e);});
}

/**
 * Public function to cancel the next alarm
 */
function cancelBackgroundAlarm() {
	NextAlarmTimestamp = -1;
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r);},
								function(e){handleError(e);});
}

// Configure and start the service
function startBackgroundService(data) {
	
	console.log("Starting FritsService in background");
	
	if (data.ServiceRunning) {
		// OK
		if (data.TimerEnabled) {
			// OK
		} else {
			enableTimer();
		} 

	} else { 
		startService();
		enableTimer();
		
	} 

	if (data.RegisteredForBootStart) {
		// OK
	} else {
		registerForBootStart();
	}

	//setBackgroundAlarm(null, "Frits alarm!", "Tekst");
}
