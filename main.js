'use strict';

var fs = require('q-io/fs');
var properties = require('properties');
var RSVP = require('rsvp');
var _ = require('underscore');
var Resource = require('./Resource');

// Read a property file
function parseProperties(obj, options) {
  return new RSVP.Promise(function(resolve, reject) {
    properties.parse (obj, options, function (err, properties) {
      if (err) {
        reject(err);
      } else {
        resolve(properties);
      }
    });
  });
}

// Read Transifex config
function readConfig(path) {
  return parseProperties(path, { path:true, sections:true })
    .then(function(properties) {
      // Keep only the config section which have a type = MOZILLAPROPERTIES
      var keys = _.filter(_.keys(properties), function(key) { return 'MOZILLAPROPERTIES' === properties[key].type; });
      var resources = _.map(keys, function(slug) {
        return new Resource(slug, properties[slug].file_filter);
      });
      return _.object(keys, resources);
    });
}

// Reads all the translations associated to a Transifex resource
function readResource(path, resource) {
  resource.translations = {};
  return fs.listTree(path + '/' + resource.directory, function(path) {
    var match = path.match(resource.regexp);
     if (path.match(resource.regexp)) {
       resource.translations[match[1]] = parseProperties(path, { path:true });
     }
     return true;
  }).then(function() {
    return RSVP.hash(resource.translations);
  }).then(function(translations) {
    resource.translations = translations;
    return resource;
  });
}

// Reads a resource given its transifex key
function getResource(path, keyExpr) {
  return readConfig(path + '/.tx/config')
   .then(function(resources) {
     var keys = _.filter(_.keys(resources), function(name) { return name.match(keyExpr); });
     if (!keys.length) {
       throw Error('Cannot find resource: ' + keyExpr.source);
     }
     return readResource(path, resources[keys[0]]);
   });
}

// Reads the manifest.webapp file
function readManifest(path) {
  var manifestPath = null;
  return fs.listTree(path, function(path) {
    if (path.match(/manifest\.webapp$/)) {
      manifestPath = path;
      return false;
    }
    return true;
  }).then(function() {
    if (!manifestPath) {
      throw Error('Cannot find manifest.webapp');
    }
    return fs.read(manifestPath);
  }).then(function(manifest) {
    return JSON.parse(manifest);
  });
}

function updateManifest(rootDir, resourceName, mainLocale) {
  return RSVP.hash({
      resource: getResource(rootDir, new RegExp(resourceName)),
      manifest: readManifest(rootDir)
    })
    .then(function(data) {
      var trans = data.resource.translations;
      var mainTrans = trans[mainLocale];
      delete trans[mainLocale];

      data.manifest.locales = trans;
      data.manifest.name = mainTrans.name;
      data.manifest.description = mainTrans.description;
      console.log(data.manifest);
    })
    .then(null, function(err) {
      console.error(err);
    });
}

module.exports = updateManifest;
