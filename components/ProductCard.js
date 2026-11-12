import Link from 'next/link';
import Device from './Device';
import { CONDITIONS, egp, eff } from '@/lib/data';

export default function ProductCard({ p }) {
  const c = CONDITIONS[p.condition] || CONDITIONS.new;
  return (
    <Link href={`/products/${p.id}`} className="card">
      <div className="card-top">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="pimg" loading="lazy" /> : <Device kind={p.kind || 'router'} led={c.led} />}
        {p.discount_pct > 0 && <span className="sale">-{p.discount_pct}%</span>}
      </div>
      <div className="card-body">
        <span className="tag"><b className={`led ${c.led}`} />{c.label}</span>
        <h3>{p.name}</h3>
        <p className="muted">{p.brand} · {p.model}</p>
        <div className="row">
          <span><strong className="price">{egp(eff(p))}</strong>{p.discount_pct > 0 && <s className="muted old">{egp(p.price)}</s>}</span>
          <span className={p.stock > 0 ? 'muted' : 'out'}>{p.stock > 0 ? `متاح ${p.stock}` : 'نفد'}</span>
        </div>
      </div>
    </Link>
  );
}
