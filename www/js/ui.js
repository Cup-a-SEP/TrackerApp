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
 * @this $
 */
UI.addItinerary = function UIaddItinerary(itinerary)
{
	var self = this;
	
	function addLeg(i, leg)
	{
		var h3 = $('<h3>')
		
		// plaatje:
			.append($('<img>').attr('src', 'img/' + leg.mode + '.png')
				.css('width', 20)
				.css('height', 20))
	
		// titel:
			.append(leg.mode.toLowerCase() + ' ' + leg.route + ' ')
			.append($('<span>').addClass('time').text(UI.formatTime(leg.startTime) + ' -> ' + UI.formatTime(leg.endTime)));
		
		// zichtbaar bij uitklappen:
		var div = $('<div>')
			.append($('<p>').text(leg.from.name + ' -> ' + leg.to.name))
			.append($('<div id="legmap' + i + '">')
				.append($('<p>').text("Map")))
			;
		
		self.append(h3).append(div);
	}
	
	$.each(itinerary.legs, addLeg);
	return self;
};

UI.Suggestion = function(target, input, size, geolocate, callback)
{
	var self = this;
	this.target = target;
	this.source = input;
	this.size = size;
	this.list =
	{
		'Eindhoven': '0,0',
		'Utrecht': '0,0',
		'Tilburg': '0,0',
		'Groningen': '0,0',
		'Breda': '0,0',
		'Eindhoven station': '0,0',
		'Eindhoven TUe': '0,0',
		'Meppel': '0,0',
		'Maaskantje': '0,0',
		'Enkhuizen': '0,0'
	};
	
	this.here = undefined;
	this.there = undefined;
	
	this.callback = callback || Function();
	
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
			.click(function() { self.callback(self.there.coords, self.there.address); }));
	
	for (var i = 0; i < number; ++i)
	{
		if (Misc.lDistance(input, names[i]) > tolerance)
			break;
		this.target.append($('<p>')
			.text(names[i])
			.click((function(i)
			{
				return function() { self.callback(list[names[i]], names[i]); };
			})(i)));
	}
	
	if (this.here)
		this.target.append($('<p>')
			.text('Huidige locatie')
			.click(function() { self.callback(self.here.coords, self.here.address); }));
	else if (this.here !== false)
		this.target.append($('<p>').text('Zoeken...'));
};


UI.Suggestion.prototype.open = function UISuggestionOpen()
{
	this.target.show();
	return this;
};

UI.Suggestion.prototype.close = function UISuggestionOpen()
{
	this.target.hide();
	return this;
};
