
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
	console.log('The user want\'s to go back...');
	history.back();
}

var nextOTP;
var lastAlarm;

$(function()
{
	$('#back').click(function()
	{
		onBackButton();
	});
	
	Storage.init();
	
	// debug:
	localStorage['Alarm departure setting'] = 'true';
	localStorage['Alarm departure time'] = '10';
	
	Storage.Trips.init();
	setTimeout(startPolling, 1000);
});

function startPolling()
{
	Storage.Trips.next().done(function(req)
	{
		console.log(req);
		OTP.plan(req).done(function(data)
		{
			console.log(data);
			nextOTP = data;
			setInterval(polling, 1000);
		});
	});
}

function polling()
{
	var now = new Date().getTime();
	var alarm = nextOTP.itineraries[0].startTime - localStorage['Alarm departure time'];
	
	if (localStorage['Alarm departure setting'] == 'true')
	{
		if (alarm != lastAlarm && alarm < now)
		{
			alert('Het is tijd!!');
			lastAlarm = alarm;
		}
	} 
}
