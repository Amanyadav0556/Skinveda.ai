import { useEffect, useState } from 'react';
import { useApp } from '../App';
import '../landing.css';
import { Icon, Logo } from '../components/ui';
import { SkinScoreCard, ConcernCard, MetricTile } from '../components/skin';
import { RecommendationExplanation } from '../components/commerce';

const STEPS = [
  { icon: 'scan',   title: 'Scan',                     text: 'Take a clear selfie or upload a photo.' },
  { icon: 'file',   title: 'Understand',               text: 'See visible concerns, explained simply.' },
  { icon: 'list',   title: 'Build your routine',       text: 'Morning and night steps made for your skin.' },
  { icon: 'bag',    title: 'Choose products if you want', text: 'Optional suggestions, with the reason for each.' },
  { icon: 'doctor', title: 'Talk to a dermatologist',  text: 'Professional guidance, whenever you need it.' },
];

const TRUST = [
  { icon: 'shield', title: 'Guidance, not diagnosis', text: 'SkinVeda gives AI-assisted skincare guidance. It never claims to diagnose a medical condition.' },
  { icon: 'lock',   title: 'Privacy-first photos', text: 'Your photos are used only for your analysis, stored privately, and deletable anytime.' },
  { icon: 'spark',  title: 'Explained recommendations', text: 'Every suggestion says why. Sponsored products are always labelled and never ranked by our AI.' },
  { icon: 'doctor', title: 'A dermatologist when needed', text: 'If a concern looks serious or uncertain, we suggest speaking with a qualified dermatologist.' },
];

const EXAMPLE_CONCERNS = [
  { id: 'acne', name: 'Acne-like spots', score: 58, severity: 'moderate', confidence: 0.82, areas: ['Chin', 'Forehead'] },
  { id: 'pigmentation', name: 'Pigmentation & dark spots', score: 38, severity: 'mild', confidence: 0.8, areas: ['Cheeks'] },
];

