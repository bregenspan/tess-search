/**
 * TESS search script
 *
 * Usage:
 *
 * > node cli.js TERM [--loglevel OPTIONAL_LOG_LEVEL]
 *
 * e.g.
 *
 * > node cli.js infowars
 *
 */

// jshint node:true
'use strict';

var log = require('loglevel');
var parseArgs = require('minimist');
var search = require('./search');

var argv = require('minimist')(process.argv.slice(2));
if (!argv._.length) {
    log.error('Please specify a TESS free-form search term -- e.g. `"Infowars"` or `030926[dc]`.');
    process.exit(1);
}

var searchTerm = argv._[0];
var logLevel = argv.loglevel || 'info';
log.setLevel(logLevel);

function progressHandler(event) {
    // Log out progress (with debug info if debug loglevel is enabled)
    var message = event.message;
    if (event.fraction !== undefined) {
        message += ': ' + (event.fraction * 100) + '% complete';
    }
    log.info(message);
    if (event.details) {
        log.debug(event.details);
    }
}

search(searchTerm, progressHandler)
    .then(function (results) {

        if (logLevel !== 'debug' && logLevel !== 'trace') {
            results.forEach(function (result) {
                delete result._html;  // debug data, we don't need
            });
        }
        log.info(results);
    }).catch(function (error) {
        log.error('ERROR: ' + error.message);
        log.error('ERROR DETAILS:');
        log.error(error.details);
    });
