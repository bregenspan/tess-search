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

const log = require('loglevel');
const search = require('./search');

const args = require('yargs')
  .option('log', {
    alias: 'l',
    default: 'info',
    describe: 'Log level (error, info, debug)',
    type: 'string'
  })
  .option('images', {
    alias: 'i',
    default: true,
    describe: 'Whether to retrieve images and include their filenames in output',
    type: 'boolean'
  })
  .option('term', {
    alias: 't',
    describe: 'TESS free-form search term -- e.g. `"Infowars"` or `030926[dc]`.',
    type: 'string'
  })
  .demandOption(['term'])
  .argv;

const searchTerm = args.term;
const logLevel = args.log;
log.setLevel(logLevel);

function progressHandler (event) {
  // Log out progress (with debug info if debug loglevel is enabled)
  let message = event.message;
  if (event.fraction !== undefined) {
    message += ': ' + Math.round((event.fraction * 1000) / 10) + '% complete';
  }
  log.info(message);
  if (event.details) {
    log.debug(event.details);
  }
}

search(searchTerm, args.images, progressHandler)
  .then(function (results) {
    if (logLevel !== 'debug' && logLevel !== 'trace') {
      results.forEach(function (result) {
        delete result._html; // debug data, we don't need
      });
    }
    console.log(results);
  }).catch(function (error) {
    log.error('ERROR: ' + error.message);
    log.error('ERROR DETAILS:');
    log.error(error.details);
  });
