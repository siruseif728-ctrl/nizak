export const eff = (p) => Math.round(Number(p.price) * (100 - (p.discount_pct || 0))) / 100;
export const egp = (n) => Number(n).toLocaleString('ar-EG') + ' ج.م';
