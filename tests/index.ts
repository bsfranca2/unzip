import { Zip } from '../lib/index';

const invoiceFile = Bun.file('fatura.xlsx');
const buf = await invoiceFile.arrayBuffer();

const zip = await Zip.create(buf);
for (const entry of zip.iterator()) {
  console.log(entry.fileName, entry.lastModified(), zip.textDecoder.decode(entry.getData()));
}
