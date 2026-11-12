'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase as sb } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function FavButton({ id }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const real = sb && !String(id).startsWith('d');
  useEffect(() => { if (real && user) sb.from('favorites').select('product_id').eq('product_id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => setFav(!!data)); }, [real, user, id]);
  if (!real) return null;
  if (!user) return <Link href="/login" className="rowbtn">♡ أضف للمفضلة</Link>;
  const toggle = async () => {
    if (fav) await sb.from('favorites').delete().eq('product_id', id).eq('user_id', user.id);
    else await sb.from('favorites').insert({ product_id: id, user_id: user.id });
    setFav(!fav);
  };
  return <button className="rowbtn" onClick={toggle} aria-pressed={fav}>{fav ? '♥ في المفضلة' : '♡ أضف للمفضلة'}</button>;
}
