'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';
import { egp } from '@/lib/data';
import { L, fmt } from '@/lib/dash';

export default function Wallet() {
  const { user } = useAuth();
  const [w, setW] = useState(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const { data: c } = await sb.from('companies').select('*').eq('user_id', user.id).maybeSingle();
    if (!c) return setW({ none: true });
    const { data: items } = await sb.from('order_items').select('quantity,unit_price,orders(status)').eq('company_id', c.id);
    const { data: pay } = await sb.from('payouts').select('*').eq('company_id', c.id).order('created_at', { ascending: false });
    const gross = (items || []).filter((i) => i.orders?.status === 'delivered').reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const net = gross * (1 - c.commission_pct / 100);
    const taken = (pay || []).filter((p) => p.status !== 'rejected').reduce((s, p) => s + Number(p.amount), 0);
    setW({ c, gross, net, avail: Math.max(0, net - taken), pay: pay || [] });
  }, [user]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function request(e) {
    e.preventDefault();
    const amount = +new FormData(e.currentTarget).get('amount');
    if (!(amount > 0) || amount > w.avail) return setMsg('المبلغ أكبر من الرصيد المتاح');
    const { error } = await sb.from('payouts').insert({ company_id: w.c.id, amount });
    setMsg(error ? error.message : 'تم إرسال طلب السحب'); load();
  }
  if (!w) return <p className="muted">جارٍ التحميل</p>;
  if (w.none) return <p>سجّل شركتك أولًا من الإعدادات.</p>;
  return (
    <>
      <h1 className="h1">المحفظة والأرباح</h1>
      <div className="stats">
        <div className="stat"><b>{egp(w.gross)}</b><span>مبيعات مسلّمة</span></div>
        <div className="stat"><b>{w.c.commission_pct}%</b><span>عمولة المنصة</span></div>
        <div className="stat"><b>{egp(w.net)}</b><span>صافي الأرباح</span></div>
        <div className="stat"><b>{egp(w.avail)}</b><span>الرصيد المتاح للسحب</span></div>
      </div>
      <form className="panel" onSubmit={request} style={{ maxWidth: 420 }}>
        <h3>طلب سحب</h3>
        <label>المبلغ (ج.م)<input name="amount" type="number" min="1" step="any" required dir="ltr" /></label>
        <button className="btn" style={{ width: 'fit-content' }}>إرسال الطلب</button>
        {msg && <p role="status">{msg}</p>}
      </form>
      {w.pay.length > 0 && <div className="tbl-wrap"><table><thead><tr><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>{w.pay.map((p) => <tr key={p.id}><td>{fmt(p.amount, 'egp')}</td><td><span className="pill">{L[p.status]}</span></td><td>{fmt(p.created_at, 'd')}</td></tr>)}</tbody></table></div>}
    </>
  );
}
