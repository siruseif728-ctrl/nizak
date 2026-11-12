'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { L } from '@/lib/dash';

async function upload(user, file) {
  if (!file || !file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error('الحد الأقصى 5 ميجا للملف');
  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.]/g, '_')}`;
  const { error } = await sb.storage.from('company-docs').upload(path, file);
  if (error) throw error;
  return path;
}

export default function Settings() {
  const { user, profile } = useAuth();
  const [company, setCompany] = useState(undefined);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (user) sb.from('companies').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => setCompany(data)); }, [user]);
  if (!profile) return null;

  async function saveProfile(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const { error } = await sb.from('profiles').update({ full_name: f.full_name, phone: f.phone || null }).eq('id', user.id);
    setMsg(error ? error.message : 'تم الحفظ');
  }
  async function regCompany(e) {
    e.preventDefault();
    setMsg('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const rec = await upload(user, f.rec_file), tax = await upload(user, f.tax_file);
      const { rec_file, tax_file, ...rest } = f;
      const { data, error } = await sb.from('companies').insert({ ...rest, user_id: user.id, email: profile.email, commercial_record_url: rec, tax_card_url: tax }).select().single();
      if (error) throw error;
      setCompany(data); setMsg('تم إرسال طلب الانضمام للمراجعة');
    } catch (er) { setMsg(er.message); }
  }
  async function addDocs(e) {
    e.preventDefault();
    setMsg('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const patch = {};
      const rec = await upload(user, f.rec_file), tax = await upload(user, f.tax_file);
      if (rec) patch.commercial_record_url = rec;
      if (tax) patch.tax_card_url = tax;
      if (!Object.keys(patch).length) return setMsg('اختر ملفًا أولًا');
      const { data, error } = await sb.from('companies').update(patch).eq('id', company.id).select().single();
      if (error) throw error;
      setCompany(data); setMsg('تم رفع المستندات');
    } catch (er) { setMsg(er.message); }
  }
  const files = <>
    <label>ملف السجل التجاري (صورة أو PDF)<input name="rec_file" type="file" accept="image/*,application/pdf" /></label>
    <label>ملف البطاقة الضريبية (صورة أو PDF)<input name="tax_file" type="file" accept="image/*,application/pdf" /></label>
  </>;
  return (
    <>
      <h1 className="h1">الإعدادات</h1>
      <form className="panel" onSubmit={saveProfile} style={{ maxWidth: 480 }}>
        <h3>بياناتي</h3>
        <label>البريد<input value={profile.email || ''} readOnly dir="ltr" /></label>
        <label>الاسم<input name="full_name" defaultValue={profile.full_name || ''} /></label>
        <label>الهاتف (اختياري)<input name="phone" defaultValue={profile.phone || ''} dir="ltr" /></label>
        <button className="btn" style={{ width: 'fit-content' }}>حفظ</button>
      </form>
      {profile.role === 'customer' && company === null && (
        <form className="panel" onSubmit={regCompany} style={{ maxWidth: 480 }}>
          <h3>سجّل كشركة أو تاجر</h3>
          <label>اسم الشركة<input name="name" required /></label>
          <label>اسم المسؤول<input name="contact_name" required /></label>
          <label>الهاتف<input name="phone" required dir="ltr" /></label>
          <label>رقم السجل التجاري<input name="commercial_record" /></label>
          <label>رقم البطاقة الضريبية<input name="tax_number" /></label>
          <label>عنوان الشركة<input name="address" required /></label>
          <label>حساب بنكي / IBAN<input name="iban" dir="ltr" /></label>
          {files}
          <button className="btn" style={{ width: 'fit-content' }}>إرسال للمراجعة</button>
        </form>
      )}
      {company && (
        <>
          <p className="panel" style={{ maxWidth: 480 }}>شركتك <b>{company.name}</b>: <span className="pill">{L[company.approval] || company.approval}</span><br />
            السجل التجاري: {company.commercial_record_url ? 'مرفوع ✓' : 'غير مرفوع'} · البطاقة الضريبية: {company.tax_card_url ? 'مرفوعة ✓' : 'غير مرفوعة'}</p>
          <form className="panel" onSubmit={addDocs} style={{ maxWidth: 480 }}><h3>رفع أو استبدال المستندات</h3>{files}<button className="btn" style={{ width: 'fit-content' }}>رفع</button></form>
        </>
      )}
      {msg && <p role="status">{msg}</p>}
    </>
  );
}
