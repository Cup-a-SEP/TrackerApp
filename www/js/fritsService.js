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
		function(r){startBackgroundService(r)},
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
	fritsService.startService(	function(r){handleSuccess(r)},
							function(e){handleError(e)});
}

// Enable the service timer with 20s interval
function enableTimer() {
	fritsService.enableTimer(	20000,
							function(r){handleSuccess(r)},
							function(e){handleError(e)});
}
 			
// Register the service to start on reboot of the device
function registerForBootStart() {
	fritsService.registerForBootStart(	function(r){handleSuccess(r)},
									function(e){handleError(e)});
}

// Public function to set the parameters for an alarm
function setBackgroundAlarm(NextAlarmTimestamp, SBNTitle, SBNBody) {
	//Default 20 second alarm
	NextAlarmTimestamp = NextAlarmTimestamp || (20 + new Date().getTime() / 1000);
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
					"SBNTitle" : SBNTitle,
					"SBNBody" : SBNBody
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r)},
								function(e){handleError(e)});
}

// Public function to cancel the next alarm
function cancelBackgroundAlarm() {
	NextAlarmTimestamp = -1;
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r)},
								function(e){handleError(e)});
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