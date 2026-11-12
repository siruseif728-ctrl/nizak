'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase as sb } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { egp } from '@/lib/data';
import { L } from '@/lib/dash';

export default function Invoice() {
  const { id } = useParams();
  const { user, ready } = useAuth();
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: o } = await sb.from('orders').select('*, order_items(quantity,unit_price,products(name)), payments(method,status,ref_no)').eq('id', id).single();
      setD(o || false);
    })();
  }, [user, id]);
  if (!ready) return null;
  if (!user) return <div className="wrap"><p>سجّل دخولك لعرض الفاتورة.</p></div>;
  if (d === null) return <div className="wrap muted">جارٍ التحميل</div>;
  if (!d) return <div className="wrap"><p className="err">الفاتورة غير متاحة.</p></div>;
  const p = d.payments?.[0] || {};
  return (
    <div className="wrap invoice">
      <div className="noprint"><button className="btn" onClick={() => window.print()}>طباعة / حفظ PDF</button></div>
      <header><h1 style={{ direction: 'ltr' }}>Router.net</h1><div><b>فاتورة INV-{d.order_no}</b><br />{new Date(d.created_at).toLocaleDateString('ar-EG')}</div></header>
      <p><b>العميل:</b> {d.guest_name} · {d.guest_phone}<br /><b>العنوان:</b> {d.ship_address}</p>
      <table><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
        <tbody>{d.order_items.map((i, k) => <tr key={k}><td>{i.products?.name}</td><td>{i.quantity}</td><td>{egp(i.unit_price)}</td><td>{egp(i.unit_price * i.quantity)}</td></tr>)}</tbody></table>
      <div className="inv-tot"><span>المجموع الفرعي {egp(d.subtotal)}</span>{d.discount > 0 && <span>الخصم {egp(d.discount)} {d.coupon_code && `(${d.coupon_code})`}</span>}<span>الشحن {egp(d.shipping_fee)}</span><strong>الإجمالي {egp(d.total)}</strong></div>
      <p className="muted">الدفع: {L[p.method] || p.method} · {L[p.status] || p.status}{p.ref_no ? ` · ${p.ref_no}` : ''}</p>
    </div>
  );
}
