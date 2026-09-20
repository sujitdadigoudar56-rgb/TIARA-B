// Migrates every image currently referenced by the DB (product photos, plus the home/look-book
// imagery that used to be hardcoded in the frontend) into the amzn-tiara S3 bucket, and rewrites
// the DB records to point at the resulting S3 URLs. Safe to re-run: URLs already on S3 are skipped.
require("dotenv").config();
const mongoose = require("mongoose");
const env = require("../src/config/env");
const Product = require("../src/modules/products/product.model");
const SiteContent = require("../src/modules/site-content/site-content.model");
const { uploadImage } = require("../src/config/s3");

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status} for ${url}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType };
}

function extFor(contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

async function migrateProducts() {
  const products = await Product.find({});
  for (const product of products) {
    const newImages = [];
    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      if (url.includes("amazonaws.com")) {
        newImages.push(url);
        continue;
      }
      const { buffer, contentType } = await fetchBuffer(url);
      const key = `products/${product.slug}/${i + 1}.${extFor(contentType)}`;
      const s3Url = await uploadImage(key, buffer, contentType);
      newImages.push(s3Url);
    }
    product.images = newImages;
    await product.save();
    console.log(`[migrate] ${product.slug}: ${newImages.length} image(s) -> S3`);
  }
}

const SITE_IMAGES = {
  hero: "https://picsum.photos/seed/tiara-hero/1600/900",
  collections: [
    { category: "dresses", title: "Dresses", src: "https://picsum.photos/seed/tiara-collection-dresses/600/750" },
    { category: "tops", title: "Tops", src: "https://picsum.photos/seed/tiara-collection-tops/600/750" },
    { category: "co-ord-sets", title: "Co-ord Sets", src: "https://picsum.photos/seed/tiara-collection-coord/600/750" },
    { category: "outerwear", title: "Outerwear", src: "https://picsum.photos/seed/tiara-collection-outerwear/600/750" },
    { category: "bottoms", title: "Bottoms", src: "https://picsum.photos/seed/tiara-collection-bottoms/600/750" },
  ],
  banners: [
    { label: "SHOP NEW IN", href: "/shop", src: "https://picsum.photos/seed/tiara-banner-newin/700/900" },
    { label: "SHOP BESTSELLERS", href: "/shop?bestseller=true", src: "https://picsum.photos/seed/tiara-banner-bestsellers/700/900" },
  ],
  lookbook: [
    { src: "https://picsum.photos/seed/tiara-lb-1/1400/800", ratio: "wide" },
    { src: "https://picsum.photos/seed/tiara-lb-2/700/900", ratio: "tall" },
    { src: "https://picsum.photos/seed/tiara-lb-3/700/900", ratio: "tall" },
    { src: "https://picsum.photos/seed/tiara-lb-4/1400/800", ratio: "wide" },
    { src: "https://picsum.photos/seed/tiara-lb-5/700/900", ratio: "tall" },
    { src: "https://picsum.photos/seed/tiara-lb-6/700/900", ratio: "tall" },
    { src: "https://picsum.photos/seed/tiara-lb-7/1400/800", ratio: "wide" },
  ],
};

async function migrateSiteContent() {
  const { buffer: heroBuf, contentType: heroCt } = await fetchBuffer(SITE_IMAGES.hero);
  const heroUrl = await uploadImage(`site/hero.${extFor(heroCt)}`, heroBuf, heroCt);

  const collections = [];
  for (const c of SITE_IMAGES.collections) {
    const { buffer, contentType } = await fetchBuffer(c.src);
    const url = await uploadImage(`site/collections/${c.category}.${extFor(contentType)}`, buffer, contentType);
    collections.push({ category: c.category, title: c.title, image: url });
  }

  const banners = [];
  for (const [i, b] of SITE_IMAGES.banners.entries()) {
    const { buffer, contentType } = await fetchBuffer(b.src);
    const url = await uploadImage(`site/banners/${i + 1}.${extFor(contentType)}`, buffer, contentType);
    banners.push({ label: b.label, href: b.href, image: url });
  }

  const lookbook = [];
  for (const [i, l] of SITE_IMAGES.lookbook.entries()) {
    const { buffer, contentType } = await fetchBuffer(l.src);
    const url = await uploadImage(`site/lookbook/${i + 1}.${extFor(contentType)}`, buffer, contentType);
    lookbook.push({ image: url, ratio: l.ratio });
  }

  await SiteContent.findByIdAndUpdate(
    "site",
    { hero: { image: heroUrl }, collections, banners, lookbook },
    { upsert: true, new: true }
  );
  console.log("[migrate] site content (hero/collections/banners/lookbook) -> S3");
}

async function main() {
  if (!env.awsAccessKeyId || !env.awsS3Bucket) throw new Error("AWS_* env vars are not set");
  await mongoose.connect(env.mongodbUri);
  await migrateProducts();
  await migrateSiteContent();
  await mongoose.disconnect();
  console.log("[migrate] done");
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
