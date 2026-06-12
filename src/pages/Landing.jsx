import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import '../landing.css';

/* ─── DATA ─────────────────────────────────────────────────────── */
const STATS = [
  { value: '98.2%', label: 'AI Accuracy', suffix: '' },
  { value: '10K+',  label: 'Active Users', suffix: '' },
  { value: '5',     label: 'Skin Conditions', suffix: '' },
  { value: '3.2s',  label: 'Analysis Time', suffix: '' },
];

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI Skin Diagnosis',
    desc: 'Upload skin images for instant analysis. Our fine-tuned DINOv2 Vision Transformer detects eczema, psoriasis, vitiligo, acne & dermatitis with 98.2% accuracy.',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))',
    iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    border: 'rgba(139,92,246,0.15)',
    topBar: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  },
  {
    icon: '💭',
    title: 'Mood Correlation Tracking',
    desc: 'Discover how stress, anxiety, and emotional patterns directly trigger and worsen your skin conditions with intelligent mood-skin correlation maps.',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(244,114,182,0.05))',
    iconBg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    border: 'rgba(236,72,153,0.15)',
    topBar: 'linear-gradient(90deg, #ec4899, #f472b6)',
  },
  {
    icon: '🤖',
    title: 'Solace AI Companion',
    desc: 'Your empathetic AI mental health companion for skin-aware emotional support. Chat or voice-interact for personalized wellness guidance.',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(147,197,253,0.05))',
    iconBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    border: 'rgba(96,165,250,0.15)',
    topBar: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
  },
  {
    icon: '🌍',
    title: 'Environmental Intelligence',
    desc: 'Real-time UV index, AQI, temperature & humidity monitoring with personalized skin risk scores and proactive alerts before flare-up conditions.',
    gradient: 'linear-gradient(135deg, rgba(45,212,191,0.1), rgba(94,234,212,0.05))',
    iconBg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
    border: 'rgba(45,212,191,0.15)',
    topBar: 'linear-gradient(90deg, #2dd4bf, #5eead4)',
  },
  {
    icon: '📊',
    title: 'Progress Visualization',
    desc: 'Upload weekly skin photos and let AI track improvement with before/after comparisons, trend graphs, and milestone celebrations.',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.1), rgba(253,164,175,0.05))',
    iconBg: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
    border: 'rgba(251,113,133,0.15)',
    topBar: 'linear-gradient(90deg, #fb7185, #fda4af)',
  },
  {
    icon: '💡',
    title: 'Personalized AI Insights',
    desc: 'Combines skin data, mood history, UV exposure and weather patterns to generate actionable, holistic health intelligence tailored to you.',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(252,211,77,0.05))',
    iconBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: 'rgba(245,158,11,0.15)',
    topBar: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
  },
];

const STEPS = [
  { num: '01', icon: '📸', title: 'Capture & Analyze', desc: 'Take or upload a photo of your skin. Our DINOv2 Vision Transformer analyzes it in under 3 seconds — detecting conditions with clinical precision.' },
  { num: '02', icon: '🗓️', title: 'Track Everything', desc: 'Log daily mood, monitor your environment, and upload weekly photos. All data streams into your personal AI health intelligence dashboard.' },
  { num: '03', icon: '✨', title: 'Get AI Insights', desc: 'Receive personalized insights connecting skin health, emotional wellbeing, and environment — a complete holistic view of your skin journey.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', condition: 'Eczema patient, 3 years', stars: 5, text: 'SkinVeda changed how I manage my eczema. The stress correlation insights helped me realize flare-ups were tied directly to work anxiety. The Solace AI feels genuinely empathetic — like talking to a caring friend.' },
  { name: 'Rahul M.', condition: 'Psoriasis patient, 7 years', stars: 5, text: 'The UV monitoring is a game changer for my psoriasis. I now get alerts before high-risk days and the weekly progress tracker keeps me motivated. Finally an app that understands the whole picture.' },
  { name: 'Aisha K.', condition: 'Vitiligo patient, 2 years', stars: 5, text: 'The AI diagnosis was surprisingly accurate — matched exactly what my dermatologist confirmed. Mood tracking helped me see how anxiety was worsening my condition. Truly holistic, truly innovative.' },
];

