/**
 * Current trip page namespace
 * @namespace Page.CurrentTrip
 */
Page.CurrentTrip = {};

/**
 * Initializes current trip information page interface
 */
Page.CurrentTrip.init = function PageCurrentTripInit()
{
	var modes =
	{
		WALK:   'Lopen',
		BUS:    'Bus',
		RAIL:   '', // Left blank intentionally
		FERRY:  'Veerpond',
		TRAM:   'Tram',
		SUBWAY: 'Metro'
	};

	var trips = new UI.Swipe($('#trips'), $('#indexindicator'));
	$('#trips').data('swipe', trips);

    $(document).on("OTPdataRefresh",function(){
        Page.replace("currenttrip.html", Page.CurrentTrip);
    });
    
	$(function()
	{
	    
		var OTPdata = localStorage['OTP data'] && $.evalJSON(localStorage['OTP data']);
		
        
		$('#prevLegButton').click(function() { trips.prev(); });
		$('#nextLegButton').click(function() { trips.next(); });
		$('#showIntStopsButton').click(function() { $('.intStop').toggle(); });
		$('#cancelButton').click(function ()
		{
			Service.Trip.cancel();
			Page.load('plan.html', Page.Plan);
		});
		
		if (OTPdata)
		{
   
            $('#currentTripHeader').empty().append($('<h3>')
                .text('Huidige reis - ' + UI.formatDay(OTPdata.date)))
                .click(function()
                {
                    localStorage['ShowMap'] = -1;
                    Page.load("legmap.html", Page.Legmap);
            });
            
            var legs = OTPdata.itineraries[0].legs;
            
			for (var i = 0; i < legs.length; ++i)
			{
				var fromName = legs[i].from.name;
				var toName = legs[i].to.name;

				if (legs[i].mode == 'RAIL')
				{
					fromName = 'Station ' + fromName + ' - Perron ' + legs[i].from.platformCode;
					toName = 'Station ' + toName + '  - Perron ' + legs[i].to.platformCode;
				}
				else
				{
					if (legs[i - 1] && legs[i - 1].mode == 'RAIL')
						fromName = 'Station ' + fromName;
					if (legs[i + 1] && legs[i + 1].mode == 'RAIL')
						toName = 'Station ' + toName;
				}
				
				trips.add()
					.append($('<label>').text(modes[legs[i].mode.toUpperCase()] + ' ' + legs[i].route))
					.append($('<br>'))
					.append($('<br>'))
					.append($('<label>').css('float', 'left').text(fromName))
					.append($('<label>').css('float', 'right').text(UI.formatTime(legs[i].startTime) + (legs[i].realTime ? (' (' + UI.formatTime(legs[i].startTime-legs[i].departureDelay*1e3) + ' + '+ Math.floor(legs[i].departureDelay/60) + 'm)') : '')))
					.append($('<br>'))
					.append($('<label>').attr('class', 'intStop').html("&darr;"))
					.append($('<br>').attr('class', 'intStop'));
				if(legs[i].intermediateStops){
				    for(var j = 0; j < legs[i].intermediateStops.length; j++){
				        var stop = legs[i].intermediateStops[j];
				        var name = stop.name;
				        var time = UI.formatTime(stop.arrival);
				        trips.last()
                            .append($('<label>').attr('class', 'intStop').css('float', 'left').text(name).toggle(false))
                            .append($('<label>').attr('class', 'intStop').css('float', 'right').text(time).toggle(false))
                            .append($('<br>').attr('class', 'intStop').toggle(false));
				    }
				}
				trips.last()
					.append($('<label>').css('float', 'left').text(toName))
					.append($('<label>').css('float', 'right').text(UI.formatTime(legs[i].endTime) + (legs[i].realTime ? (' (' + UI.formatTime(legs[i].endTime-legs[i].arrivalDelay*1e3) + ' + '+ Math.floor(legs[i].arrivalDelay/60) + 'm)') : '')))
					.append($('<br>'))
					.append($('<br>'))
					.append($('<div>').attr('id', 'legmap' + i)
						.addClass('button')
						.append($('<p>').text('Open map'))
						.click((function(i)
						{
							return function()
							{
								localStorage['ShowMap'] = i;
								Page.load('legmap.html', Page.Legmap);
							};
						})(i)));
			}
			trips.reset();
		}
		else
		{
			trips.add().html("Gefeliciteerd met het vinden van de credits! <br> <br> <br> <br> <br> <br> <br> <br> <br>");
			trips.add().html("Credits: <br> <br> <br> <br> <br> <br> <br> <br> <br>");
			trips.add().html("Opdrachtgever: <br> Paul Jansen <br> <br> <br> <br> <br> <br> <br> <br>");
			trips.add().html("Research: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br>");
			trips.add().html("Documentatie: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> Philip Klees <br> Florian Oosterhof <br> Sjarlie Graaumans <br> Frederique Gerritsen <br> Max Hageluken");
			trips.add().html("Design: <br> Henk Alkema <br> Frederique Gerritsen <br> <br> <br> <br> <br> <br> <br>");
			trips.add().html("Database: <br> Ferry Timmers <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br> <br>");
			trips.add().html("CSS: <br> Henk Alkema <br> Frederique Gerritsen <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br>");
			trips.add().html("Javascript/JQuery: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> Philip Klees <br> Florian Oosterhof <br> Sjarlie Graaumans <br> Frederique Gerritsen <br> Max Hageluken");
			trips.add().html("Groep Cup-A-SEP <br> Technische Universiteit Eindhoven <br> <br> <br> <br> <br> <br> <br> <br>");
			trips.reset();
		}
	});
};

/**
 * Refreshes current trip information page interface
 */
Page.CurrentTrip.refresh = function PageCurrentTripRefresh()
{
	$('#trips').data('swipe').refresh($('#trips'), $('#indexindicator'));
};
