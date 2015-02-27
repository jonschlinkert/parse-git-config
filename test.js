/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var git = require('./');


describe('sync:', function () {
  it('should return an object', function () {
    git.sync().should.have.properties(['core']);
    git.sync().should.not.have.properties(['foo']);
    git.sync().should.not.throw;
  });
});

describe('async:', function () {
  it('should throw a callback is not passed:', function (cb) {
    (function () {
      git();
    }).should.throw('parse-git-config async expects a callback function.')
    cb();
  });

  it('should throw an error when .git/config does not exist:', function (cb) {
    git(function (err, config) {
      config.should.have.property('core');
      config.should.not.have.property('foo');
      cb();
    });
  });

  it('should throw an error when .git/config does not exist:', function (cb) {
    git('foo', function (err, config) {
      err.should.be.an.instanceof(Error);
      err.message.should.equal('ENOENT, open \'foo/.git/config\'');
      cb();
    });
  });
});