const SKIN_METRICS = [
  { label: 'Hydration',  value: 82, bar: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', text: '82%' },
  { label: 'Elasticity', value: 74, bar: 'linear-gradient(90deg, #ec4899, #f472b6)', text: '74%' },
  { label: 'Clarity',    value: 91, bar: 'linear-gradient(90deg, #60a5fa, #93c5fd)', text: '91%' },
  { label: 'Sensitivity', value: 43, bar: 'linear-gradient(90deg, #f59e0b, #fcd34d)', text: '43%' },
];

const REC_CARDS = [
  { icon: '💧', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', title: 'Hyaluronic Acid Serum', desc: 'Boost skin hydration with 0.1% HA. Apply morning & night after cleansing.', tag: 'High Priority', tagBg: 'rgba(139,92,246,0.1)', tagColor: '#7c3aed' },
  { icon: '☀️', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', title: 'SPF 50+ Mineral Sunscreen', desc: 'Your UV sensitivity score is 8.2/10. Daily mineral SPF is critical for you.', tag: 'Critical', tagBg: 'rgba(251,113,133,0.1)', tagColor: '#f43f5e' },
  { icon: '🌿', bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', title: 'Centella Asiatica Toner', desc: 'Detected eczema markers. Centella calms inflammation and strengthens the barrier.', tag: 'Recommended', tagBg: 'rgba(45,212,191,0.1)', tagColor: '#0d9488' },
  { icon: '🍃', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', title: 'Evening Ceramide Cream', desc: 'Lock in moisture overnight. Your skin barrier metrics show dryness after 8 PM.', tag: 'AI Insight', tagBg: 'rgba(236,72,153,0.1)', tagColor: '#db2777' },
];

/* ─── Particle Component ───────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    left: Math.random() * 100,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 10,
    drift: (Math.random() - 0.5) * 120,
    color: ['rgba(167,139,250,0.5)', 'rgba(244,114,182,0.5)', 'rgba(96,165,250,0.4)', 'rgba(251,113,133,0.4)'][Math.floor(Math.random() * 4)],
  }));
  return (
    <div className="lp-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="lp-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-20px',
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated Metric Bar ──────────────────────────────────────── */
function MetricBar({ label, value, bar, text, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setWidth(value), delay); obs.disconnect(); }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, delay]);
  return (
    <div className="lp-skin-metric" ref={ref}>
      <span className="lp-metric-label">{label}</span>
      <div className="lp-metric-bar-wrap">
        <div className="lp-metric-bar" style={{ width: `${width}%`, background: bar, transition: `width 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }} />
      </div>
      <span className="lp-metric-value">{text}</span>
    </div>
  );
}

/* ─── Scroll-Triggered Section ─────────────────────────────────── */
function FadeSection({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} ${visible ? 'lp-animate-fade-up' : ''}`}
      style={{ opacity: visible ? undefined : 0 }}>
      {children}
    </div>
  );
}

/* ─── Main Landing Component ───────────────────────────────────── */
export default function Landing() {
  const { navigate } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="lp-root">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`} role="navigation">
        <div className="lp-nav-logo">
          <div className="lp-nav-logo-icon">🌿</div>
          <span className="lp-nav-logo-text">
            Skin<span>Veda</span>.ai
          </span>
        </div>
        <div className="lp-nav-links">
          {['Features', 'How It Works', 'Results', 'Stories'].map((item, i) => (
            <a key={i} className="lp-nav-link" href={`#${item.toLowerCase().replace(/ /g, '-')}`}>
              {item}
            </a>
          ))}
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn lp-btn-ghost" onClick={() => navigate('login')}>Sign In</button>
          <button className="lp-btn lp-btn-primary" onClick={() => navigate('signup')}>Get Started Free →</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="lp-hero" id="hero">
        {/* Ambient orbs */}
        <div className="lp-hero-orb lp-hero-orb-1" aria-hidden="true" />
        <div className="lp-hero-orb lp-hero-orb-2" aria-hidden="true" />
        <div className="lp-hero-orb lp-hero-orb-3" aria-hidden="true" />
        <div className="lp-hero-orb lp-hero-orb-4" aria-hidden="true" />
        <div className="lp-hero-grid" aria-hidden="true" />
        <Particles />

        <div className="lp-hero-inner">
          {/* Left Content */}
          <div className="lp-hero-left">
            <div className="lp-hero-badge lp-animate-fade-up">
              <span className="lp-badge-dot" />
              <span>Powered by DINOv2 Vision AI · 98.2% Accuracy</span>
            </div>

            <h1 className="lp-hero-title lp-animate-fade-up lp-delay-1">
              AI-Powered
              <span className="lp-gradient-text">Personalized</span>
              Skincare Analysis
            </h1>

            <p className="lp-hero-subtitle lp-animate-fade-up lp-delay-2">
              The first platform connecting your skin conditions, emotional health, and environment into one intelligent ecosystem — built for eczema, psoriasis, vitiligo, acne & dermatitis.
            </p>

            <div className="lp-hero-actions lp-animate-fade-up lp-delay-3">
              <button
                id="hero-cta-primary"
                className="lp-btn lp-btn-primary lp-btn-xl"
                onClick={() => navigate('signup')}
              >
                🚀 Start Free Analysis
              </button>
              <button
                id="hero-cta-secondary"
                className="lp-btn lp-btn-outline lp-btn-lg"
                onClick={() => navigate('login')}
              >
                Sign In →
              </button>
            </div>

            <div className="lp-hero-trust lp-animate-fade-up lp-delay-4">
              {[
                { icon: '🔒', strong: 'HIPAA Compliant', sub: 'Secure & Private' },
                { icon: '🔬', strong: 'DINOv2 AI', sub: 'Research-Grade' },
                { icon: '⚡', strong: '< 3 Seconds', sub: 'Instant Results' },
              ].map((t, i) => (
                <div key={i} className="lp-hero-trust-item">
                  <div className="lp-trust-icon">{t.icon}</div>
                  <div className="lp-trust-text">
                    <strong>{t.strong}</strong>
                    {t.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D Visual */}
          <div className="lp-hero-right lp-animate-scale-in lp-delay-2">
            <div className="lp-hero-visual">
              {/* Floating mini cards */}
              <div className="lp-float-card lp-float-card-1">
                <div className="lp-float-card-icon" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>🔬</div>
                <div>
                  <div className="lp-float-card-label">AI Confidence</div>
                  <div className="lp-float-card-value lp-gradient-text-static">98.2%</div>
                </div>
              </div>

              <div className="lp-float-card lp-float-card-2">
                <div className="lp-float-card-icon" style={{ background: 'linear-gradient(135deg, #ccfbf1, #a7f3d0)' }}>✅</div>
                <div>
                  <div className="lp-float-card-label">Skin Score</div>
                  <div className="lp-float-card-value" style={{ color: '#0d9488' }}>Excellent</div>
                </div>
              </div>

              <div className="lp-float-card lp-float-card-3">
                <div className="lp-float-card-icon" style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>💊</div>
                <div>
                  <div className="lp-float-card-label">Routine Updated</div>
                  <div className="lp-float-card-value" style={{ color: '#db2777' }}>4 Products</div>
                </div>
              </div>

              {/* 3D Sphere */}
              <div className="lp-hero-3d-sphere">
                <div className="lp-sphere-inner">
                  <div className="lp-sphere-ring lp-sphere-ring-1" />
                  <div className="lp-sphere-ring lp-sphere-ring-2" />
                  <div className="lp-sphere-ring lp-sphere-ring-3" />
                  <div className="lp-sphere-core">
                    <span className="lp-sphere-icon">🌸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <FadeSection key={i} className={`lp-stat-item lp-delay-${i + 1}`}>
              <div className="lp-stat-value lp-gradient-text-static">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </FadeSection>
          ))}
        </div>
      </div>

      {/* ── AI Skin Analysis Preview ─────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <FadeSection>
            <div className="lp-section-header">
              <div className="lp-section-chip">✦ AI Analysis</div>
              <h2 className="lp-section-title">
                See your skin like<br />
                <span className="lp-gradient-text-static">never before</span>
              </h2>
              <p className="lp-section-desc">
                Real-time AI analysis delivers clinical-grade skin insights in seconds. No guesswork, no waiting — just intelligent, personalized data.
              </p>
            </div>
          </FadeSection>

          <div className="lp-analysis-section">
            {/* Analysis Card */}
            <FadeSection className="lp-animate-slide-right">
              <div className="lp-analysis-card">
                {/* Card header */}
                <div className="lp-analysis-header">
                  <div className="lp-analysis-avatar">🌸</div>
                  <div>
                    <div className="lp-analysis-title">AI Skin Analysis</div>
                    <div className="lp-analysis-sub">Analyzing skin health profile…</div>
                  </div>
                  <div className="lp-analysis-badge">✓ Complete</div>
                </div>

                {/* Face scan visual */}
                <div className="lp-scan-visual">
                  <div className="lp-scan-grid" />
                  <div className="lp-scan-face">😊</div>
                  <div className="lp-scan-line" />
                  <div className="lp-scan-corners" />
                </div>

                {/* Metrics */}
                <div className="lp-skin-metrics">
                  {SKIN_METRICS.map((m, i) => (
                    <MetricBar key={i} {...m} delay={i * 200} />
                  ))}
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {[
                    { label: '🌟 Healthy Glow', bg: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
                    { label: '💧 Well Hydrated', bg: 'rgba(96,165,250,0.08)', color: '#2563eb', border: 'rgba(96,165,250,0.2)' },
                    { label: '✨ Clear Pores', bg: 'rgba(45,212,191,0.08)', color: '#0d9488', border: 'rgba(45,212,191,0.2)' },
                  ].map((chip, i) => (
                    <div key={i} className="lp-insight-chip" style={{ background: chip.bg, color: chip.color, border: `1px solid ${chip.border}` }}>
                      {chip.label}
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            {/* Text Content */}
            <FadeSection className="lp-analysis-text lp-animate-slide-left">
              <div className="lp-section-chip" style={{ marginBottom: 16 }}>🔬 Clinical Grade AI</div>
              <h2>
                Instant skin health
                <br />
                <span className="lp-gradient-text-static">diagnosis & scoring</span>
              </h2>
              <p>
                Our fine-tuned DINOv2 Vision Transformer analyzes texture, tone, hydration, and condition markers from a single photo — delivering a comprehensive skin health profile in under 3 seconds.
              </p>
              <ul className="lp-feature-list">
                {[
                  'Detects 5 chronic skin conditions with 98.2% accuracy',
                  'Real-time hydration, elasticity & clarity scoring',
                  'Personalized treatment recommendation engine',
                  'Week-over-week improvement tracking & analytics',
                  'HIPAA-compliant — your data is always private',
                ].map((item, i) => (
                  <li key={i}>
                    <span className="lp-feature-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate('signup')} id="analysis-cta">
                Try AI Analysis Free →
              </button>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Before / After Insights ──────────────────────────────── */}
      <section className="lp-section lp-section-alt" id="results">
        <div className="lp-section-inner">
          <FadeSection>
            <div className="lp-section-header">
              <div className="lp-section-chip">📈 Real Results</div>
              <h2 className="lp-section-title">
                Track your skin's<br />
                <span className="lp-gradient-text-static">transformation journey</span>
              </h2>
            </div>
          </FadeSection>

          <div className="lp-before-after">
            {/* Before/After Cards */}
            <FadeSection className="lp-ba-visual">
              <div style={{ position: 'relative' }}>
                <div className="lp-ba-connector-line" />
                <div className="lp-ba-cards">
                  {/* Before */}
                  <FadeSection className="lp-ba-card lp-ba-card-before">
                    <div className="lp-ba-tag lp-ba-tag-before">Before · Week 0</div>
                    <span className="lp-ba-face">😔</span>
                    <div className="lp-ba-score" style={{ color: '#f43f5e' }}>42</div>
                    <div className="lp-ba-score-label">Skin Health Score</div>
                    <div className="lp-ba-mini-bars">
                      {[
                        { label: 'Hydration', v: 35, c: '#fca5a5' },
                        { label: 'Clarity',   v: 28, c: '#fca5a5' },
                        { label: 'Barrier',   v: 42, c: '#fca5a5' },
                      ].map((b, i) => (
                        <div key={i} className="lp-ba-mini-bar-row">
                          <span className="lp-ba-mini-label">{b.label}</span>
                          <div className="lp-ba-mini-track">
                            <div className="lp-ba-mini-fill" style={{ width: `${b.v}%`, background: b.c }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </FadeSection>

                  {/* After */}
                  <FadeSection className="lp-ba-card lp-ba-card-after lp-delay-2">
                    <div className="lp-ba-tag lp-ba-tag-after">After · Week 8</div>
                    <span className="lp-ba-face">🌟</span>
                    <div className="lp-ba-score" style={{ color: '#7c3aed' }}>89</div>
                    <div className="lp-ba-score-label">Skin Health Score</div>
                    <div className="lp-ba-mini-bars">
                      {[
                        { label: 'Hydration', v: 87, c: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' },
                        { label: 'Clarity',   v: 91, c: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' },
                        { label: 'Barrier',   v: 82, c: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' },
                      ].map((b, i) => (
                        <div key={i} className="lp-ba-mini-bar-row">
                          <span className="lp-ba-mini-label">{b.label}</span>
                          <div className="lp-ba-mini-track">
                            <div className="lp-ba-mini-fill" style={{ width: `${b.v}%`, background: b.c }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </FadeSection>
                </div>

                {/* Connector badge */}
                <div className="lp-ba-connector">+113%</div>
              </div>
            </FadeSection>

            {/* Text */}
            <FadeSection className="lp-ba-text">
              <div className="lp-section-chip" style={{ marginBottom: 16 }}>📊 8-Week Transformation</div>
              <h2>
                See measurable results
                <br />
                <span className="lp-gradient-text-static">in just 8 weeks</span>
              </h2>
              <p>
                Users who follow SkinVeda's AI-personalized routines see an average 113% improvement in their skin health score within 8 weeks. Track every milestone with visual before/after comparisons.
              </p>
              <div className="lp-improvement-tags">
                {['🔥 Reduced Inflammation', '💧 +52% Hydration', '🌟 Brighter Tone', '🛡️ Stronger Barrier', '😴 Better Sleep → Better Skin', '🌱 Microbiome Balanced'].map((tag, i) => (
                  <span key={i} className="lp-improve-tag">{tag}</span>
                ))}
              </div>
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate('signup')} id="ba-cta">
                Start Your Journey →
              </button>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section className="lp-section" id="how-it-works">
        <div className="lp-section-inner">
          <FadeSection>
            <div className="lp-section-header">
              <div className="lp-section-chip">⚡ Platform</div>
              <h2 className="lp-section-title">
                Everything your skin<br />
                <span className="lp-gradient-text-static">health needs</span>
              </h2>
              <p className="lp-section-desc">
                A complete AI ecosystem combining diagnosis, mental wellness, and environmental intelligence — designed specifically for chronic skin conditions.
              </p>
            </div>
          </FadeSection>

          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <FadeSection key={i} className={`lp-feature-card lp-delay-${(i % 3) + 1}`}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.topBar, borderRadius: '24px 24px 0 0', opacity: 0.8 }} />
                <div className="lp-feat-icon-wrap" style={{ background: f.iconBg }}>
                  <span>{f.icon}</span>
                </div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personalized Recommendations ─────────────────────────── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-rec-section">
            <FadeSection className="lp-rec-text">
              <div className="lp-section-chip" style={{ marginBottom: 16 }}>💊 Smart Recommendations</div>
              <h2>
                Your personal
                <br />
                <span className="lp-gradient-text-static">AI skincare advisor</span>
              </h2>
              <p>
                SkinVeda's recommendation engine analyzes your unique skin profile, condition history, mood patterns, and environmental exposure to suggest the exact products and habits your skin needs.
              </p>
              <ul className="lp-feature-list" style={{ marginBottom: 36 }}>
                {[
                  'Personalized product recommendations ranked by efficacy',
                  'Morning & evening routine builder with reminders',
                  'Ingredient conflict detection & allergy alerts',
                  'Budget-aware product alternatives suggested by AI',
                ].map((item, i) => (
                  <li key={i}>
                    <span className="lp-feature-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate('signup')} id="rec-cta">
                Get My Skincare Plan →
              </button>
            </FadeSection>

            <FadeSection className="lp-rec-cards">
              {REC_CARDS.map((r, i) => (
                <div key={i} className={`lp-rec-card lp-delay-${i + 1}`}>
                  <div className="lp-rec-icon" style={{ background: r.bg }}>{r.icon}</div>
                  <div className="lp-rec-content">
                    <div className="lp-rec-title">{r.title}</div>
                    <div className="lp-rec-desc">{r.desc}</div>
                  </div>
                  <div className="lp-rec-tag" style={{ background: r.tagBg, color: r.tagColor, border: `1px solid ${r.tagBg.replace('0.1', '0.2')}` }}>
                    {r.tag}
                  </div>
                </div>
              ))}
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="lp-section" id="stories">
        <div className="lp-section-inner">
          <FadeSection>
            <div className="lp-section-header">
              <div className="lp-section-chip">🗺️ How It Works</div>
              <h2 className="lp-section-title">
                Three steps to
                <br />
                <span className="lp-gradient-text-static">better skin health</span>
              </h2>
            </div>
          </FadeSection>

          <div className="lp-steps-grid">
            <div className="lp-steps-connector" />
            {STEPS.map((s, i) => (
              <FadeSection key={i} className={`lp-step-card lp-delay-${i + 2}`}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon-wrap">{s.icon}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <FadeSection>
            <div className="lp-section-header">
              <div className="lp-section-chip">❤️ Patient Stories</div>
              <h2 className="lp-section-title">
                Real people,
                <br />
                <span className="lp-gradient-text-static">real transformations</span>
              </h2>
            </div>
          </FadeSection>

          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeSection key={i} className={`lp-testimonial-card lp-delay-${i + 1}`}>
                <div className="lp-testimonial-quote">"</div>
                <div className="lp-testimonial-stars">{'★'.repeat(t.stars)}</div>
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-cond">{t.condition}</div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-orb-1" aria-hidden="true" />
        <div className="lp-cta-orb-2" aria-hidden="true" />
        <FadeSection className="lp-cta-inner">
          <div className="lp-cta-chip">
            <span>🌸</span>
            Start Your Journey Today
          </div>
          <h2>
            Your skin deserves<br />
            <span className="lp-gradient-text">intelligent care</span>
          </h2>
          <p>
            Join thousands managing chronic skin conditions smarter with AI-powered analysis, personalized routines, and holistic wellness insights.
          </p>
          <div className="lp-cta-actions">
            <button
              id="cta-primary-main"
              className="lp-btn-cta-primary"
              onClick={() => navigate('signup')}
            >
              🚀 Get Started Free
            </button>
            <button
              id="cta-secondary-main"
              className="lp-btn-cta-outline"
              onClick={() => navigate('login')}
            >
              Sign In to Dashboard →
            </button>
          </div>
          <div className="lp-cta-disclaimer">
            ⚠️ Medical Disclaimer: SkinVeda.ai provides AI-powered informational analysis only. This platform does not replace professional medical diagnosis, advice, or treatment. Always consult a qualified dermatologist for medical concerns.
          </div>
        </FadeSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            {/* Brand */}
            <div>
              <div className="lp-nav-logo" style={{ marginBottom: 0 }}>
                <div className="lp-nav-logo-icon">🌿</div>
                <span className="lp-nav-logo-text">Skin<span>Veda</span>.ai</span>
              </div>
              <p className="lp-footer-brand-desc">
                AI-powered skin disease management combining diagnosis, mental health, mood tracking, and environmental intelligence for chronic skin conditions.
              </p>
              <div className="lp-footer-socials">
                {['🐦', '📸', '💼', '🎥'].map((icon, i) => (
                  <button key={i} className="lp-social-btn" aria-label={`Social ${i}`}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Platform', links: ['AI Diagnosis', 'Mood Tracker', 'Solace AI', 'Progress Tracker', 'Reports & Insights'] },
              { title: 'Conditions', links: ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Dermatitis'] },
              { title: 'Company', links: ['About SkinVeda', 'Privacy Policy', 'Terms of Service', 'Contact Us', 'Research Blog'] },
            ].map((col, i) => (
              <div key={i}>
                <div className="lp-footer-col-title">{col.title}</div>
                <div className="lp-footer-links">
                  {col.links.map(link => (
                    <a key={link} className="lp-footer-link" href="#" onClick={e => e.preventDefault()}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lp-footer-bottom">
            <div className="lp-footer-copy">© 2025 SkinVeda.ai. All rights reserved. Built for better skin & mental health.</div>
            <div className="lp-footer-badges">
              <span className="lp-footer-badge">🔬 DINOv2 AI</span>
              <span className="lp-footer-badge">🔒 HIPAA Compliant</span>
              <span className="lp-footer-badge">🌿 v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
