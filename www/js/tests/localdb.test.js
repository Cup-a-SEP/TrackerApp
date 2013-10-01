//Test suite for the LocalDB and LocalDBResult classes. Be sure to include localdb.test.js before using this script.
//Prerequisites: A database with a table 'table' must be initialized.


var localDbObj = new LocalDB('table');


//Tests: LocalDB.insert
//Expected output: a number
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
);

*/