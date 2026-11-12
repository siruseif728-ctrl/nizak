const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export async function sendMail(to, subject, body) {
  const k = process.env.RESEND_API_KEY;
  if (!k || !to) return false;
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial;max-width:520px;margin:auto"><h2 style="color:#241a5e">Router.net</h2><h3>${esc(subject)}</h3><p>${esc(body)}</p></div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM || 'Router.net <onboarding@resend.dev>', to, subject, html }),
  });
  return r.ok;
}
