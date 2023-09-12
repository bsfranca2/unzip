import type { Zip } from './zip';
import type { LocalFileHeader } from './types';
import { decodeDateTime } from './utils';

export class Entry {
  #header: LocalFileHeader;
  #compressedSize: number;
  #compressionMethod: number;
  #zip: Zip;
  #byteOffset: number;
  #data: Uint8Array | null;

  constructor(
    header: LocalFileHeader,
    compressedSize: number,
    compressionMethod: number,
    zip: Zip,
    byteOffset: number
  ) {
    this.#header = header;
    this.#compressedSize = compressedSize;
    this.#compressionMethod = compressionMethod;
    this.#zip = zip;
    this.#byteOffset = byteOffset;
    this.#data = null;
  }

  get fileName() {
    return this.#header.fileName;
  }

  isFile() {
    return !this.isDirectory();
  }

  isDirectory() {
    return this.fileName.slice(-1) === '/';
  }

  lastModified() {
    return decodeDateTime(
      this.#header.lastModificationFileDate,
      this.#header.lastModificationFileTime
    );
  }

  getData() {
    if (this.#data === null) {
      this.#data = this.#zip.readEntryData(
        this.#byteOffset,
        this.#compressedSize,
        this.#compressionMethod
      );
    }
    return this.#data;
  }
}
