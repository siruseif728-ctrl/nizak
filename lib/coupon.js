export async function calcCoupon(db, code, subtotal) {
  if (!code?.trim()) return { discount: 0 };
  const { data: c } = await db.from('coupons').select('*').eq('code', code.trim().toUpperCase()).eq('is_active', true).maybeSingle();
  if (!c) return { error: 'كوبون غير صالح' };
  if (c.expires_at && new Date(c.expires_at + 'T23:59:59') < new Date()) return { error: 'الكوبون منتهي' };
  if (c.max_uses != null && c.used_count >= c.max_uses) return { error: 'تم استهلاك الكوبون' };
  if (subtotal < Number(c.min_order)) return { error: `الحد الأدنى للطلب ${c.min_order} ج.م` };
  const d = c.type === 'percent' ? (subtotal * c.value) / 100 : Number(c.value);
  return { discount: Math.min(Math.round(d * 100) / 100, subtotal), id: c.id, used: c.used_count, code: c.code };
}
