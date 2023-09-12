export type InflateFn = (data: Uint8Array) => Uint8Array;

export type Signature = number;

export interface LocalFileHeader {
  signature: Signature;
  versionNeeded: number;
  flags: number;
  compressionMethod: number;
  lastModificationFileTime: number;
  lastModificationFileDate: number;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  fileNameLength: number;
  extraFieldLength: number;
  fileName: string;
  extraField: Uint8Array;
}

export interface CentralDirectoryFileHeader extends LocalFileHeader {
  version: number;
  fileCommentLength: number;
  diskNumber: number;
  internalFileAttributes: number;
  externalFileAttributes: number;
  localFileHeaderOffset: number;
  fileComment: string;
}

export interface EndOfCentralDirectoryRecord {
  signature: Signature;
  diskNumber: number;
  centralDirDiskNumber: number;
  centralDirDiskRecords: number;
  centralDirTotalRecords: number;
  centralDirSize: number;
  centralDirOffset: number;
  fileCommentLength: number;
  fileComment: string;
}
