# FileStorage

FileStorage is a library that allows to easily store a large number of binary files.
Data will be spread across the file tree to optimize read and write speeds and can be accessed by a unique id.
Large files can be compressed using either `ZIP` or `GZIP` and automatically decompressed on reading.

It is strongly recommended to use `filestorage.create` to get new `FileStorage` instance
because it will also create a root directory if it does not yet exist in the file system.

Example with existing directory:

```js
const { FileStorage } = require('filestorage');

const storage = new FileStorage({
  dir: './root-directory',
  minCompressSize: 2048,
});
```

Example with create:

```js
const { create } = require('filestorage');

create({ dir: './root' }, (err, storage) => { ... });
```

## Interface: filestorage

### Create new FileStorage

`FileStorage(options)`

- `options:`[`<Object>`]
  - `dir:`[`<string>`] data storage directory, which should be created before
    FileStorage is used
  - `minCompressSize:`[`<number>`] minimal file size to be compressed,
    default = 1024

### Write file to storage

`FileStorage.prototype.write(id, data, opts, cb)`

- `id` `<common.Uint64>`id of file
- `data:`[`<string>`]`|`[`<Uint8Array>`] `<Buffer>`data to be written
- `opts:`[`<Object>`]
  - `checksum:`[`<string>`] checksum type
  - `dedupHash:`[`<string>`] second checksum type
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `stats:`[`<Object>`]
    - `checksum:`[`<string>`] data checksum
    - `dedupHash:`[`<string>`] second data checksum
    - `size:`[`<number>`] data size

_Throws:_ [`<TypeError>`] if `opts.checksum` or `opts.dedupHash` is incorrect

### Update or write file in the storage

`FileStorage.prototype.update(id, data, opts, cb)`

- `id` `<common.Uint64>`id of file
- `data:`[`<string>`]`|`[`<Uint8Array>`] `<Buffer>`data to be written
- `opts:`[`<Object>`]
  - `checksum:`[`<string>`] checksum type
  - `dedupHash:`[`<string>`] second checksum type
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `stats:`[`<Object>`]
    - `checksum:`[`<string>`] data checksum
    - `dedupHash:`[`<string>`] second data checksum
    - `size:`[`<number>`] data size
    - `originalSize:`[`<number>`] size of original file

_Throws:_ [`<TypeError>`] if `opts.checksum` or `opts.dedupHash` is incorrect

### Get information about file

`FileStorage.prototype.stat(id, cb)`

- `id` `<common.Uint64>`id of file
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `stats` `<fs.Stats>`

### Read file from storage

`FileStorage.prototype.read(id, opts, cb)`

- `id` `<common.Uint64>`id of file
- `opts:`[`<Object>`]
  - `encoding:`[`<string>`]
  - `compression:`[`<string>`]
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `data:`[`<string>`] `<Buffer>`

### Delete file from storage

`FileStorage.prototype.rm(id, cb)`

- `id` `<common.Uint64>`id of file
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]

### Compress file in storage

`FileStorage.prototype.compress(id, compression, cb)`

- `id` `<common.Uint64>`id of file
- `compression:`[`<string>`] compression type
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `compressed:`[`<boolean>`] whether file was compressed

_Throws:_ [`<TypeError>`] if compression is incorrect

### Create new Filestorage and root directory if it doesn't exits

`create(options, cb)`

- `options:`[`<Object>`]
  - `dir:`[`<string>`] data storage directory
  - `minCompressSize:`[`<number>`] minimal file size to be compressed
- `cb:`[`<Function>`] callback
  - `err:`[`<Error>`]
  - `storage` `<FileStorage>`

[`<object>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[`<date>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[`<function>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[`<regexp>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[`<dataview>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
[`<map>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[`<weakmap>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
[`<set>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[`<weakset>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
[`<array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[`<arraybuffer>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[`<int8array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array
[`<uint8array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[`<uint8clampedarray>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
[`<int16array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array
[`<uint16array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array
[`<int32array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[`<uint32array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array
[`<float32array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[`<float64array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[`<error>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[`<evalerror>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/EvalError
[`<typeerror>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[`<rangeerror>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError
[`<syntaxerror>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError
[`<referenceerror>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError
[`<boolean>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[`<null>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type
[`<undefined>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type
[`<number>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`<string>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[`<symbol>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type
[`<primitive>`]: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
[`<iterable>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[`<this>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
