'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';

export default function AddToCart({ product }) {
  const { add } = useCart();
  const r = useRouter();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const out = product.stock < 1;
  return (
    <div className="panel">
      <label>الكمية<input type="number" min="1" max={Math.max(product.stock, 1)} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} dir="ltr" /></label>
      <div className="btnrow">
        <button className="btn" disabled={out} onClick={() => { add(product, qty); r.push('/cart'); }}>اشترِ الآن</button>
        <button className="btn ghost" disabled={out} onClick={() => { add(product, qty); setDone(true); }}>{done ? 'تمت الإضافة ✓' : 'أضف للسلة'}</button>
      </div>
    </div>
  );
}
