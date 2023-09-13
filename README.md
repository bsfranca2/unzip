# unzip

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
