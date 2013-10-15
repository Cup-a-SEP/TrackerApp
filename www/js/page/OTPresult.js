/**
 * Planner result page namespace
 * @namespace Page.OTPResult 
 */
Page.OTPResult = {};

/**
 * Initializes result page interface
 */
Page.OTPResult.init = function PageOTPResultInit()
{
	// Initialize database
	Storage.Trips.init();
	var data = $.evalJSON(localStorage['OTP data pending']);
	
	var from = data.from.name;
	var to = data.to.name;
	var start = UI.formatTime(data.itineraries[0].startTime);
	var end = UI.formatTime(data.itineraries[0].endTime);
	
	$('#itineraryHeader').empty().append($('<h3>')
			.text(start + ' ' + from + ' - ' + end + ' ' + to))
		.click(function()
		{
			clickMap(-1);
		});
	
	var route = $('<div>').attr('id', 'route');
	$('#plan').empty().append(route);
	
	var it = data.itineraries[0];
	
	route.add = UI.addItinerary;
	route.add(it);
	
	$('#planbutton').click(function(){
		Service.Trip.track();
		
		var req = $.evalJSON(localStorage['OTP request']);
		
		req.expectedDepartureTime = it.legs[0].startTime;
		req.expectedArrivalTime = it.legs[it.legs.length-1].endTime;

		try {
			Storage.Trips.store(req).always(function()
			{
				Page.load("currenttrip.html");
			});
		} catch(e) {
			Page.load("currenttrip.html");
		}
	});
};