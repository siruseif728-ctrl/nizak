export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return { rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api', '/pay', '/checkout', '/invoice', '/login'] }, sitemap: `${base}/sitemap.xml` };
}
