/**
 * Settings page namespace
 * @namespace Page.Settings 
 */
Page.Settings = {};

/**
 * Initializes settings page interface
 */
Page.Settings.init = function PageSettingsInit()
{	
	$('#departure-slider').val(localStorage['Alarm departure time']).slider();
	$('#embark-slider').val(localStorage['Alarm embark time']).slider();
	$('#alight-slider').val(localStorage['Alarm alight time']).slider();
	
	$('#departure-slider-number').text(localStorage['Alarm departure time']);
	$('#embark-slider-number').text(localStorage['Alarm embark time']);
	$('#alight-slider-number').text(localStorage['Alarm alight time']);
	
	$('#departure-' + (localStorage['Alarm departure setting'] == 'true' ? 'on' : 'off')).prop('checked',true);//.checkboxradio();
	$('#embark-' + (localStorage['Alarm embark setting'] == 'true' ? 'on' : 'off')).prop('checked',true);//.checkboxradio();
	$('#alight-' + (localStorage['Alarm alight setting'] == 'true' ? 'on' : 'off')).prop('checked',true);//.checkboxradio();
	
	$('fieldset').buttonset();
	
	$('#departure-slider').change(function() {
		setTimeout(function() {
			localStorage['Alarm departure time'] = $('#departure-slider').val();
			$('#departure-slider-number').text($('#departure-slider').val());
			Service.Alarm.refresh();
		},0);
	});
	$('#embark-slider').change(function() {
		setTimeout(function() {
			localStorage['Alarm embark time'] = $('#embark-slider').val();
			$('#departure-slider-number').text($('#departure-slider').val());
			Service.Alarm.refresh();
		},0);
	});
	$('#alight-slider').change(function() {
		setTimeout(function() {
			localStorage['Alarm alight time'] = $('#alight-slider').val();
			$('#departure-slider-number').text($('#departure-slider').val());
			Service.Alarm.refresh();
		},0);
	});
	
	$('.departure-control').click(function() {
		setTimeout(function() {
			localStorage['Alarm departure setting'] = $('#departure-on').prop('checked');
			Service.Alarm.refresh();
		},0);
	});
	
	$('.embark-control').click(function() {
		setTimeout(function() {
			localStorage['Alarm embark setting'] = $('#embark-on').prop('checked');
			Service.Alarm.refresh();
		},0);
	});
	
	$('.alight-control').click(function() {
		setTimeout(function() {
			localStorage['Alarm alight setting'] = $('#alight-on').prop('checked');
			Service.Alarm.refresh();
		},0);
	});
	
	// naam waarde
	/*
	localStorage['Alarm departure setting']
	localStorage['Alarm departure time']
	localStorage['Alarm embark setting']
	localStorage['Alarm embark time']
	localStorage['Alarm alight setting']
	localStorage['Alarm alight time']
	*/
};