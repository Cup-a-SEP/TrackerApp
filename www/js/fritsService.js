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

cordova.define(	'cordova/plugin/fritsService',	function(require, exports, module) {    
	CreateBackgroundService('com.phonegap.hello_world.FritsService', require, exports, module);
});

var fritsService = cordova.require('cordova/plugin/fritsService');
        	
document.addEventListener('deviceready', function() {
	fritsService.getStatus(	
		function(r){startBackgroundService(r)},
		function(e){handleError(e);}
	);
}, true);

function handleSuccess(data) {
	//updateView(data);
	
	//console.log(data);
}

function handleError(data) {
	console.log("Error: " + data.ErrorMessage);
	console.log(JSON.stringify(data));
	//updateView(data);
}

/*
 * Button Handlers
 */ 			
function getStatus() {
	fritsService.getStatus(	function(r){handleSuccess(r)},
							function(e){handleError(e)});
};

function startService() {
	fritsService.startService(	function(r){handleSuccess(r)},
							function(e){handleError(e)});
}

function stopService() {
	fritsService.stopService(	function(r){handleSuccess(r)},
							function(e){handleError(e)});
}

function enableTimer() {
	fritsService.enableTimer(	2000,
							function(r){handleSuccess(r)},
							function(e){handleError(e)});
}

function disableTimer() {
	fritsService.disableTimer(	function(r){handleSuccess(r)},
							function(e){handleError(e)});
};
 			
function registerForBootStart() {
	fritsService.registerForBootStart(	function(r){handleSuccess(r)},
									function(e){handleError(e)});
}

function deregisterForBootStart() {
	fritsService.deregisterForBootStart(	function(r){handleSuccess(r)},
										function(e){handleError(e)});
}

function setBackgroundAlarm(NextAlarmTimestamp, SBNTitle, SBNBody) {
	//Default 20 second alarm
	NextAlarmTimestamp = NextAlarmTimestamp || (30 + new Date().getTime() / 1000);
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
					"SBNTitle" : SBNTitle,
					"SBNBody" : SBNBody
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r)},
								function(e){handleError(e)});
}


function cancelBackgroundAlarm() {
	//Default 20 second alarm
	NextAlarmTimestamp = -1;
	var config = { 
					"NextAlarmTimestamp" : '' + NextAlarmTimestamp,
				}; 
	fritsService.setConfiguration(	config,
								function(r){handleSuccess(r)},
								function(e){handleError(e)});
}


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
	
	if (data.Configuration != null)
	{
		try {
			var helloToTxt = data.Configuration.HelloTo;
		} catch (err) {
		}
	}
	
	if (data.LatestResult != null)
	{
		try {
			var resultMessage = data.LatestResult.Message;
		} catch (err) {
		}
	}
}