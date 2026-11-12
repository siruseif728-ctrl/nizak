import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calcCoupon } from '@/lib/coupon';
import { limited } from '@/lib/ratelimit';

const METHODS = ['cod', 'paymob', 'meeza', 'fawry', 'vodafone_cash'];
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req) {
  if (limited(req, 'checkout', 10)) return bad('محاولات كثيرة، حاول بعد قليل', 429);
  const b = await req.json().catch(() => ({}));
  const method = METHODS.includes(b.method) ? b.method : 'cod';
  const items = Array.isArray(b.items) ? b.items.filter((i) => i?.id && +i.qty > 0).slice(0, 30) : [];
  if (!items.length) return bad('السلة فاضية');
  if (!b.name?.trim() || !/^01\d{9}$/.test(b.phone || '') || !b.address?.trim()) return bad('تأكد من الاسم ورقم موبايل مصري صحيح والعنوان');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, demo: true, order_id: 'demo', order_no: 'DEMO-' + Date.now().toString().slice(-6) });

  const db = createClient(url, key, { auth: { persistSession: false } });
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const { data: u } = token ? await db.auth.getUser(token) : { data: {} };
  const uid = u?.user?.id ?? null;
  if (uid) {
    const { data: pr } = await db.from('profiles').select('status').eq('id', uid).single();
    if (pr?.status === 'suspended') return bad('الحساب موقوف', 403);
  }
  const { data: st } = await db.from('platform_settings').select('key,value');
  const cfg = Object.fromEntries((st || []).map((x) => [x.key, Number(x.value)]));

  const { data: prods } = await db.from('products').select('id,price,discount_pct,stock,company_id,name').in('id', items.map((i) => i.id)).eq('is_active', true);
  const lines = [];
  for (const i of items) {
    const p = prods?.find((x) => x.id === i.id);
    const qty = Math.floor(+i.qty);
    if (!p) return bad('أحد المنتجات لم يعد متاحًا');
    if (qty > p.stock) return bad(`الكمية المتاحة من ${p.name} هي ${p.stock}`);
    lines.push({ p, qty, unit: Math.round(p.price * (100 - p.discount_pct)) / 100 });
  }
  if (method !== 'cod' && cfg.online_payments === 0) return bad('الدفع الإلكتروني غير متاح حاليًا، اختر الدفع عند الاستلام');
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const cp = await calcCoupon(db, b.coupon, subtotal);
  if (cp.error) return bad(cp.error);
  const shipping = cfg.free_shipping_over > 0 && subtotal >= cfg.free_shipping_over ? 0 : (cfg.shipping_fee ?? 60);
  const total = subtotal - cp.discount + shipping;

  const { data: o, error } = await db.from('orders').insert({
    user_id: uid, guest_name: b.name.trim(), guest_phone: b.phone, ship_address: b.address.trim(),
    subtotal, discount: cp.discount, coupon_code: cp.code ?? null, shipping_fee: shipping, total, notes: b.notes?.trim() || null,
  }).select('id,order_no').single();
  if (error) return bad('تعذر إنشاء الطلب', 500);

  await db.from('order_items').insert(lines.map((l) => ({ order_id: o.id, product_id: l.p.id, company_id: l.p.company_id, quantity: l.qty, unit_price: l.unit })));
  await db.from('payments').insert({ order_id: o.id, method, amount: total });
  await db.from('shipments').insert({ order_id: o.id, ship_name: b.name.trim(), ship_phone: b.phone, ship_address: b.address.trim() });
  for (const l of lines) await db.from('products').update({ stock: l.p.stock - l.qty }).eq('id', l.p.id);
  if (cp.id) await db.from('coupons').update({ used_count: cp.used + 1 }).eq('id', cp.id);
  return NextResponse.json({ ok: true, order_id: o.id, order_no: String(o.order_no) });
}
