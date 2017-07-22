let _     = require('lodash');
let async = require('async');
let debug = require('debug')('explorer');
let request = require('request');
let fs      = require('fs');

let Resource = require('./resource');

let default_options = {
    url:         process.env.DISCOVERY_FILE,
    token_name:  process.env.TOKEN_NAME,
    token_value: process.env.TOKEN_VALUE
}

function Explorer( opts ) {
  this._options = _.extend( default_options, opts || {} );
}

/**
 * Kicks off the discovery process
 *
 * TODO: Figure out how to refresh automatically and send event
 */
Explorer.prototype.discover = function( callback ) {
 
  let s = this;

  // Read the main discovery file
  // TODO: Better url/filepath check
  if( _.includes( s._options.url, 'http' ) ) {
      
    debug( "Discovery is remote", s._options.url );
    
    // Set headers
    let headers = {};
    headers[ s._options.token_name ] = s._options.token_value;

    // Make request
    request({
      uri: s._options.url,
      method: 'GET',
      json: true,
      headers: headers
    }, function( err, response, body ) {
      if(err) return callback(err);

      debug("Main remote discovery body:", body);
      s.parseMainDiscovery( body, callback );
    }); // request
  
  } else {
      
    debug( "Discovery is local", s._options.url );
    fs.readFile(s._options.url, function( err, body ) {

      try {
        body = JSON.parse( body );
        debug("Main local discovery body:", body);
        s.parseMainDiscovery( body, callback );
      }
      catch( err ) {
        return callback(err);
      }
       
    }); // fs.readFile

  } // if url or file

}

/**
 * Receives a list of discovery files
 * TODO: Add only and except service lists
 */
Explorer.prototype.parseMainDiscovery = function( service_object, callback ) {

  let s = this;

  s._options.services = _.keys(service_object);

  debug("Service object", service_object)
  debug("Services", s._options.services)

  async.eachSeries( s._options.services, function( service_name, each_callback ) {

    // Pull the service discovery file
    let service_discovery = service_object[ service_name ];

    debug("Service", service_name, service_discovery)

    // Set headers
    let headers = {};
    headers[ s._options.token_name ] = s._options.token_value;

    debug("Requesting ", service_discovery)

    // Get the Service Discovery
    request({
      uri: service_discovery,
      method: 'GET',
      json: true,
      headers: headers
    }, function ( err, response, body ) {

      // Parse and attach resources
      let base_url = service_discovery.replace( '/discover', '' );
      s.parseServiceDiscovery( body, base_url, each_callback );

    }); // request

  }, function(err) {
    callback(err);
  }); // async.eachSeries

}

/**
 * Receives a service discovery file and attaches the resources
 */
Explorer.prototype.parseServiceDiscovery = function( discovery_object, base_url, callback ) {

  let s = this;

  debug("base_url", base_url)

  // Attach all of the resources
  _.each( discovery_object.resources, function(resource) {

    s[ resource.name ] = new Resource( s, resource, base_url );

  }); // _.each

  return callback();

}

// Set exports
module.exports = Explorer;