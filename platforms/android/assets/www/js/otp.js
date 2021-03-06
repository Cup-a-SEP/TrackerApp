/**
 * Provides functions for planning a multi modality route
 * @namespace OTP
 */
var OTP = {};

/**
* A OTP server requets for planning trips 
* @typedef {Object} OTP~PlannerRequest 
* @property {String}  from                        - De plaats waar vandaan wordt gepland in text (niet onderdeel van OTP)
* @property {String}  to                          - De plaats waar naartoe wordt gepland in text (niet onderdeel van OTP)
* @property {String}  fromPlace                   - De plaats waar vandaan wordt gepland in WGS 84 (lon,lat) coördinaten. Bijvoorbeeld 52.09060823332514,5.111281871795654.
* @property {String}  toPlace                     - De plaats waar naartoe wordt gepland in WGS 84 (lon,lat) coördinaten. Bijvoorbeeld 52.252699045023974,6.169391870498657.
* @property {String}  date                        - De datum van vertrek (of aankomst wanneer arriveBy true is). Notatie is YYYY-MM-DD, dus bijvoorbeeld 2013-08-31.
* @property {String}  time                        - De tijd van vertrek (of aankomst wanneer arriveBy true is). Notatie is HH:MM, dus bijvoorbeeld 13:15.
* @property {Number}  expectedDepartureTime       - Verwachte datum/tijd  van vertrek (time code) (niet onderdeel van OTP)
* @property {Number}  expectedArrivalTime         - Verwachte datum/tijd  van aankomst (time code) (niet onderdeel van OTP)
* @property {Boolean} arriveBy                    - Plant vanaf vertrektijd en datum wanneer deze waarde false is, plant vanaf aankomsttijd en datum wanneer deze waarde true is.
* @property {String}  mode                        - De modaliteiten die gebruikt mogen worden. Geldige waarden zijn: WALK, BICYCLE, CAR, TRAM, SUBWAY, RAIL, BUS, FERRY, CABLE_CAR, GONDOLA, FUNICULAR, TRANSIT, TRAINISH, BUSISH, (LEG_SWITCH, CUSTOM_MOTOR_VEHICLE)
* @property {Boolean} wheelchair                  - Geeft aan dat de gebruiker een rolstoelvriendelijke reis wil planner wanneer deze waarde true is.
* @property {String}  startTransitTripId          - Geeft aan dat de gebruiker wil plannen vanaf een trip met een bepaald id. Notatie is agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @property {Boolean} preferLeastTransfers        - Geeft aan dat de gebruiker wil optimaliseren voor een reis met zo min mogelijk overstappen.
* @property {String}  transferPenalty             - Is beschikbaar voor OpenTripPlanner API compatibiliteit. Wordt niet gebruikt wanneer preferLeastTransfers true is.
* @property {String}  nonpreferredTransferPenalty - Is beschikbaar voor OpenTripPlanner API compatibiliteit.
* @property {String}  bannedRoutes                - Geeft een lijst (cs) van routes die niet gebruikt mogen worden voor het reisadvies. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @property {String}  bannedTrips                 - Geeft een lijst (cs) van ritten die niet gebruikt mogen worden voor het reisadvies. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @property {String}  bannedStops                 - Geeft een lijst (cs) van haltes die niet gebruikt mogen worden voor het reisadvies. Deze haltes mogen niet gebruikt worden om in of uit te stappen. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @property {String}  bannedStopsHard             - Geeft een lijst (cs) van haltes die niet gebruikt mogen worden voor het reisadvies. Deze haltes mogen niet gebruikt worden om in of uit te stappen en door heen te reizen. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
*/

/**
 * Location to the Open Trip Planner server
 * @attribute ServerPath
 * @readOnly
 * @type string
 * @default
 */
//OTP.ServerPath = 'http://b-direct.cup-a-sep.nl/rest/v1.0/';
OTP.ServerPath = 'http://opentripplanner.nl/otp-rest-servlet/ws/';
//OTP.ServerPath = 'http://ferrari.goabout.com:8080/otp-rest-servlet/ws/';
//OTP.ServerPath = 'http://otp1.do.goabout.com:8080/otp-rest-servlet/ws/';

/*OTP.PlannerRequest = function OTPPlannerRequest(fromPlace, toPlace, date, time, arriveBy, wheelchair, preferLeastTransfers, mode)
{
	this.fromPlace = fromPlace;
	this.toPlace = toPlace;
	this.date = date;
	this.time = time;
	this.arriveBy = arriveBy;
	this.wheelchair = wheelchair;
	this.preferLeastTransfers = preferLeastTransfers;
	this.mode = mode;
};*/

/**
 * Plans a route using the Open Trip Planner interface. 
 * @param {OTP~PlannerRequest} request - Planner request input 
 * @return {Object} returns a $ deferred object
 */
OTP.plan = function OTPPlan(request)
{
	var def = $.Deferred();
	
	$.getJSON(OTP.ServerPath + 'plan', request).done(function(data)
	{
		if (typeof data != 'object')
			def.reject(data);
		else if (!data.error)
			def.resolve(data.plan);
		else
			def.reject(data.error.id, data.error.msg);
	}).fail(function(jqxhr, textStatus, error)
	{
		def.reject(textStatus, error);
	});
	
	return def;
};