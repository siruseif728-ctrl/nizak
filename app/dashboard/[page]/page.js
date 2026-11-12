'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ImageUpload from '@/components/ImageUpload';
import { supabase as sb } from '@/lib/supabase';
import { CFG, L, fmt } from '@/lib/dash';

const PER = 25;

export default function GenericPage() {
  const { page } = useParams();
  const cfg = CFG[page];
  const { user, profile } = useAuth();
  const role = profile?.role;
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [company, setCompany] = useState(null);
  const [cats, setCats] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [imgs, setImgs] = useState([]);
  const [nonce, setNonce] = useState(0);
  const [whs, setWhs] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pg, setPg] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!cfg || !user) return;
    let q = sb.from(cfg.table).select(cfg.select || '*', { count: 'exact' }).order('created_at', { ascending: false }).range(pg * PER, pg * PER + PER - 1);
    if (cfg.filter) q = q.in(cfg.filter[0], cfg.filter[1]);
    if (role === 'company' && page === 'products') {
      const { data: c } = await sb.from('companies').select('id').eq('user_id', user.id).maybeSingle();
      setCompany(c);
      q = q.eq('company_id', c?.id ?? '00000000-0000-0000-0000-000000000000');
    }
    if (page === 'sell') q = q.eq('user_id', user.id);
    const { data, error, count } = await q;
    if (error) setErr(error.message); else { setRows(data); setTotal(count ?? data.length); }
  }, [cfg, user, role, page, pg]);
  useEffect(() => { setPg(0); }, [page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (page === 'products' && sb) sb.from('categories').select('id,name').then(({ data }) => setCats(data || [])); }, [page]);
  useEffect(() => { if (page === 'products' && sb) sb.from('warehouses').select('id,name').then(({ data }) => setWhs(data || [])); }, [page]);
  useEffect(() => { if (page === 'tickets' && user) sb.from('orders').select('id,order_no').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50).then(({ data }) => setMyOrders(data || [])); }, [page, user]);
  useEffect(() => { if (page === 'tickets' && ['admin', 'support'].includes(role)) sb.from('profiles').select('id,full_name,email').in('role', ['admin', 'support']).then(({ data }) => setStaff(data || [])); }, [page, role]);
  useEffect(() => { if (page.startsWith('shipments') && role === 'admin') sb.from('profiles').select('id,full_name,email').eq('role', 'courier').then(({ data }) => setCouriers(data || [])); }, [page, role]);

  if (!cfg) return <p>الصفحة غير موجودة.</p>;
  if (!role) return null;

  async function save(row, col, v) {
    const val = v === 'true' ? true : v === 'false' ? false : v;
    const { error } = await sb.from(cfg.table).update({ [col]: val }).eq('id', row.id);
    if (error) setErr(error.message); else { setErr(''); load(); }
  }
  async function del(row) {
    if (!window.confirm('تأكيد الحذف؟')) return;
    const { error } = await sb.from(cfg.table).delete().eq('id', row.id);
    if (error) setErr(error.message); else { setErr(''); load(); }
  }
  async function openDoc(path) {
    const { data, error } = await sb.storage.from('company-docs').createSignedUrl(path, 300);
    if (error) setErr(error.message); else window.open(data.signedUrl, '_blank', 'noopener');
  }
  async function create(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const form = e.currentTarget;
    if (page === 'products' && role === 'company' && !company) return setErr('سجّل شركتك واعتمدها من الأدمن أولًا من صفحة الإعدادات.');
    const body = {};
    for (const [n, , t] of cfg.create.fields) {
      let v = f[n];
      if (t === 'images') v = imgs; else if (t === 'number') v = v === '' || v == null ? null : +v; else if (v === '') v = null;
      if (v !== null && v !== undefined) body[n] = v;
    }
    if (cfg.create.owner) body.user_id = user.id;
    if (page === 'products') body.company_id = company?.id ?? null;
    if (page === 'coupons') body.code = body.code.toUpperCase();
    if (page === 'sell' && !imgs.length) return setErr('ارفع صورة واحدة على الأقل للجهاز.');
    const { error } = await sb.from(cfg.table).insert(body);
    if (error) setErr(error.message); else { setErr(''); form.reset(); setImgs([]); setNonce(nonce + 1); load(); }
  }

  const canCreate = cfg.create?.roles.includes(role);
  const edits = cfg.edit?.filter((e) => e[2].includes(role)) || [];
  const editMap = Object.fromEntries(edits.map((e) => [e[0], e]));
  const colKeys = cfg.cols.map((c) => c[0]);
  const extras = edits.filter((e) => !colKeys.includes(e[0]));
  const canDel = cfg.del?.includes(role);

  // محرر الخلية: select أو حقل نص/رقم/تاريخ يُحفظ عند الخروج منه (دالة وليست مكوّنًا حتى لا يفقد الحقل التركيز)
  const editor = (row, [col, t]) => {
    if (Array.isArray(t)) return <select value={String(row[col])} onChange={(ev) => save(row, col, ev.target.value)} aria-label="تعديل">{t.map((o) => <option key={o} value={o}>{L[o] || o}</option>)}</select>;
    if (t === 'staff') return <select value={row[col] || ''} onChange={(ev) => save(row, col, ev.target.value || null)} aria-label="المسؤول"><option value="">غير مُسند</option>{staff.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}</select>;
    if (t === 'couriers') return <select value={row[col] || ''} onChange={(ev) => save(row, col, ev.target.value || null)} aria-label="المندوب"><option value="">غير مُسند</option>{couriers.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}</select>;
    const type = t === 'number' ? 'number' : t === 'date' ? 'date' : 'text';
    return <input className="cellin" type={type} step={type === 'number' ? 'any' : undefined} min={type === 'number' ? 0 : undefined} defaultValue={row[col] ?? ''} key={`${row.id}:${row[col]}`}
      onBlur={(ev) => { const v = ev.target.value; if (v !== String(row[col] ?? '')) save(row, col, v === '' ? null : type === 'number' ? +v : v); }} />;
  };
  const cell = (r, [k, , f]) => {
    if (editMap[k]) return editor(r, editMap[k]);
    if (f === 'actor') return fmt(r.profiles, 'actor');
    if (f === 'doc') return r[k] ? <button className="rowbtn" onClick={() => openDoc(r[k])}>عرض</button> : '—';
    if (cfg.link && cfg.link[0] === k) return <Link href={cfg.link[1](r.id)}><u>{fmt(r[k], f)}</u></Link>;
    return f === 'l' ? <span className="pill">{fmt(r[k], f)}</span> : fmt(r[k], f);
  };

  return (
    <>
      <h1 className="h1">{cfg.t}</h1>
      {page === 'sell' && <p className="muted">أرسل بيانات جهازك مع Serial وصور واضحة. بعد مراجعة الأدمن وفحص الجهاز يظهر في المتجر.</p>}
      {canCreate && (
        <form onSubmit={create} className="panel">
          <div className="formrow">
            {cfg.create.fields.map(([n, l, t, opt]) => (
              <label key={n}>{l}
                {Array.isArray(t) ? <select name={n}>{t.map((x) => <option key={x} value={x}>{L[x] || x}</option>)}</select>
                  : t === 'cats' ? <select name={n}><option value="">بدون</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  : t === 'whs' ? <select name={n}><option value="">بدون</option>{whs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  : t === 'orders' ? <select name={n}><option value="">بدون</option>{myOrders.map((c) => <option key={c.id} value={c.id}>طلب #{c.order_no}</option>)}</select>
                  : t === 'images' ? <ImageUpload key={nonce} onChange={setImgs} />
                  : <input name={n} type={t === 'number' || t === 'date' ? t : 'text'} required={!opt} min={t === 'number' ? 0 : undefined} step={t === 'number' ? 'any' : undefined} />}
              </label>
            ))}
          </div>
          <button className="btn" style={{ width: 'fit-content' }}>إضافة</button>
        </form>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      {rows === null ? <p className="muted">جارٍ التحميل</p> : !rows.length ? <p className="muted">لا توجد بيانات بعد.</p> : (
        <div className="tbl-wrap"><table>
          <thead><tr>{cfg.cols.map(([, l]) => <th key={l}>{l}</th>)}{extras.map((e) => <th key={'x' + e[0]}>{e[3] || e[0]}</th>)}{cfg.open && <th />}{canDel && <th />}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}>
              {cfg.cols.map((c) => <td key={c[0]}>{cell(r, c)}</td>)}
              {extras.map((e) => <td key={'x' + e[0]}>{editor(r, e)}</td>)}
              {cfg.open && <td><Link className="rowbtn" href={cfg.open(r.id)}>تعديل كامل</Link></td>}
              {canDel && <td><button className="rowbtn" onClick={() => del(r)}>حذف</button></td>}
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {total > PER && <div className="btnrow" style={{ marginTop: 14, alignItems: 'center' }}><button className="rowbtn" disabled={pg === 0} onClick={() => setPg(pg - 1)}>السابق</button><span className="muted">صفحة {pg + 1} من {Math.ceil(total / PER)}</span><button className="rowbtn" disabled={(pg + 1) * PER >= total} onClick={() => setPg(pg + 1)}>التالي</button></div>}
    </>
  );
}
