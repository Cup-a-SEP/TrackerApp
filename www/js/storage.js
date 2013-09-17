//Supported Platforms:
//	Android
//	BlackBerry WebWorks (OS 6.0 and higher)
//	iPhone
//source: http://docs.phonegap.com/en/1.2.0/phonegap_storage_storage.md.html


onDeviceReady = function () {
	alert('device ready');
	console.log('OPVALLEND!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	storageTest();
};
document.addEventListener("deviceready", onDeviceReady, false);

	
function storageTest() {

	var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
	db.transaction(populateDB, errorCB, successCB);
	
	alert('DB Filled');
	db.transaction(queryDB, errorCB);
}


function populateDB(tx) {
	tx.executeSql('DROP TABLE IF EXISTS DEMO');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
	tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
	tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
}

function errorCB(err) {
	alert("Error processing SQL: "+err.code);
}

function successCB() {
	alert("success!");
}


function queryDB(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function querySuccess(tx, results) {
	// this will be empty since no rows were inserted.
	console.log("Insert ID = " + results.insertId); //TODO: Error here in android (adb logcat | grep 'Web Console')
	// this will be 0 since it is a select statement
	console.log("Rows Affected = " + results.rowAffected);
	// the number of rows returned by the select statement
	console.log("Insert ID = " + results.rows.length);
}
