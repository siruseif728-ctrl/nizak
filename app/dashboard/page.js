'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { HOME } from '@/lib/dash';

export default function Home() {
  const { profile, unread } = useAuth();
  const [vals, setVals] = useState([]);
  const [rev, setRev] = useState(null);
  const role = profile?.role;

  useEffect(() => {
    if (!role) return;
    Promise.all((HOME[role] || []).map(async ([, t, f]) => {
      let q = sb.from(t).select('*', { count: 'exact', head: true });
      if (f) q = q.eq(f[0], f[1]);
      return (await q).count ?? 0;
    })).then(setVals);
    if (role === 'admin') sb.from('payments').select('amount').eq('status', 'paid').then(({ data }) => setRev((data || []).reduce((s, x) => s + Number(x.amount), 0)));
  }, [role]);

  if (!role) return null;
  return (
    <>
      <h1 className="h1">أهلًا {profile.full_name || ''}</h1>
      <div className="stats">
        {HOME[role].map(([l], i) => <div className="stat" key={l}><b>{vals[i] ?? '…'}</b><span>{l}</span></div>)}
        {rev != null && <div className="stat"><b>{rev.toLocaleString('ar-EG')}</b><span>إجمالي المدفوعات (ج.م)</span></div>}
        <Link href="/dashboard/notifications" className="stat"><b>{unread}</b><span>إشعارات غير مقروءة</span></Link>
      </div>
      {role === 'customer' && <p className="muted">عايز تبيع على المنصة؟ سجّل شركتك من <Link href="/dashboard/settings"><u>الإعدادات</u></Link>.</p>}
    </>
  );
}
