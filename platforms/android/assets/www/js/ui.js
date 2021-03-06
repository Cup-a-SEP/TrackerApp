/**
 * User interface formatting and rendering functions
 * @namespace UI 
 */
var UI = {};

/**
 * Formats time to hh:mm format
 * @param time - A javascript suppored time designation
 * @return {String} The specified time in hh:mm format
 */
UI.formatTime = function UIFormatTime(time)
{
	function pad(x) { return x < 10 ? '0' + x : x; }
	var timex = new Date(time);
	return timex.getHours() + ':' + pad(timex.getMinutes());
};

/**
 * Formats time to day month format
 * @param time - A javascript suppored time designation
 * @return {String} The specified time in day month format
 */
UI.formatDay = function UIFormatDay(time)
{
    var monthName = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    var timex = new Date(time);
    return timex.getDate() + ' ' + monthName[timex.getMonth()];
};

/**
 * Formats a location name so it does not contain double spaces
 * @param name - A Location name
 * @return {String} The name without double spaces 
 */
UI.formatName = function UIFormatName(name)
{
	return name.replace(/\s+/, ' ').trim();
};

/**
 * Formats a delayed time as used by departure and arrival times
 * @param {Number} time  - Specified time including the delay (unix timestamp)
 * @param {Number} delay - The delay itself (seconds)
 * @return {String} A String containing the undelayed time with the difference in minutes: (H:MM + Dm)
 */
UI.formatDelay = function UIFormatDelay(time, delay)
{
	return UI.formatTime(Number(time) - Number(delay) * 1e3)
		+ (delay >= 0 ? ' + ' : ' - ')
		+ Math.abs(Math.floor(Number(delay) / 60))
		+ 'm';
};

/**
 * Adds a formatted itinerary to an element (accordion)
 * @param {OTP~Itinerary} itinerary - Itinerary 
 * @param {Number} index - Leg that is selected on start
 * @this jQuery target element
 */
UI.addItinerary = function UIaddItinerary(itinerary, index)
{
	var self = this;
	
	function getLegMode(i) {
		if( i < 0 || i >= itinerary.legs.length) {
			return '';
		} else {
			return itinerary.legs[i].mode;
		}
	}
	
	function addLeg(i, leg)
	{
		var startTime = UI.formatTime(leg.startTime);
		var endTime = UI.formatTime(leg.endTime);
		var fromName = leg.from.name;
		var toName = leg.to.name;
		
		if(leg.mode == 'RAIL') {
			fromName = 'Station ' + fromName + ' - Perron ' + leg.from.platformCode;
			toName = 'Station ' + toName + '  - Perron ' + leg.to.platformCode;
		} else {
			if(getLegMode(i-1) == 'RAIL') {
				fromName = 'Station ' + fromName;
			}
			if(getLegMode(i+1) == 'RAIL') {
				toName = 'Station ' + toName;
			}
		}
		
		var modeName = function(mode) {
			modes = {	'WALK': 'Lopen',
						'BUS': 'Bus',
						'RAIL': '',
						'FERRY': 'Veerpond',
						'TRAM': 'Tram',
						'SUBWAY': 'Metro'};
			if(!$.inArray(mode, modes)) {
				return mode.toLowerCase();
			} else {
				return modes[mode];
			}
		};
		
		function addStops(stops) {
			var stopElem = $('<div>');
			$.each(stops,function(i,stop) {
				stopElem.append(stop.name + '<br>');
			});
			return stopElem;
		}
		
		var h3 = $('<h3>')
		
		// image:
			.append($('<img>').attr('src', 'img/' + leg.mode.toLowerCase() + '.png')
				.css('width', 20)
				.css('height', 20))
	
		// title:
			.append($('<span>').addClass('time').text(UI.formatTime(leg.startTime) + ' - ' + UI.formatTime(leg.endTime)))
			.append(' ' + modeName(leg.mode) + ' ' + leg.route + ' ');
			
		
		// intermediate stops:
		var stopbutton, divstops;
		if (leg.intermediateStops && leg.intermediateStops.length)
		{
			divstops = $('<div>')
				.attr('id', 'intermediate' + i)
				.append(addStops(leg.intermediateStops))
				.toggle(false);
			
			// show intermediate stops button
			stopbutton = $('<div>')
				.attr('id', 'stopbutton' + i)
				.addClass('button')
				.append($('<p>').text('tussenhaltes'))
				.click((function(i)
				{
					return function() { $('#intermediate' + i).toggle(); };
				})(i));
		}
		
		// open map button
		var mapbutton = $('<div>')
			.attr('id', 'legmap' + i)
			.addClass('button')
			.append($('<p>').text('kaart'))
			.click(function()
			{
				localStorage['ShowMap'] = i;
				Page.load("legmap.html", Page.Legmap);
			});
		
		// visible when extended:
		var div = $('<div>')
			.append($('<p>')
				.text(startTime + ': ' + fromName)
				.append($('<br>'))
				.append(divstops)
				.append(endTime + ': ' + toName))
			.append(mapbutton)
			.append(stopbutton);

		self.append(h3).append(div);
	}
	
	$.each(itinerary.legs, addLeg);
	self.accordion(
	{
		collapsible: true,
		heightStyle: 'content',
		active: index
	});
	
	setTimeout(function()
	{
		self.on('accordionactivate', function(event, ui)
		{
			self.data('active', self.accordion('option', 'active'));
		});
	}, 500);
	
	return self;
};

