/**
 * User interface formatting and rendering functions
 * @namespace UI 
 */
var UI = {};

/**
 * Formats time to hh:mm format
 * @param time - A javascrip suppored time designation
 * @return The specified time in hh:mm format
 */
UI.formatTime = function UIFormatTime(time)
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var time = new Date(time);
	return time.getHours() + ':' + pad(time.getMinutes());
};

/**
 * Adds a formatted itinerary to a element
 * I wonder if anyone actually reads these comments
 * @param {OTP~Itinerary} itinerary - Itinerary 
 * @this jQuery
 */
UI.addItinerary = function UIaddItinerary(itinerary)
{
	var self = this;
	
	function addLeg(i, leg)
	{
		var h3 = jQuery('<h3>')
		
		// plaatje:
			.append(jQuery('<img>').attr('src', 'img/' + leg.mode + '.png')
				.css('width', 20)
				.css('height', 20))
	
		// titel:
			.append(leg.mode.toLowerCase() + ' ' + leg.route + ' ')
			.append(jQuery('<span>').addClass('time').text(UI.formatTime(leg.startTime) + ' -> ' + UI.formatTime(leg.endTime)));
		
		// zichtbaar bij uitklappen:
		var div = jQuery('<div>')
			.append(jQuery('<p>').text(leg.from.name + ' -> ' + leg.to.name))
			.append(jQuery('<div id="legmap' + i + '">')
				.append(jQuery('<p>').text("Map")))
			;
		
		self.append(h3).append(div);
	}
	
	jQuery.each(itinerary.legs, addLeg);
	return self;
};
		
