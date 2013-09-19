
/*
 * Initialization when the device is ready
 */
document.addEventListener('deviceready',function onDeviceReady()
{
	document.addEventListener("backbutton", onBackButton, false);
}, false);

/*
 * Back button event
 */
function onBackButton()
{
	console.log('The user want\'s to go back...');
	history.back();
}