/**
 * Creates a suggestion box from a text box
 * @classdesc A dropdown with possible locations that is updated when the user types sorted on relevance.
 * @constructor Suggestion
 * @param {jQuery}           target    - element which will be replaced by the suggestion box
 * @param {jQuery}           input     - textbox element which provides the input
 * @param {Number}           size      - number of suggestions
 * @param {Boolean}          geolocate - true if the suggestions should also include current geo-position
 * @param {Geo~DoneCallback} callback  - callback executed when user clicks a suggestion
 * 
 * @property {Number} size - number of suggestions
 * @property {Object} list - suggestion list object (address => "lat,lng")
 */
UI.Suggestion = function(target, input, size, geolocate, callback)
{
	var self = this;
	this.target = target;
	this.source = input;
	this.size = size;
	this.list = {};
	this.callback = callback || Function();
	
	input.focus(function()
	{
		self.update();
		self.open();
	});
	
	input.blur(function() 
	{ 
	    self.close();
	    
	});
	
	// Geo location and location resolving variables
	this.here = undefined;
	this.there = undefined;
	
	function hereError(code, message)
	{
		self.here = null;
		self.update();
	}
	function thereError(code, message)
	{
		self.there = null;
		self.update();
	}
	
	// Gets device geo-location
	if (!geolocate)
		self.here = false;
	else
		System.getLocation().done(function(coords)
		{
			Geo.decode(coords).done(function(coords, address)
			{
				self.here =
				{
					address: address,
					coords: coords
				};
				self.update();
			}).fail(hereError);
		}).fail(hereError);
	
	// Sets handler for user entered location resolving
	self.source.keyup(function()
	{
		setTimeout(function()
		{
			self.update();
			Geo.code(self.source.val()).done(function(coords, address)
			{
				self.there =
				{
					address: address,
					coords: coords
				};
				self.update();
			}).fail(thereError);
		}, 0);
	});
};

/**
 * Resets the DOM elements used for this swipe box (useful for cloned pages)
 * @memberof Suggestion.prototype
 * @method refresh
 * @param {jQuery}           target    - element which will be replaced by the suggestion box
 * @param {jQuery}           input     - textbox element which provides the input
 */
UI.Suggestion.prototype.refresh = function UISuggestionRefresh(target, input)
{
	this.target = target;
	this.source = input;
	this.update(); 
};

/**
 * Updates the suggestion box (when list or input has changed)
 * @memberof Suggestion.prototype
 * @method update
 */
UI.Suggestion.prototype.update = function UISuggestionUpdate()
{
	var self = this;
	var number = this.size - (this.here !== false ? 1 : 0) - (this.there ? 1 : 0);
	var input = this.source.val();
	
	var tolerance = 3;
	var list = this.list;
	
	var names = $.map(list, function(coords, address) { return address; });
	names.sort(function(a,b) { return Misc.lDistance(input, a) - Misc.lDistance(input, b); });
	
	this.target.empty();
	
	if (this.there)
		this.target.append($('<p>')
			.text(this.there.address)
			.mousedown(function()
			{
				self.callback(self.there.coords, self.there.address);
				self.close();
			}));
	
	for (var i = 0; i < number; ++i)
	{
		if (Misc.lDistance(input, names[i]) > tolerance)
			break;
		this.target.append($('<p>')
			.text(names[i])
			.mousedown((function(i)
			{
				return function()
				{
					 self.callback(list[names[i]], names[i]);
					 self.close();
				};
			})(i)));
	}
	
	if (this.here)
		this.target.append($('<p>')
			.addClass('geolocation')
			.text('Huidige locatie')
			.mousedown(function()
			{
				self.callback(self.here.coords, self.here.address);
				self.close();
			}));
	else if (this.here === null)
		this.target.append($('<p>')
			.addClass('geolocation')
			.text('GPS niet beschikbaar'));
	else if (this.here !== false)
		this.target.append($('<p>')
			.addClass('geolocation')
			.text('Zoeken...'));
};

