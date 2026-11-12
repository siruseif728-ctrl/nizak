'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase as sb } from '@/lib/supabase';

const Ctx = createContext({});
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const dev = useRef(null);

  useEffect(() => {
    if (!sb) { setReady(true); return; }
    sb.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: l } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); setUnread(0); return; }
    let off = false;
    const load = async () => {
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
      if (p?.status === 'suspended') { setBlocked(true); await sb.auth.signOut(); return; }
      const { count } = await sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
      if (!off) { setProfile(p); setUnread(count || 0); }
      if (p && dev.current !== user.id) {
        dev.current = user.id;
        try {
          let d = localStorage.getItem('rn_dev');
          if (!d) { d = crypto.randomUUID(); localStorage.setItem('rn_dev', d); }
          sb.rpc('register_device', { h: d }).then(() => {});
        } catch {}
      }
      if (p && (!p.last_login || Date.now() - new Date(p.last_login) > 36e5)) sb.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', user.id).then(() => {});
    };
    load();
    const ch = sb.channel('notif-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    const t = setInterval(load, 60000);
    return () => { off = true; clearInterval(t); sb.removeChannel(ch); };
  }, [user]);

  return <Ctx.Provider value={{ user, profile, ready, unread, setUnread, blocked, signOut: () => sb.auth.signOut() }}>{children}</Ctx.Provider>;
}
