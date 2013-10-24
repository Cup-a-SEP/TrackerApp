/**
 * Provides useful functions for general things 
 * @namespace Misc 
 */
var Misc = {};

/**
 * Alkema-Levenshtein algorithm cost specification
 * This distance is equal to the Levenshtein distance but with free insertions at the end.
 * @typedef {Object} Misc~LDistanceCost
 * @property {Number} del  - Cost of deleting a letter
 * @property {Number} ins  - Cost of inserting a letter
 * @property {Number} subs - Cost of substituting a letter
 */

/**
 * Calculates the Alkema-Levenshtein distance between two strings
 * @param {String} src              - Source string
 * @param {String} dst              - Target string
 * @param {Misc~LDistanceCost} cost - Specifies cost parameters for the algorithm (optional)
 * @return {Number} Distance
 */
Misc.lDistance = function MiscLDistance(src, dst, cost)
{
	if (!src) return 0;
	src = String(src).toLowerCase();
	dst = String(dst).toLowerCase();
	cost = cost || Misc.lDistance.DefaultCost;
	
	var d = new Array(src.length + 1);
	for (var i = 0; i <= src.length; ++i)
		d[i] = new Array(dst.length + 1);
	
	d[0][0] = 0;
	for (var i = 1; i <= src.length; ++i)
		d[i][0] = i * cost.del;
	
	for (var i = 1; i <= dst.length; ++i)
		d[0][i] = i * cost.ins;
	
	for (var j = 1; j <= dst.length; ++j)
	{
		for (var i = 1; i <= src.length; ++i)
		{
			if (i == src.length){
				if (src.charAt(i-1) == dst.charAt(j-1))
					d[i][j] = Math.min(d[i-1][j-1], d[i][j-1]);
				else 
					d[i][j] = Math.min(d[i-1][j] + cost.del, Math.min(d[i][j-1], d[i-1][j-1] + cost.subs));
			} else {
				if (src.charAt(i-1) == dst.charAt(j-1))
					d[i][j] = d[i-1][j-1];
				else 
					d[i][j] = Math.min(d[i-1][j] + cost.del, Math.min(d[i][j-1] + cost.ins, d[i-1][j-1] + cost.subs));
			}
		}
	}
	return d[src.length][dst.length];
};

/**
 * Cost parameters used when none are specified.
 * @attribute DefaultCost
 * @readOnly
 * @type Misc~LDistanceCost
 */
Misc.lDistance.DefaultCost =
{
	del: 2,
	ins: 1,
	subs: 1
};

/**
 * Splits the given time into the hour and minute part
 * @param {String} time              - a time in a hh:mm format
 * @returns {Array} An array of the form [hours, minutes]. Returns null if the time is not a valid time or not in the correct format
 */
Misc.splitTime = function MiscSplitTime(time){
    var split = time.match(/^(\d+):(\d+)$/);
    if(split == null) return null;
    split.shift();
    if(split[0] > 23 || split[1] > 59) return null;
    return split;
};

/**
 * Splits the given date into the day, month and year part
 * @param {String} date             - a date in a yyyy:mm:dd format
 * @returns {Array} An array of the form [day, month, year]. Returns null if the date is not in the correct format and if day > 31 or month > 12.
 * Note that this function will accept impossible dates like for expample 2013-2-31
 */
Misc.splitDate = function MiscSplitDate(date){
    var split = date.match(/^(\d+)-(\d+)-(\d+)$/);
    if(split == null) return null;
    split.shift();
    if(split[1] > 12 || split[2] > 31) return null;
    return split;
};
