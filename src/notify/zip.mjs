// A small reader of the one zip the sender reads: its own state artifact (spec S-001, J18). Stored
// and deflated entries only; no ZIP64, no encryption. Every size is bounded before inflating.

import { inflateRawSync } from 'node:zlib';

const EOCD = 0x06054b50;
const CEN = 0x02014b50;
const LOC = 0x04034b50;

/** The entries of a zip: Map(name → Buffer), or null when it is not a zip this reader takes. */
export function readZip(buf, { maxEntry = 256 * 1024, maxEntries = 8 } = {}) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) return null;
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
    if (buf.readUInt32LE(i) === EOCD) {
      e = i;
      break;
    }
  }
  if (e < 0) return null;
  const count = buf.readUInt16LE(e + 10);
  const cdSize = buf.readUInt32LE(e + 12);
  const cdOff = buf.readUInt32LE(e + 16);
  if (count > maxEntries || cdOff + cdSize > e) return null;
  const out = new Map();
  let p = cdOff;
  for (let k = 0; k < count; k++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== CEN) return null;
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const loff = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString('utf8');
    p += 46 + nlen + xlen + clen;
    if ((flags & 1) || csize === 0xffffffff || usize === 0xffffffff || loff === 0xffffffff) return null;
    if (usize > maxEntry || (method !== 0 && method !== 8)) return null;
    if (loff + 30 > buf.length || buf.readUInt32LE(loff) !== LOC) return null;
    const start = loff + 30 + buf.readUInt16LE(loff + 26) + buf.readUInt16LE(loff + 28);
    if (start + csize > buf.length) return null;
    const data = buf.subarray(start, start + csize);
    let body;
    try {
      body = method === 0 ? Buffer.from(data) : inflateRawSync(data, { maxOutputLength: maxEntry });
    } catch {
      return null;
    }
    if (body.length !== usize || out.has(name)) return null;
    out.set(name, body);
  }
  return out;
}
