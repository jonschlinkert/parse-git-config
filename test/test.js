/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015-2018 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var isTravis = process.env.TRAVIS || process.env.CLI;
var fs = require('fs');
var os = require('os');
var assert = require('assert');
var path = require('path');
var homedir = require('homedir-polyfill');
var parse = require('..');

function read(filepath) {
  return fs.readFileSync(path.join(__dirname, filepath), 'utf8');
}

describe('sync:', function() {
  it('should return an object', function() {
    assert(parse.sync().hasOwnProperty('core'));
  });
});

describe('async:', function() {
  it('should throw a callback is not passed:', function() {
    assert.throws(function() {
      parse();
    }, /expected/);
  });

  it('should parse .git/config', function(cb) {
    parse(function(err, config) {
      assert(!err);
      assert(config.hasOwnProperty('core'));
      cb();
    });
  });

  it('should include other config sources', function() {
    var fp = path.join(__dirname, 'fixtures/_gitconfig');

    parse({ path: fp, include: true }, function(err, config) {
      assert(!err);
      assert.deepEqual(config, require('./expected/_gitconfig.js'));
      cb();
    });
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    parse({ path: 'foo' }, function(err, config) {
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
    var fp = path.resolve(homedir(), '.gitconfig');
    assert.equal(parse.resolve({ path: fp }), fp);
  });

  it('should include other config sources', function() {
    var fp = path.join(__dirname, 'fixtures/_gitconfig');
    var actual = parse.sync({ path: fp, include: true });
    assert.deepEqual(actual, require('./expected/_gitconfig.js'));
  });

  it('should resolve relative path to cwd', function() {
    assert.equal(parse.resolve({ path: '.config' }), path.resolve(process.cwd(), '.config'));
  });

  it('should resolve relative path to the global git config when `global` is passed', function() {
    if (isTravis && os.platform() === 'darwin') return this.skip();
    assert.equal(parse.resolve('global'), path.resolve(homedir(), '.gitconfig'));
  });

  it('should allow override of cwd', function() {
    var actual = parse.resolve({ path: '.config', cwd: '/opt/config' });
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
