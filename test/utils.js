'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('../lib/utils');
const metatests = require('metatests');

const testDir = path.join(__dirname, 'root-fs');

metatests.case('', utils, {
  'getFilepath': [
    ['/dir0', 'dir1', 'dir2', 'dir3', '/dir0/dir1/dir2/dir3.' + utils.FS_EXT],
    ['/dir0', 'dir1/dir2', 'dir3', '/dir0/dir1/dir2/dir3.' + utils.FS_EXT],
    ['/dir0/dir1/dir2/dir3', '/dir0/dir1/dir2/dir3.' + utils.FS_EXT],
    ['dir0', 'dir1', 'dir2', 'dir3',  'dir0/dir1/dir2/dir3.' + utils.FS_EXT],
  ],
  'computeHash': [
    [
      'data0',
      'SHA256',
      '4285d10832a8edf4cc7979e9a257e145dc5c934549f62e0bf1dc6070e67cc4ab',
    ],
    [
      'data1',
      'SHA256',
      '5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9',
    ],
    [
      'data2',
      'SHA256',
      'd98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c',
    ],
    [
      'data3',
      'CRC32',
      'b9c44d8a',
    ],
    [
      'data4',
      'CRC32',
      '27a0d829',
    ],
    [
      'data5',
      'CRC32',
      '50a7e8bf',
    ],
  ],
});

metatests.test('', test => {
  const dir = path.join(testDir, 'some', 'path', 'to', 'nested', 'dir');
  utils.mkdirp(dir, err => {
    test.error(err);
    test.strictSame(fs.existsSync(dir), true);

    const file = path.join(testDir, 'file');
    const data = 'data'.repeat(1000);
    fs.writeFile(file, data, err => {
      test.error(err);
      utils.compress(file, 1024, 'ZIP', err => {
        test.error(err);
        test.strictSame(fs.statSync(file).size < 4000, true);

        utils.uncompress(file, { compression: 'ZIP', encoding: 'utf8' },
          (err, d) => {
            test.error(err);
            test.strictSame(d, data);
            utils.rmdirp(testDir);
            test.end();
          });
      });
    });
  });
});
