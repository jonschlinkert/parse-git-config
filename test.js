/*!
 * parse-git-config <https://github.com/jonschlinkert/parse-git-config>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
require('should');
var git = require('./');

describe('sync:', function() {
  it('should return an object', function() {
    git.sync().should.have.properties(['core']);
    git.sync().should.not.have.properties(['foo']);
    git.sync().should.not.throw;
  });
});

describe('async:', function() {
  it('should throw a callback is not passed:', function(cb) {
    (function() {
      git();
    }).should.throw('parse-git-config async expects a callback function.')
    cb();
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    git(function(err, config) {
      config.should.have.property('core');
      config.should.not.have.property('foo');
      cb();
    });
  });

  it('should throw an error when .git/config does not exist:', function(cb) {
    git({path: 'foo'}, function(err, config) {
      err.should.be.an.instanceof(Error);
      err.message.should.match(/ENOENT.*parse-git-config/);
      cb();
    });
  });
});

describe('resolve:', function() {
  it('should resolve the git config in the cwd by default', function() {
    var sep = require('path').sep;
    git.resolve().should.equal(process.cwd() + sep + '.git' + sep + 'config');
  })
  it('should allow override path', function() {
    var path = require('path').resolve(process.env.HOME, '.gitconfig')
    git.resolve({path: path}).should.equal(path);
  })
  it('should resolve relative path to cwd', function() {
    git.resolve({path: '.config'})
    .should.equal(require('path').resolve(process.cwd(), '.config'));
  })
  it('should allow override of cwd', function() {
    git.resolve({path: '.config', cwd: '/opt/config'})
    .should.equal(require('path').resolve('/opt/config','.config'))
  })
})
