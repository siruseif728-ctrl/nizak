'use client';
import { useState } from 'react';
import { supabase as sb } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function ImageUpload({ onChange }) {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function pick(e) {
    setBusy(true); setErr('');
    const out = [];
    for (const f of [...e.target.files].slice(0, 5)) {
      if (f.size > 3 * 1024 * 1024) { setErr('الحد الأقصى 3 ميجا للصورة'); continue; }
      const path = `${user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, '_')}`;
      const { error } = await sb.storage.from('product-images').upload(path, f);
      if (error) { setErr(error.message); continue; }
      out.push(sb.storage.from('product-images').getPublicUrl(path).data.publicUrl);
    }
    const all = [...urls, ...out].slice(0, 5);
    setUrls(all); onChange(all); setBusy(false);
  }
  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={pick} disabled={busy || urls.length >= 5} aria-label="رفع صور" />
      {busy && <small className="muted"> جارٍ الرفع</small>}
      {err && <p className="err">{err}</p>}
      <div className="thumbs">{urls.map((u) => <img key={u} src={u} alt="" />)}</div>
    </div>
  );
}
