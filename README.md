# unzip

## Installation

`npm install @buh/unzip`

## Quick Examples

```javascript
import { Zip } from '@buh/unzip';

// const file = Bun.file('archive.zip');
// const arrayBuffer = await file.arrayBuffer();

const zip = new Zip(arrayBuffer);
for (const entry of zip.iterator()) {
  console.log(entry.fileName, entry.lastModified(), zip.textDecoder.decode(entry.getData()));
}
```

## References

- [kriskowal/zip](https://github.com/kriskowal/zip)
- [.ZIP File Format Specification](/docs/APPNOTE.md)
