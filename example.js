'use strict';

var parse = require('./');
var config = {
  'remote "origin"': {
    url: 'https://github.com/jonschlinkert/normalize-pkg.git',
    fetch: '+refs/heads/*:refs/remotes/origin/*'
  },
  'branch "master"': {
    remote: 'origin', merge: 'refs/heads/master'
  },
  'branch "dev"': {
    remote: 'origin', merge: 'refs/heads/dev', rebase: true
  }
};

console.log(parse.keys(config));
