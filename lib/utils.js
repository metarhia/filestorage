'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { crc32 } = require('crc');
const { zip, gzip } = require('compressing');
const metasync = require('metasync');

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

const rmdirp = (dir, cb) => {
  fs.stat(dir, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') cb(null);
      else cb(err);
      return;
    }

    if (stats.isDirectory()) {
      fs.readdir(dir, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        files = files.map(file => path.join(dir, file));
        metasync.each(files, rmdirp, err => {
          if (err) cb(err);
          else fs.rmdir(dir, cb);
        });
      });
    } else {
      fs.unlink(dir, cb);
    }
  });
};

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

const compress = (file, minCompressSize, compression, cb) => {
  fs.stat(file, (err, stats) => {
    if (err || stats.size <= minCompressSize) {
      cb(err, false);
      return;
    }
    const filec = file + 'z';
    const compressor = compressors[compression];
    if (!compressor) {
      throw new Error(`Unknown compression type ${compression} specified`);
    }
    compressor
      .compressFile(file, filec)
      .then(() =>
        fs.rename(filec, file, err => {
          if (err) cb(err, false);
          else cb(null, true);
        })
      )
      .catch(err => cb(err, false));
  });
};

const uncompress = (file, opts, cb) => {
  fs.access(file, err => {
    if (err) {
      cb(err);
      return;
    }
    const compressor = compressors[opts.compression];
    if (!compressor) {
      throw new Error(`Unknown compression type ${opts.compression} specified`);
    }
    const buffers = [];
    new compressor.UncompressStream({ source: file })
      .on('error', cb)
      .on('finish', () => {
        if (opts.encoding) cb(null, buffers.join());
        else cb(null, Buffer.concat(buffers));
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
  rmdirp,
  compress,
  uncompress,
};
