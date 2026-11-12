'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import ProductCard from '@/components/ProductCard';
import { supabase as sb } from '@/lib/supabase';

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  useEffect(() => { if (user) sb.from('favorites').select('products(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setItems((data || []).map((x) => x.products).filter(Boolean))); }, [user]);
  return (
    <>
      <h1 className="h1">المفضلة</h1>
      {items === null ? <p className="muted">جارٍ التحميل</p> : !items.length ? <p className="muted">لسه مضفتش منتجات للمفضلة. افتح أي منتج واضغط ♡.</p> : <div className="grid" style={{ marginTop: 16 }}>{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </>
  );
}
