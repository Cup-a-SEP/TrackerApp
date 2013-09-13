var OTP = {};

/**
* Plan a route
*
* @param {String}  fromPlace                   De plaats waar vandaan wordt gepland in WGS 84 (lon,lat) coördinaten. Bijvoorbeeld 52.09060823332514,5.111281871795654.
* @param {String}  toPlace                     De plaats waar naartoe wordt gepland in WGS 84 (lon,lat) coördinaten. Bijvoorbeeld 52.252699045023974,6.169391870498657.
* @param {String}  date                        De datum van vertrek (of aankomst wanneer arriveBy true is). Notatie is YYYY-MM-DD, dus bijvoorbeeld 2013-08-31.
* @param {String}  time                        De tijd van vertrek (of aankomst wanneer arriveBy true is). Notatie is HH:MM, dus bijvoorbeeld 13:15.
* @param {Boolean} arriveBy                    Plant vanaf vertrektijd en datum wanneer deze waarde false is, plant vanaf aankomsttijd en datum wanneer deze waarde true is.
* @param {String}  mode                        De modaliteiten die gebruikt mogen worden. Geldige waarden zijn: WALK, BICYCLE, CAR, TRAM, SUBWAY, RAIL, BUS, FERRY, CABLE_CAR, GONDOLA, FUNICULAR, TRANSIT, TRAINISH, BUSISH, (LEG_SWITCH, CUSTOM_MOTOR_VEHICLE)
* @param {Boolean} wheelchair                  Geeft aan dat de gebruiker een rolstoelvriendelijke reis wil planner wanneer deze waarde true is.
* @param {String}  startTransitTripId          Geeft aan dat de gebruiker wil plannen vanaf een trip met een bepaald id. Notatie is agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @param {Boolean} preferLeastTransfers        Geeft aan dat de gebruiker wil optimaliseren voor een reis met zo min mogelijk overstappen.
* @param {String}  transferPenalty             Is beschikbaar voor OpenTripPlanner API compatibiliteit. Wordt niet gebruikt wanneer preferLeastTransfers true is.
* @param {String}  nonpreferredTransferPenalty Is beschikbaar voor OpenTripPlanner API compatibiliteit.
* @param {String}  bannedRoutes                Geeft een lijst (cs) van routes die niet gebruikt mogen worden voor het reisadvies. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @param {String}  bannedTrips                 Geeft een lijst (cs) van ritten die niet gebruikt mogen worden voor het reisadvies. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @param {String}  bannedStops                 Geeft een lijst (cs) van haltes die niet gebruikt mogen worden voor het reisadvies. Deze haltes mogen niet gebruikt worden om in of uit te stappen. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
* @param {String}  bannedStopsHard             Geeft een lijst (cs) van haltes die niet gebruikt mogen worden voor het reisadvies. Deze haltes mogen niet gebruikt worden om in of uit te stappen en door heen te reizen. Notatie is agency_tripId,agency_tripId. Deze informatie kan uit een eerder geplande reis worden gehaald.
*/

OTP.ServerPath = 'http://84.244.177.172/rest/v1.0/';

OTP.PlannerRequest = function OTPPlannerRequest(fromPlace, toPlace, date, time, arriveBy, wheelchair, preferLeastTransfers)
{
	this.fromPlace = fromPlace;
	this.toPlace = toPlace;
	this.date = date;
	this.time = time;
	this.arriveBy = arriveBy;
	this.wheelchair = cheelchair;
	this.preferLeastTransfers = preferLeastTransfers;
};

OTP.plan = function OTPPlan(request, callback)
{
	console.log('start plan');
	$.getJSON(OTP.ServerPath + 'plan',
	request, function(data)
	{
		// Todo: Format data
		console.log('callback');
		callback(data);
	});
};