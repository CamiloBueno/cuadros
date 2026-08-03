import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const SOURCE_DIR = path.resolve(__dirname, '../assets');
const OUTPUT_DIR = path.resolve(__dirname, '../public/misiones/ahorcado');

const ASSETS: Array<{ source: string; output: string }> = [
  { source: 'head.jpg', output: 'head.png' },
  { source: 'tshirt.jpg', output: 'torso.png' },
  { source: 'lefthand.jpg', output: 'left-arm.png' },
  { source: 'righthand.jpg', output: 'right-arm.png' },
  { source: 'trousers.jpg', output: 'legs.png' },
  { source: 'leftear.jpg', output: 'left-ear.png' },
  { source: 'rightear.jpg', output: 'right-ear.png' },
];

const OPAQUE_BELOW = 240; // channel value at/below this stays fully opaque
const TRANSPARENT_ABOVE = 246; // channel value at/above this becomes fully transparent

function alphaForChannel(min: number): number {
  if (min <= OPAQUE_BELOW) return 255;
  if (min >= TRANSPARENT_ABOVE) return 0;
  const t = (min - OPAQUE_BELOW) / (TRANSPARENT_ABOVE - OPAQUE_BELOW);
  return Math.round(255 * (1 - t));
}

async function removeWhiteBackground(source: string, output: string) {
  const image = sharp(source).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const min = Math.min(r, g, b);
    data[offset + 3] = alphaForChannel(min);
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(output);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const { source, output } of ASSETS) {
    const sourcePath = path.join(SOURCE_DIR, source);
    const outputPath = path.join(OUTPUT_DIR, output);
    await removeWhiteBackground(sourcePath, outputPath);
    console.log(`Wrote ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
