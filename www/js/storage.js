/**
 * Storage related functionality
 * @namespace Storage 
 */
var Storage = {};

Storage.Version = 1;

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
	this.db = new LocalDB('locations',
		"CREATE TABLE IF NOT EXISTS `locations` (`name` TEXT UNIQUE, `latlng` TEXT, `times` INTEGER, `fav` INTEGER);",
		Storage.Version);
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
	this.db.match({ name: name }, function(res)
	{
		if (res.pRows >= 1)
		{
			var row = res.firstRow();
			if (latlng === undefined) latlng = row.latlng;
			if (fav === undefined) fav = row.fav;
			self.db.updateMatch(
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
			self.db.insert(
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
	
	this.db.query("SELECT `name`, `latlng`, `fav` FROM `locations` ORDER BY `fav` DESC, `times`" + (number < Infinity ? "LIMIT " + number : '') + ";", function(res)
	{
		def.resolve(res.toObject());
	});
	
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
	this.db = new LocalDB('trips', 'CREATE TABLE IF NOT EXISTS `trips` (`from` TEXT NOT NULL, `fromPlace` TEXT, '
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
	this.db.insert(trip);
};

/**
 * Store a planned trip
 * @param {OTP~PlannerRequest} trip -  A planner request object to remove (only from, to time and date matter) 
 */
Storage.Trips.remove = function StorageTripsRemove(trip)
{
	this.db.query("DELETE FROM `trips` WHERE `from` = '" + trip.from + "' "
	                                    + "AND `to` = '" + trip.to + "' "
	                                    + "AND `time` = '" + trip.time + "' "
	                                    + "AND `date` = '" + trip.date + "';");
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