'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase as sb } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { egp } from '@/lib/data';

const METHODS = [['cod', 'الدفع عند الاستلام'], ['paymob', 'كارت بنكي (Paymob)'], ['meeza', 'ميزة'], ['fawry', 'فوري'], ['vodafone_cash', 'فودافون كاش']];

export default function Checkout() {
  const { user, ready, profile } = useAuth();
  const { items, clear } = useCart();
  const r = useRouter();
  const [addrs, setAddrs] = useState([]);
  const [f, setF] = useState({ name: '', phone: '', address: '', method: 'cod', coupon: '', notes: '' });
  const [disc, setDisc] = useState({ v: 0, msg: '' });
  const [st, setSt] = useState({ s: 'idle' });
  const [cfg, setCfg] = useState({ fee: 60, free: 0, online: true });
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = cfg.free > 0 && sub >= cfg.free ? 0 : cfg.fee;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { if (profile) setF((x) => ({ ...x, name: x.name || profile.full_name || '', phone: x.phone || profile.phone || '' })); }, [profile]);
  useEffect(() => { if (user) sb.from('addresses').select('*').eq('user_id', user.id).then(({ data }) => setAddrs(data || [])); }, [user]);

  useEffect(() => { if (sb) sb.from('platform_settings').select('key,value').then(({ data }) => { const m = Object.fromEntries((data || []).map((x) => [x.key, Number(x.value)])); setCfg({ fee: m.shipping_fee ?? 60, free: m.free_shipping_over ?? 0, online: m.online_payments !== 0 }); }); }, []);

  async function coupon() {
    const d = await (await fetch(`/api/coupon?code=${encodeURIComponent(f.coupon)}&subtotal=${sub}`)).json();
    setDisc(d.error ? { v: 0, msg: d.error } : { v: d.discount, msg: `تم تطبيق خصم ${egp(d.discount)}` });
  }
  async function submit(e) {
    e.preventDefault();
    setSt({ s: 'busy' });
    const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ...f, items: items.map((i) => ({ id: i.id, qty: i.qty })) }) });
    const d = await res.json();
    if (!res.ok) return setSt({ s: 'err', msg: d.error });
    clear();
    if (f.method !== 'cod') return r.push(`/pay/${d.order_id}`);
    if (d.demo) return setSt({ s: 'done', no: d.order_no });
    r.push(`/dashboard/orders/${d.order_id}`);
  }

  if (st.s === 'done') return <div className="wrap"><div className="panel ok"><h3>تم استلام طلبك</h3><p>رقم الطلب {st.no}</p></div></div>;
  if (!items.length) return <div className="wrap"><p className="muted">السلة فاضية.</p><Link href="/products" className="btn">المنتجات</Link></div>;
  if (sb && ready && !user) return <div className="wrap" style={{ maxWidth: 480 }}><div className="panel"><h3>سجّل دخولك لإتمام الطلب</h3><p className="muted">بحساب Gmail أو بريدك، عشان تتابع طلبك وتوصلك الإشعارات.</p><Link href="/login" className="btn">تسجيل الدخول</Link></div></div>;
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <h1 className="h1">إتمام الطلب</h1>
      <form onSubmit={submit} className="panel">
        {addrs.length > 0 && <label>عنوان محفوظ<select onChange={(e) => { const a = addrs.find((x) => x.id === e.target.value); if (a) setF({ ...f, address: [a.governorate, a.city, a.address].filter(Boolean).join('، '), phone: a.phone || f.phone }); }} defaultValue=""><option value="">اختر عنوانًا</option>{addrs.map((a) => <option key={a.id} value={a.id}>{a.city} - {a.address}</option>)}</select></label>}
        <label>الاسم<input value={f.name} onChange={set('name')} required /></label>
        <label>رقم الموبايل<input value={f.phone} onChange={set('phone')} required pattern="01[0-9]{9}" dir="ltr" inputMode="numeric" /></label>
        <label>العنوان بالتفصيل<textarea value={f.address} onChange={set('address')} required rows={2} /></label>
        <label>ملاحظات (اختياري)<textarea value={f.notes} onChange={set('notes')} rows={2} /></label>
        <label>طريقة الدفع<select value={f.method} onChange={set('method')}>{METHODS.filter(([v]) => v === 'cod' || cfg.online).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <div className="coupon"><input value={f.coupon} onChange={set('coupon')} placeholder="كود الخصم" dir="ltr" aria-label="كود الخصم" /><button type="button" className="rowbtn" onClick={coupon}>تطبيق</button></div>
        {disc.msg && <p className={disc.v ? '' : 'err'} role="status">{disc.msg}</p>}
        <div className="total"><span>المجموع + الشحن ({egp(ship)}) − الخصم</span><strong>{egp(sub + ship - disc.v)}</strong></div>
        {st.s === 'err' && <p className="err" role="alert">{st.msg}</p>}
        <button className="btn" disabled={st.s === 'busy'}>{st.s === 'busy' ? 'جارٍ الإرسال' : 'تأكيد الطلب'}</button>
      </form>
    </div>
  );
}
