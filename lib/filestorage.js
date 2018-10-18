'use strict';

const fs = require('fs');
const path = require('path');
const common = require('metarhia-common');
const utils = require('./utils.js');

const CHECKSUM = 'CRC32';
const DEDUP_HASH = 'SHA256';
const MIN_COMPRESS_SIZE = 1024;

class FileStorage {

  // Create new FileStorage
  //   options <Object>
  //     dir <string> data storage directory, it should be created
  //         before FileStorage is used
  //     minCompressSize <number> minimal file size
  //         to be compressed, default = 1024
  constructor(options) {
    this.dir = path.resolve(options.dir);
    this.minCompressSize = options.minCompressSize || MIN_COMPRESS_SIZE;
  }

  // Write file to storage
  //   id <Object> common.Uint64, id of file
  //   data <string> | <Buffer> | <Uint8Array> data to be written
  //   opts <Object>
  //     checksum <string> checksum type
  //     dedupHash <string> second checksum type
  //   cb <Function> callback
  //     err <Error>
  //     checksum <string> data checksum
  //     dedupHash <string> second data checksum
  //     originalSize <number> data size
  // Throws: <TypeError> if `opts.checksum` or `opts.dedupHash` is incorrect
  write(id, data, opts, cb) {
    const checksum = utils.computeHash(data, opts.checksum || CHECKSUM);
    const dedupHash = utils.computeHash(data, opts.dedupHash || DEDUP_HASH);
    const originalSize = Buffer.byteLength(data);

    const file = utils.getFilepath(this.dir, common.idToPath(id));
    utils.mkdirp(path.dirname(file), err => {
      if (err) {
        cb(err);
        return;
      }
      fs.writeFile(file, data, err => {
        if (err) cb(err);
        else cb(null, checksum, dedupHash, originalSize);
      });
    });
  }

  // Read file from storage
  //   id <Object> common.Uint64, id of file
  //   opts <Object>
  //     encoding <string>
  //     compression <string>
  //   cb <Function> callback
  //     err <Error>
  //     data <Buffer>
  read(id, opts, cb) {
    const file = utils.getFilepath(this.dir, common.idToPath(id));
    if (opts.compression) utils.uncompress(file, opts, cb);
    else fs.readFile(file, opts.encoding, cb);
  }

  // Delete file from storage
  //   id <Object> common.Uint64, id of file
  //   cb <Function> callback
  //     err <Error>
  rm(id, cb) {
    const file = utils.getFilepath(this.dir, common.idToPath(id));
    fs.unlink(file, cb);
  }

  // Compress file in storage
  //   id <Object> common.Uint64, id of file
  //   compression <string> compression type
  //   cb <Function> callback
  //     err <Error>
  //     compressed <boolean> whether file was compressed
  // Throws: <TypeError> if compression is incorrect
  compress(id, compression, cb) {
    const file = utils.getFilepath(this.dir, common.idToPath(id));
    utils.compress(file, this.minCompressSize, compression, cb);
  }
}

// Create new Filestorage and root directory if it doesn't exits
//   options <Object>
//     dir <string> data storage directory
//     minCompressSize <number> minimal file size to be compressed
//   cb <Function> callback
//     err <Error>
//     storage <FileStorage>
const create = (options, cb) => {
  utils.mkdirp(path.resolve(options.dir), err => {
    if (err) cb(err);
    else cb(null, new FileStorage(options));
  });
};

module.exports = { FileStorage, create };
