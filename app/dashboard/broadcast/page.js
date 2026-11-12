'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';

const AUD = [['all', 'كل المستخدمين'], ['customer', 'العملاء'], ['company', 'الشركات'], ['support', 'الدعم'], ['courier', 'شركة الشحن']];

export default function Broadcast() {
  const { profile } = useAuth();
  const [msg, setMsg] = useState('');
  if (profile?.role !== 'admin') return <p className="muted">للأدمن فقط.</p>;
  async function send(e) {
    e.preventDefault();
    const f = e.currentTarget, d = Object.fromEntries(new FormData(f));
    if (!window.confirm('إرسال الإشعار الآن؟')) return;
    const { data, error } = await sb.rpc('broadcast_notification', { audience: d.audience, t: d.title, b: d.body });
    if (error) return setMsg(error.message);
    setMsg(`تم إرسال الإشعار إلى ${data} مستخدم`); f.reset();
  }
  return (
    <>
      <h1 className="h1">إشعارات وعروض</h1>
      <p className="muted">أرسل عرضًا أو تنبيهًا لفئة من المستخدمين. يظهر داخل الموقع، ويصل بالبريد لو فعّلت الإيميل.</p>
      <form className="panel" onSubmit={send} style={{ maxWidth: 520 }}>
        <label>الفئة<select name="audience">{AUD.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label>العنوان<input name="title" required maxLength={80} /></label>
        <label>النص<textarea name="body" rows={3} required maxLength={300} /></label>
        <button className="btn" style={{ width: 'fit-content' }}>إرسال</button>
        {msg && <p role="status">{msg}</p>}
      </form>
    </>
  );
}
