/**
 * @namespace Service
 */
var Service = {};

/**
 * @namespace Service.Alarm 
 */
Service.Alarm = {};

Service.Alarm.check = function ServiceAlarmCheck()
{
};

/**
 * Trip information update service to keep the trip data recent.
 * @namespace Service.Trip 
 */
Service.Trip = {};

/**
 * Rerequest trip information using last request
 * @return {Object} jQuery deferred object 
 */
Service.Trip.update = function ServiceTripUpdate()
{
	var def = $.Deferred();
	
	req = $.parseJSON(localStorage['OTP request']);
	if (!req)
		def.resolve();
	else
		OTP.plan(req).done(function(data)
		{
			localStorage['OTP data'] = $.toJSON(data);
			def.resolve();
		}).fail(function(error) { def.reject(error); });
	
	return def;
};
