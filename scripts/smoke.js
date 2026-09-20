// Lightweight self-check for the modular monolith wiring (no test framework).
// Boots the real app against a disposable database, exercises the core flow through
// every module (auth -> products -> cart -> order, plus contact/preorder), asserts
// response shapes, then drops the database. Run with: node scripts/smoke.js
process.env.MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/tiara') + '_smoke';

const assert = require('assert');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const Product = require('../src/modules/products/product.model');

function extractCookie(res, name) {
  const raw = res.headers.getSetCookie?.() || [];
  const match = raw.find((c) => c.startsWith(`${name}=`));
  return match ? match.split(';')[0] : null;
}

// Only reads the body (for the error message) when the status doesn't match, so the
// success path can still call res.json() afterwards without "body already read" errors.
async function expectStatus(res, code, label) {
  if (res.status !== code) {
    const text = await res.text();
    throw new Error(`${label}: expected ${code}, got ${res.status}: ${text}`);
  }
}

async function run() {
  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://localhost:${port}/api`;
  const email = `smoke${Date.now()}@tiara.test`;
  let cookies = '';

  const product = await Product.create({
    title: 'Smoke Test Top',
    slug: `smoke-test-top-${Date.now()}`,
    price: 999,
    category: 'tops',
    sizes: ['M'],
  });

  const health = await fetch(`${base}/health`);
  assert.strictEqual(health.status, 200);

  const register = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Test', email, password: 'password123' }),
  });
  await expectStatus(register, 201, 'register');
  cookies = extractCookie(register, 'tiara_token');
  assert.ok(cookies, 'expected tiara_token cookie after register');

  const me = await fetch(`${base}/auth/me`, { headers: { Cookie: cookies } });
  assert.strictEqual(me.status, 200);
  const meBody = await me.json();
  assert.strictEqual(meBody.user.email, email);

  const products = await fetch(`${base}/products`);
  assert.strictEqual(products.status, 200);
  const productsBody = await products.json();
  assert.ok(Array.isArray(productsBody.items));

  const addToCart = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({ productId: product._id.toString(), size: 'M', quantity: 2 }),
  });
  await expectStatus(addToCart, 201, 'add to cart');
  const cartBody = await addToCart.json();
  assert.strictEqual(cartBody.items.length, 1);
  assert.strictEqual(cartBody.items[0].quantity, 2);

  const order = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      shipping: { name: 'Smoke Test', phone: '9999999999', address: '1 Test St', city: 'Testville', state: 'TS', pincode: '000000' },
    }),
  });
  await expectStatus(order, 201, 'checkout');
  const orderBody = await order.json();
  assert.strictEqual(orderBody.total, 999 * 2);

  const contact = await fetch(`${base}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', comment: 'hello' }),
  });
  assert.strictEqual(contact.status, 201);

  const preorder = await fetch(`${base}/preorders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Smoke Test', email: 'test@example.com', phone: '9999999999' }),
  });
  assert.strictEqual(preorder.status, 201);

  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log('[smoke] all checks passed');
}

run().catch(async (err) => {
  console.error('[smoke] FAILED:', err);
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
