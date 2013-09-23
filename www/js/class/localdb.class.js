//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

/**
 * Class to aid access to the local database on a device. Also contains the table structure.
 */
var LocalDB = Class.create({
	
	//Constants
	cClassVersion: 1, //Version of this class code
	cDefaultDbVersion: 2, //When DB Version is not specified, use this value. 
	
	
	//Properties
	pDbVersion: undefined,
	pDbo: undefined,
	pTableName: undefined,
	pError: false,
	
	dbResultCallback: undefined,
	
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
			this.pDbo = window.openDatabase("FritsOVLocalDatabase2", this.pDbVersion, "FritsOV Local Database", 1000, onDBCreate);
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
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	selectOne: function(id, dbResultCallback) {

		var sqlquery = 'SELECT * FROM ' + this.pTableName + ' WHERE id=\'' + id + '\'';
		
		return this.query(sqlquery, dbResultCallback);
	},
	
	/**
	 * Select a single row from the current table
	 * 
	 * @param {int} limit Limit of the amount of rows returned. A value of -1 disables the limit.
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	selectAll: function(limit, dbResultCallback) {		
		
		var sqlquery = 'SELECT * FROM ' + this.pTableName + (limit > -1 ? (' LIMIT ' + limit + '\'') : '');
		
		return this.query(sqlquery, dbResultCallback);
	},

	/**
	 * Select rows from the current table that match a certain value for a certain column
	 * 
	 * @param {object} values Column-value pairs to search for in the database
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	match: function(values, dbResultCallback) {
		var wheres = '';
		jQuery.each(values, function (col, val) {
			wheres += ' AND `' + col + '` = \'' + val + '\'';
		});

		var sqlquery = 'SELECT * FROM ' + this.pTableName + ' WHERE ' + wheres.substring(5);
		
		return this.query(sqlquery, dbResultCallback);
	},

	/**
	 * Inserts a row into the current table.
	 * 
	 * @param {object} values Column-value pairs to insert for this row
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	insert: function(values, dbResultCallback) {		
		var cols = '', vals = '';
		jQuery.each(values, function (col, val) {
			cols += ', `' + col + '`';
			vals += ', \'' + val + '\'';
		});
		//console.log(values);
		
		
		//this.query('CREATE TABLE IF NOT EXISTS jemoeder (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, a, b, c)', function() {console.log('blaat');});

		var sqlquery = 'INSERT INTO ' + this.pTableName + ' (' + cols.substring(2) + ') VALUES (' + vals.substring(2) + ')';
		
		return this.query(sqlquery, dbResultCallback);
	},


	/**
	 * Updates a row in the current table.
	 * 
	 * @param {object} values Column-value pairs to insert for this row
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	update: function(id, values, dbResultCallback) {		
		var updates = '';
		jQuery.each(values, function (col, val) {
			updates += ', `' + col + '` = \'' + val + '\'';
		});		
		
		var sqlquery = 'UPDATE ' + this.pTableName + ' SET ' + updates.substring(2) + ' WHERE `id` = \'' + id + '\'';

		return this.query(sqlquery, dbResultCallback);
	},

	/**
	 * Deletes a row into the current table.
	 * 
	 * @param {int} id Row ID in the database table
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	deleteOne: function(id, dbResultCallback) {

		var sqlquery = 'DELETE FROM ' + this.pTableName + ' WHERE id=\'' + id + '\'';
	
		return this.query(sqlquery, dbResultCallback);
	},
	

	/**
	 * Perform a query on the database. Disregards current table.
	 * 
	 * @param {String} sqlQuery The query to be executed
	 * @param {function(LocalDBResult object)} dbResultCallback Callback function called on completion of the query
	 */	
	query: function(sqlQuery, dbResultCallback) {
		
		if (!this.pError) {
			
			if ('function' == typeof dbResultCallback) {
				var requestCallback = dbResultCallback;
			} else {
				var requestCallback = function(){};
			}
			
			var queryExecuteCallback = function(tx, result) {
				var localDBResultObj = new LocalDBResult(sqlQuery, result);
				requestCallback(localDBResultObj);
			};
			
			this.dbResultCallback = dbResultCallback;
			this.pDbo.transaction(
				function(tx) { //Transaction function
					tx.executeSql(sqlQuery, [], queryExecuteCallback);
					console.log(sqlQuery);
				}, 
				function(err) { //Error function
					console.log(err);
				}, 
				function() { //Success function
					console.log('success');
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
	pResultDataObj: undefined,
	pSqlQuery: undefined,
	pRows: -1,
	
	//Methods
	
	/**
	 * Initialize a LocalDB instance for a specified table and database structure version
	 * 
	 * @param {bool} isSelectQuery Is this the result based on a SELECT query or not
	 * @param {String} dbVersion Version of the data structure expected on the device
	 */
	initialize: function(sqlQuery, resultData) {
		this.pSqlQuery = sqlQuery;
		this.pResultData = resultData;
		this.pRows = this.pResultData.rows.length;	
	},
	
	toObject: function() {
		
		var obj = {};
		
		var item = undefined;
		for (var i = 0; i < this.pRows; i++){
			//results.rows.item(i).id + " a =  " + results.rows.item(i).a + " b =  " + results.rows.item(i).b + " c =  " + results.rows.item(i).c);
			item = this.pResultData.rows.item(i);
			obj[item.id] = item;
		}
		return obj;
	},
	
	firstRow: function() {
		
		return this.pResultData.rows.item(0);
	},
	
	rowsAffected: function() {
		
		return this.pResultData.rowsAffected;
	},
	
	insertId: function() {
		
		return this.pResultData.insertId;
	},
});