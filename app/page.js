import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts, getFilters } from '@/lib/data';

export const revalidate = 60;

const PORTS = [
  ['جديد', 'cyan', '/products?c=new'], ['مستعمل', 'amber', '/products?c=used'], ['مجدّد', 'violet', '/products?c=refurbished'],
];

export default async function Home() {
  const items = (await getProducts()).slice(0, 6);
  const { cats } = await getFilters();
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>كل جهاز شبكة<br />له منفذ عندنا</h1>
          <p>راوترات وسويتشات جديدة ومستعملة ومجدّدة من شركات وتجّار معتمدين. تشتري بثقة، وتتابع شحنتك لحد باب البيت.</p>
          <Link href="/products" className="btn">تصفّح الأجهزة</Link>
        </div>
        <div className="rack" role="group" aria-label="لوحة منافذ تفاعلية">
          <div className="rack-bar"><span>PATCH 01</span><span>اختر حالة الجهاز بتوصيل الكابل</span></div>
          <div className="rack-grid">
            {Array.from({ length: 24 }).map((_, i) => {
              const sel = i % 8 === 3 ? PORTS[i % 3] : null;
              return sel ? (
                <Link key={i} href={sel[2]} className="rp active" aria-label={sel[0]}>
                  <b className={`led ${sel[1]}`} /><em>{sel[0]}</em>
                </Link>
              ) : (
                <span key={i} className="rp"><b className="led idle" style={{ animationDelay: `${(i * 0.53) % 3}s` }} /></span>
              );
            })}
          </div>
          <div className="legend"><span><b className="led cyan" /> جديد</span><span><b className="led amber" /> مستعمل</span><span><b className="led violet" /> مجدّد</span></div>
        </div>
      </section>

      {cats.length > 0 && <section className="wrap" style={{ paddingBottom: 0 }}><h2 style={{ marginBottom: 14 }}>الأقسام</h2><div className="chips">{cats.map((c) => <Link key={c.slug} href={`/products?cat=${c.slug}`} className="chip">{c.name}</Link>)}</div></section>}

      <section className="wrap">
        <div className="sec-head"><h2>وصل حديثًا</h2><Link href="/products">كل المنتجات</Link></div>
        <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="wrap steps">
        <h2>من الطلب للتسليم</h2>
        <ol>
          <li><b>اختار الجهاز</b><span>مواصفات واضحة وحالة مفحوصة.</span></li>
          <li><b>أكّد بياناتك</b><span>رقم موبايل وعنوان، والدفع عند الاستلام.</span></li>
          <li><b>تابع الشحنة</b><span>من التجهيز لحد وصول الجهاز.</span></li>
          <li><b>استرجع لو لزم</b><span>طلب مرتجع بمراجعة واضحة.</span></li>
        </ol>
      </section>
    </>
  );
}
