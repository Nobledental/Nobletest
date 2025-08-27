import { glob } from 'glob';
import hasha from 'hasha';
import fs from 'fs-extra';
import path from 'node:path';

const patterns = ['public/images/*.{avif,webp,jpg,png}', 'public/fonts/*.woff2', 'public/videos/*.{mp4,webm}'];
const manifest = {};

for (const pat of patterns) {
  const files = await glob(pat);
  for (const f of files) {
    const buf = await fs.readFile(f);
    const hash = (await hasha.async(buf, { algorithm: 'md5' })).slice(0, 8);
    const ext = path.extname(f);
    const dir = path.dirname(f);
    const base = path.basename(f, ext);
    const rev = path.join(dir, `${base}.${hash}${ext}`).replace(/^public/, '');
    await fs.copy(f, `public${rev}`);
    manifest[`/${path.relative('public', f).replaceAll('\\','/')}`] = rev;
  }
}
await fs.writeJson('public/rev-manifest.json', manifest, { spaces: 2 });
console.log('✅ revisioned assets -> public/, manifest at public/rev-manifest.json');
