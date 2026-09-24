import { useEffect, useRef, useState } from 'react';

/* ================================================================
   SkinVeda UI kit — icons, brand, data visuals, form controls.
   Shared by the landing page and every in-app screen.
   ================================================================ */

/* ─── Icons (24px grid, 1.7 stroke) ────────────────────────────── */
const PATHS = {
  scan:     'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16',
  spark:    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z',
  drop:     'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  check:    'M5 12.5l4.5 4.5L19 7.5',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  shield:   'M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3zM9 12l2 2 4-4',
  chart:    'M4 20V4M4 20h16M8 16l4-5 3 3 5-6',
  upload:   'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  cpu:      'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM9 9h6v6H9z',
  list:     'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  trend:    'M3 17l6-6 4 4 8-8M15 7h6v6',
  arrow:    'M5 12h14M13 6l6 6-6 6',
  back:     'M19 12H5M11 18l-6-6 6-6',
  star:     'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z',
  lock:     'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  leaf:     'M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l7-7',
  home:     'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
  user:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  bell:     'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
  logout:   'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  chat:     'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  smile:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01',
  sun:      'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon:     'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  file:     'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5zM14 3v5h5M9 13h6M9 17h6',
  help:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  card:     'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 10h18M7 15h3',
  camera:   'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  image:    'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  x:        'M6 6l12 12M18 6L6 18',
  plus:     'M12 5v14M5 12h14',
  eye:      'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff:   'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2',
  mail:     'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.5 7l8.5 6 8.5-6',
  phone:    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  alert:    'M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  info:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  wind:     'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
  thermo:   'M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z',
  flame:    'M12 21c-3.9 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.5 2 1.5 3 2.5 3 0-3 1-6 4-8 0 3 2 4.5 3.5 6.5 1 1.3 1.5 3 1.5 5 0 3.8-3.1 6.5-8 6.5z',
  bolt:     'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  target:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  mic:      'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3',
  send:     'M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z',
  refresh:  'M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  trash:    'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit:     'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  globe:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  heart:    'M12 20s-7.5-4.6-9.3-9.3C1.4 7.3 3.6 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7C19.5 15.4 12 20 12 20z',
  menu:     'M4 7h16M4 12h16M4 17h16',
  flask:    'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10',
  crown:    'M3 7l4.5 4L12 5l4.5 6L21 7l-2 11H5L3 7z',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  compare:  'M12 3v18M5 7h4v10H5zM15 5h4v14h-4z',
  grid:     'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chevron:  'M9 6l6 6-6 6',
  chevDown: 'M6 9l6 6 6-6',
  award:    'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7',
  doctor:   'M6 3v5a4 4 0 0 0 8 0V3M10 12v3a5 5 0 0 0 10 0v-2M20 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  bag:      'M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2',
  pin:      'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  video:    'M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM16 10l5-3v10l-5-3',
  filter:   'M4 5h16M7 12h10M10 19h4',
  face:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0',
  save:     'M6 3h10l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 3v5h8M8 21v-7h8v7',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  language: 'M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 4-3 7-7 8M13 21l4-9 4 9M14.5 18h5',
};

export function Icon({ name, size = 20, stroke = 1.7, className, style, fill }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
      fill={fill || 'none'} stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] || PATHS.info} />
    </svg>
  );
}

/* ─── Brand ────────────────────────────────────────────────────── */
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="var(--sv-emerald)" />
      <path d="M9 22c0-7 4.5-12 14-12 0 8.5-5 12-14 12z" fill="var(--sv-sage-pale)" />
      <path d="M9 22l7.5-7" stroke="var(--sv-emerald)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23.5" cy="9" r="2.2" fill="var(--sv-clay)" />
    </svg>
  );
}

export function Logo({ size = 30, sub }) {
  return (
    <span className="sv-logo">
      <LogoMark size={size} />
      <span className="sv-logo-text">
        <span>SkinVeda<em>.ai</em></span>
        {sub && <small>{sub}</small>}
      </span>
    </span>
  );
}

