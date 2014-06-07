'use strict';

function Resource(slug, fileFilter) {
  this.slug = slug;
  var index = fileFilter.indexOf('/<lang>');
  this.directory = fileFilter.substring(0, index);
  this.regexp = new RegExp(fileFilter.substring(index + 1).replace(/\//g, '\\/').replace('<lang>', '([a-z]{2}(_[A-Z]{2})?)'));
}

module.exports = Resource;
