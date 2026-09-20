// Idempotent product seed. Inserts picsum.photos placeholder image URLs — run
// `npm run migrate-images` afterward to upload them to S3 and rewrite these to real S3 URLs
// (or swap this file for real TIARA product photography before going live).
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Product = require('../src/modules/products/product.model');

function img(slug, n) {
  return `https://picsum.photos/seed/tiara-${slug}-${n}/800/1000`;
}

const products = [
  { title: 'Tunic Co-ord Set', slug: 'tunic-co-ord-set', price: 2270, compareAtPrice: 3780, category: 'co-ord-sets', sizes: ['XS-S', 'S-M', 'L-XL'], isBestSeller: true },
  { title: 'Azalea Flower Shirt', slug: 'azalea-flower-shirt', price: 1770, category: 'tops', sizes: ['XS', 'S', 'M', 'L'], isBestSeller: true },
  { title: 'Yellow Sailor Coat', slug: 'yellow-sailor-coat', price: 2270, category: 'outerwear', sizes: ['XS-S', 'S-M', 'L-XL'], isBestSeller: true },
  { title: 'Classic Sailor Coat', slug: 'classic-sailor-coat', price: 1790, category: 'outerwear', sizes: ['XS-S', 'S-M', 'L-XL'], isBestSeller: true },
  { title: 'RFID Embroidered Jacket', slug: 'rfid-embroidered-jacket', price: 4750, category: 'outerwear', sizes: ['S', 'M', 'L'] },
  { title: 'Sugar Plum Shirt', slug: 'sugar-plum-shirt', price: 1780, category: 'tops', sizes: ['X-Small', 'Small', 'Medium'] },
  { title: 'Cherry Hearts Rhinestone Baby Tee', slug: 'cherry-hearts-rhinestone-baby-tee', price: 1350, category: 'tops', sizes: ['X-Small', 'Small', 'Medium'], isBestSeller: true },
  { title: 'Golden Hour Top', slug: 'golden-hour-top', price: 2499, category: 'tops', sizes: ['XS', 'S', 'M'] },
  { title: 'Latte Draped Dress', slug: 'latte-draped-dress', price: 3200, category: 'dresses', sizes: ['XS-S', 'S-M', 'L-XL'] },
  { title: 'Red Floral Tie Back Corset Top', slug: 'red-floral-tie-back-corset-top', price: 1500, compareAtPrice: 2500, category: 'tops', sizes: ['XS', 'S', 'M'] },
  { title: 'No Strings Attached Top', slug: 'no-strings-attached-top', price: 1320, compareAtPrice: 3200, category: 'tops', sizes: ['S', 'M', 'L'] },
  { title: 'Almost Pjs Boxer Shorts', slug: 'almost-pjs-boxer-shorts', price: 1325, compareAtPrice: 1890, category: 'bottoms', sizes: ['S', 'M', 'L'] },
  { title: 'Striped Baggy Pants', slug: 'striped-baggy-pants', price: 1690, category: 'bottoms', sizes: ['S', 'M', 'L', 'XL'], isBestSeller: true },
  { title: 'Brown Striped Shirt', slug: 'brown-striped-shirt', price: 1650, category: 'tops', sizes: ['XS', 'S', 'M', 'L'], isBestSeller: true },
  { title: 'Sophia Set', slug: 'sophia-set', price: 3520, category: 'co-ord-sets', sizes: ['XS-S', 'S-M', 'L-XL'], isBestSeller: true },
].map((p) => ({
  ...p,
  description:
    'Introducing a wardrobe staple from the TIARA collection, designed for an effortless, tailored silhouette. Made to move with you, day to night.',
  images: [img(p.slug, 1), img(p.slug, 2), img(p.slug, 3)],
}));

async function seed() {
  await mongoose.connect(env.mongodbUri);
  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`[seed] upserted ${products.length} products`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
