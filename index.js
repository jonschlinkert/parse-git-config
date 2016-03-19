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

/**
 * Asynchronously parse a `.git/config` file. If only the callback is passed,
 * the `.git/config` file relative to `process.cwd()` is used.
 *
 * ```js
 * parse(function(err, config) {
 *   if (err) throw err;
 *   // do stuff with config
 * });
 * ```
 * @param {Object|String|Function} `options` Options with `cwd` or `path`, the cwd to use, or the callback function.
 * @param {Function} `cb` callback function if the first argument is options or cwd.
 * @return {Object}
 * @api public
 */

function parse(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('parse-git-config async expects a callback function.');
  }

  options = options || {};
  var filepath = parse.resolve(options);

  fs.stat(filepath, function(err, stat) {
    if (err) return cb(err);

    fs.readFile(filepath, 'utf8', function(err, str) {
      if (err) return cb(err);
      cb(null, ini.parse(str));
    });
  });
}

/**
 * Synchronously parse a `.git/config` file. If no arguments are passed,
 * the `.git/config` file relative to `process.cwd()` is used.
 *
 * ```js
 * var config = parse.sync();
 * ```
 *
 * @name .sync
 * @param {Object|String} `options` Options with `cwd` or `path`, or the cwd to use.
 * @return {Object}
 * @api public
 */

parse.sync = function parseSync(options) {
  options = options || {};
  var filepath = parse.resolve(options);
  if (exists(filepath)) {
    var str = fs.readFileSync(filepath, 'utf8');
    return ini.parse(str);
  }
  return {};
};

/**
 * Resolve the git config path
 */

parse.resolve = function resolve(options) {
  options = options || {};
  var cwd;
  if (typeof options === 'string') {
    cwd = path.resolve(options);
    options = {};
  } else if (options.cwd) {
    cwd = options.cwd;
  } else {
    cwd = process.cwd();
  }
  return path.resolve(cwd, options.path || '.git/config');
};

/**
 * Returns an object with only the properties that had ini-style keys
 * converted to objects (example below).
 *
 * ```js
 * var config = parse.sync();
 * var obj = parse.keys(config);
 * ```
 * @name .keys
 * @param {Object} `config` The parsed git config object.
 * @return {Object}
 * @api public
 */

parse.keys = function parseKeys(config) {
  var res = {};
  for (var key in config) {
    var m = /(\S+) "(.*)"/.exec(key);
    if (!m) continue;
    var prop = m[1];
    res[prop] = res[prop] || {};
    res[prop][m[2]] = config[key];
  }
  return res;
};

function exists(fp) {
  try {
    fs.statSync(fp);
    return true;
  } catch (err) {}
  return false;
}

/**
 * Expose `parse`
 */

module.exports = parse;
