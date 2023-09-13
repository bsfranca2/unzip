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
      console.log(entry.fileName, entry.lastModified(), zip.textDecoder.decode(entry.getData()));
    }
  });
});
