'use strict';

const parse = require('./');
const gitconfig = {
  email: 'email',
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

const config = parse.expandKeys(gitconfig);
console.log(config);
