'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ImageUpload from '@/components/ImageUpload';
import { supabase as sb } from '@/lib/supabase';
import { L } from '@/lib/dash';

const F = [['name', 'اسم المنتج', 'text', 1], ['brand', 'الماركة', 'text'], ['model', 'الموديل', 'text'], ['serial_number', 'Serial', 'text'], ['sku', 'SKU', 'text'],
  ['kind', 'النوع', ['router', 'switch'], 1], ['condition', 'الحالة', ['new', 'used', 'refurbished'], 1], ['price', 'السعر', 'number', 1], ['wholesale_price', 'سعر الجملة', 'number'],
  ['discount_pct', 'خصم %', 'number'], ['stock', 'المخزون', 'number', 1], ['weight_kg', 'الوزن (كجم)', 'number']];

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [cats, setCats] = useState([]);
  const [whs, setWhs] = useState([]);
  const [kept, setKept] = useState([]);
  const [added, setAdded] = useState([]);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!user) return;
    sb.from('products').select('*').eq('id', id).single().then(({ data }) => { setP(data || false); setKept(data?.images || []); });
    sb.from('categories').select('id,name').then(({ data }) => setCats(data || []));
    sb.from('warehouses').select('id,name').then(({ data }) => setWhs(data || []));
  }, [user, id]);
  if (p === null) return <p className="muted">جارٍ التحميل</p>;
  if (!p) return <p className="err">المنتج غير موجود أو ليس لديك صلاحية.</p>;

  async function save(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const body = { description: f.description || null, category_id: f.category_id || null, warehouse_id: f.warehouse_id || null, images: [...kept, ...added].slice(0, 8) };
    for (const [n, , t, req] of F) {
      const v = f[n];
      body[n] = Array.isArray(t) ? v : t === 'number' ? (v === '' ? (n === 'discount_pct' ? 0 : null) : +v) : (v === '' && !req ? null : v);
    }
    const { error } = await sb.from('products').update(body).eq('id', id);
    setMsg(error ? error.message : 'تم الحفظ');
  }
  return (
    <>
      <Link href="/dashboard/products" className="muted">← المنتجات</Link>
      <h1 className="h1">تعديل: {p.name}</h1>
      <form className="panel" onSubmit={save}>
        <div className="formrow">
          {F.map(([n, l, t, req]) => (
            <label key={n}>{l}
              {Array.isArray(t) ? <select name={n} defaultValue={p[n]}>{t.map((x) => <option key={x} value={x}>{L[x] || x}</option>)}</select>
                : <input name={n} type={t} defaultValue={p[n] ?? ''} required={!!req} min={t === 'number' ? 0 : undefined} step={t === 'number' ? 'any' : undefined} />}
            </label>
          ))}
          <label>القسم<select name="category_id" defaultValue={p.category_id || ''}><option value="">بدون</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>المخزن<select name="warehouse_id" defaultValue={p.warehouse_id || ''}><option value="">بدون</option>{whs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        </div>
        <label>الوصف<textarea name="description" rows={4} defaultValue={p.description || ''} /></label>
        <div>الصور الحالية
          <div className="thumbs">{kept.map((u) => <span key={u} style={{ position: 'relative' }}><img src={u} alt="" /><button type="button" className="rowbtn" onClick={() => setKept(kept.filter((x) => x !== u))} aria-label="حذف الصورة">✕</button></span>)}{!kept.length && <span className="muted">لا توجد صور</span>}</div>
        </div>
        <label>إضافة صور<ImageUpload onChange={setAdded} /></label>
        <button className="btn" style={{ width: 'fit-content' }}>حفظ التعديلات</button>
        {msg && <p role="status">{msg}</p>}
      </form>
    </>
  );
}
