module.exports = {
  user: {
    email: 'email',
    name: 'name',
    signingkey: 'https://help.github.com/articles/generating-a-new-gpg-key/'
  },
  github: {
    user: 'name',
    token: 'https://github.com/settings/tokens'
  },
  commit: {
    gpgsign: true
  },
  tag: {
    gpgsign: true,
    path: '_gitconfig.local',
    sort: 'version:refname'
  },
  core: {
    legacyheaders: false,
    quotepath: false,
    trustctime: false,
    precomposeunicode: false,
    pager: 'cat',
    logAllRefUpdates: true,
    excludesfile: '~/.gitignore'
  },
  repack: {
    usedeltabaseoffset: true
  },
  merge: {
    log: true,
    conflictstyle: 'diff3'
  },
  apply: {
    whitespace: 'fix'
  },
  help: {
    autocorrect: '1'
  },
  rerere: {
    enabled: true
  },
  color: {
    diff: 'auto',
    status: 'auto',
    branch: 'auto',
    interactive: 'auto',
    ui: 'always'
  },
  'color "diff"': {
    meta: 'yellow bold',
    frag: 'magenta',
    plain: 'white bold',
    old: 'red bold',
    new: 'green bold',
    commit: 'yellow bold',
    func: 'green dim',
    whitespace: 'red reverse'
  },
  'color "status"': {
    added: 'yellow',
    changed: 'green',
    untracked: 'cyan'
  },
  'color "branch"': {
    current: 'yellow reverse',
    local: 'yellow',
    remote: 'green'
  },
  diff: {
    renames: 'copies',
    algorithm: 'patience',
    compactionHeuristic: true,
    wsErrorHighlight: 'all'
  },
  'diff "bin"': {
    textconv: 'hexdump -v -C'
  },
  credential: {
    helper: 'store'
  },
  status: {
    relativePaths: true,
    showUntrackedFiles: 'no'
  },
  pull: {
    rebase: true
  },
  push: {
    default: 'current',
    followTags: true
  },
  alias: {
    a: 'commit --amend',
    c: 'commit -am',
    d: '!git diff --exit-code && git diff --cached',
    dif: 'diff',
    git: '!exec git',
    p: 'push -u',
    r: 'reset --soft HEAD~1',
    s: 'status',
    sc: 'clone --depth=1',
    l: 'log --graph --pretty=format:\'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset\' --abbrev-commit -n 15'
  },
  'remote "origin"': {
    fetch: '+refs/tags/*:refs/tags/*'
  },
  branch: {
    autosetupmerge: 'always',
    autosetuprebase: 'always'
  },
  http: {
    sslverify: false
  },
  submodule: {
    fetchJobs: '0'
  },
  fetch: {
    prune: true
  }
};
