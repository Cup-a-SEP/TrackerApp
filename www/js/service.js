/**
 * @namespace Service
 */
var Service = {};

/**
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
 * Fired when an alarm is triggered
 * @attribute Callback
 * @type Service.Alarm~Callback
 */
Service.Alarm.Callback = function(){};

/**
 * Check if an alarm would fire and fire it if so
 * @return {Number} Time of the next alarm that would fire or else Infinity (unix timestamp)
 */
Service.Alarm.check = function ServiceAlarmCheck()
{
	res = !localStorage['OTP data'] || $.parseJSON(localStorage['OTP data']);
	if (!res)
		return Infinity;
	
	var now = new Date().getTime();
	var last = localStorage['Alarm last'] ? Number(localStorage['Alarm last']) : 0;
	var next = Infinity;
	
	function nextEmbark()
	{
		$.each(res.itineraries[0].legs, function(leg)
		{
			if (leg.startTime > last)
				return leg;
		});
	}
	
	function nextAlight()
	{
		$.each(res.itineraries[0].legs, function(leg)
		{
			if (leg.endTime > last)
				return leg;
		});
	}
	
	if (localStorage['Alarm departure setting'] == 'true')
	{
		var predelay = Number(localStorage['Alarm departure time']) * 60;
		var time = res.itineraries[0].startTime;
		if (time > last && now >= time - predelay)
		{
			localStorage['Alarm last'] = last = time;
			Service.Alarm.Callback('departure', res.itineraries[0].legs[0]);
		}
		if (time > last)
			next = time;
	}
	else if (localStorage['Alarm embark setting'] == 'true')
	{
		var predelay = Number(localStorage['Alarm embark time']) * 60;
		var leg;
		if (leg = nextEmbark())
		{
			var time = leg.startTime;
			if (time > last && now >= time - predelay)
			{
				localStorage['Alarm last'] = last = time;
				Service.Alarm.Callback('embark', reg);
			}
		}
		// Calculate next
		if (leg = nextEmbark())
			next = Math.min(next, leg.startTime);
	}
	else if (localStorage['Alarm alight setting'] == 'true')
	{
		var time = Number(localStorage['Alarm alight time']) * 60;
		var leg = nextAlight();
		if (leg)
		{
			var time = leg.endTime;
			if (time > last && now >= time - predelay)
			{
				localStorage['Alarm last'] = last = time;
				Service.Alarm.Callback('alight', reg);
			}
		}
		// Calculate next
		if (leg = nextAlight())
			next = Math.min(next, leg.endTime);
	}
	return next;
};

/**
 * Receives the leg and type of next alarm 
 */
Service.Alarm.next = function ServiceAlarmNext()
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