export default function Landing() {
  const { navigate, user } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scanCta = () => navigate(user ? 'scan' : 'signup');
  const jump = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="lp">
      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-wrap lp-nav-inner">
          <a href="#top" onClick={jump('top')} aria-label="SkinVeda.ai home"><Logo /></a>
          <nav className="lp-links" aria-label="Sections">
            <a href="#how" onClick={jump('how')}>How it works</a>
            <a href="#analysis" onClick={jump('analysis')}>Skin analysis</a>
            <a href="#doctors" onClick={jump('doctors')}>Dermatologists</a>
            <a href="#trust" onClick={jump('trust')}>Safety</a>
          </nav>
          <div className="row" style={{ gap: 8 }}>
            {!user && <button className="btn btn-ghost btn-sm lp-hide-sm" onClick={() => navigate('login')}>Sign in</button>}
            <button className="btn btn-primary btn-sm" onClick={user ? () => navigate('dashboard') : scanCta}>{user ? 'Open app' : 'Scan my skin'}</button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div>
              <span className="pill pill-primary"><Icon name="spark" size={13} /> AI-assisted skincare guidance</span>
              <h1>Understand your skin. <span>Build a better routine.</span></h1>
              <p className="lp-lead">
                AI-assisted skin analysis, personalised skincare guidance, trusted product suggestions,
                and access to dermatologists — all in one place.
              </p>
              <div className="row wrap" style={{ gap: 10 }}>
                <button className="btn btn-primary btn-lg" onClick={scanCta}><Icon name="scan" size={18} /> Scan my skin</button>
                <button className="btn btn-ghost btn-lg" onClick={jump('how')}>Explore how it works</button>
              </div>
              <p className="t-help mt-16">Free to start · Not a medical diagnosis · Buying products is always optional</p>
            </div>
            <div className="lp-hero-visual" aria-label="Example skin report">
              <div className="card lp-preview">
                <div className="row-between"><span className="stat-label">Example report</span><span className="pill">Combination skin</span></div>
                <div className="mt-16"><SkinScoreCard score={78} delta={5} size={88} /></div>
                <p className="mt-16" style={{ fontSize: 15 }}>Your skin appears combination with moderate acne-like spots on the chin and mild pigmentation on the cheeks.</p>
                <div className="stack-sm mt-16">
                  {EXAMPLE_CONCERNS.map((c, i) => <ConcernCard key={c.id} concern={c} primary={i === 0} explain={false} />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="lp-section" id="how">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ui-eyebrow">How SkinVeda works</span>
              <h2>Five simple steps. You stay in control.</h2>
            </div>
            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="lp-step-icon"><Icon name={s.icon} size={20} /></span>
                  <span className="lp-step-num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Analysis */}
        <section className="lp-section lp-alt" id="analysis">
          <div className="lp-wrap lp-feature">
            <div>
              <span className="ui-eyebrow">AI skin analysis</span>
              <h2>See what's visible — explained simply</h2>
              <p>Your scan estimates acne-like spots, pigmentation, dryness, oiliness, redness, texture, dark circles and fine lines, and highlights the 3–5 findings that matter most.</p>
              <ul className="lp-bullets">
                <li><Icon name="check" size={16} stroke={2.4} /> A skin wellness score and a one-line summary</li>
                <li><Icon name="check" size={16} stroke={2.4} /> Where each concern appears on your face</li>
                <li><Icon name="check" size={16} stroke={2.4} /> A confidence level, and a prompt to retake unclear photos</li>
              </ul>
            </div>
            <div className="card">
              <div className="metric-grid lp-metrics">
                <MetricTile metricKey="hydration" value={74} />
                <MetricTile metricKey="oiliness" value={61} />
                <MetricTile metricKey="texture" value={70} />
                <MetricTile metricKey="pigmentation" value={38} />
              </div>
            </div>
          </div>
        </section>

        {/* Routine */}
        <section className="lp-section">
          <div className="lp-wrap lp-feature lp-reverse">
            <div>
              <span className="ui-eyebrow">Personalised routine</span>
              <h2>A routine that explains itself</h2>
              <p>Every morning and night step tells you why it's there, which ingredient to look for, how often to use it and what to be careful about.</p>
              <ul className="lp-bullets">
                <li><Icon name="check" size={16} stroke={2.4} /> Built from your scan and skin type</li>
                <li><Icon name="check" size={16} stroke={2.4} /> Ingredient guidance, not brand pressure</li>
                <li><Icon name="check" size={16} stroke={2.4} /> A daily checklist that syncs across devices</li>
              </ul>
            </div>
            <div className="card">
              <div className="routine-head"><span><Icon name="sun" size={20} /></span><div><h3 className="h-card">Morning routine</h3><small className="muted">Example</small></div></div>
              {[['Cleanse', 'Gentle gel cleanser', 'Salicylic acid (BHA)'], ['Treat', 'Niacinamide serum', 'May help support oil control'], ['Moisturise', 'Light gel moisturiser', 'Hyaluronic acid'], ['Protect', 'Sunscreen SPF 30+', 'Every morning']].map(([s, t, d], i) => (
                <div key={s} className="rstep"><span className="rstep-num">{i + 1}</span><div><div className="rstep-title"><div><small>{s}</small><strong>{t}</strong></div></div><p className="t-small ink2">{d}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="lp-section lp-alt">
          <div className="lp-wrap lp-feature">
            <div>
              <span className="ui-eyebrow">Optional product suggestions</span>
              <h2>Explore products that may suit you</h2>
              <p>Filter by skin type, concern, ingredient, price and brand. Each suggestion tells you why — and you never have to buy anything to follow your routine.</p>
            </div>
            <div className="card stack-sm">
              <span className="product-brand">Example suggestion</span>
              <strong className="h-card">Niacinamide 5% serum</strong>
              <RecommendationExplanation reason="Your scan shows oily skin with visible acne-like spots. It contains niacinamide, which is commonly used to help balance oil and even out the look of skin tone." />
              <span className="t-help">Sponsored products are always labelled and kept separate from these suggestions.</span>
            </div>
          </div>
        </section>

        {/* Doctors */}
        <section className="lp-section" id="doctors">
          <div className="lp-wrap lp-feature lp-reverse">
            <div>
              <span className="ui-eyebrow">Dermatologist consultation</span>
              <h2>Professional advice, when you want it</h2>
              <p>Book a video, chat or clinic consultation with a dermatologist and share your skin report in one tap. If your scan suggests a concern needs expert eyes, we'll say so clearly.</p>
            </div>
            <div className="card">
              <div className="callout callout-warn">
                <Icon name="doctor" size={20} />
                <div><strong>Professional consultation recommended</strong>Our AI assessment may not be sufficient for this concern. Consider speaking with a qualified dermatologist.</div>
              </div>
              <div className="row wrap mt-16" style={{ gap: 8 }}>
                <span className="pill"><Icon name="video" size={13} /> Video</span>
                <span className="pill"><Icon name="chat" size={13} /> Chat</span>
                <span className="pill"><Icon name="home" size={13} /> Clinic</span>
              </div>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="lp-section lp-alt">
          <div className="lp-wrap lp-feature">
            <div>
              <span className="ui-eyebrow">Progress tracking</span>
              <h2>See real change over time</h2>
              <p>Compare Day 1, Day 14 and Day 30 side by side — acne appearance, pigmentation, redness, texture and your overall score. Photos are shown exactly as taken.</p>
            </div>
            <div className="card">
              <table className="compare-table-sm">
                <thead><tr><th>Example</th><th>Day 1</th><th>Day 14</th><th>Day 30</th></tr></thead>
                <tbody>
                  <tr><td>Skin score</td><td>62</td><td>68</td><td className="up">75</td></tr>
                  <tr><td>Acne-like spots</td><td>64</td><td>55</td><td className="up">41</td></tr>
                  <tr><td>Redness</td><td>40</td><td>34</td><td className="up">27</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="lp-section" id="trust">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="ui-eyebrow">Safety & trust</span>
              <h2>Built to be trusted with something personal</h2>
            </div>
            <div className="trust-grid">
              {TRUST.map(t => (
                <div key={t.title} className="trust-item"><span><Icon name={t.icon} size={19} /></span><strong>{t.title}</strong><p>{t.text}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="lp-wrap">
          <div className="lp-cta">
            <div>
              <h2>Ready to understand your skin?</h2>
              <p>Your first scan takes about a minute.</p>
            </div>
            <button className="btn btn-light btn-lg" onClick={scanCta}><Icon name="scan" size={18} /> Scan my skin</button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-row">
            <Logo />
            <nav className="row wrap" style={{ gap: 18 }} aria-label="Footer">
              <button onClick={() => navigate('help')}>Help & safety</button>
              <button onClick={() => navigate('pricing')}>Plans</button>
              <button onClick={() => navigate('login')}>Sign in</button>
            </nav>
          </div>
          <p className="t-help mt-16">© {new Date().getFullYear()} SkinVeda.ai · SkinVeda.ai provides AI-assisted skincare guidance and does not replace professional medical diagnosis.</p>
        </div>
      </footer>
    </div>
  );
}
