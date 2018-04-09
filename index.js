/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ini = require('ini');
const configPath = require('git-config-path');
const expand = require('expand-tilde');

const read = promisify(fs.readFile);
const stat = promisify(fs.stat);

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
 * @param {Function} `callback` callback function if the first argument is options or cwd.
 * @return {Object}
 * @api public
 */

function parse(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (typeof callback !== 'function') {
    return parse.promise(options);
  }

  return parse.promise(options)
    .then(config => callback(null, config))
    .catch(callback);
}

/**
 * Parse the given
 *
 * ```js
 * parse.promise({ path: '/path/to/.gitconfig' })
 *   .then(config => console.log(config));
 * ```
 *
 * @name .sync
 * @param {Object|String} `options` Options with `cwd` or `path`, or the cwd to use.
 * @return {Object}
 * @api public
 */

parse.promise = function(options) {
  const opts = Object.assign({}, options);
  const filepath = parse.resolveConfigPath(opts);

  if (!filepath) {
    return Promise.resolve(null);
  }

  return stat(filepath)
    .then(() => {
      return read(filepath, 'utf8');
    })
    .then(str => {
      if (opts.include === true) {
        str = injectInclude(str, path.resolve(path.dirname(filepath)));
      }
      return parseIni(str, opts);
    });
};

/**
 * Synchronously parse a `.git/config` file. If no arguments are passed,
 * the `.git/config` file relative to `process.cwd()` is used.
 *
 * ```js
 * const config = parse.sync();
 * ```
 *
 * @name .sync
 * @param {Object|String} `options` Options with `cwd` or `path`, or the cwd to use.
 * @return {Object}
 * @api public
 */

parse.sync = function(options) {
  const opts = Object.assign({}, options);
  const filepath = parse.resolveConfigPath(opts);
  if (filepath && fs.existsSync(filepath)) {
    const input = fs.readFileSync(filepath, 'utf8');

    if (opts.include === true) {
      const cwd = path.resolve(path.dirname(filepath));
      const str = injectInclude(input, cwd);
      return parseIni(str, opts);
    }

    return parseIni(input, opts);
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
  const opts = Object.assign({cwd: process.cwd()}, options);
  const fp = opts.path ? expand(opts.path) : configPath(opts.type);
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
 * converted to objects.
 *
 * ```js
 * const config = parse.sync({ path: '/path/to/.gitconfig' });
 * const obj = parse.expandKeys(config);
 * ```
 * @param {Object} `config` The parsed git config object.
 * @return {Object}
 * @api public
 */

parse.expandKeys = function(config) {
  for (const key of Object.keys(config)) {
    const m = /(\S+) "(.*)"/.exec(key);
    if (!m) continue;
    const prop = m[1];
    config[prop] = config[prop] || {};
    config[prop][m[2]] = config[key];
    delete config[key];
  }
  return config;
};

function parseIni(str, options) {
  const opts = Object.assign({}, options);

  str = str.replace(/\[(\S+) "(.*)"\]/g, function(m, $1, $2) {
    return $1 && $2 ? `[${$1} "${$2.split('.').join('\\.')}"]` : m;
  });

  const config = ini.parse(str);
  if (opts.expandKeys === true) {
    return parse.expandKeys(config);
  }
  return config;
}

function injectInclude(input, cwd) {
  const lines = input.split('\n').filter(function(line) {
    return line.trim() !== '';
  });

  const len = lines.length;
  const res = [];

  for (let i = 0; i < len; i++) {
    const line = lines[i];
    if (line.indexOf('[include]') === 0) {
      const filepath = lines[i + 1].replace(/^\s*path\s*=\s*/, '');
      const fp = path.resolve(cwd, expand(filepath));
      res.push(fs.readFileSync(fp));

    } else {
      res.push(line);
    }
  }
  return res.join('\n');
}

/**
 * Wraps an arbitrary function in a Promise.
 *
 * @param {Function} `fn` The function to be wrapped.
 */

function promisify(fn) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, res) => {
        err ? reject(err) : resolve(res);
      });
    });
  };
}

/**
 * Expose `parse`
 */

module.exports = parse;
