//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

//Initialize 'class'
var LocalDB = Class.create({
	
	//Constants
	cDefaultDbVersion: 1,
	
	
	
	//Properties
	pDbVersion: undefined,
	pDbo: undefined,
	pDbo2: undefined,
	pTableName: undefined,
	pError: false,
	
	//Methods
	
	/**
	 * Initialize a LocalDB instance for a specified table and database structure version
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
		var onDBCreate = function (database) {
		  //Attach the database because "window.openDatabase" would not have returned it
			this.pDbo2 = database;
			console.log('blaay');
			/*database.transaction(
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
		  );*/
		};
		
		//Open connection to the database on the device. Failure here may indicate compatibility issues.
		try {
			console.log('try shit');
			var dbo = window.openDatabase("FritsOVLocalDatabase2", '3', "FritsOV Local Database", 1000, onDBCreate);
		} catch (e) {
			//Most likely database version mismatch
			if (e.code == 11) {
				console.log('Database version mismatch, LocalDB object constructor failed');
				this.pError = true;
				return false;
			}
		}
	},
	
	query: function(sqlQuery) {
		if (!$this.pError) {
			
			
			
		}
	}
});


//Instantiate class using:
//var LocalDBObj = new LocalDB();
//LocalDBObj.query('blablabla');
