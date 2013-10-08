/**
 * Storage related functionality
 * @namespace Storage 
 */
var Storage = {};

Storage.Version = 1;

Storage.init = function StorageInit()
{
	localStorage['Alarm departure time'] = localStorage['Alarm departure time'] || 10;
	localStorage['Alarm embark time'] = localStorage['Alarm embark time'] || 10;
	localStorage['Alarm alight time'] = localStorage['Alarm alight time'] || 10;
	
	localStorage['Alarm departure setting'] = localStorage['Alarm departure setting'] || false;
	localStorage['Alarm embark setting'] = localStorage['Alarm embark setting'] || false;
	localStorage['Alarm alight setting'] = localStorage['Alarm alight setting'] || false;
	
	/*
	 * For reference:
	 *
	 * localStorage['OTP request']
	 * localStorage['OTP data']
	 */
};

/**
 * Location storage for previous used and favourite locations.
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
 * Adds a new location to the stored ones
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
	
	this.db.query("SELECT `name`, `latlng`, `fav` FROM `locations` ORDER BY `fav` DESC, `times`"
		+ (number < Infinity ? "LIMIT " + number : '') + ";").done(function(res)
	{
		def.resolve(res.toObject());
	}).fail(function(err) { def.reject(err); });
	
	return def;
};

/**
 * Trip storage for tracked trips
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
 */
Storage.Trips.store = function StorageTripsStore(trip)
{
	trip = Object.create(trip);
	trip.arriveBy = (trip.arriveBy ? '1' : '0');
	trip.wheelchair = (trip.wheelchair ? '1' : '0');
	trip.preferLeastTransfers = (trip.preferLeastTransfers ? '1' : '0');
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
 * Store a planned trip
 * @param {OTP~PlannerRequest} trip -  A planner request object to remove (only from, to time and date matter) 
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

/*
LocalDB Examples:

var localDbObj = new LocalDB('tablename');

localDbObj.insert(
	{a:2, b:3},
	function(localDbResultObj) { 
		console.log(localDbResultObj.insertId()); 
	}
);

localDbObj.selectOne(
	1, //id
	function(localDbResultObj) { 
		console.log(localDbResultObj.firstRow());
	}
);

localDbObj.selectAll(
	-1, //limit, -1 is no limit
	function(localDbResultObj) { 
		console.log(localDbResultObj.toObject());
	}
);

localDbObj.match(
	{a:2}, //match criteria
	function(localDbResultObj) { 
		console.log(localDbResultObj.toObject());
	}
);

localDbObj.update(
	13, //id
	{a:2, b:3}, //new values
	function(localDbResultObj) { 
		console.log(localDbResultObj.rowsAffected()); 
	}
);

localDbObj.deleteOne(
	14, //id
	function(localDbResultObj) { 
		console.log(localDbResultObj.rowsAffected());
	}
);*/