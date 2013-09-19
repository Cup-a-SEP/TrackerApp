
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
	history.back();
}
