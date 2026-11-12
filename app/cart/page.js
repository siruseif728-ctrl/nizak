'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { egp } from '@/lib/data';

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (!items.length) return <div className="wrap"><h1 className="h1">السلة</h1><p className="muted">السلة فاضية.</p><Link href="/products" className="btn">تصفّح المنتجات</Link></div>;
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <h1 className="h1">السلة</h1>
      {items.map((i) => (
        <div key={i.id} className="cartrow">
          <div><b>{i.name}</b><div className="muted">{egp(i.price)}</div></div>
          <input type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, e.target.value)} dir="ltr" aria-label="الكمية" />
          <strong>{egp(i.price * i.qty)}</strong>
          <button className="rowbtn" onClick={() => remove(i.id)}>حذف</button>
        </div>
      ))}
      <div className="total panel"><span>المجموع الفرعي</span><strong>{egp(sub)}</strong></div>
      <p className="muted">الشحن والخصم بالكوبون يُحسبان في الخطوة التالية.</p>
      <Link href="/checkout" className="btn">إتمام الطلب</Link>
    </div>
  );
}
