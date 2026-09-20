// One-off: wires the S3 URLs uploaded by migrate-figma-images.js into SiteContent (hero,
// collection-highlight slides, promo banners, look book gallery) and matching Product records,
// so the site renders the actual Figma design's imagery instead of picsum placeholders.
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const SiteContent = require('../src/modules/site-content/site-content.model');
const Product = require('../src/modules/products/product.model');

const S3 = 'https://amzn-tiara.s3.ap-south-1.amazonaws.com/figma-design';

async function run() {
  await mongoose.connect(env.mongodbUri);

  await SiteContent.findByIdAndUpdate(
    'site',
    {
      hero: { image: `${S3}/home/hero.jpg` },
      collections: [
        { category: 'tops', title: 'Golden Hour Top', subtitle: 'Click to Shop Now', image: `${S3}/home/collection-1-golden-hour-top.png` },
        { category: 'tops', title: 'Cherry Hearts Baby Tee', subtitle: 'Click to Shop Now', image: `${S3}/home/collection-2-cherry-hearts.png` },
        { category: 'dresses', title: 'Latte Draped Dress – Blue', subtitle: 'Click to Shop Now', image: `${S3}/home/collection-3-latte-draped-dress.png` },
      ],
      banners: [
        { label: 'SHOP MEN', href: '/shop', image: `${S3}/home/banner-shop-men.png` },
        { label: 'SHOP WOMEN', href: '/shop', image: `${S3}/home/banner-shop-women.png` },
      ],
      // ratio encodes the collage block pattern: "big"+"half"+"half" form one 3-col/2-row
      // block (big spans 2 cols x 2 rows, the two halves stack in the 3rd column); "full"
      // is a standalone full-width image. See app/look-book/page.tsx for the grouping.
      lookbook: [
        { image: `${S3}/lookbook/1-big.png`, ratio: 'big' },
        { image: `${S3}/lookbook/1-top.png`, ratio: 'half' },
        { image: `${S3}/lookbook/1-bottom.png`, ratio: 'half' },
        { image: `${S3}/lookbook/2-big.png`, ratio: 'big' },
        { image: `${S3}/lookbook/2-top.png`, ratio: 'half' },
        { image: `${S3}/lookbook/2-bottom.png`, ratio: 'half' },
        { image: `${S3}/lookbook/3-full.jpg`, ratio: 'full' },
        { image: `${S3}/lookbook/4-full.jpg`, ratio: 'full' },
        { image: `${S3}/lookbook/5-big.png`, ratio: 'big' },
        { image: `${S3}/lookbook/5-top.png`, ratio: 'half' },
        { image: `${S3}/lookbook/5-bottom.png`, ratio: 'half' },
        { image: `${S3}/lookbook/6-big.png`, ratio: 'big' },
        { image: `${S3}/lookbook/6-tall.png`, ratio: 'tall' },
        { image: `${S3}/lookbook/7-big.png`, ratio: 'big' },
        { image: `${S3}/lookbook/7-top.png`, ratio: 'half' },
        { image: `${S3}/lookbook/7-bottom.png`, ratio: 'half' },
      ],
    },
    { upsert: true }
  );
  console.log('[apply-figma] SiteContent updated');

  const productImages = {
    'tunic-co-ord-set': [`${S3}/pdp/tunic-1-main.png`, `${S3}/pdp/tunic-2.png`, `${S3}/pdp/tunic-3.png`, `${S3}/pdp/tunic-4.png`],
    'striped-baggy-pants': [`${S3}/bestseller/striped-baggy-pants.png`],
    'brown-striped-shirt': [`${S3}/bestseller/brown-striped-shirt.png`],
    'classic-sailor-coat': [`${S3}/bestseller/classic-sailor-coat.png`],
    'rfid-embroidered-jacket': [`${S3}/bestseller/rfid-embroidered-jacket.png`],
    'azalea-flower-shirt': [`${S3}/bestseller/azalea-flower-shirt.png`],
    'sophia-set': [`${S3}/bestseller/sophia-set.png`],
    'golden-hour-top': [`${S3}/home/collection-1-golden-hour-top.png`],
    'cherry-hearts-rhinestone-baby-tee': [`${S3}/home/collection-2-cherry-hearts.png`],
    'latte-draped-dress': [`${S3}/home/collection-3-latte-draped-dress.png`],
  };
  for (const [slug, images] of Object.entries(productImages)) {
    const res = await Product.updateOne({ slug }, { $set: { images } });
    console.log(`[apply-figma] ${slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  // Two Figma best-seller products not yet in the catalog.
  const newProducts = [
    {
      title: 'Buttercup Shirt',
      slug: 'buttercup-shirt',
      price: 2200,
      category: 'tops',
      sizes: ['XS', 'S', 'M', 'L'],
      isBestSeller: true,
      images: [`${S3}/bestseller/buttercup-shirt.png`],
      description: 'Introducing a wardrobe staple from the TIARA collection, designed for an effortless, tailored silhouette. Made to move with you, day to night.',
    },
    {
      title: 'Pinstripe Dress Jacket',
      slug: 'pinstripe-dress-jacket',
      price: 4250,
      category: 'outerwear',
      sizes: ['XS', 'S', 'M', 'L'],
      isBestSeller: true,
      images: [`${S3}/bestseller/pinstripe-dress-jacket.png`],
      description: 'Introducing a wardrobe staple from the TIARA collection, designed for an effortless, tailored silhouette. Made to move with you, day to night.',
    },
  ];
  for (const p of newProducts) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, setDefaultsOnInsert: true });
    console.log(`[apply-figma] upserted ${p.slug}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[apply-figma] failed:', err);
  process.exit(1);
});
