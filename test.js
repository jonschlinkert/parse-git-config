/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
require('should');
var parse = require('./');

describe('sync:', function() {
  it('should return an object', function() {
    parse.sync().should.have.properties(['core']);
    parse.sync().should.not.have.properties(['foo']);
    parse.sync().should.not.throw;
  });
});

describe('async:', function() {
  it('should throw a callback is not passed:', function(cb) {
    (function() {
      parse();
    }).should.throw('parse-git-config async expects a callback function.');
    cb();
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    parse(function(err, config) {
      config.should.have.property('core');
      config.should.not.have.property('foo');
      cb();
    });
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    parse({path: 'foo'}, function(err, config) {
      err.should.be.an.instanceof(Error);
      err.message.should.match(/ENOENT.*parse-git-config/);
      cb();
    });
  });
});

describe('resolve:', function() {
  it('should resolve the git config in the cwd by default', function() {
    var sep = require('path').sep;
    parse.resolve().should.equal(process.cwd() + sep + '.git' + sep + 'config');
  });
  it('should allow override path', function() {
    var path = require('path').resolve(process.env.HOME, '.gitconfig');
    parse.resolve({path: path}).should.equal(path);
  });
  it('should resolve relative path to cwd', function() {
    parse.resolve({path: '.config'})
    .should.equal(require('path').resolve(process.cwd(), '.config'));
  });
  it('should allow override of cwd', function() {
    parse.resolve({path: '.config', cwd: '/opt/config'})
    .should.equal(require('path').resolve('/opt/config','.config'));
  });
});

describe('.keys:', function() {
  it('should parse ini-style keys', function() {
    var config = {
      'foo "bar"': { doStuff: true },
      'foo "baz"': { doStuff: true }
    };

    parse.keys(config).should.eql({
      foo: {
        bar: { doStuff: true },
        baz: { doStuff: true }
      }
    });
  });
});
