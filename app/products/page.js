import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProductsPage, getFilters } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'المنتجات | Router.net' };
const SIZE = 12;

export default async function Products({ searchParams: sp = {} }) {
  const f = { q: sp.q, condition: sp.c, kind: sp.kind, min: sp.min, max: sp.max, sort: sp.sort, brand: sp.brand, cat: sp.cat };
  const page = Math.max(1, +sp.page || 1);
  const [{ items, total }, { cats, brands }] = await Promise.all([getProductsPage(f, page, SIZE), getFilters()]);
  const pages = Math.ceil(total / SIZE);
  const href = (n) => { const u = new URLSearchParams(); Object.entries(sp).forEach(([k, v]) => { if (v && k !== 'page') u.set(k, v); }); u.set('page', n); return `/products?${u}`; };
  return (
    <div className="wrap">
      <h1 className="h1">المنتجات</h1>
      <form className="filters" method="get">
        <input name="q" defaultValue={sp.q || ''} placeholder="ابحث بالاسم أو الماركة أو الموديل" aria-label="بحث" />
        {cats.length > 0 && <select name="cat" defaultValue={sp.cat || ''} aria-label="القسم"><option value="">كل الأقسام</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>}
        {brands.length > 0 && <select name="brand" defaultValue={sp.brand || ''} aria-label="الماركة"><option value="">كل الماركات</option>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</select>}
        <select name="kind" defaultValue={sp.kind || ''} aria-label="النوع"><option value="">كل الأنواع</option><option value="router">راوتر</option><option value="switch">سويتش</option></select>
        <select name="c" defaultValue={sp.c || ''} aria-label="الحالة"><option value="">كل الحالات</option><option value="new">جديد</option><option value="used">مستعمل</option><option value="refurbished">مجدّد</option></select>
        <input name="min" type="number" min="0" defaultValue={sp.min || ''} placeholder="أقل سعر" dir="ltr" aria-label="أقل سعر" />
        <input name="max" type="number" min="0" defaultValue={sp.max || ''} placeholder="أعلى سعر" dir="ltr" aria-label="أعلى سعر" />
        <select name="sort" defaultValue={sp.sort || ''} aria-label="الترتيب"><option value="">الأحدث</option><option value="price_asc">الأرخص</option><option value="price_desc">الأغلى</option></select>
        <button className="btn sm">بحث</button>
      </form>
      {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="muted">مفيش نتائج. جرّب تغيّر البحث أو الفلاتر.</p>}
      {pages > 1 && <div className="btnrow" style={{ marginTop: 24, alignItems: 'center', justifyContent: 'center' }}>
        {page > 1 && <Link className="rowbtn" href={href(page - 1)}>السابق</Link>}<span className="muted">صفحة {page} من {pages}</span>{page < pages && <Link className="rowbtn" href={href(page + 1)}>التالي</Link>}
      </div>}
    </div>
  );
}
