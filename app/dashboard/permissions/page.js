'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { NAV, TITLES, L } from '@/lib/dash';

const ROLES = ['customer', 'company', 'support', 'courier', 'admin'];
const key = (k) => (k === 'home' ? 'dashboard' : k);

export default function Permissions() {
  const { profile } = useAuth();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const load = async () => { const { data } = await sb.from('role_permissions').select('*'); setRows(data || []); };
  useEffect(() => { if (profile?.role === 'admin') load(); }, [profile]);
  if (profile?.role !== 'admin') return <p className="muted">للأدمن فقط.</p>;
  if (!rows) return <p className="muted">جارٍ التحميل</p>;
  const allowed = (r, k) => rows.find((x) => x.role === r && x.page === key(k))?.allowed !== false;
  async function toggle(r, k) {
    const { error } = await sb.from('role_permissions').upsert({ role: r, page: key(k), allowed: !allowed(r, k) });
    if (error) setErr(error.message); else { setErr(''); load(); }
  }
  return (
    <>
      <h1 className="h1">الصلاحيات</h1>
      <p className="muted">حدّد الصفحات الظاهرة لكل نوع مستخدم. التغيير يسري عند أول تحميل للوحة.</p>
      {err && <p className="err" role="alert">{err}</p>}
      {ROLES.map((r) => (
        <div key={r} className="panel">
          <h3>{L[r]}</h3>
          <div className="btnrow">{NAV[r].filter((k) => !(r === 'admin' && ['home', 'permissions'].includes(k))).map((k) => (
            <label key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 400 }}>
              <input type="checkbox" checked={allowed(r, k)} onChange={() => toggle(r, k)} />{TITLES[k]}
            </label>
          ))}</div>
        </div>
      ))}
    </>
  );
}
