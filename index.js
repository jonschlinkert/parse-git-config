/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var expand = require('expand-tilde');
var exists = require('fs-exists-sync');
var extend = require('extend-shallow');
var configPath = require('git-config-path');
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
    options = null;
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var filepath = parse.resolveConfigPath(options);
  if (filepath === null) {
    cb();
    return;
  }

  fs.stat(filepath, function(err, stat) {
    if (err) {
      cb(err);
      return;
    }

    fs.readFile(filepath, 'utf8', function(err, str) {
      if (err) {
        cb(err);
        return;
      }

      if (options && options.include === true) {
        str = injectInclude(str, path.resolve(path.dirname(filepath)));
      }

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
  var filepath = parse.resolveConfigPath(options);
  if (filepath && exists(filepath)) {
    var input = fs.readFileSync(filepath, 'utf8');

    if (options && options.include === true) {
      var cwd = path.resolve(path.dirname(filepath));
      var str = injectInclude(input, cwd);
      return ini.parse(str);
    }

    return ini.parse(input);
  }
  return {};
};

/**
 * Resolve the git config path
 */

parse.resolveConfigPath = function(options) {
  if (typeof options === 'string') {
    options = { type: options };
  }
  var opts = extend({cwd: process.cwd()}, options);
  var fp = opts.path ? expand(opts.path) : configPath(opts.type);
  return fp ? path.resolve(opts.cwd, fp) : null;
};

/**
 * Deprecated: use `.resolveConfigPath` instead
 */

parse.resolve = function(options) {
  return parse.resolveConfigPath(options);
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

function injectInclude(input, cwd) {
  var pathRegex = /^\s*path\s*=\s*/;
  var lines = input.split('\n');
  var len = lines.length;
  var filepath = '';
  var res = [];

  for (var i = 0; i < len; i++) {
    var line = lines[i];
    var n = i;

    if (line.indexOf('[include]') === 0) {
      while (n < len && !pathRegex.test(filepath)) {
        filepath = lines[++n];
      }

      if (!filepath) {
        return input;
      }

      filepath = filepath.replace(pathRegex, '');
      var fp = path.resolve(cwd, expand(filepath));
      res.push(fs.readFileSync(fp));

    } else {
      res.push(line);
    }
  }

  return res.join('\n');
}

/**
 * Expose `parse`
 */

module.exports = parse;
