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
var lookup = require('look-up');

module.exports = config;

function config(cwd, cb) {
  if (typeof cwd === 'function') {
    cb = cwd; cwd = null;
  }

  var fp = path.join(cwd || process.cwd(), '.git/config');
  read(fp, function (err, buffer) {
    if (err) {
      cb(err);
      return;
    }

    var data = ini.parse(buffer.toString());
    return cb(null, data);
  });
}

config.sync = function configSync(cwd) {
  var fp = path.join(cwd || process.cwd(), '.git/config');
  if (!fs.existsSync(fp)) {
    throw new Error('.git/config does not exist.');
  }
  return ini.parse(fs.readFileSync(fp, 'utf8'));
};

function read(fp, cb) {
  try {
    fs.readFile(fp, function (err, data) {
      if (err) return cb(err);

      return cb(null, data);
    });
  } catch (err) {
    cb(err);
  }
}
