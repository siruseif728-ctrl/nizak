import './globals.css';
import Link from 'next/link';
import AuthProvider from '@/components/AuthProvider';
import CartProvider from '@/components/CartProvider';
import NavUser from '@/components/NavUser';
import { Tajawal, Reem_Kufi } from 'next/font/google';

const body = Tajawal({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700'], variable: '--f-body' });
const head = Reem_Kufi({ subsets: ['arabic', 'latin'], weight: ['500', '700'], variable: '--f-head' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: 'Router.net | سوق الراوتر والسويتش',
  description: 'اشترِ راوتر وسويتش جديد أو مستعمل أو مجدّد من شركات موثوقة، مع شحن وتتبع.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${body.variable} ${head.variable}`}>
      <body>
        <AuthProvider><CartProvider>
        <header className="nav">
          <Link href="/" className="logo">Router<span>.net</span></Link>
          <nav>
            <Link href="/products">المنتجات</Link>
            <Link href="/products?c=used">مستعمل</Link>
            <Link href="/products?c=refurbished">مجدّد</Link>
          </nav>
          <NavUser />
        </header>
        <main>{children}</main>
        <footer className="foot">Router.net · سوق أجهزة الشبكات · الدفع عند الاستلام متاح</footer>
        </CartProvider></AuthProvider>
      </body>
    </html>
  );
}