/* ─── Data visuals ─────────────────────────────────────────────── */
export function ScoreRing({ value, size = 104, stroke = 9, label, color = 'var(--sv-emerald)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ui-ring" role="img"
      aria-label={label || `Score ${v} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sv-track)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ui-ring-arc" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ui-ring-num"
        style={{ fontSize: size * 0.28 }}>{Math.round(v)}</text>
    </svg>
  );
}

export function Meter({ value, tone = 'emerald', thin }) {
  return (
    <span className={`ui-meter ui-meter-${tone}${thin ? ' thin' : ''}`} role="presentation">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

/**
 * Responsive single-series line chart with crosshair + tooltip.
 * points: [{ label, value }]
 */
export function LineChart({ points, height = 200, min, max, unit = '', ariaLabel, format = v => v }) {
  const boxRef = useRef(null);
  const [W, setW] = useState(600);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!points.length) return null;

  const H = height, PL = 34, PR = 12, PT = 16, PB = 28;
  const vals = points.map(p => p.value);
  const lo = min ?? Math.floor((Math.min(...vals) - 5) / 10) * 10;
  const hi = max ?? Math.ceil((Math.max(...vals) + 5) / 10) * 10;
  const span = hi - lo || 1;
  const n = points.length;
  const x = i => n === 1 ? (PL + W - PR) / 2 : PL + (i * (W - PL - PR)) / (n - 1);
  const y = v => PT + (1 - (v - lo) / span) * (H - PT - PB);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const area = `${line} L${x(n - 1)},${H - PB} L${x(0)},${H - PB} Z`;
  const step = span <= 20 ? 5 : span <= 50 ? 10 : span <= 100 ? 20 : Math.ceil(span / 50) * 10;
  const ticks = [];
  for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(t);
  const labelEvery = Math.ceil(n / Math.max(2, Math.floor((W - PL) / 56)));
  const active = hover ?? n - 1;

  const onMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    setHover(best);
  };

  const edge = active === 0 ? ' is-start' : active === n - 1 ? ' is-end' : '';
  const gid = `lc-${ariaLabel?.length || 0}-${n}`;

  return (
    <div className="ui-chart" ref={boxRef}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        role="img" aria-label={ariaLabel}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sv-emerald)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--sv-emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map(t => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} className="ui-grid" />
            <text x={PL - 8} y={y(t)} className="ui-axis" textAnchor="end" dominantBaseline="central">{Math.round(t)}</text>
          </g>
        ))}
        {points.map((p, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 8} className="ui-axis" textAnchor="middle">{p.label}</text>
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke="var(--sv-emerald)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={x(active)} x2={x(active)} y1={PT} y2={H - PB} className="ui-cross" />
        <circle cx={x(active)} cy={y(points[active].value)} r="5" fill="var(--sv-emerald)" stroke="var(--sv-paper)" strokeWidth="2" />
      </svg>
      <div className={`ui-tip${edge}`} style={{ left: `${(x(active) / W) * 100}%`, top: y(points[active].value) }}>
        <span>{points[active].label}</span><strong>{format(points[active].value)}{unit}</strong>
      </div>
    </div>
  );
}

/** Vertical bars for small categorical/time series, with per-bar hover. */
export function BarChart({ bars, height = 140, max, format = v => v, empty = 'No data' }) {
  const [hover, setHover] = useState(null);
  const hi = max ?? Math.max(1, ...bars.map(b => b.value));
  return (
    <div className="ui-bars" style={{ height }}>
      {bars.map((b, i) => (
        <div key={i} className={`ui-bar${b.value ? '' : ' is-empty'}${b.highlight ? ' is-hi' : ''}`}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <div className="ui-bar-track">
            <span style={{ height: `${b.value ? Math.max(4, (b.value / hi) * 100) : 4}%` }} />
            {hover === i && <em className="ui-bar-tip">{b.value ? format(b.value) : empty}</em>}
          </div>
          <small>{b.label}</small>
        </div>
      ))}
    </div>
  );
}

/** Drag/keyboard before-after image slider. */
export function CompareSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  const move = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setPos(Math.max(4, Math.min(96, (x / rect.width) * 100)));
  };
  return (
    <div className="compare-slider" style={{ '--pos': `${pos}%` }}
      onMouseMove={e => e.buttons === 1 && move(e)} onMouseDown={move} onTouchMove={move}
      role="slider" aria-label="Before and after comparison" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowLeft') setPos(p => Math.max(4, p - 5)); if (e.key === 'ArrowRight') setPos(p => Math.min(96, p + 5)); }}>
      <img src={before} alt="Earlier scan" />
      <img src={after} alt="Latest scan" className="after" />
      <div className="compare-handle" />
      <span className="compare-label l">Before</span>
      <span className="compare-label r">After</span>
    </div>
  );
}

/* ─── Layout helpers ───────────────────────────────────────────── */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="ui-page-head">
      <div>
        {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon = 'spark', title, text, action }) {
  return (
    <div className="ui-empty">
      <span className="ui-empty-icon"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className={`ui-toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function Segmented({ options, value, onChange, size }) {
  return (
    <div className={`ui-seg${size === 'sm' ? ' sm' : ''}`} role="tablist">
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <button key={v} type="button" role="tab" aria-selected={value === v}
            className={value === v ? 'active' : ''} onClick={() => onChange(v)}>
            {o.icon && <Icon name={o.icon} size={15} />}{l}
          </button>
        );
      })}
    </div>
  );
}

export function Disclaimer({ compact }) {
  return (
    <div className={`ui-disclaimer${compact ? ' compact' : ''}`}>
      <Icon name="shield" size={16} />
      <span>SkinVeda.ai provides AI-assisted skincare guidance and does not replace professional medical diagnosis.</span>
    </div>
  );
}
