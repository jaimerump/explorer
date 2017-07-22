let _       = require('lodash');
let qs      = require('querystring');
let request = require('request');
let debug   = require('debug')('explorer:resource');

function Resource( parent, json, base_url ) {

  let s = this;

  s.parent = parent;
  s.base_url = base_url;
  s._options = parent._options;

  s.parseResource( json );

}

/**
 * Parses the json body of the resource into methods and sub-resources
 */
Resource.prototype.parseResource = function( json ){

  let s = this;

  s.name = json.name;
  debug("Parsing resource:", s.name)

  s.methods = json.methods;

  if( json.resources ) s.parseSubResources( json.resources );

}

/**
 * Parses the subresources out and attaches them to the resource
 */
Resource.prototype.parseSubResources = function( subresources ) {

  let s = this;

  // Attach all of the resources
  _.each( subresources, function(subresource) {

    debug(`Creating ${s.name}.${subresource.name}`)

    s[ subresource.name ] = new Resource( s, subresource, s.base_url );

  }); // _.each

}

// Methods

/** 
 * Issues a get request to this resource with the specified params and calls the callback with the results
 * Usually used to fetch records
 */
Resource.prototype.get = function( params, callback ) {

  let s = this;
  let definition = s.methods["GET"];
  if( !definition ) return callback( { error: "Invalid Method" }, false );

  // Allow an id string for gets
  if( typeof params === "string" ) {
    params = { id: params };
  }

  params = params || {};

  // Request
  let headers = {};
  headers[ s._options.token_name ] = s._options.token_value;
  let request_options = {
    uri:    s.base_url + definition.uri,
    method: "GET",
    headers: headers,
    json: true
  };

  // Handle Params
  request_options.uri = request_options.uri.replace(/{([^{}]+)}/g, function( match, param ) {

    // Find value
    if( params[ param ] ) {
      let value = params[ param ];
      
      // Remove from the params array so I don't also query string it
      delete params[ param ];
      return value;
    }

    // Empty return
    return '';
  }); // request_options.uri.replace

  // Build Query
  if ( !_.isEmpty( params ) ) request_options.uri += '?' + qs.stringify( params );

  debug('Request options', request_options );

  // Request
  request( request_options, function ( err, res, body ) {
    
    // Error
    if ( err ) return callback(err);
    if ( res.statusCode >= 400 ) return callback(body);

    // Deliver result
    callback(null, body);
  }); // request

}

/**
 * Issues a post request to this resource with the specified params and calls the callback with the results
 * Usually used to create records
 */
Resource.prototype.post = function( params, callback ) {

  let s = this;
  let definition = s.methods["POST"];
  if( !definition ) return callback( { error: "Invalid Method" }, false );

}

/**
 * Issues a put request to this resource with the specified params and calls the callback with the results
 * Usually used to update records
 */
Resource.prototype.put = function( params, callback ) {

  let s = this;
  let definition = s.methods["PUT"];
  if( !definition ) return callback( { error: "Invalid Method" }, false );

}

/**
 * Issues a delete request to this resource with the specified params and calls the callback with the results
 * Usually used to delete records
 */
Resource.prototype.delete = function( params, callback ) {

  let s = this;
  let definition = s.methods["DELETE"];
  if( !definition ) return callback( { error: "Invalid Method" }, false );

}

// Set exports
module.exports = Resource;