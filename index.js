/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var ini = require('ini');

function parseGitConfig(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }

  var fp = resolve(options);

  if (typeof cb !== 'function') {
    throw new TypeError('parse-git-config async expects a callback function.');
  }

  read(fp, function(err, buffer) {
    if (err) {
      cb(err);
      return;
    }
    cb(null, ini.parse(buffer.toString()));
  });
}

parseGitConfig.sync = function parseGitConfigSync(options) {
  var fp = resolve(options);
  if (!fs.existsSync(fp)) {
    return null;
  }
  return ini.parse(fs.readFileSync(fp, 'utf8'));
};

function read(fp, cb) {
  try {
    fs.readFile(fp, function(err, config) {
      if (err) {
        return cb(err);
      }
      cb(null, config);
    });
  } catch (err) {
    cb(err);
  }
}

function resolve(options) {
  options = options || {};
  var cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  return path.resolve(cwd, options.path || '.git/config');
}

/**
 * Expose `resolve`
 */

parseGitConfig.resolve = resolve;

/**
 * Expose `parseGitConfig`
 */

module.exports = parseGitConfig;
