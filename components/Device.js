// جهاز مرسوم بـ CSS: راوتر أو سويتش مع LED يعبّر عن حالة المنتج
export default function Device({ kind = 'router', led = 'cyan', ports }) {
  const n = ports ?? (kind === 'switch' ? 12 : 4);
  return (
    <div className={`device ${kind}`} aria-hidden="true">
      {kind === 'router' && <><i className="ant a1" /><i className="ant a2" /></>}
      <div className="dports">
        {Array.from({ length: n }).map((_, i) => (
          <span key={i} className="dport"><b className={`led ${led}`} style={{ animationDelay: `${(i * 0.37) % 2}s` }} /></span>
        ))}
      </div>
    </div>
  );
}
