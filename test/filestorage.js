'use strict';

const fs = require('fs');
const path = require('path');
const { create } = require('..');
const utils = require('../lib/utils');
const metatests = require('metatests');
const common = require('@metarhia/common');

const testDir = path.join(__dirname, 'test-root');
const minCompressSize = 1000;

const fsTest = metatests.test('Filestorage');
fsTest.endAfterSubtests();

fsTest.beforeEach((test, cb) => {
  create({ dir: testDir, minCompressSize }, (err, storage) => {
    test.error(err);
    cb({ storage });
  });
});

fsTest.afterEach((test, cb) => {
  utils.rmdirp(testDir, err => {
    test.error(err);
    cb();
  });
});

fsTest.test('Create root directory on create', test => {
  const dir = testDir + 'create';
  create({ dir }, err => {
    test.error(err);
    test.strictSame(fs.existsSync(dir), true);
    utils.rmdirp(dir, err => {
      test.error(err);
      test.end();
    });
  });
});

fsTest.test('Write string to file', (test, { storage }) => {
  const data = 'data0';
  const cs = '20cd1c30';
  const dh = '4285d10832a8edf4cc7979e9a257e145dc5c934549f62e0bf1dc6070e67cc4ab';
  const dataSize = 5;

  storage.write(
    new common.Uint64(0),
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      fs.readFile(utils.getFilepath(testDir, '0000', '0000'), (err, d) => {
        test.error(err);
        test.strictSame(d.toString(), data);
        test.end();
      });
    }
  );
});

fsTest.test('Write Buffer to file', (test, { storage }) => {
  const data = 'data1';
  const cs = '57ca2ca6';
  const dh = '5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9';
  const dataSize = 5;

  storage.write(
    new common.Uint64(1),
    Buffer.from(data),
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      fs.readFile(utils.getFilepath(testDir, '0001', '0000'), (err, d) => {
        test.error(err);
        test.strictSame(d.toString(), data);
        test.end();
      });
    }
  );
});

fsTest.test('Read file', (test, { storage }) => {
  const data = 'data2';

  fs.mkdir(path.join(testDir, '0002'), err => {
    test.error(err);

    fs.writeFile(utils.getFilepath(testDir, '0002', '0000'), data, err => {
      test.error(err);

      storage.read(new common.Uint64(2), {}, (err, d) => {
        test.error(err);
        test.strictSame(d.toString(), data);
        test.end();
      });
    });
  });
});

fsTest.test('Remove file', (test, { storage }) => {
  const data = 'data3';
  const file = utils.getFilepath(testDir, '0003', '0000');

  fs.mkdir(path.join(testDir, '0003'), err => {
    test.error(err);

    fs.writeFile(file, data, err => {
      test.error(err);

      storage.rm(new common.Uint64(3), err => {
        test.error(err);
        test.strictSame(fs.existsSync(file), false);
        test.end();
      });
    });
  });
});

fsTest.test('Compress small file using zip', (test, { storage }) => {
  const data = 'data4';
  const file = utils.getFilepath(testDir, '0004', '0000');

  fs.mkdir(path.join(testDir, '0004'), err => {
    test.error(err);

    fs.writeFile(utils.getFilepath(testDir, '0004', '0000'), data, err => {
      test.error(err);

      storage.compress(new common.Uint64(4), 'ZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, false);

        fs.readFile(file, 'utf8', (err, d) => {
          test.error(err);
          test.strictSame(d, data);
          test.end();
        });
      });
    });
  });
});

fsTest.test('Compress small file using gzip', (test, { storage }) => {
  const data = 'data5';
  const file = utils.getFilepath(testDir, '0005', '0000');

  fs.mkdir(path.join(testDir, '0005'), err => {
    test.error(err);

    fs.writeFile(file, data, err => {
      test.error(err);

      storage.compress(new common.Uint64(5), 'GZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, false);

        fs.readFile(file, 'utf8', (err, d) => {
          test.error(err);
          test.strictSame(d, data);
          test.end();
        });
      });
    });
  });
});

fsTest.test('Compress big file using zip', (test, { storage }) => {
  const data = 'data6'.repeat(1000);
  const file = utils.getFilepath(testDir, '0006', '0000');

  fs.mkdir(path.join(testDir, '0006'), err => {
    test.error(err);

    fs.writeFile(file, data, err => {
      test.error(err);

      storage.compress(new common.Uint64(6), 'ZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, true);
        test.strictSame(fs.statSync(file).size < 5000, true);

        fs.readFile(file, 'utf8', (err, d) => {
          test.error(err);
          test.strictNotSame(d, data);
          test.end();
        });
      });
    });
  });
});

fsTest.test('Compress big file using gzip', (test, { storage }) => {
  const data = 'data7'.repeat(1000);
  const file = utils.getFilepath(testDir, '0007', '0000');

  fs.mkdir(path.join(testDir, '0007'), err => {
    test.error(err);

    fs.writeFile(file, data, err => {
      test.error(err);

      storage.compress(new common.Uint64(7), 'GZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, true);
        test.strictSame(fs.statSync(file).size < 5000, true);

        fs.readFile(file, 'utf8', (err, d) => {
          test.error(err);
          test.strictNotSame(d, data);
          test.end();
        });
      });
    });
  });
});