/**
 * Opens the suggestion box
 * @memberof Suggestion.prototype
 * @method open
 * @return {Suggestion} this 
 */
UI.Suggestion.prototype.open = function UISuggestionOpen()
{
	this.target.fadeIn();
	return this;
};

/**
 * Closes the suggestion box
 * @memberof Suggestion.prototype
 * @method close
 * @return {Suggestion} this
 */
UI.Suggestion.prototype.close = function UISuggestionClose()
{
	this.target.fadeOut(100);
	return this;
};

/**
 * Creates a swipe box from an element
 * @classdesc Box with multiple pages that can be swiped through.
 * @constructor Swipe
 * @param {jQuery}           target    - element which will be replaced by the swipe box
 * @param {jQuery}           indicator - element that will contain the index indicator
 * 
 * @property {Number} count - number of pages
 * @property {Number} index - page currently selected
 */
UI.Swipe = function UISwipe(target, indicator)
{
	var self = this;
	this.count = 0;
	this.index = 0;
	this.element = target;
	this.indicator = indicator;
	
	this.element.append(this.container = $('<div>').addClass('swipe-wrap'));
	this.reset();
};

/**
 * Redraws the swipebox when pages have been added
 * @memberof Swipe.prototype
 * @method reset
 * @return {Swipe} this 
 */
UI.Swipe.prototype.reset = function UISwipeReset()
{
	var self = this;
	
	function update()
	{
		var bullets = '';
		for (var i = 0; i < self.count; ++i)
			bullets += i == self.index ? '&diams; ' : '&bull; '; 
		
		self.indicator.html(bullets.trim());
	};
	
	this.control = Swipe(this.element[0],
	{
		startSlide: this.index,                       //(default:0) - index position Swipe should start at
		//speed: 300,                                 //(default:300) - speed of prev and next transitions in milliseconds
		//auto: 3000,                                 //begin with auto slideshow (time in milliseconds between slides)
		continuous : false,                           //(default:true) - create an infinite feel with no endpoints
		//disableScroll: true,                        //(default:false) - stop any touches on this container from scrolling the page
		//stopPropagation: true,                      //(default:false) - stop event propagation
		callback : function(index, element)           //runs at slide change
		{
			self.index = index;
			update();
		},
		//transitionEnd: function(index, element) {}  //runs at the end slide transition
	});
	
	update();
	
	return this;
};

/**
 * Resets the DOM elements used for this swipe box (useful for cloned pages)
 * @memberof Swipe.prototype
 * @method refresh
 * @param {jQuery}           target    - element which will be replaced by the swipe box
 * @param {jQuery}           indicator - element that will contain the index indicator
 */
UI.Swipe.prototype.refresh = function UISwipeRefresh(target, indicator)
{
	this.element = target;
	this.container = target.children('.swipe-wrap');
	this.indicator = indicator;
	this.reset(); 
};

/**
 * Adds a page to the swipebox
 * @memberof Swipe.prototype
 * @method add
 * @return {jQuery} added page element 
 */
UI.Swipe.prototype.add = function UISwipeAdd()
{
	this.count++;
	
	var div;
	this.container.append(div = $('<div>')
		.addClass('leg-display'));
	return div;
};

/**
 * Returns the last page of the swipebox
 * @memberof Swipe.prototype
 * @method last
 * @return {jQuery} the last page of the swipebox 
 */
UI.Swipe.prototype.last = function UISwipeLast()
{
    return $('.leg-display').last();
};

/**
 * Goes to the next page
 * @memberof Swipe.prototype
 * @method next
 * @return {Swipe} this 
 */
UI.Swipe.prototype.next = function UISwipeNext()
{
	this.control.next();
	return this;
};

/**
 * Goes to the previous page
 * @memberof Swipe.prototype
 * @method prev
 * @return {Swipe} this 
 */
UI.Swipe.prototype.prev = function UISwipePrev()
{
	this.control.prev();
	return this;
};
