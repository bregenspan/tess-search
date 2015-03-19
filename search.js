/*
 * TESS searcher
 */

// jshint node:true
/*global process, require*/
'use strict';

// CONSTANTS
var HOST = 'http://tmsearch.uspto.gov';
var HANDLER_URL = HOST + '/bin/gate.exe';
var LOGIN = HANDLER_URL + '?f=login&p_lang=english&p_d=trmk';
var SERIAL_ROW_NUMBER = 2;
var DOCUMENT_LINK_SELECTOR = 'a[href*="f=doc"]';
var IMAGE_HANDLER_URL = HOST + '/ImageAgent/ImageAgentProxy?getImage={serialNumber}&widthLimit=400&heightLimit=300';
var LOGOUT_BUTTON_SELECTOR = 'input[value="Logout"]';

var rp = require('request-promise');
var Promise = require('bluebird').Promise;
var cheerio = require('cheerio');

var jar = rp.jar();

rp = rp.defaults({
    jar: jar,
    //proxy: 'http://localhost:8888',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0 (compatible; TESS-GIF)'
    }
});

/**
 * @param {Cheerio} $form - form element to serialize
 * @returns {object} - object mapping field names to values
 */
function serializeForm($form) {
    return $form.serializeArray().reduce(function (o, v) {
        o[v.name] = v.value;
        return o;
    }, {});
}

/**
 * @param {string} message - user-facing error message
 * @param {object|string} [details] - any extra error details for debug purposes
 */
function TessError(message, details) {
    this.name = 'TessError';
    this.message = message;
    this.details = details;
}
TessError.prototype = Object.create(Error.prototype);
TessError.prototype.constructor = TessError;


/**
 * @param {string} message - user-facing progress message
 * @param {object|string} [details] - details for debug purposes
 */
function TessProgress(message, details) {
    this.message = message;
    this.details = details;
}


/**
 * @param {string} searchTerm - TESS free-form query
 * @param {function} [progressHandler] - optional handler for progress-related events
 */
function search(searchTerm, progressHandler) {

    /**
     * Gets a TESS session, returning a Disposer for session cleanup
     * @returns Bluebird.Promise.prototype.disposer
     */
    function getSession() {

        progressHandler(new TessProgress('Logging in to TESS...'));

        return rp(LOGIN)
            .catch(function (e) {
                throw new TessError('Encountered error logging in to TESS', e);
            })
            .disposer(function (pageData) {
                var $ = cheerio.load(pageData),
                    $logoutForm = $(LOGOUT_BUTTON_SELECTOR).closest('form');
                if (!$logoutForm.length) {
                    return new TessError('Failed to find TESS logout form!');
                }

                progressHandler(new TessProgress('Logging out of TESS...'));

                return rp.post({
                    uri: HANDLER_URL,
                    form: serializeForm($logoutForm)
                }).catch(function (response) {
                    return new TessError('Encountered an error disposing TESS session!');
                });
            });
    }

    return Promise.using(getSession(), function (entryPageHtml) {
        var $ = cheerio.load(entryPageHtml),

        // Get a link to the search page (which includes session token)
        link = $('a:contains("Free Form")');
        if (!link.length) {
            throw new TessError('Failed to find link to search page!', entryPageHtml);
        }

        // Load the search page
        return rp(HOST + link.attr('href'), { resolveWithFullResponse: true })
            .then(function (response) {
                // Search
                var $ = cheerio.load(response.body),
                    formData = serializeForm($('form[name=search_text]'));
                formData.p_s_ALL = searchTerm;
                formData.a_search = 'Submit Query';
                formData.p_L = 500;  // 500 results/page
                //jar.setCookie(rp.cookie('queryCookie=' + encodeURIComponent(formData.p_s_ALL)), HOST);

                progressHandler(new TessProgress('Querying ' + searchTerm));

                return rp.post({
                    uri: HANDLER_URL,
                    form: formData,
                    resolveWithFullResponse: true,
                    headers: {
                        Referer: response.request.href
                    }
                });
            })
            .then(function (response) {
                var $ = cheerio.load(response.body),
                    titleContainingError = $('title:contains(Error)'),
                    documentData;

                if (titleContainingError.length) {
                    throw new TessError('Encountered an error querying TESS', $('body').text());
                }

                progressHandler(new TessProgress('Got search response', response.body));

                documentData = $('td:nth-of-type(' + SERIAL_ROW_NUMBER + ') ' + DOCUMENT_LINK_SELECTOR).toArray().map(function (el) {
                    return {
                        imageUrl: IMAGE_HANDLER_URL.replace('{serialNumber}', $(el).html()),
                        docUrl: HOST + $(el).attr('href')
                    };
                });

                return documentData;
            });
    });
}

module.exports = search;
