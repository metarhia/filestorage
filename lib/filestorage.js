'use strict';

const fs = require('fs');
const path = require('path');
const common = require('@metarhia/common');
const utils = require('./utils');

const MIN_COMPRESS_SIZE = 1024;

const getFilepath = Symbol('getFilepath');

class FileStorage {
  // Create new FileStorage
  //   options - <Object>
  //     dir - <string>, data storage directory, which should be created
  //         before FileStorage is used
  //     minCompressSize - <number>, minimal file size
  //         to be compressed, default = 1024
  constructor(options) {
    this.dir = path.resolve(options.dir);
    this.minCompressSize = options.minCompressSize || MIN_COMPRESS_SIZE;
  }

  // Write file to storage
  //   id - <common.Uint64>, id of file
  //   data - <string> | <Buffer> | <Uint8Array>, data to be written
  //   opts - <Object>
  //     checksum - <string>, checksum type
  //     dedupHash - <string>, second checksum type
  //   cb - <Function>, callback
  //     err - <Error>
  //     stats - <Object>
  //       checksum - <string>, data checksum
  //       dedupHash - <string>, second data checksum
  //       size - <number>, data size
  // Throws: <TypeError>, if `opts.checksum` or `opts.dedupHash` is incorrect
  write(id, data, opts, cb) {
    const file = this[getFilepath](id);
    utils.mkdirp(path.dirname(file), err => {
      if (err) {
        cb(err);
        return;
      }
      fs.writeFile(file, data, err => {
        if (err) {
          cb(err);
          return;
        }
        const stats = utils.getDataStats(data, opts.checksum, opts.dedupHash);
        cb(null, stats);
      });
    });
  }

  // Update file in the storage
  //   id - <common.Uint64>, id of file
  //   data - <string> | <Buffer> | <Uint8Array>, data to be written
  //   opts - <Object>
  //     checksum - <string>, checksum type
  //     dedupHash - <string>, second checksum type
  //   cb - <Function>, callback
  //     err - <Error>
  //     stats - <Object>
  //       checksum - <string>, data checksum
  //       dedupHash - <string>, second data checksum
  //       size - <number>, data size
  //       originalSize - <number>, size of original file
  // Throws: <TypeError>, if `opts.checksum` or `opts.dedupHash` is incorrect
  update(id, data, opts, cb) {
    const file = this[getFilepath](id);
    fs.stat(file, (err, fstats) => {
      if (err) {
        cb(err);
        return;
      }
      fs.writeFile(file, data, err => {
        if (err) {
          cb(err);
          return;
        }
        const stats = utils.getDataStats(data, opts.checksum, opts.dedupHash);
        stats.originalSize = fstats.size;
        cb(null, stats);
      });
    });
  }

  // Get information about file
  //   id - <common.Uint64>, id of file
  //   cb - <Function>, callback
  //     err - <Error>
  //     stats - <fs.Stats>
  stat(id, cb) {
    const file = this[getFilepath](id);
    fs.stat(file, cb);
  }

  // Read file from storage
  //   id - <common.Uint64>, id of file
  //   opts - <Object>
  //     encoding - <string>
  //     compression - <string>
  //   cb - <Function>, callback
  //     err - <Error>
  //     data - <Buffer> | <string>
  read(id, opts, cb) {
    const file = this[getFilepath](id);
    if (opts.compression) utils.uncompress(file, opts, cb);
    else fs.readFile(file, opts.encoding, cb);
  }

  // Delete file from storage
  //   id - <common.Uint64>, id of file
  //   cb - <Function>, callback
  //     err - <Error>
  rm(id, cb) {
    const file = this[getFilepath](id);
    fs.unlink(file, cb);
  }

  // Compress file in storage
  //   id - <common.Uint64>, id of file
  //   compression - <string>, compression type
  //   cb - <Function>, callback
  //     err - <Error>
  //     compressed - <boolean>, whether file was compressed
  // Throws: <TypeError>, if compression is incorrect
  compress(id, compression, cb) {
    const file = this[getFilepath](id);
    utils.compress(file, this.minCompressSize, compression, cb);
  }

  [getFilepath](id) {
    return utils.getFilepath(this.dir, common.idToPath(id));
  }
}

// Create new Filestorage and root directory if it doesn't exits
//   options - <Object>
//     dir - <string>, data storage directory
//     minCompressSize - <number>, minimal file size to be compressed
//   cb - <Function>, callback
//     err - <Error>
//     storage - <FileStorage>
const create = (options, cb) => {
  utils.mkdirp(path.resolve(options.dir), err => {
    if (err) cb(err);
    else cb(null, new FileStorage(options));
  });
};

module.exports = { FileStorage, create };
