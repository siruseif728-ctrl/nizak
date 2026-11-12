'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

export default function NavUser() {
  const { user, unread, ready } = useAuth();
  const { count } = useCart();
  return (
    <span className="navuser">
      <Link href="/cart" className="bell" aria-label={`السلة، ${count} منتج`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 10.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6M10 20h.01M17 20h.01" /></svg>
        {count > 0 && <b>{count}</b>}
      </Link>
      {ready && (user ? (
        <>
          <Link href="/dashboard/notifications" className="bell" aria-label={`الإشعارات، ${unread} غير مقروءة`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" /></svg>
            {unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}
          </Link>
          <Link href="/dashboard" className="btn sm">لوحة التحكم</Link>
        </>
      ) : <Link href="/login" className="btn sm">دخول</Link>)}
    </span>
  );
}
