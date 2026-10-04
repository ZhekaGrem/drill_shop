// Keep the owner's artwork intact; normalize only orientation, size and encoding.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/scarf/prepare-textures.cjs <source-directory>');
const out = path.resolve(__dirname, '../../public/3d/textures/scarf-oksana');
(async () => {
  const files = fs
    .readdirSync(source)
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();
  if (files.length !== 8) throw new Error('Expected eight scarf designs');
  fs.mkdirSync(out, { recursive: true });
  const thumbs = [];
  for (const [index, file] of files.entries()) {
    const input = path.join(source, file);
    const name = `print-${String(index + 1).padStart(2, '0')}.webp`;
    const meta = await sharp(input).metadata();
    await sharp(input)
      .rotate()
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(path.join(out, name));
    thumbs.push({
      input: await sharp(input).rotate().resize(300, 300, { fit: 'contain' }).png().toBuffer(),
      left: (index % 4) * 300,
      top: Math.floor(index / 4) * 300,
    });
    console.log(`${file}: ${meta.width}x${meta.height} -> ${name}`);
  }
  await sharp({ create: { width: 1200, height: 600, channels: 3, background: '#fff' } })
    .composite(thumbs)
    .png()
    .toFile('/private/tmp/drill-scarf-contact.png');
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
