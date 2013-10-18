/**
 * Provides functions for browsing pages
 * @namespace Page
 */
var Page = {};

/**
 * Format for page states recorded in history 
 * @typedef {Object} Page~State 
 * @property {jQuery} body        - DOM elements recorded in that state
 * @property {Page~Events} events - Callback handlers for page events 
 */

/**
 * callback object for page events
 * @typedef {Object} Page~Events
 * @property {Function} init    -  fired when page is initialized 
 * @property {Function} refresh - fired when a page is reloaded (back button) 
 */

/**
 * Page history stack
 * @attribute History
 * @type Array
 */
Page.History = [];

/**
 * Current location
 * @attribute Location
 * @type String
 */
Page.Location = '';

/**
 * Page contianer element
 * @attribute Body
 * @type jQuery
 */
Page.Body = $('body'); 

/**
 * Loads a page and saves the history 
 * @param {String} href - url for the html portion of the page
 * @param {Page~Events} events - Events object for the javascrip portion of the page
 */
Page.load = function PageLoad(href, events)
{
	Page.History.push(
	{
		body: Page.Body.contents().clone(true, true),
		events: Page.events
	});
	Page.replace(href, events);
};

/**
 * Loads a page without saving history
 * @param {String} href - url for the html portion of the page
 * @param {Page~Events} events - Events object for the javascrip portion of the page
 */
Page.replace = function PageReplace(href, events)
{
	events = events || {};
	Page.events =
	{
		init: events.init || function(){},
		refresh: events.refresh || function(){}
	};
	Page.Body.load(href, Page.events.init);
	Page.Location = href;
};

/**
 * Loads a page and saves the history only if it's not currently open
 * @param {String} href - url for the html portion of the page
 * @param {Page~Events} events - Events object for the javascrip portion of the page
 */
Page.open = function PageOpen(href, events)
{
	
	(href == Page.Location ? Page.replace : Page.load)(href, events);
};

/**
 * Go back a page in history or close the app if the last one 
 */
Page.back = function PageBack()
{
	if (Page.History.length)
	{
		var page = Page.History.pop();
		Page.Body.empty().append(page.body);
		page.events.refresh();
		Page.events = page.events;
	}
	else
		navigator.app.exitApp();
};
