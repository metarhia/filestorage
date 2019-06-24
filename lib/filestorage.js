'use strict';

const fs = require('./fs');
const path = require('path');
const common = require('@metarhia/common');
const utils = require('./utils');

const MIN_COMPRESS_SIZE = 1024;

const getFilepath = Symbol('getFilepath');

class FileStorage {
  // Create new FileStorage
  //   options - <Object>
  //     path - <string>, data storage directory, which should be created
  //         before FileStorage is used
  //     minCompressSize - <number>, minimal file size
  //         to be compressed, default = 1024
  constructor(options) {
    this.path = path.resolve(options.path);
    this.minCompressSize = options.minCompressSize || MIN_COMPRESS_SIZE;
  }

  // Write file to storage
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  //   data - <string> | <Buffer> | <Uint8Array>, data to be written
  //   opts - <Object>
  //     checksum - <string>, checksum type
  //     dedupHash - <string>, second checksum type
  // Returns: <Promise>
  // Throws: <TypeError>, if `opts.checksum` or `opts.dedupHash` is incorrect
  async write(id, data, opts) {
    const file = this[getFilepath](id);
    await utils.mkdirpPromise(path.dirname(file));
    await fs.writeFile(file, data);

    return utils.getDataStats(data, opts.checksum, opts.dedupHash);
  }

  // Update file in the storage
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  //   data - <string> | <Buffer> | <Uint8Array>, data to be written
  //   opts - <Object>
  //     checksum - <string>, checksum type
  //     dedupHash - <string>, second checksum type
  // Returns: <Promise>
  // Throws: <TypeError>, if `opts.checksum` or `opts.dedupHash` is incorrect
  async update(id, data, opts) {
    const file = this[getFilepath](id);
    const fstats = await fs.stat(file);
    await fs.writeFile(file, data);

    const stats = utils.getDataStats(data, opts.checksum, opts.dedupHash);
    stats.originalSize = fstats.size;
    return stats;
  }

  // Get information about file
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  // Returns: <Promise>
  async stat(id) {
    const file = this[getFilepath](id);
    return fs.stat(file);
  }

  // Read file from storage
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  //   opts - <Object>
  //     encoding - <string>
  //     compression - <string>
  // Returns: <Promise>
  async read(id, opts) {
    const file = this[getFilepath](id);
    if (opts.compression) return utils.uncompress(file, opts);
    return fs.readFile(file, opts.encoding);
  }

  // Delete file from storage
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  async rm(id) {
    const file = this[getFilepath](id);
    await fs.unlink(file);
  }

  // Compress file in storage
  //   id - <common.Uint64> | <number> | <BigInt>, id of file
  //   compression - <string>, compression type
  // Returns: <Promise>
  // Throws: <TypeError>, if compression is incorrect
  async compress(id, compression) {
    const file = this[getFilepath](id);
    return utils.compress(file, this.minCompressSize, compression);
  }

  [getFilepath](id) {
    return utils.getFilepath(this.path, common.idToPath(id));
  }
}

// Create new Filestorage and root directory if it doesn't exits
//   options - <Object>
//     path - <string>, data storage directory
//     minCompressSize - <number>, minimal file size to be compressed
// Returns: <Promise>
const create = async options => {
  await utils.mkdirpPromise(path.resolve(options.path));
  return new FileStorage(options);
};

module.exports = { FileStorage, create };
