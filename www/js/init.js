
/**
 * Initialization when the device is ready
 */
document.addEventListener('deviceready',function onDeviceReady()
{
	document.addEventListener("backbutton", onBackButton, false);
}, false);

/**
 * Back button event - Goes to the previous page.
 */
function onBackButton()
{
	console.log('The user wants to go back...');
	history.back();
}

$(function()
{
	$('#back').click(function()
	{
		onBackButton();
	});
	
	Storage.init();
	Service.Alarm.Callback = function(type, leg)
	{
		var map = {
			'departure':'Vertrek',
			'embark':'Instap',
			'alight':'Uitstap'
		};
		alert('De ' + map[type] + ' wekker ging af!\n' + leg.from.name + ' -> ' + leg.to.name + ' (debug)');
	};
	setTimeout(Polling, 0);
});

function Polling()
{
    // alert code START
    var req = $.parseJSON(localStorage['OTP request']);
    var oldData = $.parseJSON(localStorage['OTP data']);
    
    if(req && oldData){
        // Get the next stopID and the time the user will be there
        var oldLegs = oldData.itineraries[0].legs;
        var now = new Date().getTime();
        var curLeg;
        for(var i = 0; i < oldLegs.length; i++){
            if(now <= oldLegs[i].endTime){
                curLeg = oldLegs[i];
                break;
            }
        }
        
        if(!curLeg) return;
        
        var nextStopId;
        var nextStopTime;
        if(now < curLeg.startTime){
            // waiting to start curLeg, therefore at the starting location of curLeg
            nextStopTime = now;
            if(curLeg == oldLegs[0]){
                nextStopId = req.fromPlace;
            } else {
                nextStopId = curLeg.from.stopId.agencyId + '_' + curLeg.from.stopId.id;
            }
        } else {
            // currently on curLeg
            for(var i = 0; i < curLeg.intermediateStops.length; i++){
                var stop = curLeg.intermediateStops[i];
                var time = stop.arrival;
                if(now < time){
                    nextStopTime = time;
                    nextStopId = stop.stopId.agencyId + '_' + stop.stopId.id;
                    break;
                }
            }
            
            if(!nextStopId){
                // next stop is not one of the intermediate stops, therefore it is the destination
                nextStopTime = curLeg.endTime;
                nextStopId = curLeg.to.stopId.agencyId + '_'+ curLeg.to.stopId.id;
            }
        }
        
        // plan the trip from the next stop
        
        req.fromPlace = nextStopId;
        req.arriveBy = false;
        var d = new Date(nextStopTime);
        req.time = d.getHours() + ':' + d.getMinutes();
        
        
        OTP.plan(req).done(function(data)
        {
            var newLegs = data.itineraries[0].legs;
            var offset = oldLegs.length - newLegs.length;
            
            for(var i = 0; i < newLegs.length; i++){
                if(newLegs[i].tripId != oldLegs[i+offset].tripId){
                    // TODO: handle the alarm
                    console.log("OMGWTFBBQ! ALERT!!!11!!!!!!");
                }
            }
        }).fail(function(error){
            console.log("Error in OTP alert plan " + error);
        });
    }
    // end alert code
    
	var next = Service.Alarm.check() - new Date().getTime();
	next = Math.max(Math.min(next / 2, 5 * 60 * 1000), 1000);
	setTimeout(Polling, next);
}
