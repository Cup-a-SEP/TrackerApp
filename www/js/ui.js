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
 * Formats a location name so it does not contain double spaces
 * @param name - A Location name
 * @return The name without double spaces 
 */
UI.formatName = function UIFormatName(name)
{
	return name.replace(/\s+/, ' ').trim();
};

/**
 * Adds a formatted itinerary to a element
 * I wonder if anyone actually reads these comments
 * @param {OTP~Itinerary} itinerary - Itinerary 
 * @this $
 */
UI.addItinerary = function UIaddItinerary(itinerary)
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
		
		// plaatje:
			.append($('<img>').attr('src', 'img/' + leg.mode + '.png')
				.css('width', 20)
				.css('height', 20))
	
		// titel:
			.append($('<span>').addClass('time').text(UI.formatTime(leg.startTime) + ' - ' + UI.formatTime(leg.endTime)))
			.append(' ' + modeName(leg.mode) + ' ' + leg.route + ' ');
			
		// zichtbaar bij uitklappen:
		var hasstops = (leg.intermediateStops.length > 0);
		var divstops;
		var stopbutton;
		if(hasstops){
			divstops = $('<div>').append(addStops(leg.intermediateStops));
			console.log('test1');
			divstops.toggle(false);
			console.log('test2');
			stopbutton = $('<div id="stopsbutton' + i + '" class="button">')
						.append("<p>tussenhaltes</p>");
			stopbutton.click(function() {
				divstops.toggle();
			});
		}
		
		var mapbutton = $('<div id="legmap' + i + '" class="button">')
					.append("<p>Open map</p>");
		$(mapbutton).click(function() {
			localStorage['ShowMap'] = i;
			window.location = "legmap.html";
		});
					
		var div = $('<div>')
			.append($('<p>').text(startTime + ': ' + fromName).append($('<br>')).append(divstops).append(endTime + ': ' + toName))
			.append(mapbutton)
			.append(stopbutton);

		self.append(h3).append(div);
	}
	
	$.each(itinerary.legs, addLeg);
	self.accordion({collapsible:true});
	return self;
};

/**
 * Creates a suggestion box from a text box
 * @constructor Suggestion
 * @param {jQuery}           target    - element which will be replaced by the suggestion box
 * @param {jQuery}           input     - textbox element which provides the input
 * @param {Number}           size      - number of suggestions
 * @param {Boolean}          geolocate - true if the suggestions should also include current geo-position
 * @param {Geo~DoneCallback} callback  - callback executed when user clicks a suggestion
 * 
 * @property {Number} size - number of suggestions
 * @property {Object} list - suggestion list object with address => "lat,lng"
 */
UI.Suggestion = function(target, input, size, geolocate, callback)
{
	var self = this;
	this.target = target;
	this.source = input;
	this.size = size;
	this.list = {};
	this.callback = callback || Function();
	
	input.click(function()
	{
		self.update();
		self.open();
	});
	input.blur(function() { setTimeout(function() { self.close(); }, 1000); });
	
	// Geo location and location resolving variables
	this.here = undefined;
	this.there = undefined;
	
	function hereError(code, message)
	{
		self.here = false;
		self.update();
	}
	function thereError(code, message)
	{
		self.there = false;
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
 * Updates the suggestion box (when list or input has changed)
 * @memberof UI.Suggestion
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
			.click(function()
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
			.click((function(i)
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
			.text('Huidige locatie')
			.click(function()
			{
				self.callback(self.here.coords, self.here.address);
				self.close();
			}));
	else if (this.here !== false)
		this.target.append($('<p>').text('Zoeken...'));
};

/**
 * Opens the suggestion box
 * @memberof UI.Suggestion
 * @return this 
 */
UI.Suggestion.prototype.open = function UISuggestionOpen()
{
	this.target.slideDown();
	return this;
};

/**
 * Closes the suggestion box
 * @memberof UI.Suggestion
 * @return this
 */
UI.Suggestion.prototype.close = function UISuggestionClose()
{
	this.target.slideUp();
	return this;
};
