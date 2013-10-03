/**
 * Provides useful functions for general things 
 * @namespace Misc 
 */
var Misc = {};

/*
 * Levenshtein algorithm cost specification
 * @typedef {Object} Misc~LDistanceCost
 * @property {Number} del  - Cost of deleting a letter
 * @property {Number} ins  - Cost of inserting a letter
 * @property {Number} subs - Cost of substituting a letter
 */

/**
 * Calculates the Levenshtein distance between two strings
 * @param {String} src              - Source string
 * @param {String} dst              - Target string
 * @param {Misc~LDistanceCost} cost - Specifies cost parameters for the algorithm (optional)
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
