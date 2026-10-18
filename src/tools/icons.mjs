// The desk's Home Screen icons (spec S-001, AC75): src/public/icons/desk-180.png, desk-192.png and
// desk-512.png, drawn here with Node's standard library only, so they can be made again exactly:
//
//   node src/tools/icons.mjs          write the three files
//   node src/tools/icons.mjs --check  exit 1 if a committed file differs from what this draws
//
// The mark: the desk's "needs you" diamond (AC66), white on its coral, on a full square (iOS rounds
// the corners itself). No text, so it reads at every size.

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

export const SIZES = [180, 192, 512];
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const BG = [0xd2, 0x3c, 0x0f];
const FG = [0xff, 0xff, 0xff];

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** One icon as PNG bytes: an RGB image, the diamond's edge smoothed over one pixel. */
export function drawIcon(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const c = (size - 1) / 2;
  const r = size * 0.3;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const d = Math.abs(x - c) + Math.abs(y - c); // the diamond: |x| + |y| ≤ r
      const a = Math.max(0, Math.min(1, r - d + 0.5));
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(BG[i] * (1 - a) + FG[i] * a);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  let bad = 0;
  if (!check) mkdirSync(OUT, { recursive: true });
  for (const s of SIZES) {
    const file = join(OUT, `desk-${s}.png`);
    const png = drawIcon(s);
    if (check) {
      let cur = null;
      try {
        cur = readFileSync(file);
      } catch {
        cur = null;
      }
      if (!cur || !cur.equals(png)) {
        console.error(`icons: ${file} differs from what src/tools/icons.mjs draws`);
        bad++;
      }
    } else writeFileSync(file, png);
  }
  if (bad) process.exit(1);
  console.log(check ? 'icons: in step' : `icons: wrote ${SIZES.length} files`);
}
