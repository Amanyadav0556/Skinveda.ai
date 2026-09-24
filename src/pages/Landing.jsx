import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import '../landing.css';
import { Icon, Logo } from '../components/ui';

/* ─── DATA ─────────────────────────────────────────────────────── */
const STEPS = [
  { icon: 'upload', title: 'Upload a photo',       desc: 'Snap a clear, well-lit selfie or upload one. Takes about ten seconds.' },
  { icon: 'cpu',    title: 'AI analysis',          desc: 'Our vision model maps texture, tone, hydration and concerns across your face.' },
  { icon: 'list',   title: 'Get recommendations',  desc: 'Receive an AM/PM routine and ingredients matched to your skin — not an average.' },
  { icon: 'trend',  title: 'Track improvement',    desc: 'Re-scan weekly and watch your skin score move with every change you make.' },
];

const COMPARE = [
  { label: 'Accurate analysis',        without: 'Mirror guesswork', with: '98.2% model accuracy' },
  { label: 'Personalized results',     without: 'Generic advice',   with: 'Tailored to you' },
  { label: 'Easy to use',              without: 'Trial and error',  with: '30-second scan' },
  { label: 'Skin health tracking',     without: 'No',               with: 'Weekly skin score' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',  meta: 'Combination skin · 4 months', initials: 'PS', text: 'I finally stopped buying random serums. The routine SkinVeda built for me cleared my T-zone in six weeks, and I could actually see it in the score.' },
  { name: 'Rahul M.',  meta: 'Acne-prone · 3 months',       initials: 'RM', text: 'The weekly re-scan keeps me honest. Watching the clarity number climb was more motivating than any before/after photo.' },
  { name: 'Aisha K.',  meta: 'Sensitive skin · 6 months',   initials: 'AK', text: 'The analysis matched what my dermatologist told me almost word for word — and it explained why, in plain language.' },
];

const PROGRESS = [64, 67, 66, 71, 74, 78, 82, 86];

const METRICS = [
  { label: 'Hydration',   value: 72 },
  { label: 'Clarity',     value: 81 },
  { label: 'Evenness',    value: 76 },
  { label: 'Oil balance', value: 58 },
];

/* ─── HOOKS ────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── PIECES ───────────────────────────────────────────────────── */
function ScoreRing({ value, size = 104, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="sv-ring" role="img" aria-label={`Skin score ${value} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sv-track)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sv-emerald)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="sv-ring-num">{value}</text>
    </svg>
  );
}

function ProgressChart() {
  // Measure real width so axis text renders at 1:1 instead of scaling with the panel
  const boxRef = useRef(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 190, PX = 30, PT = 16, PB = 26;
  const min = 60, max = 90;
  const xs = PROGRESS.map((_, i) => PX + (i * (W - PX - 8)) / (PROGRESS.length - 1));
  const y = v => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
  const line = PROGRESS.map((v, i) => `${i ? 'L' : 'M'}${xs[i]},${y(v)}`).join(' ');
  const area = `${line} L${xs[xs.length - 1]},${H - PB} L${xs[0]},${H - PB} Z`;
  const [hover, setHover] = useState(PROGRESS.length - 1);
  const svgRef = useRef(null);

  const onMove = e => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    xs.forEach((x, i) => { if (Math.abs(x - px) < Math.abs(xs[best] - px)) best = i; });
    setHover(best);
  };

  return (
    <div className="sv-chart" ref={boxRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(PROGRESS.length - 1)}
        role="img" aria-label="Skin score over 8 weeks, rising from 64 to 86">
        <defs>
          <linearGradient id="svArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sv-emerald)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--sv-emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[60, 70, 80, 90].map(t => (
          <g key={t}>
            <line x1={PX} x2={W - 8} y1={y(t)} y2={y(t)} className="sv-grid" />
            <text x={PX - 8} y={y(t)} className="sv-axis" textAnchor="end" dominantBaseline="central">{t}</text>
          </g>
        ))}
        {xs.map((x, i) => (
          <text key={i} x={x} y={H - 6} className="sv-axis" textAnchor="middle">W{i + 1}</text>
        ))}
        <path d={area} fill="url(#svArea)" />
        <path d={line} fill="none" stroke="var(--sv-emerald)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={xs[hover]} x2={xs[hover]} y1={PT} y2={H - PB} className="sv-cross" />
        <circle cx={xs[hover]} cy={y(PROGRESS[hover])} r="5" fill="var(--sv-emerald)" stroke="var(--sv-paper)" strokeWidth="2" />
      </svg>
      <div className={`sv-tip ${hover === 0 ? 'is-start' : hover === PROGRESS.length - 1 ? 'is-end' : ''}`} style={{ left: `${(xs[hover] / W) * 100}%`, top: `${(y(PROGRESS[hover]) / H) * 100}%` }}>
        <span>Week {hover + 1}</span><strong>{PROGRESS[hover]}</strong>
      </div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="sv-mock" aria-hidden="true">
      <div className="sv-mock-glow" />

      <div className="sv-scan-card">
        <div className="sv-scan-head">
          <span className="sv-mono"><i className="sv-live" /> Live skin scan</span>
          <span className="sv-mono sv-dim">3.2s</span>
        </div>

        <div className="sv-face">
          <svg viewBox="0 0 240 260">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <ellipse key={i} cx="120" cy="132" rx={92 - i * 13} ry={112 - i * 15}
                fill="none" stroke="var(--sv-sage)" strokeOpacity={0.28 + i * 0.1} strokeWidth="1" strokeDasharray={i % 2 ? '2 5' : 'none'} />
            ))}
            <path d="M92 118q10-7 20 0M128 118q10-7 20 0M110 170q10 7 20 0" fill="none" stroke="var(--sv-emerald)" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="120" cy="86" r="5" className="sv-pt" />
            <circle cx="78"  cy="150" r="5" className="sv-pt sv-pt-clay" />
            <circle cx="164" cy="142" r="5" className="sv-pt" />
          </svg>
          <div className="sv-scanline" />
          <span className="sv-tag" style={{ top: '26%', left: '58%' }}>T-zone · oily</span>
          <span className="sv-tag sv-tag-clay" style={{ top: '70%', left: '50%' }}>Mild acne · 94%</span>
          <span className="sv-tag" style={{ top: '48%', left: '70%' }}>Hydration 72%</span>
        </div>

        <div className="sv-scan-foot">
          {[['Clarity', 81], ['Evenness', 76], ['Texture', 69]].map(([k, v]) => (
            <div key={k}>
              <span className="sv-mono sv-dim">{k}</span>
              <strong>{v}</strong>
              <span className="sv-meter"><span style={{ width: `${v}%` }} /></span>
            </div>
          ))}
        </div>
      </div>

      <div className="sv-float sv-float-score">
        <ScoreRing value={86} size={72} stroke={7} />
        <div>
          <span className="sv-mono sv-dim">Skin score</span>
          <strong>Very good</strong>
          <span className="sv-up">▲ 6 this month</span>
        </div>
      </div>

      <div className="sv-float sv-float-rec">
        <span className="sv-chip-icon"><Icon name="drop" size={16} /></span>
        <div>
          <span className="sv-mono sv-dim">Recommended · PM</span>
          <strong>Niacinamide 5% serum</strong>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────────── */
export default function Landing() {
  const { navigate, user } = useApp();
  const rootRef = useReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const start = () => navigate(user ? 'dashboard' : 'signup');
  const tryAnalysis = () => navigate(user ? 'diagnosis' : 'signup');
  const jump = id => e => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sv-landing" ref={rootRef}>
      {/* ── NAV ── */}
      <header className={`sv-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="sv-wrap sv-nav-inner">
          <a href="#top" onClick={jump('top')} aria-label="SkinVeda.ai home"><Logo /></a>
          <nav className="sv-nav-links">
            <a href="#features" onClick={jump('features')}>Features</a>
            <a href="#how" onClick={jump('how')}>How it works</a>
            <a href="#preview" onClick={jump('preview')}>Dashboard</a>
            <a href="#stories" onClick={jump('stories')}>Stories</a>
            <a href="#pricing" onClick={e => { e.preventDefault(); navigate('pricing'); }}>Pricing</a>
          </nav>
          <div className="sv-nav-cta">
            {!user && <button className="sv-link-btn" onClick={() => navigate('login')}>Sign in</button>}
            <button className="sv-btn sv-btn-dark sv-btn-sm" onClick={start}>{user ? 'Dashboard' : 'Get Started'}</button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ── HERO ── */}
        <section className="sv-hero">
          <div className="sv-wrap sv-hero-grid">
            <div className="sv-hero-copy">
              <span className="sv-pill rv"><span className="sv-pill-dot" /> Clinical-grade AI · now in beta</span>
              <h1 className="rv">
                AI-Powered Skin Analysis
                <span className="sv-accent"> for <em>smarter</em> skincare.</span>
              </h1>
              <p className="sv-lead rv">
                SkinVeda reads your skin from a single photo — tone, texture, hydration and concerns —
                then builds a routine that’s made for you, and shows you it’s working.
              </p>
              <div className="sv-cta-row rv">
                <button className="sv-btn sv-btn-dark" onClick={start}>
                  Get Started <Icon name="arrow" size={18} />
                </button>
                <button className="sv-btn sv-btn-ghost" onClick={tryAnalysis}>
                  <Icon name="scan" size={18} /> Try Skin Analysis
                </button>
              </div>
              <div className="sv-hero-proof rv">
                <div className="sv-avatars">
                  {['PS', 'RM', 'AK', 'NJ'].map((a, i) => <span key={a} style={{ '--i': i }}>{a}</span>)}
                </div>
                <div>
                  <div className="sv-stars">{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" size={14} stroke={0} />)}<b>4.9</b></div>
                  <span className="sv-dim">Loved by 10,000+ people improving their skin</span>
                </div>
              </div>
            </div>
            <div className="sv-hero-visual rv">
              <HeroMockup />
            </div>
          </div>

          <div className="sv-wrap">
            <dl className="sv-stats rv">
              {[['98.2%', 'Model accuracy'], ['3.2s', 'Average analysis'], ['40+', 'Skin markers'], ['10K+', 'Active users']].map(([v, l]) => (
                <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="sv-section" id="features">
          <div className="sv-wrap">
            <div className="sv-head rv">
              <div>
                <span className="sv-eyebrow">01 — Features</span>
                <h2>Everything your skin needs, <span className="sv-accent">in one place.</span></h2>
              </div>
              <p>From the first scan to your hundredth day, SkinVeda turns what your skin is telling you into decisions you can act on.</p>
            </div>

            <div className="sv-bento">
              <article className="sv-card sv-card-lg rv">
                <div className="sv-card-top">
                  <span className="sv-icon"><Icon name="scan" /></span>
                  <span className="sv-badge">Core</span>
                </div>
                <h3>AI Skin Analysis</h3>
                <p>A vision model trained on dermatology imagery maps over 40 markers from one photo — in seconds.</p>
                <ul className="sv-rows">
                  <li><span>Acne &amp; breakouts</span><b>Detected · mild</b></li>
                  <li><span>Pigmentation</span><b>Low</b></li>
                  <li><span>Hydration</span><b>72%</b></li>
                  <li><span>Texture</span><b>Smooth</b></li>
                </ul>
              </article>

              <article className="sv-card rv">
                <span className="sv-icon"><Icon name="spark" /></span>
                <h3>Personalized Recommendations</h3>
                <p>Ingredients and products matched to your skin type, concerns and climate.</p>
                <div className="sv-chips">
                  <span>Niacinamide</span><span>Ceramides</span><span>SPF 50</span><span>BHA 2%</span>
                </div>
              </article>

              <article className="sv-card rv">
                <span className="sv-icon"><Icon name="calendar" /></span>
                <h3>Routine Tracking</h3>
                <p>Simple AM/PM check-ins that build a habit — and a streak.</p>
                <div className="sv-checks">
                  {[['Cleanser', true], ['Vitamin C', true], ['Sunscreen', true], ['Retinol', false]].map(([s, d]) => (
                    <span key={s} className={d ? 'done' : ''}><i><Icon name="check" size={12} stroke={2.4} /></i>{s}</span>
                  ))}
                </div>
              </article>

              <article className="sv-card rv">
                <span className="sv-icon"><Icon name="shield" /></span>
                <h3>Dermatologist-Inspired Insights</h3>
                <p>Guidance modelled on clinical practice, explained in plain language — the why behind every step.</p>
                <blockquote>“Your dryness peaks on cold, low-humidity days. Layer a ceramide cream at night.”</blockquote>
              </article>

              <article className="sv-card rv">
                <span className="sv-icon"><Icon name="chart" /></span>
                <h3>Progress Monitoring</h3>
                <p>Weekly re-scans turn into a clear trend line, so you know what’s working.</p>
                <div className="sv-bars" aria-hidden="true">
                  {PROGRESS.map((v, i) => <span key={i} style={{ height: `${(v - 55) * 2.6}%` }} />)}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="sv-section sv-section-tint" id="how">
          <div className="sv-wrap">
            <div className="sv-head sv-head-center rv">
              <span className="sv-eyebrow">02 — How it works</span>
              <h2>Four steps. <span className="sv-accent">About a minute.</span></h2>
            </div>
            <ol className="sv-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rv" style={{ '--d': `${i * 90}ms` }}>
                  <div className="sv-step-top">
                    <span className="sv-step-icon"><Icon name={s.icon} size={22} /></span>
                    <span className="sv-step-num">0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="sv-section" id="benefits">
          <div className="sv-wrap">
            <div className="sv-head rv">
              <div>
                <span className="sv-eyebrow">03 — The difference</span>
                <h2>Skincare, <span className="sv-accent">minus the guesswork.</span></h2>
              </div>
              <p>Most routines are built on hunches and trends. SkinVeda builds yours on evidence from your own skin.</p>
            </div>

            <div className="sv-compare">
              <div className="sv-compare-card rv">
                <span className="sv-tagline sv-tagline-muted">On your own</span>
                <h3>Guessing what works.</h3>
                <p>Trending products, conflicting advice, and months before you know if anything helped.</p>
                <ul className="sv-rows">
                  {COMPARE.map(r => <li key={r.label}><span>{r.label}</span><b className="sv-dim">{r.without}</b></li>)}
                </ul>
              </div>
              <div className="sv-compare-card sv-compare-hi rv">
                <span className="sv-tagline">With SkinVeda.ai</span>
                <h3>Knowing what works.</h3>
                <p>A precise read of your skin, a routine made for it, and a score that proves the progress.</p>
                <ul className="sv-rows">
                  {COMPARE.map(r => (
                    <li key={r.label}><span>{r.label}</span><b><Icon name="check" size={14} stroke={2.4} /> {r.with}</b></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ── */}
        <section className="sv-section sv-section-dark" id="preview">
          <div className="sv-wrap">
            <div className="sv-head sv-head-center rv">
              <span className="sv-eyebrow sv-eyebrow-light">04 — Your dashboard</span>
              <h2>Your skin, <span className="sv-accent">measured.</span></h2>
              <p>One calm view of your score, what the AI found, what to do next, and how far you’ve come.</p>
            </div>

            <div className="sv-browser rv">
              <div className="sv-browser-bar">
                <span /><span /><span />
                <div className="sv-url"><Icon name="lock" size={12} /> app.skinveda.ai/dashboard</div>
              </div>

              <div className="sv-dash">
                <div className="sv-panel sv-panel-score">
                  <span className="sv-mono sv-dim">Skin score</span>
                  <ScoreRing value={86} size={132} stroke={11} />
                  <strong>Very good</strong>
                  <span className="sv-up">▲ 6 pts vs last month</span>
                </div>

                <div className="sv-panel">
                  <div className="sv-panel-head"><span className="sv-mono sv-dim">Analysis results</span><span className="sv-mono sv-dim">Today</span></div>
                  <ul className="sv-metrics">
                    {METRICS.map(m => (
                      <li key={m.label}>
                        <div><span>{m.label}</span><b>{m.value}</b></div>
                        <span className="sv-meter"><span style={{ width: `${m.value}%` }} /></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sv-panel">
                  <div className="sv-panel-head"><span className="sv-mono sv-dim">Today’s routine</span><span className="sv-mono sv-dim">3 / 5</span></div>
                  <ul className="sv-routine">
                    {[['AM', 'Gentle gel cleanser', true], ['AM', 'Vitamin C 10%', true], ['AM', 'SPF 50 sunscreen', true], ['PM', 'Niacinamide 5% serum', false], ['PM', 'Ceramide night cream', false]].map(([t, s, d]) => (
                      <li key={s} className={d ? 'done' : ''}>
                        <i><Icon name="check" size={11} stroke={2.6} /></i>
                        <span>{s}</span>
                        <em>{t}</em>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sv-panel sv-panel-wide">
                  <div className="sv-panel-head"><span className="sv-mono sv-dim">Skin score · last 8 weeks</span><span className="sv-up">+22 pts</span></div>
                  <ProgressChart />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="sv-section" id="stories">
          <div className="sv-wrap">
            <div className="sv-head rv">
              <div>
                <span className="sv-eyebrow">05 — Trust</span>
                <h2>Real results, <span className="sv-accent">backed by science.</span></h2>
              </div>
              <p>Built with dermatology research, protected by privacy-first engineering, and proven by the people using it every day.</p>
            </div>

            <div className="sv-trust">
              <div className="sv-trust-card rv">
                <div className="sv-big">4.9<small>/5</small></div>
                <div className="sv-stars">{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" size={16} stroke={0} />)}</div>
                <p className="sv-dim">Average rating from 10,000+ users</p>
                <ul className="sv-trust-list">
                  <li><Icon name="trend" size={18} /><span><b>92%</b> saw a higher skin score within 8 weeks</span></li>
                  <li><Icon name="shield" size={18} /><span>Insights reviewed against dermatology guidelines</span></li>
                  <li><Icon name="lock" size={18} /><span>Photos encrypted end-to-end, never sold</span></li>
                </ul>
              </div>

              <div className="sv-quotes">
                {TESTIMONIALS.map((t, i) => (
                  <figure key={t.name} className="sv-quote rv" style={{ '--d': `${i * 90}ms` }}>
                    <div className="sv-stars">{[0, 1, 2, 3, 4].map(k => <Icon key={k} name="star" size={13} stroke={0} />)}</div>
                    <blockquote>“{t.text}”</blockquote>
                    <figcaption>
                      <span className="sv-avatar">{t.initials}</span>
                      <span><b>{t.name}</b><small>{t.meta}</small></span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="sv-wrap">
          <div className="sv-cta rv">
            <div>
              <span className="sv-eyebrow sv-eyebrow-light">Start today</span>
              <h2>Meet your skin, <em>properly.</em></h2>
              <p>Your first analysis is free and takes less than a minute.</p>
            </div>
            <div className="sv-cta-row">
              <button className="sv-btn sv-btn-light" onClick={start}>Get Started <Icon name="arrow" size={18} /></button>
              <button className="sv-btn sv-btn-outline-light" onClick={tryAnalysis}><Icon name="scan" size={18} /> Try Skin Analysis</button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="sv-footer">
        <div className="sv-wrap">
          <div className="sv-footer-grid">
            <div className="sv-footer-brand">
              <Logo />
              <p>AI-powered skin analysis and personalized skincare, rooted in science.</p>
            </div>
            <div>
              <h4>Product</h4>
              <a href="#features" onClick={jump('features')}>Features</a>
              <a href="#how" onClick={jump('how')}>How it works</a>
              <a href="#preview" onClick={jump('preview')}>Dashboard</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#stories" onClick={jump('stories')}>Stories</a>
              <a href="#help" onClick={e => { e.preventDefault(); navigate('help'); }}>About</a>
              <a href="#help" onClick={e => { e.preventDefault(); navigate('help'); }}>Help &amp; contact</a>
              <a href="#pricing" onClick={e => { e.preventDefault(); navigate('pricing'); }}>Pricing</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#top" onClick={jump('top')}>Privacy</a>
              <a href="#top" onClick={jump('top')}>Terms</a>
            </div>
          </div>
          <div className="sv-footer-bottom">
            <span>© {new Date().getFullYear()} SkinVeda.ai</span>
            <span>SkinVeda provides AI-assisted insights and is not a substitute for professional medical diagnosis.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
