//LocalDB Class
//See: http://prototypejs.org/learn/class-inheritance.html

//Initialize 'class'
var LocalDB = function(args){};
//Define class
LocalDB.prototype = {
	
	__construct: function(args) {
		console.log(args);
	}
};

//Instantiate class using:
//var LocalDBObj = new LocalDB();
//LocalDBObj.query('blablabla');