fsTest.test('Write and read small file', (test, { storage }) => {
  const id = new common.Uint64(8);
  const data = 'data8';
  const cs = '2e169402';
  const dh = 'b5cc74ab5bb5a5f1acc7407be3e4cbce8611c5ed07354ab9e510b74ee0b273cb';
  const dataSize = 5;

  storage.write(
    id,
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      storage.read(id, { encoding: 'utf8' }, (err, d) => {
        test.error(err);
        test.strictSame(d, data);
        test.end();
      });
    }
  );
});

fsTest.test('Write, compress and read small file', (test, { storage }) => {
  const id = new common.Uint64(9);
  const data = 'data9';
  const cs = '5911a494';
  const dh = 'bbe0aa41024faeac81813a0194a95637d54cc65c025e0efd857ce0afcd51573f';
  const dataSize = 5;

  storage.write(
    id,
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      storage.compress(id, 'ZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, false);

        storage.read(id, { encoding: 'utf8' }, (err, d) => {
          test.error(err);
          test.strictSame(d, data);
          test.end();
        });
      });
    }
  );
});

fsTest.test('Write and read big file', (test, { storage }) => {
  const id = new common.Uint64(10);
  const data = 'data10'.repeat(1000);
  const cs = '828aaf45';
  const dh = '7a8553c5934fd3b4a068a3d4c5bafc189e1fe8e0f7f46cbcc0fc1199249a39a2';
  const dataSize = 6000;

  storage.write(
    id,
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      storage.read(id, { encoding: 'utf8' }, (err, d) => {
        test.error(err);
        test.strictSame(d, data);
        test.end();
      });
    }
  );
});

fsTest.test('Write, compress and read big file', (test, { storage }) => {
  const id = new common.Uint64(11);
  const data = 'data11'.repeat(1000);
  const cs = '5928f9a';
  const dh = 'f1cf91dea01f77fd860645de51462794cfbbae0a14d81350b21934e58a69941d';
  const dataSize = 6000;

  storage.write(
    id,
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      storage.compress(id, 'ZIP', (err, compressed) => {
        test.error(err);
        test.strictSame(compressed, true);

        storage.read(id, { encoding: 'utf8', compression: 'ZIP' }, (err, d) => {
          test.error(err);
          test.strictSame(d, data);
          test.end();
        });
      });
    }
  );
});

fsTest.test('Write and read small file', (test, { storage }) => {
  const id = new common.Uint64(12);
  const data = '白い猫でも黒い猫でも鼠を取る猫はいい猫だ';
  const cs = '289722d';
  const dh = 'fab270bfcdc81e464611cd112e95c6b9590ba55483fbfe2dda98d67ddc741ab3';
  const dataSize = 60;

  storage.write(
    id,
    data,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs);
      test.strictSame(dedupHash, dh);
      test.strictSame(size, dataSize);

      storage.read(id, { encoding: 'utf8' }, (err, d) => {
        test.error(err);
        test.strictSame(d, data);
        test.end();
      });
    }
  );
});

fsTest.test('Get file stats', (test, { storage }) => {
  const data = 'data13';
  const file = utils.getFilepath(testDir, '000d', '0000');

  fs.mkdir(path.join(testDir, '000d'), err => {
    test.error(err);

    fs.writeFile(file, data, err => {
      test.error(err);

      fs.stat(file, (err, fstats) => {
        test.error(err);

        storage.stat(new common.Uint64(13), (err, stats) => {
          test.error(err);
          test.strictSame(stats, fstats);
          test.end();
        });
      });
    });
  });
});

fsTest.test('Update file', (test, { storage }) => {
  const data1 = 'data15';
  const cs1 = 'bb53e75f';
  const dh1 =
    '87fef323635f22fc88999957a585c3cf3f8383029c8501e52928a14028c0af2c';
  const dataSize1 = 6;

  const data2 = 'another data';
  const cs2 = '963fe1ef';
  const dh2 =
    'f3cfa0c4064755101ffbcdc8a8d1b9dccc46d45b3a82f800a6eaab42e65f14c9';
  const dataSize2 = 12;

  const id = new common.Uint64(15);

  storage.write(
    id,
    data1,
    { checksum: 'CRC32', dedupHash: 'SHA256' },
    (err, { checksum, dedupHash, size }) => {
      test.error(err);
      test.strictSame(checksum, cs1);
      test.strictSame(dedupHash, dh1);
      test.strictSame(size, dataSize1);

      storage.update(
        id,
        data2,
        { checksum: 'CRC32', dedupHash: 'SHA256' },
        (err, { checksum, dedupHash, size, originalSize }) => {
          test.error(err);
          test.strictSame(checksum, cs2);
          test.strictSame(dedupHash, dh2);
          test.strictSame(size, dataSize2);
          test.strictSame(originalSize, dataSize1);

          fs.readFile(utils.getFilepath(testDir, '000f', '0000'), (err, d) => {
            test.error(err);
            test.strictSame(d.toString(), data2);
            test.end();
          });
        }
      );
    }
  );
});
