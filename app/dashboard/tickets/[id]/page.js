'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { L } from '@/lib/dash';

export default function Ticket() {
  const { id } = useParams();
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const { data: tk } = await sb.from('tickets').select('*').eq('id', id).single();
    setT(tk || false);
    const { data } = await sb.from('ticket_messages').select('*, profiles(full_name,role)').eq('ticket_id', id).order('created_at');
    setMsgs(data || []);
  }, [id]);
  useEffect(() => { if (user) { load(); const i = setInterval(load, 10000); return () => clearInterval(i); } }, [user, load]);
  async function send(e) {
    e.preventDefault();
    const f = e.currentTarget, body = new FormData(f).get('body').trim();
    if (!body) return;
    const { error } = await sb.from('ticket_messages').insert({ ticket_id: id, author_id: user.id, body });
    if (error) setErr(error.message); else { setErr(''); f.reset(); load(); }
  }
  async function answer(status) {
    const { error } = await sb.from('tickets').update({ status }).eq('id', id);
    if (error) setErr(error.message); else load();
  }
  if (t === null) return <p className="muted">جارٍ التحميل</p>;
  if (!t) return <p className="err">التذكرة غير موجودة.</p>;
  return (
    <>
      <h1 className="h1">{t.subject}</h1>
      <span className="pill">{L[t.status]}</span> <span className="pill">{L[t.department]}</span>
      <div className="chat">{msgs.map((m) => (
        <div key={m.id} className={m.author_id === user.id ? 'msg me' : 'msg'}><small>{m.profiles?.full_name || L[m.profiles?.role] || 'مستخدم'} · {new Date(m.created_at).toLocaleString('ar-EG')}</small>{m.body}</div>
      ))}{!msgs.length && <p className="muted">لا توجد رسائل بعد.</p>}</div>
      {t.status === 'resolved' && t.user_id === user.id && (
        <div className="panel"><h3>هل تم حل المشكلة؟</h3><div className="btnrow"><button className="btn sm" onClick={() => answer('closed')}>نعم، تم الحل</button><button className="btn sm ghost" onClick={() => answer('open')}>لا، لسه محتاج مساعدة</button></div></div>
      )}
      {t.status !== 'closed' ? (
        <form onSubmit={send} className="panel"><textarea name="body" rows={3} required placeholder="اكتب رسالتك" style={{ font: 'inherit', padding: 10, border: '1px solid var(--line)', borderRadius: 8 }} />
          {err && <p className="err" role="alert">{err}</p>}<button className="btn" style={{ width: 'fit-content' }}>إرسال</button></form>
      ) : <p className="muted">التذكرة مغلقة.</p>}
    </>
  );
}
