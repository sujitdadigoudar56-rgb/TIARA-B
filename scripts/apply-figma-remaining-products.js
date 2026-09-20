// Finishes what apply-figma-design.js started: the last 7 products that still had
// non-Figma (picsum-derived) images, matched by name against the Shop page section of the
// Figma file. After this, every seeded product has a real Figma-sourced photo.
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Product = require('../src/modules/products/product.model');

const S3 = 'https://amzn-tiara.s3.ap-south-1.amazonaws.com/figma-design/shop';

const productImages = {
  'dirty-martini-baby-tee': [`${S3}/dirty-martini-baby-tee.png`],
  'no-strings-attached-top': [`${S3}/no-strings-attached-top.png`],
  'second-skin-corset-top': [`${S3}/second-skin-corset-top.jpg`],
  'sugar-plum-shirt': [`${S3}/sugar-plum-shirt.png`],
  'yellow-sailor-coat': [`${S3}/sailor-coat-blue.png`],
  'almost-pjs-boxer-shorts': [`${S3}/boxer-shorts.png`],
  'red-floral-tie-back-corset-top': [`${S3}/red-floral-tie-back-corset-top.jpg`],
};

async function run() {
  await mongoose.connect(env.mongodbUri);
  for (const [slug, images] of Object.entries(productImages)) {
    const res = await Product.updateOne({ slug }, { $set: { images } });
    console.log(`[apply-figma-remaining] ${slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[apply-figma-remaining] failed:', err);
  process.exit(1);
});
