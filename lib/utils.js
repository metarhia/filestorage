'use strict';

const fs = require('./fs');
const path = require('path');
const crypto = require('crypto');
const { crc32 } = require('crc');
const util = require('util');
const common = require('@metarhia/common');
const { zip, gzip } = require('compressing');

const CHECKSUM = 'CRC32';
const DEDUP_HASH = 'SHA256';

const hashers = {
  CRC32: data => crc32(data).toString(16),
  SHA256: data =>
    crypto
      .createHash('sha256')
      .update(data)
      .digest('hex'),
};

const compressors = {
  ZIP: zip,
  GZIP: gzip,
};

const FS_EXT = 'f';

const getFilepath = (...parts) => `${path.join(...parts)}.${FS_EXT}`;

const computeHash = (data, checksum) => {
  const hasher = hashers[checksum];
  if (!hasher) {
    throw new TypeError(`${checksum} is not supported`);
  }
  return hasher(data);
};

const getDataStats = (data, checksum, dedupHash) => ({
  checksum: computeHash(data, checksum || CHECKSUM),
  dedupHash: computeHash(data, dedupHash || DEDUP_HASH),
  size: Buffer.byteLength(data),
});

const compress = async (file, minCompressSize, compression) => {
  const compressor = compressors[compression];
  if (!compressor) {
    throw new Error(`Unknown compression type ${compression} specified`);
  }

  const stats = await fs.stat(file);
  if (stats.size <= minCompressSize) return false;

  const filec = file + 'z';
  await compressor.compressFile(file, filec);
  await fs.rename(filec, file);
  return true;
};

const uncompress = async (file, opts) => {
  const compressor = compressors[opts.compression];
  if (!compressor) {
    throw new Error(`Unknown compression type ${opts.compression} specified`);
  }

  return new Promise((res, rej) => {
    const buffers = [];
    new compressor.UncompressStream({ source: file })
      .on('error', rej)
      .on('finish', () => {
        if (opts.encoding) res(buffers.join(''));
        else res(Buffer.concat(buffers));
      })
      .on('entry', (header, stream, next) => {
        if (opts.encoding) stream.setEncoding(opts.encoding);
        stream.on('end', next).on('data', data => buffers.push(data));
      });
  });
};

module.exports = {
  FS_EXT,
  getFilepath,
  computeHash,
  getDataStats,
  compress,
  uncompress,
  mkdirpPromise: util.promisify(common.mkdirp),
};
