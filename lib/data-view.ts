export class ZipDataView {
  #dv: DataView;
  #byteOffset = 0;

  constructor(buf: ArrayBuffer) {
    this.#dv = new DataView(buf);
  }

  getUint8(): number {
    const value = this.#dv.getUint8(this.#byteOffset);
    this.#byteOffset += 1;
    return value;
  }

  getUint16(): number {
    const value = this.#dv.getUint16(this.#byteOffset, true);
    this.#byteOffset += 2;
    return value;
  }

  getUint32(): number {
    const value = this.#dv.getUint32(this.#byteOffset, true);
    this.#byteOffset += 4;
    return value;
  }

  getUint8Array(length: number): Uint8Array {
    const arr = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = this.getUint8();
    }
    return arr;
  }

  get byteLength(): number {
    return this.#dv.byteLength;
  }

  get byteOffset(): number {
    return this.#byteOffset;
  }

  setByteOffset(byteOffset: number): void {
    this.#byteOffset = byteOffset;
  }
}
