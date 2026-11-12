'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { egp } from '@/lib/data';
import { supabase as sb } from '@/lib/supabase';

const authH = async () => { const t = sb ? (await sb.auth.getSession()).data.session?.access_token : null; return t ? { Authorization: `Bearer ${t}` } : {}; };

const NAMES = { paymob: 'Paymob', meeza: 'Meeza', fawry: 'Fawry', vodafone_cash: 'Vodafone Cash' };

export default function Pay() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [st, setSt] = useState('idle');
  const [ref, setRef] = useState('');
  const [errMsg, setErr] = useState('');

  useEffect(() => { (async () => { setO(await (await fetch('/api/pay?id=' + id, { headers: await authH() })).json()); })(); }, [id]);
  async function pay() {
    setSt('busy');
    const r = await fetch('/api/pay', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await authH()) }, body: JSON.stringify({ id }) });
    const d = await r.json();
    if (r.ok) { setRef(d.ref); setSt('ok'); } else { setErr(d.error || ''); setSt('err'); }
  }
  if (!o) return <div className="wrap muted">جارٍ التحميل</div>;
  if (o.error) return <div className="wrap"><p className="err">{o.error}</p></div>;
  if (o.order_status === 'cancelled') return <div className="wrap"><p className="err">تم إلغاء هذا الطلب (انتهت مهلة الدفع أو تم إلغاؤه). يمكنك إنشاء طلب جديد.</p></div>;
  const m = o.method;
  return (
    <div className="wrap" style={{ maxWidth: 520 }}>
      <div className="gate">
        <div className="gate-head"><b>{NAMES[m] || 'الدفع'}</b><span>طلب #{o.order_no}</span></div>
        <p className="demo-note">بوابة دفع تجريبية. لا يتم خصم أي مبلغ، والبيانات معبأة مسبقًا. لا تدخل بيانات كارت حقيقية.</p>
        {st === 'ok' ? (
          <div className="ok-box" role="status"><h3>تم الدفع بنجاح</h3><p>مرجع العملية <b dir="ltr">{ref}</b></p><Link href="/dashboard/orders" className="btn">متابعة الطلب</Link></div>
        ) : o.status === 'paid' ? <p>الطلب مدفوع بالفعل.</p> : (
          <>
            {(m === 'paymob' || m === 'meeza') && <>
              <label>رقم الكارت<input defaultValue="4111 1111 1111 1111" dir="ltr" readOnly /></label>
              <div className="two"><label>الانتهاء<input defaultValue="12/30" dir="ltr" readOnly /></label><label>CVV<input defaultValue="123" dir="ltr" readOnly /></label></div></>}
            {m === 'fawry' && <div className="fawry"><span>كود فوري</span><b dir="ltr">{String(o.order_no).padStart(9, '7')}</b><small>في الواقع تدفعه من أي فرع. هنا اضغط ادفع للمحاكاة.</small></div>}
            {m === 'vodafone_cash' && <label>رقم المحفظة<input defaultValue="01000000000" dir="ltr" readOnly /></label>}
            <div className="total"><span>الإجمالي</span><strong>{egp(o.total)}</strong></div>
            {st === 'err' && <p className="err" role="alert">{errMsg || 'تعذر إتمام الدفع. حاول مرة أخرى.'}</p>}
            <button className="btn" onClick={pay} disabled={st === 'busy'}>{st === 'busy' ? 'جارٍ المعالجة' : `ادفع ${egp(o.total)}`}</button>
          </>
        )}
      </div>
    </div>
  );
}
