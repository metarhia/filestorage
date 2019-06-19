'use strict';

const fs = require('../lib/fs');
const utils = require('../lib/utils');
const path = require('path');
const common = require('@metarhia/common');
const metatests = require('metatests');

const testDir = path.join(__dirname, 'utils-test-root');

metatests.case('', utils, {
  getFilepath: [
    [
      '/dir0',
      'dir1',
      'dir2',
      'dir3',
      `${path.join('/dir0', 'dir1', 'dir2', 'dir3')}.${utils.FS_EXT}`,
    ],
    [
      '/dir0',
      'dir1/dir2',
      'dir3',
      `${path.join('/dir0', 'dir1/dir2', 'dir3')}.${utils.FS_EXT}`,
    ],
    [
      '/dir0/dir1/dir2/dir3',
      `${path.join('/dir0/dir1/dir2/dir3')}.${utils.FS_EXT}`,
    ],
    [
      'dir0',
      'dir1',
      'dir2',
      'dir3',
      `${path.join('dir0', 'dir1', 'dir2', 'dir3')}.${utils.FS_EXT}`,
    ],
  ],
  computeHash: [
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
    ['data3', 'CRC32', 'b9c44d8a'],
    ['data4', 'CRC32', '27a0d829'],
    ['data5', 'CRC32', '50a7e8bf'],
  ],
  getDataStats: [
    [
      'data6',
      'SHA256',
      'CRC32',
      {
        checksum:
          '9c67b4b76a18503009f542ef7c93dc7ac94aebbc6141515bea4e63e3068373a6',
        dedupHash: 'c9aeb905',
        size: 5,
      },
    ],
  ],
});

metatests.test('Compress and uncompress file', async test => {
  const dir = path.join(testDir, 'some', 'path', 'to', 'nested', 'dir');
  await utils.mkdirpPromise(dir);
  await fs.access(testDir);

  const file = path.join(testDir, 'file');
  const data = 'data'.repeat(1000);
  const opts = { compression: 'ZIP', encoding: 'utf8' };

  await fs.writeFile(file, data);
  await utils.compress(file, 1024, 'ZIP');

  const { size } = await fs.stat(file);
  test.assert(size < data.length);

  await test.resolves(utils.uncompress(file, opts), data);
  await common.rmRecursivePromise(testDir);
});
