# unzip

## Benchmark

Command: `hyperfine --warmup 100 --runs 1000 'bun run tests/index.ts' 'node tests/node.js'`

```
Benchmark 1: bun run tests/index.ts
  Time (mean ± σ):      41.0 ms ±   4.1 ms    [User: 29.4 ms, System: 22.8 ms]
  Range (min … max):    30.9 ms …  60.3 ms    1000 runs
 
Benchmark 2: node tests/node.js
  Time (mean ± σ):     205.4 ms ±   8.9 ms    [User: 168.5 ms, System: 59.7 ms]
  Range (min … max):   180.8 ms … 231.4 ms    1000 runs
 
Summary
  'bun run tests/index.ts' ran
    5.01 ± 0.54 times faster than 'node tests/node.js'
```

## Installation

`npm install @buh/unzip`

## Quick Examples

### Bun

Use `inflateSync` from `Bun.inflateSync`.

```javascript
import { Zip } from '@buh/unzip';

const file = Bun.file('archive.zip');
const arrayBuffer = await file.arrayBuffer();

const zip = await Zip.create(arrayBuffer);
for (const entry of zip.iterator()) {
  console.log(entry.fileName, entry.lastModified(), entry.getData());
}
```

### Node

Use `inflateRawSync` from `node:zlib`.

```javascript
import { Zip } from '@buh/unzip';
import { readFileSync } from 'node:fs';

const file = readFileSync('archive.zip');

const zip = await Zip.create(file.buffer);
for (const entry of zip.iterator()) {
  console.log(entry.fileName, entry.lastModified(), entry.getData());
}
```

### Browser / Custom

I pretend to do my own inflate implementation for study purpose, but I recommend use `pako`. Install `npm install pako`.

```javascript
import { Zip } from '@buh/unzip';
import { inflateRaw } from 'pako';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('input[type=file]');
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files[0];
    const arrayBuffer = await file.arrayBuffer();

    const zip = await Zip.create(arrayBuffer, { inflate: inflateRaw });
    for (const entry of zip.iterator()) {
      console.log(entry.fileName, entry.lastModified(), entry.getData());
    }
  });
});
```

## References

- [kriskowal/zip](https://github.com/kriskowal/zip)
- [.ZIP File Format Specification](/docs/APPNOTE.md)

## Chagelogs

You can track the changelogs in [CHANGELOGS.md](/CHANGELOG.md) file.
