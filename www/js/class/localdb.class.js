//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

/**
 * Initialize a LocalDB instance for a specified table and database structure version
 * @classdesc Class to aid access to the local database on a device. Also contains the table structure.
 * @name LocalDB
 * 
 * @constructor
 * @param {String} tableStruct - A create table structure query
 * @param {String} dbVersion   - Version of the data structure expected on the device
 * @throws {TypeError} Error when supplied table structure is incorrect
 * 
 */
var LocalDB = Class.create({
	
	//Constants
	/**
	 * Version of this class code
	 * @constant {Number} cClassVersion
	 * @memberof LocalDB.prototype
	 * @default 1
	 */
	cClassVersion: 1,
	
	/**
	 * When DB Version is not specified, it uses this value.
	 * @constant {Number} cDefaultDbVersion
	 * @memberof LocalDB.prototype
	 * @default 2
	 */
	cDefaultDbVersion: 2,
	
	//Properties
	/**
	 * Database version this instance uses
	 * @member {Number} pDbVersion
	 * @memberof LocalDB.prototype
	 * @readonly
	 */
	pDbVersion: undefined,
	
	/**
	 * WebSQl object this instance uses
	 * @member {Database} pDbo
	 * @memberof LocalDB.prototype
	 * @readonly
	 */
	pDbo: undefined,
	
	/**
	 * Name of the table this instance uses
	 * @member {String} pTableName
	 * @memberof LocalDB.prototype
	 * @readonly
	 */
	pTableName: undefined,
	
	/**
	 * SQL Structure of the table this instance uses
	 * @member {String} pTableStruct
	 * @memberof LocalDB.prototype
	 * @readonly
	 */
	pTableStruct: undefined,
	
	/**
	 * Error state of this instance
	 * @member {Boolean} pError
	 * @memberof LocalDB.prototype
	 * @readonly
	 */
	pError: false,
	
	//Methods
	onDbCreate: function (db)
	{
	  //Attach the database because "window.openDatabase" would not have returned it
		this.pDbo = db;
		this.initDbStruct();
	},
	
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
	 * @memberof LocalDB.prototype
	 * @param {Number} id    - Row ID in the database table
	 * @param {Array} fields - List of fields to select (optional) 
	 * @return {Object} A jQuery deferred object
	 */
	selectById: function(id, fields)
	{
		fields = fields ? $.map(fields, function(field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '` WHERE id=\'' + id + '\';';
		
		return this.query(sqlquery);
	},
	
	/**
	 * Select a single row from the current table
	 * 
	 * @memberof LocalDB.prototype
	 * @param {Number} limit - Limit of the amount of rows returned. A value of -1 disables the limit.
	 * @param {Array} fields - List of fields to select (optional) 
	 * @param {String} sql   - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	selectAll: function(limit, fields, sql)
	{
		fields = fields ? $.map(fields, function(field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		
		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '`'
			+ (sql ? ' ' + sql : '')
			+ (limit > -1 && limit < Infinity ? ' LIMIT ' + limit + ';' : ';');
		
		return this.query(sqlquery);
	},

	/**
	 * Select rows from the current table that match a certain value for a certain column
	 * 
	 * @memberof LocalDB.prototype
	 * @param {Object} match - Column-value pairs to search for in the database
	 * @param {String} sql   - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	selectMatch: function(match, fields, sql)
	{
		fields = fields ? $.map(fields, function(field)
		{
			return '`' + field + '`';
		}).join(', ') : '*';
		
		var wheres = jQuery.map(match, function (val, col)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');

		var sqlquery = 'SELECT ' + fields + ' FROM `' + this.pTableName + '` WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');
		
		return this.query(sqlquery);
	},

	/**
	 * Inserts a row into the current table.
	 * 
	 * @memberof LocalDB.prototype
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
	 * @memberof LocalDB.prototype
	 * @param {Number} id     - Id of record to update
	 * @param {Object} values - Column-value pairs to insert for this row
	 * @return {Object} A jQuery deferred object
	 */	
	updateById: function(id, values)
	{
		var updates = jQuery.map(values, function (val, col)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(', ');
		
		var sqlquery = 'UPDATE `' + this.pTableName + '` SET ' + updates + ' WHERE `id` = \'' + id + '\';';

		return this.query(sqlquery);
	},

	/**
	 * Updates a row in the current table using a match.
	 * 
	 * @memberof LocalDB.prototype
	 * @param {Object} values - Column-value pairs to insert for this row
	 * @param {Object} match  - Column-value pairs to search for in the database
	 * @param {String} sql    - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	updateMatch: function(values, match, sql)
	{
		var updates = jQuery.map(values, function (val, col)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(', ');
		
		var wheres = jQuery.map(match, function (val, col)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');
		
		var sqlquery = 'UPDATE `' + this.pTableName + '` SET ' + updates + ' WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');

		return this.query(sqlquery);
	},

	/**
	 * Deletes a row into the current table by id.
	 * 
	 * @memberof LocalDB.prototype
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
	 * @memberof LocalDB.prototype
	 * @param {Object} values - Column-value pairs to search for in the database
	 * @param {String} sql    - Additional SQL parameters (optional)
	 * @return {Object} A jQuery deferred object
	 */	
	deleteMatch: function(match, sql)
	{
		var wheres = jQuery.map(match, function (val, col)
		{
			return '`' + col + '` = \'' + val + '\'';
		}).join(' AND ');
		
		var sqlquery = 'DELETE FROM `' + this.pTableName + '` WHERE ' + wheres + (sql ? ' ' + sql + ';' : ';');
	
		return this.query(sqlquery);
	},

	/**
	 * Executes a raw SQL query.
	 * 
	 * @memberof LocalDB.prototype
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
				//console.log(sqlQuery);
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
				//console.log('success');
				def.resolve(def.result);
			}
		);
		
		return def;
	},

	/**
	 * The database did not exist yet, create the structure here.
	 * @memberof LocalDB.prototype
	 * @private
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
						//console.log("Table `" + self.pTableName + "` created Successfully");
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
 * Initialize a LocalDB instance for a specified table and database structure version
 * @classdesc Class to contain results from the LocalDB database requests
 * 
 * @constructor
 * @param {bool} isSelectQuery Is this the result based on a SELECT query or not
 * @param {String} dbVersion Version of the data structure expected on the device
 */
var LocalDBResult = Class.create({
	
	//Constants
	/**
	 * When DB Version is not specified, use this value.
	 * @constant {Number} cDefaultDbVersion
	 * @memberof LocalDBResult.prototype
	 * @readonly
	 * @default 1
	 */
	cDefaultDbVersion: 1, 
	
	//Properties
	/**
	 * Web SQL result object
	 * @member {DatabaseResult} pResultData
	 * @memberof LocalDBResult.prototype
	 * @readonly
	 */
	pResultData: undefined,
	
	/**
	 * Original SQL query sent
	 * @member {String} pSqlQuery
	 * @memberof LocalDBResult.prototype
	 * @readonly
	 */
	pSqlQuery: undefined,
	
	/**
	 * Number of rows returned in result
	 * @member {Number} pRows
	 * @memberof LocalDBResult.prototype
	 * @readonly
	 */
	pRows: -1,
	
	//Methods
	initialize: function(sqlQuery, resultData)
	{
		this.pSqlQuery = sqlQuery;
		this.pResultData = resultData;
		this.pRows = this.pResultData.rows.length;	
	},
	
	/**
	 * Returns an object representation of the SQL result
	 * @memberof LocalDBResult.prototype
	 * @return {Array} [field => value]
	 */
	toObject: function()
	{	
		var obj = [];
		
		for (var i = 0; i < this.pRows; ++i)
			obj.push(this.pResultData.rows.item(i));
		
		return obj;
	},
	
	/**
	 * Returns on object representation of teh rist row of the SQL result
	 * @memberof LocalDBResult.prototype
	 * @return {Object} field => value
	 */
	firstRow: function()
	{	
		return this.pResultData.rows.item(0);
	},
	
	/**
	 * Returns the numbre of affected rows
	 * @memberof LocalDBResult.prototype
	 * @return {Number} number of rows affected 
	 */
	rowsAffected: function()
	{	
		return this.pResultData.rowsAffected;
	},
	
	/**
	 * Id of insertion
	 * @memberof LocalDBResult.prototype
	 * @return {Number} 
	 */
	insertId: function()
	{	
		return this.pResultData.insertId;
	},
});