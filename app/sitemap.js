import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const { data } = supabase ? await supabase.from('products').select('id,created_at').eq('is_active', true).limit(5000) : { data: [] };
  return [{ url: base, lastModified: new Date() }, { url: `${base}/products`, lastModified: new Date() },
    ...(data || []).map((p) => ({ url: `${base}/products/${p.id}`, lastModified: p.created_at }))];
}
