'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { eff } from '@/lib/data';

const C = createContext({ items: [], count: 0, add() {}, setQty() {}, remove() {}, clear() {} });
export const useCart = () => useContext(C);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('rn_cart') || '[]')); } catch {} }, []);
  const save = (n) => { setItems(n); try { localStorage.setItem('rn_cart', JSON.stringify(n)); } catch {} };
  const add = (p, qty = 1) => {
    const e = items.find((i) => i.id === p.id);
    save(e ? items.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock || 99) } : i))
      : [...items, { id: p.id, name: p.name, price: eff(p), stock: p.stock, image: p.images?.[0] || null, qty: Math.min(qty, p.stock || 99) }]);
  };
  const setQty = (id, q) => save(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(+q || 1, i.stock || 99)) } : i)));
  const remove = (id) => save(items.filter((i) => i.id !== id));
  return <C.Provider value={{ items, count: items.reduce((s, i) => s + i.qty, 0), add, setQty, remove, clear: () => save([]) }}>{children}</C.Provider>;
}
