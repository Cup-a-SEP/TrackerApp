/**
 * Storage related functionality
 * @namespace Storage 
 */
var Storage = {};

/**
 * Location storage for previous used and favourite locations.
 * @namespace Storage.Locations 
 */
Storage.Locations = {};

Storage.Locations.DB = new LocalDB('locations');

/**
 * Adds a new location to the stored ones
 * @param {String} name   - Location name
 * @param {String} latlng - Geoposition coordinates concated with a comma
 * @param {Integer} times - Number of times the location is used
 * @param {Boolean} fav   - Is this locations favourited (or just previously used). 
 */
Storage.Locations.store = function StorageLocationsStore(name, latlng, times, fav)
{
	var res = Storage.Locations.DB.match({ name: name });
	if (res.pRows < 1 || (!this.pResultData.rows.item(0).fav && fav))
	{
		// Todo: Check query
		/* Get correct row from the database
		 * Increase times by 1
		 * update the correct row
		 */
		Storage.Locations.DB.update(
			{
				name: name,
				latlng: latlng,
				times: times + 1,
				fav: fav
			}
		);
	}
	else
		Storage.Locations.DB.insert(
		{
			name: name,
			latlng: latlng,
			times: 0,
			fav: !!fav	
		});
};


jQuery(function(){
	
	
	var localDbObj = new LocalDB('table');

	
	//Tests: LocalDB.insert
	//Expected output: a number
	localDbObj.insert(
		{a:22, b:23},
		function(localDbResultObj) { 
			console.log(localDbResultObj.insertId()); 
		}
	);

});

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