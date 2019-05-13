'use strict';

const fs = require('../lib/fs');
const path = require('path');

const { create } = require('..');
const utils = require('../lib/utils');

const metatests = require('metatests');
const common = require('@metarhia/common');

const testDir = path.join(__dirname, 'test-root');
const minCompressSize = 1000;

const fsTest = metatests.test('Filestorage');
fsTest.endAfterSubtests();

let idCounter = 0;

fsTest.beforeEach(async () => {
  const storage = await create({ path: testDir, minCompressSize });
  const id = new common.Uint64(idCounter++);
  return { storage, id };
});

fsTest.afterEach(() => utils.rmRecursive(testDir));

fsTest.test('Create root directory on create', () => fs.access(testDir));

fsTest.test('Write string to file', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
  const data = 'data0';
  const dataStats = {
    checksum: '20cd1c30',
    dedupHash:
      '4285d10832a8edf4cc7979e9a257e145dc5c934549f62e0bf1dc6070e67cc4ab',
    size: 5,
  };

  await test.resolves(storage.write(id, data, opts), dataStats);
  await test.resolves(fs.readFile(file, 'utf8'), data);
});

fsTest.test('Write Buffer to file', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
  const data = Buffer.from('data1');
  const dataStats = {
    checksum: '57ca2ca6',
    dedupHash:
      '5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9',
    size: 5,
  };

  await test.resolves(storage.write(id, data, opts), dataStats);
  await test.resolves(fs.readFile(file), data);
});

fsTest.test('Read file', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data2';

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await test.resolves(storage.read(id, { encoding: 'utf8' }), data);
});

fsTest.test('Remove file', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data3';

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await storage.rm(id);

  const err = await test.rejects(fs.access(file));
  test.strictSame(err.code, 'ENOENT');
});

fsTest.test('Compress small file using zip', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data4';

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await test.resolves(storage.compress(id, 'ZIP'), false);
  await test.resolves(fs.readFile(file, 'utf8'), data);
});

fsTest.test('Compress small file using gzip', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data5';

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await test.resolves(storage.compress(id, 'GZIP'), false);
  await test.resolves(fs.readFile(file, 'utf8'), data);
});

fsTest.test('Compress big file using zip', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data6'.repeat(1000);

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await test.resolves(storage.compress(id, 'ZIP'), true);

  const d = await fs.readFile(file, 'utf8');
  test.strictNotSame(d, data);

  const { size } = await fs.stat(file);
  test.assert(size < 5000);
});

fsTest.test('Compress big file using gzip', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data7'.repeat(1000);

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);
  await test.resolves(storage.compress(id, 'GZIP'), true);

  const d = await fs.readFile(file, 'utf8');
  test.strictNotSame(d, data);

  const { size } = await fs.stat(file);
  test.assert(size < 5000);
});

fsTest.test('Write and read small file', async (test, { storage, id }) => {
  const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
  const data = 'data8';
  const dataStats = {
    checksum: '2e169402',
    dedupHash:
      'b5cc74ab5bb5a5f1acc7407be3e4cbce8611c5ed07354ab9e510b74ee0b273cb',
    size: 5,
  };

  await test.resolves(storage.write(id, data, opts), dataStats);
  await test.resolves(storage.read(id, { encoding: 'utf8' }), data);
});

fsTest.test(
  'Write, compress, read small file',
  async (test, { storage, id }) => {
    const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
    const data = 'data9';
    const dataStats = {
      checksum: '5911a494',
      dedupHash:
        'bbe0aa41024faeac81813a0194a95637d54cc65c025e0efd857ce0afcd51573f',
      size: 5,
    };

    await test.resolves(storage.write(id, data, opts), dataStats);
    await test.resolves(storage.compress(id, 'ZIP'), false);
    await test.resolves(storage.read(id, { encoding: 'utf8' }), data);
  }
);

fsTest.test('Write and read big file', async (test, { storage, id }) => {
  const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
  const data = 'data10'.repeat(1000);
  const dataStats = {
    checksum: '828aaf45',
    dedupHash:
      '7a8553c5934fd3b4a068a3d4c5bafc189e1fe8e0f7f46cbcc0fc1199249a39a2',
    size: 6000,
  };

  await test.resolves(storage.write(id, data, opts), dataStats);
  await test.resolves(storage.read(id, { encoding: 'utf8' }), data);
});

fsTest.test(
  'Write, compress and read big file',
  async (test, { storage, id }) => {
    const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
    const data = 'data11'.repeat(1000);
    const dataStats = {
      checksum: '5928f9a',
      dedupHash:
        'f1cf91dea01f77fd860645de51462794cfbbae0a14d81350b21934e58a69941d',
      size: 6000,
    };

    await test.resolves(storage.write(id, data, opts), dataStats);
    await test.resolves(storage.compress(id, 'ZIP'), true);
    await test.resolves(
      storage.read(id, { encoding: 'utf8', compression: 'ZIP' }),
      data
    );
  }
);

fsTest.test(
  'Write and read small unicode file',
  async (test, { storage, id }) => {
    const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
    const data = '白い猫でも黒い猫でも鼠を取る猫はいい猫だ';
    const dataStats = {
      checksum: '289722d',
      dedupHash:
        'fab270bfcdc81e464611cd112e95c6b9590ba55483fbfe2dda98d67ddc741ab3',
      size: 60,
    };

    await test.resolves(storage.write(id, data, opts), dataStats);
    await test.resolves(storage.read(id, { encoding: 'utf8' }), data);
  }
);

fsTest.test('Get file stats', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const data = 'data13';

  await fs.mkdir(path.join(testDir, pathPart));
  await fs.writeFile(file, data);

  const fstats = await fs.stat(file);
  await test.resolves(storage.stat(id), fstats);
});

fsTest.test('Update file', async (test, { storage, id }) => {
  const pathPart = id.toString(16).padStart(4, '0');
  const file = utils.getFilepath(testDir, pathPart, '0000');
  const opts = { checksum: 'CRC32', dedupHash: 'SHA256' };
  const data1 = 'data15';
  const data2 = 'another data';
  const dataStats1 = {
    checksum: 'bb53e75f',
    dedupHash:
      '87fef323635f22fc88999957a585c3cf3f8383029c8501e52928a14028c0af2c',
    size: 6,
  };
  const dataStats2 = {
    checksum: '963fe1ef',
    dedupHash:
      'f3cfa0c4064755101ffbcdc8a8d1b9dccc46d45b3a82f800a6eaab42e65f14c9',
    size: 12,
    originalSize: 6,
  };

  await test.resolves(storage.write(id, data1, opts), dataStats1);
  await test.resolves(storage.update(id, data2, opts), dataStats2);
  await test.resolves(fs.readFile(file, 'utf8'), data2);
});
