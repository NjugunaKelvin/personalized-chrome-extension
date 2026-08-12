/**
 * Node.js script to generate 16x16, 48x48, 128x128 PNG extension icons
 * using standard Node.js zlib module (zero external npm dependencies required).
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table calculator
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'binary');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function generateMinimalPng(size) {
  // Create RGBA scanlines
  // Raw scanline format: 1 byte filter type (0) + width * 4 bytes RGBA
  const scanlineLength = 1 + size * 4;
  const rawData = Buffer.alloc(scanlineLength * size);

  // Colors: Warm dark background #171717, Off-white V signature #F7F6F2
  const bgR = 0x17, bgG = 0x17, bgB = 0x17, bgA = 0xFF;
  const fgR = 0xF7, fgG = 0xF6, fgB = 0xF2, fgA = 0xFF;

  const center = size / 2;
  const radius = size * 0.42;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Squircle / rounded box test
      const dx = Math.abs(x + 0.5 - center);
      const dy = Math.abs(y + 0.5 - center);
      const dist = Math.pow(dx / radius, 4) + Math.pow(dy / radius, 4);

      let r = bgR, g = bgG, b = bgB, a = bgA;

      if (dist > 1.0) {
        // Transparent outside rounded box
        a = 0x00;
      } else {
        // Draw crisp minimalist 'V' monogram in center
        const relX = (x + 0.5 - center) / size;
        const relY = (y + 0.5 - center) / size;

        // V left stroke & right stroke equation
        const leftArm = Math.abs((relY * 1.5) - (relX * 1.5 + 0.2)) < 0.08 && relY > -0.22 && relY < 0.22;
        const rightArm = Math.abs((relY * 1.5) - (-relX * 1.5 + 0.2)) < 0.08 && relY > -0.22 && relY < 0.22;

        if (leftArm || rightArm) {
          r = fgR; g = fgG; b = fgB; a = fgA;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress IDAT scanline data using zlib
  const idatData = zlib.deflateSync(rawData);

  // Build PNG signature + chunks
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk: Width(4), Height(4), Depth(1=8), ColorType(1=6 RGBA), Compression(1=0), Filter(1=0), Interlace(1=0)
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(size, 0);
  ihdrBuf.writeUInt32BE(size, 4);
  ihdrBuf[8] = 8;  // 8-bit depth
  ihdrBuf[9] = 6;  // RGBA color type
  ihdrBuf[10] = 0; // compression
  ihdrBuf[11] = 0; // filter
  ihdrBuf[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrBuf);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon set
const iconsDir = __dirname;
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const iconBuffer = generateMinimalPng(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, iconBuffer);
  console.log(`Generated ${filePath} (${size}x${size} PNG)`);
});
