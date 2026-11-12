'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ImageUpload from '@/components/ImageUpload';
import { supabase as sb } from '@/lib/supabase';
import { egp } from '@/lib/data';
import { L } from '@/lib/dash';

export default function OrderDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [o, setO] = useState(null);
  const [h, setH] = useState([]);
  const [msg, setMsg] = useState('');
  const [showRet, setShowRet] = useState(false);
  const [photos, setPhotos] = useState([]);

  const load = useCallback(async () => {
    const { data } = await sb.from('orders').select('*, order_items(id,quantity,unit_price,fulfillment,company_id,products(name)), payments(method,status,ref_no), shipments(status,tracking_no,courier_name,expected_at)').eq('id', id).single();
    setO(data || false);
    const { data: hh } = await sb.from('order_status_history').select('*').eq('order_id', id).order('created_at');
    setH(hh || []);
  }, [id]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function fulfil(itemId, v) {
    const { error } = await sb.from('order_items').update({ fulfillment: v }).eq('id', itemId);
    setMsg(error ? error.message : ''); load();
  }
  async function cancel() {
    const reason = window.prompt('سبب الإلغاء؟');
    if (!reason) return;
    const { error } = await sb.from('orders').update({ status: 'cancelled', cancel_reason: reason }).eq('id', id);
    setMsg(error ? error.message : 'تم إلغاء الطلب'); load();
  }
  async function requestReturn(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const { error } = await sb.from('returns').insert({ order_id: id, order_item_id: f.item || null, reason: f.reason, photos });
    if (error) return setMsg(error.message.includes('returns_one_open') ? 'يوجد طلب مرتجع مفتوح لهذا المنتج بالفعل' : error.message);
    setShowRet(false); setMsg('تم إرسال طلب المرتجع، هتوصلك إشعارات بالقرار');
  }

  if (o === null) return <p className="muted">جارٍ التحميل</p>;
  if (!o) return <p className="err">الطلب غير موجود.</p>;
  const p = o.payments?.[0] || {}, s = o.shipments?.[0] || {};
  const customer = profile?.role === 'customer';
  return (
    <>
      <h1 className="h1">طلب #{o.order_no}</h1>
      <p><span className="pill">{L[o.status]}</span> · {new Date(o.created_at).toLocaleString('ar-EG')}</p>
      <div className="btnrow">
        <Link href={`/invoice/${o.id}`} className="btn sm">الفاتورة PDF</Link>
        {p.status === 'pending' && p.method !== 'cod' && o.status === 'pending' && <Link href={`/pay/${o.id}`} className="btn sm ghost">أكمل الدفع</Link>}
        {customer && ['pending', 'confirmed'].includes(o.status) && <button className="btn sm ghost" onClick={cancel}>إلغاء الطلب</button>}
        {customer && o.status === 'delivered' && <button className="btn sm ghost" onClick={() => setShowRet(!showRet)}>طلب مرتجع</button>}
      </div>
      {msg && <p role="status">{msg}</p>}
      {showRet && (
        <form className="panel" onSubmit={requestReturn}>
          <h3>طلب مرتجع</h3>
          <label>المنتج<select name="item"><option value="">كل الطلب</option>{o.order_items.map((i) => <option key={i.id} value={i.id}>{i.products?.name} × {i.quantity}</option>)}</select></label>
          <label>سبب المرتجع<textarea name="reason" required rows={2} /></label>
          <label>صور توضيحية (اختياري)<ImageUpload onChange={setPhotos} /></label>
          <button className="btn" style={{ width: 'fit-content' }}>إرسال</button>
        </form>
      )}
      <div className="panel"><h3>المنتجات</h3>{o.order_items.map((i) => <div key={i.id} className="row"><span>{i.products?.name} × {i.quantity}{i.company_id && profile?.role !== 'company' && <> <span className="pill">{L[i.fulfillment]}</span></>}</span>
          <span>{profile?.role === 'company' && i.company_id && <select value={i.fulfillment} onChange={(e) => fulfil(i.id, e.target.value)} aria-label="تجهيز المنتج">{['pending', 'confirmed', 'preparing', 'ready'].map((x) => <option key={x} value={x}>{L[x]}</option>)}</select>} <b>{egp(i.unit_price * i.quantity)}</b></span></div>)}
        {o.discount > 0 && <div className="row"><span>خصم {o.coupon_code}</span><b>−{egp(o.discount)}</b></div>}
        <div className="row"><span>الشحن</span><b>{egp(o.shipping_fee)}</b></div><div className="row"><strong>الإجمالي</strong><strong>{egp(o.total)}</strong></div></div>
      <div className="panel"><h3>الدفع والشحن</h3>
        <p>الدفع: {L[p.method]} · <span className="pill">{L[p.status]}</span>{p.ref_no ? ` · ${p.ref_no}` : ''}</p>
        <p>الشحنة: <span className="pill">{L[s.status] || '—'}</span>{s.courier_name ? ` · المندوب ${s.courier_name}` : ''}{s.tracking_no ? ` · رقم التتبع ${s.tracking_no}` : ''}{s.expected_at ? ` · التسليم المتوقع ${new Date(s.expected_at).toLocaleDateString('ar-EG')}` : ''}</p>
        <p className="muted">العنوان: {o.ship_address}{o.notes ? ` · ملاحظات: ${o.notes}` : ''}</p></div>
      <div className="panel"><h3>تتبع الطلب</h3><ul className="tl">{h.map((x) => <li key={x.id}>{L[x.status]}{x.actor ? ` · بواسطة ${L[x.actor] || x.actor}` : ''}<small>{new Date(x.created_at).toLocaleString('ar-EG')}</small></li>)}</ul></div>
    </>
  );
}
