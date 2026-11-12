// حد بسيط للطلبات لكل IP (داخل نسخة السيرفر الواحدة). لحماية أقوى استخدم Upstash Ratelimit أو Vercel Firewall.
const hits = new Map();
export function limited(req, key, max = 20, windowMs = 60000) {
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const k = `${key}:${ip}`, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(k, arr);
  if (hits.size > 5000) for (const [kk, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(kk);
  return arr.length > max;
}
