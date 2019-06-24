'use strict';

// TODO: this file should be removed and `fs.promises` used instead
// when support for Node.js 8 is dropped

const fs = require('fs');
const { promisify } = require('util');

const { iter } = require('@metarhia/common');

const list = [
  'readFile',
  'writeFile',
  'unlink',
  'rename',
  'stat',
  'access',
  'mkdir',
  'rmdir',
  'readdir',
];

if (fs.promises) {
  module.exports = fs.promises;
} else {
  module.exports = iter(list).collectWith(
    {},
    (obj, name) => (obj[name] = promisify(fs[name]))
  );
}
