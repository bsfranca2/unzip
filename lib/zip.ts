import type {
  CentralDirectoryFileHeader,
  EndOfCentralDirectoryRecord,
  InflateFn,
  LocalFileHeader,
  Signature,
} from './types';
import { ZipDataView } from './data-view';
import { getInflateFnByRuntime } from './runtime';
import { CompressionMethod, Signatures } from './constants';
import { Entry } from './entry';

export interface Options {
  inflate: InflateFn;
}

export class Zip {
  #dataView: ZipDataView;
  #inflate: InflateFn;

  textDecoder = new TextDecoder('utf-8');

  private constructor(arrayBuffer: ArrayBuffer, options: Options) {
    this.#dataView = new ZipDataView(arrayBuffer);
    this.#inflate = options.inflate;
  }

  static async create(arrayBuffer: ArrayBuffer, options?: Partial<Options>) {
    const _options = (options ?? {}) as Options;
    _options.inflate ??= await getInflateFnByRuntime();

    return new Zip(arrayBuffer, _options);
  }

  readStructure() {
    const signature = this.#dataView.getUint32();
    switch (signature) {
      case Signatures.LocalFileHeader:
        return this.readLocalFileHeader(signature);
      case Signatures.CentralDirectoryFileHeader:
        return this.readCentralDirectoryFileHeader(signature);
      case Signatures.EndOfCentralDirectoryRecord:
        throw new Error('Not implemented yet');
      default:
        throw new Error('Unknown ZIP structure signature: 0x' + signature.toString(16));
    }
  }

