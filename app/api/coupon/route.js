import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calcCoupon } from '@/lib/coupon';
import { limited } from '@/lib/ratelimit';

export async function GET(req) {
  if (limited(req, 'coupon', 15)) return NextResponse.json({ error: 'محاولات كثيرة، حاول بعد قليل' }, { status: 429 });
  const sp = new URL(req.url).searchParams;
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL, k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!u || !k) return NextResponse.json({ error: 'الكوبونات غير متاحة في النسخة التجريبية' });
  const r = await calcCoupon(createClient(u, k, { auth: { persistSession: false } }), sp.get('code'), +sp.get('subtotal') || 0);
  return NextResponse.json({ discount: r.discount, error: r.error });
}
