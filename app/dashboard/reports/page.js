'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { egp } from '@/lib/data';
import { L } from '@/lib/dash';

const Bars = ({ rows, money }) => {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return <div className="bars">{rows.map(([k, v]) => <div className="bar" key={k}><span>{k}</span><i style={{ width: `${(v / max) * 100}%` }} /><b>{money ? egp(v) : v}</b></div>)}</div>;
};

export default function Reports() {
  const { profile } = useAuth();
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      if (profile.role === 'courier') {
        const { data: sh } = await sb.from('shipments').select('status').limit(5000);
        const st = {};
        (sh || []).forEach((x) => { st[L[x.status] || x.status] = (st[L[x.status] || x.status] || 0) + 1; });
        const done = (sh || []).filter((x) => x.status === 'delivered').length, closed = (sh || []).filter((x) => ['delivered', 'failed', 'returned'].includes(x.status)).length;
        return setD({ courier: true, total: (sh || []).length, done, rate: closed ? Math.round((done / closed) * 100) : 0, st: Object.entries(st) });
      }
      const { data: items } = await sb.from('order_items').select('quantity,unit_price,products(name),orders(created_at,status)').limit(5000);
      const { data: orders } = await sb.from('orders').select('status,created_at').limit(5000);
      const live = (items || []).filter((i) => i.orders && !['cancelled', 'returned'].includes(i.orders.status));
      const rev = live.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const days = {};
      for (let k = 13; k >= 0; k--) days[new Date(Date.now() - k * 864e5).toISOString().slice(0, 10)] = 0;
      const top = {};
      live.forEach((i) => {
        const day = i.orders.created_at.slice(0, 10);
        if (day in days) days[day] += i.unit_price * i.quantity;
        const n = i.products?.name || 'غير معروف';
        top[n] = (top[n] || 0) + i.unit_price * i.quantity;
      });
      const st = {};
      (orders || []).forEach((o) => { st[L[o.status] || o.status] = (st[L[o.status] || o.status] || 0) + 1; });
      setD({ rev, count: (orders || []).length, days: Object.entries(days).map(([k, v]) => [k.slice(5), v]), top: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6), st: Object.entries(st) });
    })();
  }, [profile]);
  if (!d) return <p className="muted">جارٍ التحميل</p>;
  if (d.courier) return (
    <>
      <h1 className="h1">تقارير الشحن</h1>
      <div className="stats"><div className="stat"><b>{d.total}</b><span>إجمالي الشحنات</span></div><div className="stat"><b>{d.done}</b><span>تم تسليمها</span></div><div className="stat"><b>{d.rate}%</b><span>نسبة نجاح التسليم</span></div></div>
      <div className="panel"><h3>الشحنات حسب الحالة</h3>{d.st.length ? <Bars rows={d.st} /> : <p className="muted">لا توجد شحنات.</p>}</div>
    </>
  );
  return (
    <>
      <h1 className="h1">التقارير</h1>
      <div className="stats"><div className="stat"><b>{egp(d.rev)}</b><span>إجمالي المبيعات</span></div><div className="stat"><b>{d.count}</b><span>عدد الطلبات</span></div><div className="stat"><b>{d.count ? egp(d.rev / d.count) : '—'}</b><span>متوسط قيمة الطلب</span></div></div>
      <div className="panel"><h3>المبيعات آخر 14 يوم</h3><Bars rows={d.days} money /></div>
      <div className="panel"><h3>أعلى المنتجات مبيعًا</h3>{d.top.length ? <Bars rows={d.top} money /> : <p className="muted">لا توجد مبيعات بعد.</p>}</div>
      <div className="panel"><h3>الطلبات حسب الحالة</h3>{d.st.length ? <Bars rows={d.st} /> : <p className="muted">لا توجد طلبات.</p>}</div>
    </>
  );
}
