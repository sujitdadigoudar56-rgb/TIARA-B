// One-off: downloads Figma asset export URLs (from get_design_context, ~7-day expiry) and
// re-uploads them to S3 under stable keys, printing the resulting mapping as JSON.
// Usage: node scripts/migrate-figma-images.js manifest.json
// manifest.json: { "<s3-key-without-ext>": "<figma-asset-url>", ... }
require('dotenv').config();
const { uploadImage } = require('../src/config/s3');

async function run() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('Usage: node scripts/migrate-figma-images.js manifest.json');
    process.exit(1);
  }
  const manifest = require(require('path').resolve(manifestPath));
  const result = {};

  for (const [key, url] of Object.entries(manifest)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[migrate-figma] FAILED ${key}: ${res.status} ${url}`);
      continue;
    }
    const contentType = res.headers.get('content-type') || 'image/png';
    const ext = contentType.includes('svg') ? 'svg' : contentType.includes('jpeg') ? 'jpg' : 'png';
    const buffer = Buffer.from(await res.arrayBuffer());
    const s3Url = await uploadImage(`figma-design/${key}.${ext}`, buffer, contentType);
    result[key] = s3Url;
    console.error(`[migrate-figma] ${key} -> ${s3Url}`);
  }

  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error('[migrate-figma] failed:', err);
  process.exit(1);
});
