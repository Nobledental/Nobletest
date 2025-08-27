import fs from 'fs-extra';
import { glob } from 'glob';

const manifest = await fs.readJson('public/rev-manifest.json');

// replace raw paths with hashed ones
function replaceAll(content) {
  for (const [orig, rev] of Object.entries(manifest)) {
    // safe replacement in HTML/CSS/JS
    const re = new RegExp(orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(re, rev);
  }
  return content;
}

const files = await glob(['public/**/*.html', 'public/**/*.css', 'public/**/*.js', '!public/**/rev-manifest.json']);
for (const file of files) {
  let content = await fs.readFile(file, 'utf8');
  const updated = replaceAll(content);
  if (updated !== content) {
    await fs.writeFile(file, updated);
    console.log('✍️  updated', file);
  }
}
console.log('✅ references updated using rev-manifest.json');
