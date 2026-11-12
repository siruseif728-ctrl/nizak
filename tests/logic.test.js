import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { eff, egp } from '../lib/pricing.js';
import { calcCoupon } from '../lib/coupon.js';
import { limited } from '../lib/ratelimit.js';
import { NAV, CFG, TITLES, HOME, fmt } from '../lib/dash.js';

const fakeDb = (row) => ({ from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: row }) }) });

test('eff: السعر بعد الخصم', () => {
  assert.equal(eff({ price: 1000, discount_pct: 10 }), 900);
  assert.equal(eff({ price: 1000 }), 1000);
  assert.equal(eff({ price: '2450', discount_pct: 10 }), 2205);
});
test('egp: يضيف العملة', () => assert.match(egp(60), /ج\.م$/));

test('coupon: نسبة وثابت ومنتهي ومستهلك وحد أدنى', async () => {
  const base = { id: 'c1', code: 'X', type: 'percent', value: 10, min_order: 0, max_uses: null, used_count: 0, expires_at: null };
  assert.equal((await calcCoupon(fakeDb(base), 'x', 1000)).discount, 100);
  assert.equal((await calcCoupon(fakeDb({ ...base, type: 'fixed', value: 5000 }), 'x', 1000)).discount, 1000);
  assert.ok((await calcCoupon(fakeDb(null), 'x', 1000)).error);
  assert.ok((await calcCoupon(fakeDb({ ...base, expires_at: '2020-01-01' }), 'x', 1000)).error);
  assert.ok((await calcCoupon(fakeDb({ ...base, max_uses: 3, used_count: 3 }), 'x', 1000)).error);
  assert.ok((await calcCoupon(fakeDb({ ...base, min_order: 5000 }), 'x', 1000)).error);
  assert.equal((await calcCoupon(fakeDb(null), '', 1000)).discount, 0);
});

test('ratelimit: يمنع بعد الحد', () => {
  const req = { headers: new Headers({ 'x-forwarded-for': '9.9.9.9' }) };
  assert.equal(limited(req, 't', 2), false);
  assert.equal(limited(req, 't', 2), false);
  assert.equal(limited(req, 't', 2), true);
});

test('dash: كل صفحة في القوائم لها شاشة', () => {
  const custom = ['notifications', 'settings', 'reports', 'wallet', 'favorites', 'permissions', 'broadcast'];
  for (const [role, keys] of Object.entries(NAV)) {
    for (const k of keys) {
      assert.ok(TITLES[k], `عنوان ناقص: ${k}`);
      if (k === 'home') continue;
      if (custom.includes(k)) assert.ok(fs.existsSync(`app/dashboard/${k}/page.js`), `صفحة ناقصة: ${k} (${role})`);
      else assert.ok(CFG[k], `إعداد ناقص: ${k} (${role})`);
    }
    assert.ok(HOME[role], `إحصاءات الرئيسية ناقصة: ${role}`);
  }
});

test('dash: إعدادات الجداول سليمة', () => {
  const roles = ['customer', 'company', 'admin', 'support', 'courier'];
  for (const [k, c] of Object.entries(CFG)) {
    assert.ok(c.table && c.t && Array.isArray(c.cols), k);
    for (const e of c.edit || []) assert.ok(e[2].every((r) => roles.includes(r)), `دور غير معروف في ${k}`);
    for (const r of c.create?.roles || []) assert.ok(roles.includes(r), k);
  }
  assert.equal(fmt('delivered', 'l'), 'تم التسليم');
  assert.equal(fmt(null, 'l'), '—');
});
