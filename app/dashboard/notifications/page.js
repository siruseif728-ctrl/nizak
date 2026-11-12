'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase as sb } from '@/lib/supabase';

export default function Notifications() {
  const { user, setUnread } = useAuth();
  const [rows, setRows] = useState(null);
  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await sb.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
    setRows(data || []); setUnread((data || []).filter((n) => !n.is_read).length);
  }, [user, setUnread]);
  useEffect(() => { load(); }, [load]);
  const read = async (n) => { if (!n.is_read) { await sb.from('notifications').update({ is_read: true }).eq('id', n.id); load(); } };
  const readAll = async () => { await sb.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false); load(); };
  return (
    <>
      <div className="sec-head"><h1 className="h1">الإشعارات</h1>{rows?.some((n) => !n.is_read) && <button className="rowbtn" onClick={readAll}>تعليم الكل كمقروء</button>}</div>
      {rows === null ? <p className="muted">جارٍ التحميل</p> : !rows.length ? <p className="muted">لا توجد إشعارات.</p> : rows.map((n) => (
        <div key={n.id} className={n.is_read ? 'notif' : 'notif unread'} onClick={() => read(n)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && read(n)}>
          <b>{n.title}</b><span>{n.body}</span><small className="muted" style={{ display: 'block' }}>{new Date(n.created_at).toLocaleString('ar-EG')}</small>
        </div>
      ))}
    </>
  );
}
