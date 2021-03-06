/**
 * Local storage and local database functionality
 * @namespace Storage 
 */
var Storage = {};

/**
 * Version of the storage scheme used (Increment everytime database structures have changed regarding the next release)
 * @attribute {Number} Version
 * @readonly
 * @default 
 */
Storage.Version = 1;

/**
 * Initializes local storage; applies default values when not present. 
 */
Storage.init = function StorageInit()
{
	localStorage['Alarm departure time'] = localStorage['Alarm departure time'] || 10;
	localStorage['Alarm embark time'] = localStorage['Alarm embark time'] || 10;
	localStorage['Alarm alight time'] = localStorage['Alarm alight time'] || 10;
	
	localStorage['Alarm departure setting'] = localStorage['Alarm departure setting'] || false;
	localStorage['Alarm embark setting'] = localStorage['Alarm embark setting'] || false;
	localStorage['Alarm alight setting'] = localStorage['Alarm alight setting'] || false;
};

/**
 * Storage for previous used and favourite locations.
 * @namespace Storage.Locations 
 */
Storage.Locations = {};

/**
 * Initializes the locations database
 */
Storage.Locations.init = function()
{
	this.db = new LocalDB("CREATE TABLE IF NOT EXISTS `locations` "
		+ "(`name` TEXT UNIQUE, `latlng` TEXT, `times` INTEGER, `fav` INTEGER);", Storage.Version);
};

/**
 * Adds a new location to the stored ones or increases the usage counter if it already exists
 * @param {String} name   - Location name
 * @param {String} latlng - Geoposition coordinates concated with a comma
 * @param {Boolean} fav   - Is this locations favourited (or just previously used). 
 */
Storage.Locations.store = function StorageLocationsStore(name, latlng, fav)
{
	var self = this;
	this.db.selectMatch({ name: name }).done(function(res)
	{
		if (res.pRows >= 1)
		{
			var row = res.firstRow();
			if (latlng === undefined) latlng = row.latlng;
			if (fav === undefined) fav = row.fav;
			return self.db.updateMatch(
			{
				latlng: latlng,
				times: Number(row.times) + 1,
				fav: fav ? '1' : '0',
			},
			{
				name: name,
			});
		}
		else
			return self.db.insert(
			{
				name: name,
				latlng: latlng,
				times: String(0),
				fav: fav ? '1' : '0' 
			});
	});
};

/**
 * Retrieves the a number of locations sorted by favourite and times used
 * @param {Number} number - number of location entries to retrieve
 * @return {Object} jQuery deferred object 
 */
Storage.Locations.list = function StorageLocationsList(number)
{
	var def = $.Deferred();
	
	this.db.query("SELECT `name`, `latlng`, `fav` FROM `locations` ORDER BY `fav` DESC, `times` DESC"
		+ (number < Infinity ? "LIMIT " + number : '') + ";").done(function(res)
	{
		def.resolve(res.toObject());
	}).fail(function(err) { def.reject(err); });
	
	return def;
};

/**
 * Storage for tracked trips
 * @namespace Storage.Trips
 */
Storage.Trips = {};

/**
 * Initialize the trips database 
 */
Storage.Trips.init = function StorageTripsInit()
{
	this.db = new LocalDB('CREATE TABLE IF NOT EXISTS `trips` (`from` TEXT NOT NULL, `fromPlace` TEXT, '
	                                                        + '`to` TEXT NOT NULL, `toPlace` TEXT, '
	                                                        + '`time` TEXT NOT NULL, `date` TEXT NOT NULL, '
	                                                        + '`expectedDepartureTime` INTEGER NOT NULL, '
	                                                        + '`expectedArrivalTime` INTEGER NOT NULL, '
	                                                        + '`arriveBy` INTEGER, `mode` TEXT, '
	                                                        + '`wheelchair` INTEGER, `preferLeastTransfers` INTEGER, '
	                                                        + 'PRIMARY KEY (`from`, `to`, `time`, `date`) );',
	                                                        Storage.Version);
};

/**
 * Store a planned trip
 * @param {OTP~PlannerRequest} trip -  A planner request object to store 
 * @return {Object} jQuery deferred object 
 */
Storage.Trips.store = function StorageTripsStore(trip)
{
	trip = 
	{
		from: trip.from,       fromPlace: trip.fromPlace            ,
		to:   trip.to,         toPlace:   trip.toPlace              ,
		time: trip.time,       date:      trip.date                 ,
		expectedDepartureTime: trip.expectedDepartureTime           ,
		expectedArrivalTime:   trip.expectedArrivalTime             ,
		arriveBy:              trip.arriveBy             ? '1' : '0',
		mode:                  trip.mode                            ,
		wheelchair:            trip.wheelchair           ? '1' : '0',
		preferLeastTransfers:  trip.preferLeastTransfers ? '1' : '0'
	};
	
	return this.db.insert(trip);
};

/**
 * Retrieves  a number of trips sorted by expected departure time
 * @param {Number} number - number of trip entries to retrieve
 * @return {Object} jQuery deferred object 
 */
Storage.Trips.list = function StorageTripsList(number)
{
	var def = $.Deferred();
	
	this.db.selectAll(number, undefined, 'ORDER BY `expectedDepartureTime`').done(function(res)
	{
		def.resolve(res.toObject());
	}).fail(function(err) { def.reject(err); });
	
	return def;
};

/**
 * Retrieves the first trip sorted by expected departure time
 * @return {Object} jQuery deferred object 
 */
Storage.Trips.next = function StorageTripsNext()
{
	var def = $.Deferred();
	
	this.db.selectAll(1, undefined, 'ORDER BY `expectedDepartureTime`').done(function(res)
	{
		def.resolve(res.toObject()[0]);
	}).fail(function(err) { def.reject(err); });
	
	return def;
};

/**
 * Remove a planned trip
 * @param {OTP~PlannerRequest} trip -  A planner request object to remove (only from, to time and date matter) 
 * @return {Object} jQuery deferred object 
 */
Storage.Trips.remove = function StorageTripsRemove(trip)
{
	return this.db.deleteMatch(
	{
		from: trip.from,
		to: trip.to,
		time: trip.time,
		date: trip.date,
	});
};