/**
 * TESS search script
 *
 * Usage:
 *
 * > node tess.js TERM [--loglevel OPTIONAL_LOG_LEVEL]
 *
 * e.g.
 *
 * > node tess.js infowars
 *
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
var Promise = require('bluebird').Promise,
    using = Promise.using;
var cheerio = require('cheerio');
var log = require('loglevel');
var parseArgs = require('minimist');

var argv = require('minimist')(process.argv.slice(2));
if (!argv._.length) {
    log.error('Please specify a TESS free-form search term -- e.g. `"Infowars"` or `030926[dc]`.');
    process.exit(1);
}
var searchTerm = argv._[0];
log.setLevel(argv.loglevel || 'info');


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
 * Initiate a TESS session, returning a Disposer that can be used with Bluebird's
 * `using` method to ensure we're always well-behaved and log out of TESS.
 * @returns Bluebird.Promise.prototype.disposer
 */
function getSession() {
    log.info('Logging in to TESS...');
    return rp(LOGIN)
        .catch(function (e) {
            log.error('Encountered error logging in to TESS:');
            log.error(e);
        })
        .disposer(function (pageData) {
            var $ = cheerio.load(pageData),
                $logoutForm = $(LOGOUT_BUTTON_SELECTOR).closest('form');
            if (!$logoutForm.length) {
                log.error('Failed to find TESS logout form!');
            }

            log.info('Logging out of TESS...');

            return rp.post({
                uri: HANDLER_URL,
                form: serializeForm($logoutForm)
            }).catch(function (response) {
                log.error('Encountered an error disposing TESS session!');
                log.debug(response);
            });
        });
}

using(getSession(), function (entryPageHtml) {
    var $ = cheerio.load(entryPageHtml),

    // Get a link to the search page (which includes session token)
    link = $('a:contains("Free Form")');
    if (!link.length) {
        throw 'Failed to find link to search page! Full HTML: ' + entryPageHtml;
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

            log.info('Querying ' + searchTerm);

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

            log.debug('Got search response');
            log.debug(response.body);

            var $ = cheerio.load(response.body);

            var titleContainingError = $('title:contains(Error)');
            if (titleContainingError.length) {
                log.error('Encountered an error querying TESS:');
                log.error($('body').text());
            }

            var documentData = $('td:nth-of-type(' + SERIAL_ROW_NUMBER + ') ' + DOCUMENT_LINK_SELECTOR).toArray().map(function (el) {
                return {
                    imageUrl: IMAGE_HANDLER_URL.replace('{serialNumber}', $(el).html()),
                    docUrl: HOST + $(el).attr('href')
                };
            });

            // Output the retrieved document data as an object
            log.info(JSON.stringify(documentData));
        });
});
