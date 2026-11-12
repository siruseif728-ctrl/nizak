'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase as sb } from '@/lib/supabase';

export default function ResetPassword() {
  const r = useRouter();
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setOk(!!data.session));
    const { data: l } = sb.auth.onAuthStateChange((e) => { if (e === 'PASSWORD_RECOVERY') setOk(true); });
    return () => l.subscription.unsubscribe();
  }, []);
  async function submit(e) {
    e.preventDefault();
    const pw = new FormData(e.currentTarget).get('password');
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) return setMsg(error.message);
    setMsg('تم تغيير كلمة المرور'); setTimeout(() => r.push('/dashboard'), 900);
  }
  return (
    <div className="wrap" style={{ maxWidth: 440 }}>
      <form className="panel" onSubmit={submit}>
        <h1 className="h1">كلمة مرور جديدة</h1>
        {!ok ? <p className="muted">افتح الرابط من رسالة البريد لتتمكن من تغيير كلمة المرور.</p> : <>
          <label>كلمة المرور الجديدة<input name="password" type="password" required minLength={6} dir="ltr" autoComplete="new-password" /></label>
          <button className="btn">حفظ</button></>}
        {msg && <p role="status">{msg}</p>}
      </form>
    </div>
  );
}
