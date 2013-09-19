//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

/**
 * Class to aid access to the local database on a device. Also contains the table structure.
 */
var LocalDB = Class.create({
	
	//Constants
	cDefaultDbVersion: 1, //When DB Version is not specified, use this value. 
	
	
	//Properties
	pDbVersion: undefined,
	pDbo: undefined,
	pTableName: undefined,
	pError: false,
	
	//Methods
	
	/**
	 * Initialize a LocalDB instance for a specified table and database structure version
	 * 
	 * @param {String} tableName Name of the table to connect to
	 * @param {String} dbVersion Version of the data structure expected on the device
	 */
	initialize: function(tableName, dbVersion) {
		if (undefined == dbVersion) {
			this.pDbVersion = this.cDefaultDbVersion;
		} else {
			this.pDbVersion = dbVersion;
		}
		this.pTableName = tableName; 
		//console.log('Connecting to table ' + pTableName + ' version ' + pDbVersion);
		
    //This method is only called once (the first time the database is created)
    //Source: https://developer.blackberry.com/html5/api/database.html
		var onDBCreate = function (db) {
		  //Attach the database because "window.openDatabase" would not have returned it
			this.pDbo = database;
			this.initDbStruct(db);
		};
		
		//Open connection to the database on the device. Failure here may indicate compatibility issues.
		try {
			console.log('try shit');
			this.pDbo = window.openDatabase("FritsOVLocalDatabase2", '3', "FritsOV Local Database", 1000, onDBCreate);
		} catch (e) {
			//(Most likely) database version mismatch
			if (e.code == 11) {
				console.log('Database version mismatch, LocalDB object constructor failed');
				
				//Replace this with code to update the database structure / reset the database (perhaps confirm with user) TODO
				this.pError = true;
				return false;
			}
		}
	},

	/**
	 * Select a single row from the current table
	 * 
	 * @param {int} id Row ID in the database table
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	select: function(id, dbResultCallback) {
		//TODO
		
		
		//tx.executeSql('SELECT * FROM ' + this.pTablename + ' WHERE id=\'' + id + '\'', [], querySuccess, errorCB);
		var sqlquery = 'SELECT * FROM ' + this.pTablename + ' WHERE id=\'' + id + '\'';
		
		return this.query(sqlquery, dbResultCallback);
	},

	/**
	 * Select rows from the current table that match a certain value for a certain column
	 * 
	 * @param {object} values Column-value pairs to search for in the database
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	search: function(values, dbResultCallback) {
		//TODO
	},

	/**
	 * Inserts a row into the current table.
	 * 
	 * @param {object} values Column-value pairs to insert for this row
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	insert: function(values, dbResultCallback) {		
		var cols = '', vals = '';
		$.each(values, function (col, val) {
			cols += ', `' + col + '`';
			vals += ', \'' + val + '\'';
		});
		
		var sqlquery = 'INSERT INTO ' + tableName + ' (' + cols.substring(2) + ') VALUES (' + vals.substring(2) + ')';
		
		return this.query(sqlquery, dbResultCallback);
	},


	/**
	 * Inserts a row into the current table.
	 * 
	 * @param {object} values Column-value pairs to insert for this row
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	update: function(values, dbResultCallback) {		
		var cols = '', vals = '';
		$.each(values, function (col, val) {
			cols += ', `' + col + '`';
			vals += ', \'' + val + '\'';
		});
		
		var sqlquery = 'INSERT INTO ' + tableName + ' (' + cols.substring(2) + ') VALUES (' + vals.substring(2) + ')';
		
		return this.query(sqlquery, dbResultCallback);
	},
	

	/**
	 * Inserts a row into the current table.
	 * 
	 * @param {object} values Column-value pairs to insert for this row
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	insert: function(values, dbResultCallback) {		
		var cols = '', vals = '';
		$.each(values, function (col, val) {
			cols += ', `' + col + '`';
			vals += ', \'' + val + '\'';
		});
		
		var sqlquery = 'INSERT INTO ' + tableName + ' (' + cols.substring(2) + ') VALUES (' + vals.substring(2) + ')';
		
		return this.query(sqlquery, dbResultCallback);
	},

	/**
	 * Perform a query on the database. Disregards current table.
	 * 
	 * @param {String} sqlQuery The query to be executed
	 * @param {function(LocalDBResult object)} dbResltCallback Callback function called on completion of the query
	 */	
	query: function(sqlQuery, dbResultCallback) {
		if (!$this.pError) {
			db.transaction(
				function(tx) { //Transaction function
					tx.executeSql(sqlQuery);
				}, 
				function(err) { //Error function
					console.log(err);
				}, 
				function() { //Success function
					LocalDBResultObj = new LocalDBResult();
					dbResultCallback(LocalDBResultObj);
				}
			);
		}
	},


	/**
	 * The database did not exist yet, create the structure here.
	 * @param {database} db The WebSQL database objectc
	 */	
	initDbStruct: function(db) {
		database.transaction(
			
			
			//Replace this code TODO
		  function (tx) {
		  	tx.executeSql('CREATE TABLE tbl_name (key int unique, name text)',
		    [],
		    function (tx, res) {
		      alert("Table Created Successfully");
		    },
		    function (tx, err) {
		      alert("ERROR - Table creation failed - code: " + err.code + ", message: " + err.message);
	      });
	    }
	  );
	},
	
});

//LocalDBResult Class
//See: http://prototypejs.org/learn/class-inheritance.html

/**
 * Class to contain results from the LocalDB database requests
 */
var LocalDBResult = Class.create({
	
	//Constants
	cDefaultDbVersion: 1, //When DB Version is not specified, use this value. 
	
	
	//Properties
	pDbVersion: undefined,
	pDbo: undefined,
	pTableName: undefined,
	pError: false,
	
	pValue: undefined,
	
	//Methods
	
	/**
	 * Initialize a LocalDB instance for a specified table and database structure version
	 * 
	 * @param {String} tableName Name of the table to connect to
	 * @param {String} dbVersion Version of the data structure expected on the device
	 */
	initialize: function(tableName, dbVersion) {
		this.pValue = 'test!';
		
	
	},

	
});