  // ZIP local file header
  // Offset   Bytes   Description
  // 0        4       Local file header signature = 0x04034b50
  // 4        2       Version needed to extract (minimum)
  // 6        2       General purpose bit flag
  // 8        2       Compression method
  // 10       2       File last modification time
  // 12       2       File last modification date
  // 14       4       CRC-32
  // 18       4       Compressed size
  // 22       4       Uncompressed size
  // 26       2       File name length (n)
  // 28       2       Extra field length (m)
  // 30       n       File name
  // 30+n     m       Extra field
  readLocalFileHeader(signature?: Signature) {
    if (!signature) signature = this.#dataView.getUint32();

    if (signature !== Signatures.LocalFileHeader)
      throw new Error(
        'ZIP local file header signature invalid (expects 0x04034b50, actually 0x' +
          signature.toString(16) +
          ')'
      );

    const localFileHeader = {
      signature,
      versionNeeded: this.#dataView.getUint16(),
      flags: this.#dataView.getUint16(),
      compressionMethod: this.#dataView.getUint16(),
      lastModificationFileTime: this.#dataView.getUint16(),
      lastModificationFileDate: this.#dataView.getUint16(),
      crc32: this.#dataView.getUint32(),
      compressedSize: this.#dataView.getUint32(),
      uncompressedSize: this.#dataView.getUint32(),
      fileNameLength: this.#dataView.getUint16(),
      extraFieldLength: this.#dataView.getUint16(),
    } as LocalFileHeader;

    const n = localFileHeader.fileNameLength;
    const m = localFileHeader.extraFieldLength;

    localFileHeader.fileName = this.textDecoder.decode(this.#dataView.getUint8Array(n));
    localFileHeader.extraField = this.#dataView.getUint8Array(m);

    return localFileHeader;
  }

  // ZIP central directory file header
  // Offset   Bytes   Description
  // 0        4       Central directory file header signature = 0x02014b50
  // 4        2       Version made by
  // 6        2       Version needed to extract (minimum)
  // 8        2       General purpose bit flag
  // 10       2       Compression method
  // 12       2       File last modification time
  // 14       2       File last modification date
  // 16       4       CRC-32
  // 20       4       Compressed size
  // 24       4       Uncompressed size
  // 28       2       File name length (n)
  // 30       2       Extra field length (m)
  // 32       2       File comment length (k)
  // 34       2       Disk number where file starts
  // 36       2       Internal file attributes
  // 38       4       External file attributes
  // 42       4       Relative offset of local file header
  // 46       n       File name
  // 46+n     m       Extra field
  // 46+n+m   k       File comment
  readCentralDirectoryFileHeader(signature?: Signature) {
    if (!signature) signature = this.#dataView.getUint32();

    if (signature !== Signatures.CentralDirectoryFileHeader)
      throw new Error(
        'ZIP central directory file header signature invalid (expects 0x02014b50, actually 0x' +
          signature.toString(16) +
          ')'
      );

    const centralDirectoryFileHeader = {
      signature,
      version: this.#dataView.getUint16(),
      versionNeeded: this.#dataView.getUint16(),
      flags: this.#dataView.getUint16(),
      compressionMethod: this.#dataView.getUint16(),
      lastModificationFileTime: this.#dataView.getUint16(),
      lastModificationFileDate: this.#dataView.getUint16(),
      crc32: this.#dataView.getUint32(),
      compressedSize: this.#dataView.getUint32(),
      uncompressedSize: this.#dataView.getUint32(),
      fileNameLength: this.#dataView.getUint16(),
      extraFieldLength: this.#dataView.getUint16(),
      fileCommentLength: this.#dataView.getUint16(),
      diskNumber: this.#dataView.getUint16(),
      internalFileAttributes: this.#dataView.getUint16(),
      externalFileAttributes: this.#dataView.getUint32(),
      localFileHeaderOffset: this.#dataView.getUint32(),
    } as CentralDirectoryFileHeader;

    const n = centralDirectoryFileHeader.fileNameLength;
    const m = centralDirectoryFileHeader.extraFieldLength;
    const k = centralDirectoryFileHeader.fileCommentLength;

    centralDirectoryFileHeader.fileName = this.textDecoder.decode(this.#dataView.getUint8Array(n));
    centralDirectoryFileHeader.extraField = this.#dataView.getUint8Array(m);
    centralDirectoryFileHeader.fileComment = this.textDecoder.decode(
      this.#dataView.getUint8Array(k)
    );

    return centralDirectoryFileHeader;
  }

  // finds the end of central directory record
  // I'd like to slap whoever thought it was a good idea to put a variable length comment field here
  locateEndOfCentralDirectoryRecord() {
    const length = this.#dataView.byteLength;
    const minPosition = length - Math.pow(2, 16) - 22;

    let position = length - 22 + 1;
    while (--position) {
      if (position < minPosition) throw new Error('Unable to find end of central directory record');

      this.#dataView.setByteOffset(position);
      const possibleSignature = this.#dataView.getUint32();
      if (possibleSignature !== Signatures.EndOfCentralDirectoryRecord) continue;

      this.#dataView.setByteOffset(position + 20);
      const possibleFileCommentLength = this.#dataView.getUint16();
      if (position + 22 + possibleFileCommentLength === length) break;
    }

    this.#dataView.setByteOffset(position);
    return position;
  }

  // ZIP end of central directory record
  // Offset   Bytes   Description
  // 0        4       End of central directory signature = 0x06054b50
  // 4        2       Number of this disk
  // 6        2       Disk where central directory starts
  // 8        2       Number of central directory records on this disk
  // 10       2       Total number of central directory records
  // 12       4       Size of central directory (bytes)
  // 16       4       Offset of start of central directory, relative to start of archive
  // 20       2       ZIP file comment length (n)
  // 22       n       ZIP file comment
  readEndOfCentralDirectoryRecord(signature?: Signature) {
    if (!signature) signature = this.#dataView.getUint32();

    if (signature !== Signatures.EndOfCentralDirectoryRecord)
      throw new Error(
        'ZIP end of central directory record signature invalid (expects 0x06054b50, actually 0x' +
          signature.toString(16) +
          ')'
      );

    const endOfCentralDirectoryRecord = {
      signature,
      diskNumber: this.#dataView.getUint16(),
      centralDirDiskNumber: this.#dataView.getUint16(),
      centralDirDiskRecords: this.#dataView.getUint16(),
      centralDirTotalRecords: this.#dataView.getUint16(),
      centralDirSize: this.#dataView.getUint32(),
      centralDirOffset: this.#dataView.getUint32(),
      fileCommentLength: this.#dataView.getUint16(),
    } as EndOfCentralDirectoryRecord;

    const n = endOfCentralDirectoryRecord.fileCommentLength;

    endOfCentralDirectoryRecord.fileComment = this.textDecoder.decode(
      this.#dataView.getUint8Array(n)
    );

    return endOfCentralDirectoryRecord;
  }

  readDataDescriptor() {
    const firstValue = this.#dataView.getUint32();
    const isSignature = firstValue === 0x08074b50;
    return {
      crc32: isSignature ? this.#dataView.getUint32() : firstValue,
      compressedSize: this.#dataView.getUint32(),
      uncompressedSize: this.#dataView.getUint32(),
    };
  }

  readUncompressed(length: number, method: number) {
    const compressed = this.#dataView.getUint8Array(length);
    switch (method) {
      case CompressionMethod.NoCompression:
        return compressed;
      case CompressionMethod.Deflated:
        return this.#inflate(compressed);
      default:
        throw new Error('Unknown compression method: ' + method);
    }
  }

  readEntryData(start: number, compressedSize: number, compressionMethod: number) {
    const bookmark = this.#dataView.byteOffset;
    this.#dataView.setByteOffset(start);
    const data = this.readUncompressed(compressedSize, compressionMethod);
    this.#dataView.setByteOffset(bookmark);
    return data;
  }

  iterator() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // find the end record and read it
    this.locateEndOfCentralDirectoryRecord();
    const endRecord = this.readEndOfCentralDirectoryRecord();

    // seek to the beginning of the central directory
    this.#dataView.setByteOffset(endRecord.centralDirOffset);

    return {
      [Symbol.iterator]: function* () {
        for (let count = endRecord.centralDirDiskRecords; count > 0; count--) {
          // read the central directory header
          const centralHeader = self.readCentralDirectoryFileHeader();

          // save our new position so we can restore it
          const saved = self.#dataView.byteOffset;

          // seek to the local header and read it
          self.#dataView.setByteOffset(centralHeader.localFileHeaderOffset);
          const localHeader = self.readLocalFileHeader();

          // don't read the content just save the position for later use
          const start = self.#dataView.byteOffset;

          // seek back to the next central directory header
          self.#dataView.setByteOffset(saved);

          yield new Entry(
            localHeader,
            centralHeader.compressedSize,
            centralHeader.compressionMethod,
            self,
            start
          );
        }
      },
    };
  }
}
