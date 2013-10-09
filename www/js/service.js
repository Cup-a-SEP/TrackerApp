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
	var res = localStorage['OTP data'] && $.parseJSON(localStorage['OTP data']);
	if (!res)
		return Infinity;
	var legs = res.itineraries[0].legs;
	
	var now = new Date().getTime();
	var last = localStorage['Alarm last'] ? Number(localStorage['Alarm last']) : 0;
	var next = Infinity;
	
	function nextEmbark()
	{
		for (var i = 1; i < legs.length; ++i)
			if (legs[i].startTime > last)
				return legs[i];
	}
	
	function nextAlight()
	{
		for (var i = 0; i < legs.length; ++i)
			if (legs[i].endTime > last)
				return legs[i];
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
			next = time - predelay;
	}
	
	if (localStorage['Alarm embark setting'] == 'true')
	{
		var predelay = Number(localStorage['Alarm embark time']) * 60;
		var leg;
		if (leg = nextEmbark())
		{
			var time = leg.startTime;
			if (time > last && now >= time - predelay)
			{
				localStorage['Alarm last'] = last = time;
				Service.Alarm.Callback('embark', leg);
			}
		}
		// Calculate next
		if (leg = nextEmbark())
			next = Math.min(next, leg.startTime - predelay);
	}
	
	if (localStorage['Alarm alight setting'] == 'true')
	{
		var time = Number(localStorage['Alarm alight time']) * 60;
		var leg;
		if (leg = nextAlight())
		{
			var time = leg.endTime;
			if (time > last && now >= time - predelay)
			{
				localStorage['Alarm last'] = last = time;
				Service.Alarm.Callback('alight', leg);
			}
		}
		// Calculate next
		if (leg = nextAlight())
			next = Math.min(next, leg.endTime - predelay);
	}
	return next;
};

/**
 * Trip information update service to keep the trip data recent.
 * @namespace Service.Trip 
 */
Service.Trip = {};

/**
 * Gets the leg from the current planned trip where the user is expected to be.
 * @returns OTP~Leg current leg or else null
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
 * @returns OTP~Leg current leg, on error null else when current is last leg: undefined
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


/**
 * Rerequest trip information using last request
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
			def.resolve();
		}).fail(function(error) { def.reject(error); });
	
	return def;
};

/**
 * Recalculates trip from current locations 
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
				req.startTransitTripId = leg.agencyId + '_' + leg.tripId;
				plan();
			}
			else // No idea where we are and where to go next, fail
				def.reject();
		});
	else
	{
		delete req.fromPlace;
		req.startTransitTripId = leg.tripId;
		plan();
	}
	
	function plan()
	{
		console.log(req);
		OTP.plan(req).done(function(data)
		{
			localStorage['OTP data'] = $.toJSON(data);
			def.resolve();
		}).fail(function(code, error) { def.reject(code, error); });
	}
	
	return def;
};
