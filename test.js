/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var path = require('path');
var home = require('os-homedir');
var parse = require('./');

describe('sync:', function() {
  it('should return an object', function() {
    assert(parse.sync().hasOwnProperty('core'));
  });
});

describe('async:', function() {
  it('should throw a callback is not passed:', function(cb) {
    try {
      parse();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'parse-git-config async expects a callback function.');
      cb();
    }
  });

  it('should parse .git/config', function(cb) {
    parse(function(err, config) {
      assert(!err);
      assert(config.hasOwnProperty('core'));
      cb();
    });
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    parse({path: 'foo'}, function(err, config) {
      assert(err instanceof Error);
      assert(/ENOENT.*parse-git-config/.test(err.message));
      cb();
    });
  });
});

describe('resolve:', function() {
  it('should resolve the git config in the cwd by default', function() {
    assert.equal(parse.resolve(), path.resolve(process.cwd(), '.git/config'));
  });

  it('should allow override path', function() {
    var fp = path.resolve(home(), '.gitconfig');
    assert.equal(parse.resolve({path: fp}), fp);
  });

  it('should resolve relative path to cwd', function() {
    assert.equal(parse.resolve({path: '.config'}), path.resolve(process.cwd(), '.config'));
  });

  it('should resolve relative path to the global git config when `global` is passed', function() {
    assert.equal(parse.resolve('global'), path.resolve(home(), '.gitconfig'));
  });

  it('should allow override of cwd', function() {
    var actual = parse.resolve({path: '.config', cwd: '/opt/config'});
    assert.equal(actual, path.resolve('/opt/config/.config'));
  });
});

describe('.keys:', function() {
  it('should parse ini-style keys', function() {
    var config = {
      'foo "bar"': { doStuff: true },
      'foo "baz"': { doStuff: true }
    };

    assert.deepEqual(parse.keys(config), {
      foo: {
        bar: { doStuff: true },
        baz: { doStuff: true }
      }
    });
  });
});
