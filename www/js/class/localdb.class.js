//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

// If this code works, it was written by Jeroen van de Ven. If not, I don't know who wrote it.

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
	pTableStruct: undefined,
	pError: false,
	
	dbResultCallback: undefined,
	
	//Methods
	onDbCreate: function (db)
	{
	  //Attach the database because "window.openDatabase" would not have returned it
		this.pDbo = db;
		this.initDbStruct();
	},
		
	/**
	 * Initialize a LocalDB instance for a specified table and database structure version
	 * 
	 * @param {String} tableStruct - A create table structure query
	 * @param {String} dbVersion   - Version of the data structure expected on the device
	 */
	initialize: function(tableStruct, dbVersion)
	{
		if (undefined == dbVersion)
			this.pDbVersion = this.cDefaultDbVersion;
		else
			this.pDbVersion = dbVersion;
		
		var table = tableStruct.match(/`([^`]+)`/);
		if (table == null)
			throw new TypeError('Table structure is invalid!');
		
		this.pTableName = table[1]; 
		this.pTableStruct = tableStruct;

		//Open connection to the database on the device. Failure here may indicate compatibility issues.
		try {
			this.pDbo = window.openDatabase("FritsOVLocalDatabase", this.pDbVersion, "FritsOV Local Database", 1000, this.onDbCreate.bind(this));
			this.initDbStruct(); // Just force table creation every time (it has the IF EXISTS so it's fine)
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
	 * Callback function called on completion of the query
	 * @callback LocalDB~Success
	 * @param {LocalDBResult} object - Database result
	 */
	
	/**
	 * Callback function called on failure of the query
	 * @callback LocalDB~Error
	 * @param {String} error - Error message
	 */
	
	/**
	 * Select a single row from the current table by id
	 * 
	 * @param {Number} id    - Row ID in the database table
	 * @param {Array} fields - List of fields to select (optional) 
	 * @return {Object} A jQuery deferred object
	 */
	selectById: function(id, fields)
	{
		fields = fields ? $.map(fields, function(i, field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '` WHERE id=\'' + id + '\';';
		
		return this.query(sqlquery);
	},
	
	/**
	 * Select a single row from the current table
	 * 
	 * @param {Number} limit - Limit of the amount of rows returned. A value of -1 disables the limit.
	 * @param {Array} fields - List of fields to select (optional) 
	 * @param {String} sql   - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	selectAll: function(limit, fields, sql)
	{
		fields = fields ? $.map(fields, function(i, field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		
		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '`'
			+ (limit > -1 && limit < Infinity ? (' LIMIT ' + limit + '\'') : '')
			+ (sql ? ' ' + sql + ';' : ';');
		
		return this.query(sqlquery);
	},

	/**
	 * Select rows from the current table that match a certain value for a certain column
	 * 
	 * @param {Object} match - Column-value pairs to search for in the database
	 * @param {String} sql   - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	selectMatch: function(match, fields, sql)
	{
		fields = fields ? $.map(fields, function(i, field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		
		var wheres = jQuery.map(match, function (col, val)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');

		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '` WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');
		
		return this.query(sqlquery);
	},

	/**
	 * Inserts a row into the current table.
	 * 
	 * @param {Object} values - Column-value pairs to insert for this row
	 * @return {Object} A jQuery deferred object
	 */	
	insert: function(values)
	{		
		var cols = [], vals = [];
		jQuery.each(values, function (col, val)
		{
			cols.push('`' + col + '`');
			vals.push('\'' + val + '\'');
		});

		var sqlquery = 'INSERT INTO `' + this.pTableName + '` (' + cols.join(', ') + ') VALUES (' + vals.join(', ') + ');';
		
		return this.query(sqlquery);
	},


	/**
	 * Updates a row in the current table by id.
	 * 
	 * @param {Number} id     - Id of record to update
	 * @param {Object} values - Column-value pairs to insert for this row
	 * @return {Object} A jQuery deferred object
	 */	
	updateById: function(id, values)
	{
		var updates = jQuery.map(values, function (col, val)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(', ');
		
		var sqlquery = 'UPDATE `' + this.pTableName + '` SET ' + updates + ' WHERE `id` = \'' + id + '\';';

		return this.query(sqlquery);
	},

	/**
	 * Updates a row in the current table using a match.
	 * 
	 * @param {Object} values - Column-value pairs to insert for this row
	 * @param {Object} match  - Column-value pairs to search for in the database
	 * @param {String} sql    - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	updateMatch: function(values, match, sql)
	{
		var updates = jQuery.map(values, function (col, val)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(', ');
		
		var wheres = jQuery.map(match, function (col, val)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');
		
		var sqlquery = 'UPDATE `' + this.pTableName + '` SET ' + updates + ' WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');

		return this.query(sqlquery);
	},

	/**
	 * Deletes a row into the current table by id.
	 * 
	 * @param {Number} id Row ID in the database table
	 * @return {Object} A jQuery deferred object
	 */	
	deleteById: function(id) {

		var sqlquery = 'DELETE FROM `' + this.pTableName + '` WHERE id=\'' + id + '\';';
	
		return this.query(sqlquery);
	},
	
	/**
	 * Deletes a row into the current table by match.
	 * 
	 * @param {Object} values - Column-value pairs to search for in the database
	 * @param {String} sql    - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	deleteMatch: function(match, sql)
	{
		var wheres = jQuery.map(match, function (col, val)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');
		
		var sqlquery = 'DELETE FROM `' + this.pTableName + '` WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');
	
		return this.query(sqlquery);
	},

	/**
	 * Executes a raw SQL query.
	 * 
	 * @param {String} sqlQuery - A SQL query (what a surprise)
	 * @return {Object} A jQuery deferred object
	 */
	query: function(sqlQuery)
	{
		var def = $.Deferred();
			
		if (this.pError)
		{
			def.reject('Invalid database or table initialization failed!');
			return def;
		}
		
		this.pDbo.transaction(
			function transaction(tx)
			{
				console.log(sqlQuery);
				tx.executeSql(sqlQuery, [], function result(tx, result)
				{
					def.result = new LocalDBResult(sqlQuery, result);
				});
			}, 
			function error(err)
			{
				console.log(err);
				def.reject(err);
			}, 
			function success()
			{
				console.log('success');
				def.resolve(def.result);
			}
		);
		
		return def;
	},

	/**
	 * The database did not exist yet, create the structure here.
	 * @param {database} db The WebSQL database objectc
	 */	
	initDbStruct: function()
	{
		var self = this;
		this.pDbo.transaction(
			function (tx)
			{
				tx.executeSql(self.pTableStruct, [],
					function (tx, res)
					{
						console.log("Table `" + self.pTableName + "` created Successfully");
					},
					function (tx, err)
					{
						console.log("ERROR - Table creation failed - code: " + err.code + ", message: " + err.message);
						self.pError = true;
					}
				);
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
	pResultData: undefined,
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
		
		var obj = [];
		
		for (var i = 0; i < this.pRows; i++){
			obj.push(this.pResultData.rows.item(i));
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