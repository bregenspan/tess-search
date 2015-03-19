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
log.setLevel(argv.loglevel || 'info');

function progressHandler(event) {
    // Log out progress (with debug info if debug loglevel is enabled)
    log.info(event.message);
    log.debug(event.details);
}

search(searchTerm, progressHandler)
    .then(function (results) {
        log.info(results);
    }).catch(function (error) {
        log.error('ERROR: ' + error.message);
        log.error('ERROR DETAILS:');
        log.error(error.details);
    });
