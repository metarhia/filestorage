# FileStorage

FileStorage is a library that allows to easily store a large number of binary files.
Data will be spread across the file tree to optimize read and write speeds and can be accessed by a unique id.
Large files can be compressed using either `ZIP` or `GZIP` and automatically decompressed on reading.

It is strongly recommended to use `filestorage.create` to get new `FileStorage` instance
because it will also create a root directory if it does not yet exist in the file system.

Example with existing directory:
```js
const { FileStorage } = require('filestorage');

const storage = new FileStorage({ dir: './root-directory', minCompressSize: 2048 });
```

Example with create:
```js
const { create } = require('filestorage');

create({ dir: './root' }, (err, storage) => { ... });
```


## Interface: filestorage

### Create new FileStorage

`FileStorage(options)`
  - `options: `[`<Object>`]
    - `dir: `[`<string>`] data storage directory, which should be created before
          FileStorage is used
    - `minCompressSize: `[`<number>`] minimal file size to be compressed,
          default = 1024


### Write file to storage

`FileStorage.prototype.write(id, data, opts, cb)`
  - `id` `<common.Uint64>`id of file
  - `data: `[`<string>`]` | `[`<Uint8Array>`] `<Buffer>`data to be written
  - `opts: `[`<Object>`]
    - `checksum: `[`<string>`] checksum type
    - `dedupHash: `[`<string>`] second checksum type
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `stats: `[`<Object>`]
      - `checksum: `[`<string>`] data checksum
      - `dedupHash: `[`<string>`] second data checksum
      - `size: `[`<number>`] data size

*Throws:* [`<TypeError>`] if `opts.checksum` or `opts.dedupHash` is incorrect


### Update or write file in the storage

`FileStorage.prototype.update(id, data, opts, cb)`
  - `id` `<common.Uint64>`id of file
  - `data: `[`<string>`]` | `[`<Uint8Array>`] `<Buffer>`data to be written
  - `opts: `[`<Object>`]
    - `checksum: `[`<string>`] checksum type
    - `dedupHash: `[`<string>`] second checksum type
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `stats: `[`<Object>`]
      - `checksum: `[`<string>`] data checksum
      - `dedupHash: `[`<string>`] second data checksum
      - `size: `[`<number>`] data size
      - `originalSize: `[`<number>`] size of original file

*Throws:* [`<TypeError>`] if `opts.checksum` or `opts.dedupHash` is incorrect


### Get information about file

`FileStorage.prototype.stat(id, cb)`
  - `id` `<common.Uint64>`id of file
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `stats` `<fs.Stats>`


### Read file from storage

`FileStorage.prototype.read(id, opts, cb)`
  - `id` `<common.Uint64>`id of file
  - `opts: `[`<Object>`]
    - `encoding: `[`<string>`]
    - `compression: `[`<string>`]
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `data: `[`<string>`] `<Buffer>`


### Delete file from storage

`FileStorage.prototype.rm(id, cb)`
  - `id` `<common.Uint64>`id of file
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]


### Compress file in storage

`FileStorage.prototype.compress(id, compression, cb)`
  - `id` `<common.Uint64>`id of file
  - `compression: `[`<string>`] compression type
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `compressed: `[`<boolean>`] whether file was compressed

*Throws:* [`<TypeError>`] if compression is incorrect


### Create new Filestorage and root directory if it doesn't exits

`create(options, cb)`
  - `options: `[`<Object>`]
    - `dir: `[`<string>`] data storage directory
    - `minCompressSize: `[`<number>`] minimal file size to be compressed
  - `cb: `[`<Function>`] callback
    - `err: `[`<Error>`]
    - `storage` `<FileStorage>`


[`<Object>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[`<Date>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[`<Function>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[`<RegExp>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[`<DataView>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
[`<Map>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[`<WeakMap>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
[`<Set>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[`<WeakSet>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
[`<Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[`<ArrayBuffer>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[`<Int8Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array
[`<Uint8Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[`<Uint8ClampedArray>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
[`<Int16Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array
[`<Uint16Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array
[`<Int32Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[`<Uint32Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array
[`<Float32Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[`<Float64Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[`<Error>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[`<EvalError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/EvalError
[`<TypeError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[`<RangeError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError
[`<SyntaxError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError
[`<ReferenceError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError
[`<boolean>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[`<null>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type
[`<undefined>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type
[`<number>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`<string>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[`<symbol>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type
[`<Primitive>`]: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
[`<Iterable>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[`<this>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this