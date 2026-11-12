'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { NAV, TITLES, L } from '@/lib/dash';

export default function DashLayout({ children }) {
  const { user, profile, ready, signOut } = useAuth();
  const r = useRouter();
  const path = usePathname();
  const [deny, setDeny] = useState([]);

  useEffect(() => { if (ready && !user && sb) r.replace('/login'); }, [ready, user, r]);
  useEffect(() => {
    if (!profile) return;
    sb.from('role_permissions').select('page').eq('role', profile.role).eq('allowed', false).then(({ data }) => setDeny((data || []).map((x) => x.page)));
  }, [profile]);

  if (!sb) return <div className="wrap"><div className="panel"><h3>لوحة التحكم تحتاج Supabase</h3><p>أضف متغيرات البيئة ثم أعد النشر.</p></div></div>;
  if (!ready || !profile) return <div className="wrap muted">جارٍ التحميل</div>;
  const items = (NAV[profile.role] || NAV.customer).filter((k) => !deny.includes(k === 'home' ? 'dashboard' : k));
  const cur = path.split('/')[2] || 'home';
  const allowed = (NAV[profile.role] || NAV.customer).includes(cur) || cur === 'tickets' || cur === 'orders';
  const blockedPage = deny.includes(cur === 'home' ? 'dashboard' : cur) || !allowed;
  const href = (k) => (k === 'home' ? '/dashboard' : `/dashboard/${k}`);
  return (
    <div className="dash">
      <aside>
        <div className="who"><b>{profile.full_name || profile.email}</b><span className="pill">{L[profile.role]}</span></div>
        {items.map((k) => <Link key={k} href={href(k)} className={path === href(k) ? 'on' : ''}>{TITLES[k]}</Link>)}
        <a href="#" onClick={async (e) => { e.preventDefault(); await signOut(); r.push('/'); }}>تسجيل الخروج</a>
      </aside>
      <section>{blockedPage ? <div className="panel"><h3>غير مسموح</h3><p className="muted">ليس لديك صلاحية لهذه الصفحة.</p></div> : children}</section>
    </div>
  );
}
