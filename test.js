let _     = require('lodash');
let async = require('async');
let debug = require('debug')('explorer:test');
let Explorer = require('./lib/explorer');

const MASTER_DISCOVERY_FILE = "https://s3.us-east-2.amazonaws.com/jaimerump-test/discovery.json";

let explorer = new Explorer({ url: MASTER_DISCOVERY_FILE });

explorer.discover(function(err) {
  debug("Discovery error:", err);

  // Now try a get
  explorer.item.get({}, function(err, items) {

    debug("Response:", err, items);

    // Now try getting a single record
    explorer.item.get( "1", function(err, item) {

      debug("Response:", err, item);

    }); // explorer.item.get

  }); // explorer.item.get

}); // explorer.discover