import { Zip } from '../dist/index.js';
import { readFileSync } from 'node:fs';

async function main() {
  const invoiceFile = readFileSync('fatura.xlsx');
  const zip = await Zip.create(invoiceFile.buffer);

  for (const entry of zip.iterator()) {
    // console.log(entry.fileName, entry.lastModified(), zip.textDecoder.decode(entry.getData()));
    zip.textDecoder.decode(entry.getData());
  }
}
main();
