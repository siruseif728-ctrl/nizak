import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail } from '@/lib/mail';

// Supabase Database Webhook (INSERT على جدول notifications) يستدعي هذا المسار
export async function POST(req) {
  if (!process.env.WEBHOOK_SECRET || req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { record } = await req.json().catch(() => ({}));
  if (!record?.user_id) return NextResponse.json({ ok: false });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: p } = await db.from('profiles').select('email,phone').eq('id', record.user_id).single();
  const sent = await sendMail(p?.email, record.title, record.body);
  // SMS اختياري (Twilio) لأهم التنبيهات فقط
  const sid = process.env.TWILIO_SID, tok = process.env.TWILIO_TOKEN, from = process.env.TWILIO_FROM;
  const important = record.title === 'رقم تتبع شحنتك' || record.body === 'خرج للتسليم';
  let sms = false;
  if (sid && tok && from && important && /^01\d{9}$/.test(p?.phone || '')) {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${tok}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: '+2' + p.phone, From: from, Body: `Router.net: ${record.title} ${record.body || ''}` }),
    });
    sms = r.ok;
  }
  return NextResponse.json({ ok: sent, sms });
}
