/**
 * Planner page namespace
 * @namespace Page.Plan 
 */
Page.Plan = {};

/**
 * Initializes plan page interface
 */
Page.Plan.init = function PagePlanInit()
{
	// Initialize to/from input boxes
	var sugfrom = new UI.Suggestion($('#sugfrom'), $('#from'), 5, true, function(coords, address)
	{
		$('#from').val(address);
		$('#fromPlace').val(coords);
	});
	$('#from').data('sugbox', sugfrom);
	
	var sugto = new UI.Suggestion($('#sugto'), $('#to'), 5, false, function(coords, address)
	{
		$('#to').val(address);
		$('#toPlace').val(coords);
	});
	$('#to').data('sugbox', sugto);
	
	$('#from').keyup(function() { $('#fromPlace').val(''); });
	$('#to').keyup(function() { $('#toPlace').val(''); });
	
	// Initialize suggestions list
	sugfrom.list = sugto.list = {};
	Storage.Locations.list(Infinity).done(function(res)
	{
		$.each(res, function(i, item)
		{
			sugto.list[item.name] = item.latlng;
		});
	});
	
	// Initialize date/time input boxes
	$('#date').val(System.getDate());
	$('#time').val(System.getTime());
	
	// Modality button states
	var modalities =
	{
		walk: true,
		bus: true,
		rail: true,
		tram: true,
		subway: true,
		ferry: true
	};
	
	// Initialize modality buttons
	$.each(modalities, function(name)
	{
		var mod = $('#' + name);
		mod.click(function()
		{
			modalities[name] = !modalities[name];
			mod.css('opacity', modalities[name] ? 1 : .3);
			$('#mode').val($.map(modalities, function(value, name)
			{
				if (value)
					return name.toUpperCase();
			}).join(','));
		});
	});
	
	// Send request to planner
	$('#plan').click(function(event)
	{
		event.preventDefault();
		
		var req = {};
        $.each($('#form').serializeArray(), function(i, item)
        {
            req[item.name] = item.value;
        });
            
        req['showIntermediateStops'] = true;
        
		if(!req.fromPlace){
            (navigator.notification ? navigator.notification : window).alert('De van-locatie is nog niet ingevuld. Vul deze locatie in en probeer het opnieuw', function(){}, 'Foute invoer');
		} else if(!req.toPlace){
            (navigator.notification ? navigator.notification : window).alert('De naar-locatie is nog niet ingevuld. Vul deze locatie in en probeer het opnieuw', function(){}, 'Foute invoer');
		} else if(Misc.splitDate(req.date) == null){
            (navigator.notification ? navigator.notification : window).alert('De datum is nog niet ingevuld of niet correct. Gebruik het volgende formaat: yyyy-mm-dd', function(){}, 'Foute invoer');
		} else if(Misc.splitTime(req.time) == null){
		    (navigator.notification ? navigator.notification : window).alert('De tijd is nog niet ingevuld of niet correct. Gebruik het volgende formaat: hh:mm', function(){}, 'Foute invoer');
		} else {
    		
    		$('#status').empty().append($('<h1>').text("Zoeken..."));
    		
    		Storage.Locations.store(req.from, req.fromPlace, false);
    		Storage.Locations.store(req.to, req.toPlace, false);
    		
    		Service.Trip.plan(req).done(function(data)
    		{
    			$('#status').empty();
    			Page.load("OTPresult.html", Page.OTPResult);
    		}).fail(function(error, message)
    		{
    			$('#status').empty()
    				.append($('<h3>').text('Geen route gevonden.'))
    				.append($('<h4>').text(error + ' ' + message));
    		});
		}
		return false;
	});
};

/**
 * Refreshes the plan page interface (used for back button)
 */
Page.Plan.refresh = function PagePlanRefresh()
{
};
