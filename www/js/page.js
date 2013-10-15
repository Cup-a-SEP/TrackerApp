/**
 * Provides functions for browsing pages
 * @namespace Page
 */
var Page = {};

/**
 * Page history stack
 * @attribute History
 * @type {jQuery}
 */
Page.History = [];

/**
 * Page history stack
 * @attribute History
 * @type {jQuery}
 */
Page.Body = $('body'); 

/**
 * Loads a page and saves the history 
 * @param {Object} href
 */
Page.load = function PageLoad(href)
{
	Page.History.push(Page.Body.contents().clone(true, true));
	Page.Body.load(href);
};

/**
 * Go back a page in history or close the app if the last one 
 */
Page.back = function PageBack()
{
	if (Page.History.length)
		Page.Body.empty().append(Page.History.pop());
	else
		navigator.app.exitApp();
};
