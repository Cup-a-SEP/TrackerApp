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
	var triplength = 1;
	
	
	// with jQuery
	// window.mySwipe = $('#mySwipe').Swipe().data('Swipe');
	var modeName = function(mode) {
        modes = {   'WALK': 'Lopen',
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
    
    function updateindexindicator(index){
        var ii = $('#indexindicator');
        ii.empty();
        var toAdd = "";
        for(var i = 0; i < triplength; i++){
            if(i == index){
                toAdd = toAdd.concat("&diams; ");
            } else {
                toAdd = toAdd.concat("&bull; ");
    		}
        }
	    ii.append(toAdd);
	}
	
	function cancelTracking(){
	    Service.Trip.cancel();
	    window.location = "index.html";
	}
	
	function initSwipe(){
        var elem = document.getElementById('mySwipe');
        window.mySwipe = Swipe(elem, {
            //startSlide: 4,                              //(default:0) - index position Swipe should start at
            //speed: 300,                                 //(default:300) - speed of prev and next transitions in milliseconds
            //auto: 3000,                                 //begin with auto slideshow (time in milliseconds between slides)
            continuous: false,                            //(default:true) - create an infinite feel with no endpoints
            //disableScroll: true,                        //(default:false) - stop any touches on this container from scrolling the page
            //stopPropagation: true,                      //(default:false) - stop event propagation
            callback: function(index, element) {
                updateindexindicator(index);
            },      //runs at slide change
           //transitionEnd: function(index, element) {}  //runs at the end slide transition
        });
        updateindexindicator(0);
	}
	
	function getLegMode(legs, i) {
        if( i < 0 || i >= legs.length) {
            return '';
        } else {
            return legs[i].mode;
        }
    }
    
	$(function(){
		$('#prevLegButton').click(function(){ mySwipe.prev(); });
		$('#nextLegButton').click(function(){ mySwipe.next(); });
		$('#cancelButton').click(cancelTracking);
    	var data = localStorage['OTP data'] && $.evalJSON(localStorage['OTP data']);
		var sw = $('.swipe-wrap');
		if (data){
                triplength = data.itineraries[0].legs.length;
                for(var i = 0; i < triplength; i++){
                    var curleg = data.itineraries[0].legs[i];
                    
                    var fromName = curleg.from.name;
                    var toName = curleg.to.name;
                    
                    if(curleg.mode == 'RAIL') {
                        fromName = 'Station ' + fromName + ' - Perron ' + curleg.from.platformCode;
                        toName = 'Station ' + toName + '  - Perron ' + curleg.to.platformCode;
                    } else {
                        if(getLegMode(data.itineraries[0].legs, i-1) == 'RAIL') {
                            fromName = 'Station ' + fromName;
                        }
                        if(getLegMode(data.itineraries[0].legs, i+1) == 'RAIL') {
                            toName = 'Station ' + toName;
                        }
                    }
                    
                    sw.append($('<div>')
                        .addClass("leg-display")
                        .append($('<label>').text(modeName(curleg.mode) + ' ' + curleg.route))
                        .append($('<br>'))
                        .append($('<br>'))
                        .append($('<label style="float:left">').text(fromName))
                        .append($('<label style="float:right">').text(UI.formatTime(curleg.startTime)))
                        .append($('<br>'))
                        .append("&darr;")
                        .append($('<br>'))
                        .append($('<label style="float:left">').text(toName))
                        .append($('<label style="float:right">').text(UI.formatTime(curleg.endTime)))
                        .append($('<br>'))
                        .append($('<br>'))
                        .append($('<div class="button" id="legmap' + i + '">')
                            .append("<p>Open map</p>"))
                    );
                    $('#legmap' + i + '').click(function()
                    {
                        clickMap(this.id.substring(6));
                    });
                }
                initSwipe();
		} else {
			sw.append($('<div class="leg-display">').html("Gefeliciteerd met het vinden van de credits! <br> <br> <br> <br> <br> <br> <br> <br> <br>"));
			sw.append($('<div class="leg-display">').html("Credits: <br> <br> <br> <br> <br> <br> <br> <br> <br>"));
			sw.append($('<div class="leg-display">').html("Opdrachtgever: <br> Paul Jansen <br> <br> <br> <br> <br> <br> <br> <br>"));
			sw.append($('<div class="leg-display">').html("Research: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br>"));
			sw.append($('<div class="leg-display">').html("Documentatie: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> Philip Klees <br> Florian Oosterhof <br> Sjarlie Graaumans <br> Frederique Gerritsen <br> Max Hageluken"));
			sw.append($('<div class="leg-display">').html("Design: <br> Henk Alkema <br> Frederique Gerritsen <br> <br> <br> <br> <br> <br> <br>"));
            sw.append($('<div class="leg-display">').html("Database: <br> Ferry Timmers <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br> <br>"));
            sw.append($('<div class="leg-display">').html("CSS: <br> Henk Alkema <br> Frederique Gerritsen <br> Jeroen van de Ven <br> <br> <br> <br> <br> <br>"));
			sw.append($('<div class="leg-display">').html("Javascript/JQuery: <br> Henk Alkema <br> Ferry Timmers <br> Jeroen van de Ven <br> Philip Klees <br> Florian Oosterhof <br> Sjarlie Graaumans <br> Frederique Gerritsen <br> Max Hageluken"));
			sw.append($('<div class="leg-display">').html("Groep Cup-A-SEP <br> Technische Universiteit Eindhoven <br> <br> <br> <br> <br> <br> <br> <br>"));
			triplength = 10;
            initSwipe();
		}

	});
	
	
    function clickMap(i)
    {
        localStorage['ShowMap'] = i;
        window.location = "legmap.html";
    }
    function clickStops(i)
    {
        localStorage['ShowMap'] = i;
        window.location = "legmap.html";
    }
};
