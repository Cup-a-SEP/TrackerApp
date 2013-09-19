//Storage functions

var LocalDBObj = new LocalDB('jemoeder');
//console.log(LocalDBObj);


LocalDBObj.insert({a:1,b:2});

LocalDBObj.selectOne(1, function(localDbResultObj) { console.log(localDbResultObj); });

storeData = function(tx, tableName, data) {
	var keys = '', els = '';
	jQuery.each(data, function (key, el) {
		keys += ', `' + key + '`';
		els += ', \'' + el + '\'';
	});
	
	var sqlquery = 'INSERT INTO ' + tableName + ' (' + keys.substring(2) + ') VALUES (' + els.substring(2) + ')';
	tx.executeSql(sqlquery);
};


storageTest = function () {

window.openDatabase("FritsOVLocalDatabase2", this.pDbVersion, "FritsOV Local Database", 1000, onDBCreate);
	db.transaction(function(tx) {
			storeData(tx, 'jemoeder', {a:1,b:2,c:3});
		}, 
		errorCB, 
		successCB
	);
	
	db.transaction(queryDB, errorCB);	

};

onDeviceReady = function () {
	console.log('Device ready (storage test');
	//storeData('jemoeder', {a:1,b:2,c:3});
};
	
resetTable = function () {

	var db = window.openDatabase("Database", "1.0", "Frits Storage jemoeder 1", 1000);

	db.transaction(function(tx) {
			tx.executeSql('DROP TABLE IF EXISTS jemoeder');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS jemoeder (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, a, b, c)');
		}, 
		errorCB, 
		successCB
	);
};
document.addEventListener("deviceready", onDeviceReady, false);



function errorCB(err) {
	alert("Error processing SQL: "+err.code);
	console.log(err);
}

function successCB() {
	alert("success!");
}


function queryDB(tx) {
	tx.executeSql('SELECT * FROM jemoeder', [], querySuccess, errorCB);
}

function querySuccess(tx, results) {
	var len = results.rows.length;
	console.log("jemoeder table: " + len + " rows found.");
	for (var i=0; i<len; i++){
		console.log("Row = " + i + " ID = " + results.rows.item(i).id + " a =  " + results.rows.item(i).a + " b =  " + results.rows.item(i).b + " c =  " + results.rows.item(i).c);
	}
}
