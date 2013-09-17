//Supported Platforms:
//	Android
//	BlackBerry WebWorks (OS 6.0 and higher)
//	iPhone
//source: http://docs.phonegap.com/en/1.2.0/phonegap_storage_storage.md.html

$(function() {

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
	
	var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
	db.transaction(populateDB, errorCB, successCB);
});

