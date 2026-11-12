import { notFound } from 'next/navigation';
import Device from '@/components/Device';
import AddToCart from '@/components/AddToCart';
import FavButton from '@/components/FavButton';
import { CONDITIONS, egp, eff, getProduct } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProduct(params.id);
  if (!p) return {};
  const description = (p.description || `${p.brand || ''} ${p.model || ''}`).slice(0, 160);
  return { title: `${p.name} | Router.net`, description, openGraph: { title: p.name, description, images: p.images?.[0] ? [p.images[0]] : [] } };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.id);
  if (!p) notFound();
  const c = CONDITIONS[p.condition] || CONDITIONS.new;
  const imgs = p.images || [];
  return (
    <div className="wrap detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, brand: p.brand, model: p.model, description: p.description, image: imgs, offers: { '@type': 'Offer', priceCurrency: 'EGP', price: eff(p), availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } }) }} />
      <div>
        <div className="detail-vis">
          {imgs[0] ? <img src={imgs[0]} alt={p.name} className="bigimg" /> : <Device kind={p.kind || 'router'} led={c.led} ports={p.kind === 'switch' ? 16 : 5} />}
        </div>
        {imgs.length > 1 && <div className="thumbs">{imgs.slice(1).map((u) => <img key={u} src={u} alt="" />)}</div>}
      </div>
      <div>
        <span className="tag"><b className={`led ${c.led}`} />{c.label}</span>
        <h1 className="h1">{p.name}</h1>
        <p className="muted">{p.brand} · {p.model}{p.serial_number ? ` · S/N ${p.serial_number}` : ''}</p>
        <p className="big price">{egp(eff(p))}{p.discount_pct > 0 && <s className="muted old">{egp(p.price)}</s>}</p>
        <p>{p.description}</p>
        <p className="muted">{p.stock > 0 ? `متاح ${p.stock} قطعة` : 'نفد المخزون'} · الشحن يُحسب عند إتمام الطلب</p>
        <AddToCart product={{ id: p.id, name: p.name, price: p.price, discount_pct: p.discount_pct, stock: p.stock, images: p.images, kind: p.kind }} />
        <FavButton id={p.id} />
      </div>
    </div>
  );
}
