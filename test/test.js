'use strict';

require('mocha');
const isTravis = process.env.TRAVIS || process.env.CLI;
const os = require('os');
const assert = require('assert');
const path = require('path');
const homedir = require('homedir-polyfill');
const parse = require('..');

const cwd = (...args) => path.resolve(__dirname, ...args);
const fixture = name => cwd('fixtures', name);

describe('parse-git-config', function() {
  describe('async', function() {
    it('should return a promise when callback is not passed', function(cb) {
      parse({ path: fixture('_gitconfig') })
        .then(config => {
          assert(config.hasOwnProperty('core'));
          cb();
        })
        .catch(cb);
    });

    it('should parse .git/config', function(cb) {
      parse({ path: fixture('_gitconfig') }, function(err, config) {
        assert(!err);
        assert(config.hasOwnProperty('core'));
        cb();
      });
    });

    it('should expand keys in config', function(cb) {
      parse({ path: fixture('_gitconfig'), expandKeys: true })
        .then(config => {
          assert(config.hasOwnProperty('color'));
          assert(config.color.hasOwnProperty('diff'));
          cb();
        })
        .catch(cb);
    });

    it('should not expand dots in keys in config', function(cb) {
      parse({ path: fixture('_gitconfig-branch'), expandKeys: true })
        .then(config => {
          assert.deepEqual(Object.keys(config.branch), ['devel', 'master', '2.0']);
          cb();
        })
        .catch(cb);
    });

    it('should include other config sources', function(cb) {
      parse({ path: fixture('_gitconfig'), include: true }, function(err, config) {
        assert(!err);
        assert.deepEqual(config, require('./expected/_gitconfig.js'));
        cb();
      });
    });

    it('should throw an error when .git/config does not exist', function(cb) {
      parse({ path: 'foo' }, function(err, config) {
        assert(err instanceof Error);
        assert(/ENOENT.*parse-git-config/.test(err.message));
        cb();
      });
    });
  });

  describe('promise', function() {
    it('should return a promise', function(cb) {
      parse.promise({ path: fixture('_gitconfig') })
        .then(config => {
          assert(config.hasOwnProperty('core'));
          cb();
        });
    });

    it('should include other config sources', function() {
      return parse.promise({ path: fixture('_gitconfig'), include: true })
        .then(config => {
          assert.deepEqual(config, require('./expected/_gitconfig.js'));
        });
    });
  });

  describe('sync', function() {
    it('should return an object', function() {
      assert(parse.sync({path: fixture('_gitconfig') }).hasOwnProperty('core'));
    });
  });

  describe('.expandKeys', function() {
    it('should expand ini-style keys', function() {
      const config = {
        'foo "bar"': { doStuff: true },
        'foo "baz"': { doStuff: true }
      };

      assert.deepEqual(parse.expandKeys(config), {
        foo: {
          bar: { doStuff: true },
          baz: { doStuff: true }
        }
      });
    });
  });

  describe('resolve', function() {
    it('should resolve the git config in the cwd by default', function() {
      assert.equal(parse.resolve(), path.resolve(process.cwd(), '.git/config'));
    });

    it('should allow override path', function() {
      const fp = path.resolve(homedir(), '.gitconfig');
      assert.equal(parse.resolve({ path: fp }), fp);
    });

    it('should include other config sources', function() {
      const fp = path.join(__dirname, 'fixtures/_gitconfig');
      const actual = parse.sync({ path: fp, include: true });
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
      const actual = parse.resolve({ path: '.config', cwd: '/opt/config' });
      assert.equal(actual, path.resolve('/opt/config/.config'));
    });
  });
});
