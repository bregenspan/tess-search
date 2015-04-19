/**
 *	Master Shredder
 *
 *	A (hopefully) simple Node.js scraping framework, with support for multi-step
 *	scraping workflows, parallel requests, retrieval of binaries, and detecting errors
 *	in responses that do not return meaningful HTTP error codes.
 *
 *	Master Shredder breaks the scraping workflow into a few general types of step, which can be combined
 *	in a number of ways and incorporate the output from prior steps:
 *
 *	* Making requests (ShredderRequest)
 *	* Extracting results from responses (ShredderExtract)
 *	* Retrieving binaries (ShredderRetrieve)
 *
 *	The goal is to be able to define fairly complex scraping workflows in a relatively simple declrative
 *	way that keeps the process easy to understand and debug.
 *
 *	The project name is based on fond childhood memories of a trip to the Teenage Mutant Ninja Turtle
 *	Museum.
 */

var response = require('./lib/response');

// Each step requests with resolveWithFullResponse, and passes referrer in if applicable


// Helpers for defining scraping steps

/**
 * @param {string} url - URL to retrieve
 * @param {string} description - description of step
 * @returns {RequestPromise}
 */
function get(url, description) {
}

/**
 * @param {string} selector - selector to use for extracting content
 * @param {string} description - description of step
 * @returns {RequestPromise}
 */
function extract(selector, description) {
}

/**
 * @param {string} selector - selector to use for extracting content
 * @param {object} fields - object containing any extra fields to add to form
 * @param {string} description - description of step
 * @returns {RequestPromise}
 */
function extractForm(selector, fields, description) {
}

/**
 * @param {string} url - URL to post data from prior step to
 * @param {string} description - description of step
 * @returns {RequestPromise}
 */
function post(url) {
}

// Configure the chain of requests for this scraper
var tessWorkflow = [
    get(LOGIN, 'Log in to TESS'),
    extract(selectors.searchPageLink, 'Get link to search page'),
    get(HOST, attr($1, 'href'), 'Retrieve the search page'), // TODO: automatically add HOST to relative links
    extractForm(selectors.searchForm, {
        p_s_ALL: searchTerm,
        a_search: 'Submit Query',
        p_L: 500
    }, 'Get the search form'),
    post(HANDLER_URL, 'Perform search request'),
	detectError(selectors.titleContainingError, 'Encountered an error querying'),
	extractEach(selectors.documentLink, {
		imageUrl: IMAGE_HANDLER_URL.replace('{serialNumber}', $(el).html()),
		docUrl: HOST + $(el).attr('href')
	}, 'Retrieve search results'),
	getParallel('Retrieve each result'),
	extract(function ($) {
		doc.full = {};
		$(selectors.resultsTable).find('tr').each(function (i, el) {
			var fieldName = $(el).find('td:first-of-type').text().trim(),
				fieldValue = $(el).find('td:last-of-type').text().trim();
			doc.full[fieldName] = fieldValue;
		});
		doc._html = $('body').html();
		return doc;
	}, 'Extract result data'),
	retrieveParallel(response.get('imageUrl'), 'download/path', 'Store images')
];



