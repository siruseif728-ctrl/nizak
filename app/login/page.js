'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase as sb } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const r = useRouter();
  const { blocked } = useAuth();
  const [mode, setMode] = useState('in'); // in | up | forgot
  const [msg, setMsg] = useState({});
  if (!sb) return <div className="wrap"><div className="panel"><h3>الدخول غير مفعّل</h3><p>اربط Supabase بإضافة متغيرات البيئة ثم أعد النشر.</p></div></div>;

  const google = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/dashboard' } });
  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setMsg({});
    if (mode === 'forgot') {
      const { error } = await sb.auth.resetPasswordForEmail(f.email, { redirectTo: location.origin + '/reset-password' });
      return setMsg(error ? { err: error.message } : { ok: 'لو البريد مسجّل عندنا هيوصلك رابط لإعادة تعيين كلمة المرور.' });
    }
    const { data, error } = mode === 'up'
      ? await sb.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name }, emailRedirectTo: location.origin + '/dashboard' } })
      : await sb.auth.signInWithPassword({ email: f.email, password: f.password });
    if (error) return setMsg({ err: error.message.includes('Invalid') ? 'البريد أو كلمة المرور غير صحيحة' : error.message });
    if (mode === 'up' && !data.session) return setMsg({ ok: 'أرسلنا لك رسالة تأكيد على بريدك. افتحها ثم سجّل دخولك.' });
    r.push('/dashboard');
  }
  const title = mode === 'up' ? 'إنشاء حساب' : mode === 'forgot' ? 'استعادة كلمة المرور' : 'تسجيل الدخول';
  return (
    <div className="wrap" style={{ maxWidth: 440 }}>
      <form className="panel" onSubmit={submit}>
        <h1 className="h1">{title}</h1>
        {blocked && <p className="err" role="alert">تم إيقاف هذا الحساب. تواصل مع الدعم.</p>}
        {mode !== 'forgot' && <><button type="button" className="btn gbtn" onClick={google}>المتابعة بحساب Google</button><p className="muted" style={{ textAlign: 'center' }}>أو بالبريد الإلكتروني</p></>}
        {mode === 'up' && <label>الاسم<input name="name" required autoComplete="name" /></label>}
        <label>البريد الإلكتروني<input name="email" type="email" required dir="ltr" autoComplete="email" /></label>
        {mode !== 'forgot' && <label>كلمة المرور<input name="password" type="password" required minLength={6} dir="ltr" autoComplete={mode === 'up' ? 'new-password' : 'current-password'} /></label>}
        {msg.err && <p className="err" role="alert">{msg.err}</p>}
        {msg.ok && <p role="status">{msg.ok}</p>}
        <button className="btn">{mode === 'up' ? 'إنشاء الحساب' : mode === 'forgot' ? 'إرسال الرابط' : 'دخول'}</button>
        {mode === 'in' && <button type="button" className="linkbtn" onClick={() => setMode('forgot')}>نسيت كلمة المرور؟</button>}
        <button type="button" className="linkbtn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>{mode === 'in' ? 'مفيش عندي حساب' : 'عندي حساب بالفعل'}</button>
      </form>
    </div>
  );
}
