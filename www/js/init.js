
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

$(function()
{
	$('#back').click(function()
	{
		onBackButton();
	});
	
	Storage.init();
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
			
			polling();
			setInterval(polling, 1000);
		});
	});
}

function polling()
{
	var now = new Date().getTime();
	var alarm = nextOTP.itineraries[0].startTime - Number(localStorage['Alarm departure time']) * 60;
	var lastAlarm = Number(localStorage['Alarm last']);
	
	if (localStorage['Alarm departure setting'] == 'true')
	{
		if ((!lastAlarm || lastAlarm < alarm) && alarm < now)
		{
			alert('Het is tijd!!');
			localStorage['Alarm last'] = lastAlarm = alarm;
		}
	} 
}
