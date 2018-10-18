'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { crc32 } = require('crc');
const { zip, gzip } = require('compressing');

const hashers = {
  CRC32: data => crc32(data).toString(16),
  SHA256: data => crypto.createHash('sha256').update(data).digest('hex'),
};

const compressors = {
  ZIP: zip,
  GZIP: gzip,
};

const FS_EXT = 'f';

const getFilepath = (...parts) => `${path.join(...parts)}.${FS_EXT}`;

const mkdirp = (dir, cb) => {
  fs.access(dir, fs.constants.F_OK, err => {
    if (err && err.code === 'ENOENT') {
      mkdirp(path.dirname(dir), err => {
        if (err) cb(err);
        else fs.mkdir(dir, cb);
      });
    } else {
      cb(err);
    }
  });
};

const rmdirp = dir => {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      fs.readdirSync(dir).forEach(file => rmdirp(path.join(dir, file)));
      fs.rmdirSync(dir);
    } else {
      fs.unlinkSync(dir);
    }
  }
};

const computeHash = (data, checksum) => {
  const hasher = hashers[checksum];
  if (!hasher) {
    throw new TypeError(`${checksum} is not supported`);
  }
  return hasher(data);
};

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
    compressor.compressFile(file, filec)
      .then(() => fs.rename(filec, file, err => {
        if (err) cb(err, false);
        else cb(null, true);
      }))
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
        stream
          .on('end', next)
          .on('data', data => buffers.push(data));
      });
  });
};

module.exports = {
  FS_EXT,
  getFilepath,
  computeHash,
  mkdirp,
  rmdirp,
  compress,
  uncompress,
};
