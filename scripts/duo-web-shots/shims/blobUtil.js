/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// Web stand-in for react-native-blob-util: serves the pinned upstream data.
const files = {
  'Dark.json': JSON.stringify(require('../data/Dark.json')),
  'Light.json': JSON.stringify(require('../data/Light.json')),
  'sets.json': JSON.stringify(require('../data/sets.json')),
  'decklists.json': JSON.stringify(require('../data/decklists.json')),
};
const name = path => String(path).split('/').pop();
const api = {
  fs: {
    dirs: {DocumentDir: '/documents'},
    readFile: path => (files[name(path)] ? Promise.resolve(files[name(path)]) : Promise.reject(Object.assign(new Error('No such file'), {code: 'ENOENT'}))),
    exists: path => Promise.resolve(!!files[name(path)]),
  },
  config: () => ({fetch: () => Promise.resolve({})}),
};
module.exports = api;
module.exports.default = api;
