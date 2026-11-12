import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { limited } from '@/lib/ratelimit';

// بوابة دفع تجريبية: لا تتصل بأي بنك ولا تخصم أي مبلغ.
const admin = () => {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL, k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return u && k ? createClient(u, k, { auth: { persistSession: false } }) : null;
};
const err = (error, status) => NextResponse.json({ error }, { status });

// يتأكد أن صاحب الطلب هو من يدفع (إن كان الطلب مرتبطًا بحساب)
async function owns(db, req, id) {
  const { data: o } = await db.from('orders').select('id,user_id,order_no,total,status,payments(method,status)').eq('id', id).single();
  if (!o) return { error: err('الطلب غير موجود', 404) };
  if (o.user_id) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const { data: u } = token ? await db.auth.getUser(token) : { data: {} };
    if (u?.user?.id !== o.user_id) return { error: err('غير مصرح', 403) };
  }
  return { o };
}

export async function GET(req) {
  const id = new URL(req.url).searchParams.get('id');
  const db = admin();
  if (!db || id === 'demo') return NextResponse.json({ order_no: 'DEMO', total: 0, method: 'paymob', status: 'pending', demo: true });
  const { o, error } = await owns(db, req, id);
  if (error) return error;
  const p = o.payments?.[0] || {};
  return NextResponse.json({ order_no: o.order_no, total: o.total, method: p.method, status: p.status, order_status: o.status });
}

export async function POST(req) {
  if (limited(req, 'pay', 10)) return err('محاولات كثيرة، حاول بعد قليل', 429);
  const { id } = await req.json().catch(() => ({}));
  const ref = 'MOCK-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const db = admin();
  if (!db || id === 'demo') return NextResponse.json({ ok: true, ref });
  const { o, error } = await owns(db, req, id);
  if (error) return error;
  if (o.status !== 'pending') return err('لا يمكن دفع هذا الطلب', 409);
  const { data } = await db.from('payments').update({ status: 'paid', ref_no: ref, paid_at: new Date().toISOString(), gateway_payload: { mock: true } })
    .eq('order_id', id).eq('status', 'pending').select('id');
  if (!data?.length) return err('الطلب مدفوع بالفعل أو منتهي', 409);
  await db.from('orders').update({ status: 'confirmed' }).eq('id', id).eq('status', 'pending');
  await db.from('audit_logs').insert({ action: 'payment.mock_paid', entity: 'payments', entity_id: id, meta: { ref } });
  return NextResponse.json({ ok: true, ref });
}
