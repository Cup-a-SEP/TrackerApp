/**
 * Feedback page namespace
 * @namespace Page.Feedback 
 */
Page.Feedback = {};

/**
 * Initializes feedback page interface
 */
Page.Feedback.init = function PageFeedbackInit()
{
	var emailAddress = "mailto:example@example.com";
	
	/**
	 * Handles effects to form after feedback is sent
	 */
	function wrapUp() {
		document.getElementById("comment").value = "Email verzonden!";
		document.getElementById("submitButton").disabled = true;
	}

	/**
	 * Starts mailing proceedings
	 * @param(subject) The subject of the complaint
	 * @param(body) The body of the email
	 */
	function mail(subject, body) {
		var link = emailAddress + "?subject=" + escape("Klacht over " + subject) + "&body=" + escape(body);
		window.location.href = link;
	}

	/**
	 * Handles the sending of the feedback
	 */
	$('#submitButton').click(function buttonClick() {
		var index = document.getElementById("subject").selectedIndex;
		if (index == 0) {
			var subject = "Frits";
			var body = document.getElementById('comment').value;
			mail(subject, body);
			wrapUp();
		} else if (index == 1) {
			var subject = "de route";
			var body = document.getElementById('comment').value + "\n \nREQUEST:  " + localStorage['OTP request'];
			mail(subject, body);
			wrapUp();
		} else if (document.getElementById("legs").selectedIndex == 0) {
			alert("Maak een keuze in het tweede drop-down menu!");
		} else {
			var e = document.getElementById("legs");
			var subject = e.options[e.selectedIndex].text;
			var body = document.getElementById('comment').value;
			mail(subject, body);
			wrapUp();
		}
	});
	
	/**
	 * Makes the Stations dropdown menu visible and fills it with the different parts of a journey a user can have a complaint about
	 */
	function getStations() {
		$('#legs').attr("style", "display : block");
		var data = $.evalJSON(localStorage['OTP data']);
		var first = true;
		for (var i = 0; i < data.itineraries[0].legs.length; i++) {
			if (data.itineraries[0].legs[i].mode == "BUS") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].from.name + '> Bushalte - ' + data.itineraries[0].legs[i].from.name + '</option>');
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Bushalte -' + data.itineraries[0].legs[i].to.name + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Bushalte -' + data.itineraries[0].legs[i].to.name + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "RAIL") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].from.name + '>' + data.itineraries[0].legs[i].from.name + ', Station NS</option>');
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '>' + data.itineraries[0].legs[i].to.name + ', Station NS</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '>' + data.itineraries[0].legs[i].to.name + ', Station NS</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "TRAM") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].from.name + '> Tramhalte - ' + data.itineraries[0].legs[i].from.name + '</option>');
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Tramhalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Tramhalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "SUBWAY") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].from.name + '> Metrohalte - ' + data.itineraries[0].legs[i].from.name + '</option>');
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Metrohalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Metrohalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "FERRY") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].from.name + '> Veerponthalte - ' + data.itineraries[0].legs[i].from.name + '</option>');
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Veerponthalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].to.name + '> Veerponthalte - ' + data.itineraries[0].legs[i].to.name + '</option>');
				}
			}

		}
	}
	
	/**
	 * Makes the Vehicles dropdown menu visible and fills it with the different parts of a journey a user can have a complaint about
	 */
	function getVehicles() {
		$('#legs').attr("style", "display : block");
		var data = $.evalJSON(localStorage['OTP data']);
		var first = true;
		for (var i = 0; i < data.itineraries[0].legs.length; i++) {
			if (data.itineraries[0].legs[i].mode == "BUS") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '>Bus - ' + data.itineraries[0].legs[i].route + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '>Bus - ' + data.itineraries[0].legs[i].route + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "RAIL") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '>' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '>' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "TRAM") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Tram ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Tram ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "SUBWAY") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Metro ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Metro ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
				}
			} else if (data.itineraries[0].legs[i].mode == "FERRY") {
				if (first) {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Veerpont ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
					first = false;
				} else {
					$("#legs").append('<option value=' + data.itineraries[0].legs[i].tripId + '> Veerpont ' + data.itineraries[0].legs[i].routeShortName + ' - ' + data.itineraries[0].legs[i].routeLongName + '</option>');
				}
			}

		}
	}
	
	/**
	 * Makes a div visible that shows the user about which route he is making a complaint.
	 */
	function createDiv() {
		$('#itineraryHeader').attr("style", "display : block");
		$('#itineraryHeader').attr("style", "margin-top: 3.2 em");
		var req = $.evalJSON(localStorage['OTP request']);
		var data = $.evalJSON(localStorage['OTP data']);

		var from = data.from.name;
		var to = data.to.name;
		var start = UI.formatTime(data.itineraries[0].startTime);
		var end = UI.formatTime(data.itineraries[0].endTime);
		$('#itineraryHeader').append($('<h3>').text(start + ' ' + from + ' - ' + end + ' ' + to));
	}

	/**
	 * Empties the div and makes it invisible.
	 */
	function emptyDiv() {
		$('#itineraryHeader').empty();
		$('#itineraryHeader').attr("style", "display : none");
		$('#itineraryHeader').attr("style", "margin-top: 0 em");
		$('#itineraryHeader').attr("style", "border: 0px");
	}

	/**
	 * Empties the second dropdown and makes it invisible.
	 */
	function emptyLegs() {
		var x = document.getElementById("legs");
		for (var i = x.options.length - 1; i >= 0; i--) {
			x.remove(i);
		}
		$('#legs').append('<option>Maak een keuze!</option>');
		$('#legs').attr("style", "display : none");
	}
	
	/**
	 * Resets the textarea and button disabled setting.
	 */
	function resetText() {
		document.getElementById("comment").value = "Licht hier uw klacht toe";
		document.getElementById("submitButton").disabled = true;
	}
	/**
	 * Changes the form of the layout according to which type of complaint the user has.
	 */
	$('#subject').change(function changeForm() {
		var index = document.getElementById("subject").selectedIndex;
		resetText();
		if (index == 0) {
			emptyLegs();
			emptyDiv();
		} else if (index == 1) {
			emptyLegs();
			if (localStorage['OTP request'] == null) {
				document.getElementById("subject").selectedIndex = 0;
				alert("U kunt geen klacht indienen over een route zonder een route ingepland te hebben.");
			} else {
				createDiv();
			}
		} else if (index == 2){
			emptyDiv();
			emptyLegs();
			if (localStorage['OTP request'] == null) {
				document.getElementById("subject").selectedIndex = 0;
				alert("U kunt geen klacht indienen over een halte of station zonder een route ingepland te hebben.");
			} else {
				getStations();
			}
		} else {
			emptyDiv();
			emptyLegs();
			if (localStorage['OTP request'] == null) {
				document.getElementById("subject").selectedIndex = 0;
				alert("U kunt geen klacht indienen over een vervoersmiddel zonder een route ingepland te hebben.");
			} else {
				getVehicles();
			}
		}
	});

	$(function() {
		// Initialize database
		Storage.Trips.init();
	});
	/**
	 * Empties the textfield when it is tapped.
	 */
	$("#comment").focus(function() {

		if ($(this).val() == "Licht hier uw klacht toe") {
			$(this).val("");

			document.getElementById("submitButton").disabled = false;
		}

	});
};