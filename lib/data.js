import { supabase } from './supabase';
import { eff, egp } from './pricing';
export { eff, egp };

export const CONDITIONS = {
  new: { label: 'جديد', led: 'cyan' },
  used: { label: 'مستعمل', led: 'amber' },
  refurbished: { label: 'مجدّد', led: 'violet' },
};

export const demo = [
  { id: 'd1', name: 'TP-Link Archer AX55', brand: 'TP-Link', model: 'AX55', condition: 'new', price: 2450, discount_pct: 10, stock: 14, kind: 'router', description: 'راوتر Wi-Fi 6 ثنائي النطاق بسرعة 3000 ميجابت، مناسب للبيوت والمكاتب الصغيرة.' },
  { id: 'd2', name: 'Cisco Catalyst 2960-24TT', brand: 'Cisco', model: 'WS-C2960-24TT-L', condition: 'refurbished', price: 5800, stock: 5, kind: 'switch', description: 'سويتش 24 منفذ Fast Ethernet مع منفذي Uplink، تم فحصه وتجديده.' },
  { id: 'd3', name: 'Huawei HG8145V5 ONT', brand: 'Huawei', model: 'HG8145V5', condition: 'used', price: 650, stock: 22, kind: 'router', description: 'راوتر ألياف GPON مستعمل بحالة ممتازة، يعمل مع معظم مزودي الخدمة.' },
  { id: 'd4', name: 'MikroTik hEX S', brand: 'MikroTik', model: 'RB760iGS', condition: 'new', price: 3100, stock: 9, kind: 'router', description: 'راوتر 5 منافذ Gigabit مع منفذ SFP، ممتاز لإدارة الشبكات المتقدمة.' },
  { id: 'd5', name: 'D-Link DGS-1016D', brand: 'D-Link', model: 'DGS-1016D', condition: 'new', price: 1750, stock: 18, kind: 'switch', description: 'سويتش 16 منفذ Gigabit غير مُدار، تركيب سهل بدون إعدادات.' },
  { id: 'd6', name: 'Ubiquiti UniFi US-24-250W', brand: 'Ubiquiti', model: 'US-24-250W', condition: 'used', price: 9200, stock: 2, kind: 'switch', description: 'سويتش PoE مُدار 24 منفذ بقدرة 250 واط، مستعمل ومفحوص.' },
];

const clean = (v) => (v || '').replace(/[,()%*]/g, ' ').trim();

function localFilter(f) {
  const q = clean(f.q).toLowerCase();
  const r = demo.filter((p) => (!f.condition || p.condition === f.condition) && (!f.kind || p.kind === f.kind) && (!f.brand || p.brand === f.brand)
    && (!f.min || eff(p) >= +f.min) && (!f.max || eff(p) <= +f.max) && (!q || [p.name, p.brand, p.model].join(' ').toLowerCase().includes(q)));
  return f.sort === 'price_asc' ? [...r].sort((a, b) => eff(a) - eff(b)) : f.sort === 'price_desc' ? [...r].sort((a, b) => eff(b) - eff(a)) : r;
}

async function runQuery(f, range) {
  let s = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);
  const q = clean(f.q);
  if (f.condition) s = s.eq('condition', f.condition);
  if (f.kind) s = s.eq('kind', f.kind);
  if (f.brand) s = s.eq('brand', f.brand);
  if (f.cat) { const { data: c } = await supabase.from('categories').select('id').eq('slug', f.cat).maybeSingle(); if (c) s = s.eq('category_id', c.id); }
  if (f.min) s = s.gte('price', +f.min);
  if (f.max) s = s.lte('price', +f.max);
  if (q) s = s.or(`name.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%`);
  s = f.sort === 'price_asc' ? s.order('price') : f.sort === 'price_desc' ? s.order('price', { ascending: false }) : s.order('created_at', { ascending: false });
  return range ? s.range(range[0], range[1]) : s;
}

export async function getProducts(f = {}) {
  if (typeof f === 'string') f = { condition: f };
  if (!supabase) return localFilter(f);
  const { data, error } = await runQuery(f);
  return error ? localFilter(f) : data;
}

export async function getProductsPage(f = {}, page = 1, size = 12) {
  const slice = () => { const a = localFilter(f); return { items: a.slice((page - 1) * size, page * size), total: a.length }; };
  if (!supabase) return slice();
  const { data, error, count } = await runQuery(f, [(page - 1) * size, page * size - 1]);
  return error ? slice() : { items: data, total: count ?? data.length };
}

export async function getProduct(id) {
  const fallback = demo.find((p) => p.id === id) || null;
  if (!supabase || id.startsWith('d')) return fallback;
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  return data || fallback;
}

export async function getFilters() {
  if (!supabase) return { cats: [], brands: [...new Set(demo.map((p) => p.brand))] };
  const [{ data: c }, { data: b }] = await Promise.all([
    supabase.from('categories').select('name,slug'),
    supabase.from('products').select('brand').eq('is_active', true).not('brand', 'is', null),
  ]);
  return { cats: c || [], brands: [...new Set((b || []).map((x) => x.brand))].sort() };
}
