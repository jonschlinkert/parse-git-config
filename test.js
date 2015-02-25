/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var config = require('./');

describe('sync:', function () {
  it('should return an object', function () {
    config.sync().should.have.properties([]);
  });

  it('should throw an error when .git/config does not exist:', function () {
    (function () {
      config.sync('foo');
    }).should.throw('.git/config does not exist.');
  });
});

describe('async:', function () {
  it('should throw an error when .git/config does not exist:', function (cb) {
    config(function (err, data) {
      console.log(arguments)
    });
    cb();
  });

  it('should throw an error when .git/config does not exist:', function (cb) {
    config('foo', function (err, data) {
      console.log(arguments)
    });
    cb();
  });
});
