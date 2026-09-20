# TIARA backend

Modular monolith: one Express app, one MongoDB database, one deploy — domain logic split into
self-contained modules under `src/modules/*` (auth, products, cart, orders, contact, preorders,
site-content).

## Setup

```bash
cp .env.example .env   # edit MONGODB_URI / JWT_SECRET / AWS_* if needed
npm install
npm run seed            # upserts demo products
npm run migrate-images  # uploads product + site imagery to S3, rewrites DB image URLs
npm run dev
```

Requires a MongoDB instance reachable at `MONGODB_URI`. Currently pointed at a MongoDB Atlas
cluster (`mongodb+srv://...`) — set in `.env`, not committed. Falls back to local
`mongodb://localhost:27017/tiara` if `MONGODB_URI` is unset. `scripts/smoke.js` always targets a
local `<db>_smoke` database regardless of `MONGODB_URI`, so it never touches Atlas.

## Images (S3)

All images (product photos, home hero, collection tiles, promo banners, look book gallery) are
stored in the `AWS_S3_BUCKET` bucket and served as plain public URLs — nothing is hardcoded in the
frontend. `src/config/s3.js` wraps `PutObjectCommand` (`uploadImage(key, buffer, contentType)`);
`scripts/migrate-images-to-s3.js` is the one-off migration that uploaded the original placeholder
set and rewrote every `Product.images` / `SiteContent` field to point at S3 — safe to re-run, it
skips URLs already on `amazonaws.com`. The bucket already has a public-read policy attached (the
app's IAM user only has `PutObject`/`GetObject`, no ACL or delete permissions, so uploads rely on
that bucket policy rather than per-object ACLs). Home/Look Book imagery is served from the new
`GET /api/site-content` endpoint instead of being hardcoded in the frontend.

## Self-check

```bash
npm run smoke
```

Boots the app against a disposable `_smoke` database and exercises register → cart → checkout →
contact → preorder, then drops the database. No test framework — see the plan's scope notes.

## API

All routes are under `/api`. See `src/modules/*/*.routes.js` for the full surface:
auth (register/login/logout/me), products (list/detail), cart (get/add/update/remove),
orders (checkout/detail), contact, preorders, site-content (get).
