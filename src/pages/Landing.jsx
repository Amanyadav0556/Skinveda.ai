import { useApp } from '../App';
import { DISEASES } from '../data/mockData';

const FEATURES = [
  { icon: '🔬', gradient: 'linear-gradient(135deg,rgba(0,217,166,0.15),rgba(0,217,166,0.05))', border: 'rgba(0,217,166,0.2)', title: 'AI Skin Diagnosis', desc: 'Upload or capture skin images. Our fine-tuned DINOv2 model analyzes eczema, psoriasis, vitiligo, acne, and dermatitis with 98.2% accuracy.' },
  { icon: '💭', gradient: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05))', border: 'rgba(124,58,237,0.2)', title: 'Mood Tracking', desc: 'Log daily emotions and discover how stress, anxiety, and mood patterns directly affect your skin conditions over time.' },
  { icon: '🤖', gradient: 'linear-gradient(135deg,rgba(244,63,143,0.15),rgba(244,63,143,0.05))', border: 'rgba(244,63,143,0.2)', title: 'Solace AI', desc: 'Your empathetic AI mental health companion. Chat or voice-interact with Solace for personalized skin-condition-aware emotional support.' },
  { icon: '🌍', gradient: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))', border: 'rgba(59,130,246,0.2)', title: 'Environmental Intelligence', desc: 'Real-time UV index, AQI, temperature, and humidity monitoring with personalized skin risk scores and proactive alerts.' },
  { icon: '📊', gradient: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))', border: 'rgba(245,158,11,0.2)', title: 'Weekly Progress Tracker', desc: 'Upload weekly skin photos and let AI track your improvement with before/after comparisons and trend analysis.' },
  { icon: '💡', gradient: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05))', border: 'rgba(34,197,94,0.2)', title: 'Personalized AI Insights', desc: 'Combine skin data, mood history, UV exposure, and weather patterns to generate actionable, intelligent health insights.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', condition: 'Eczema patient, 3 years', stars: 5, text: '"SkinVeda.ai changed how I manage my eczema. The stress correlation insights helped me realize my flare-ups were directly tied to work anxiety. The Solace AI feels genuinely empathetic."' },
  { name: 'Rahul M.', condition: 'Psoriasis patient, 7 years', stars: 5, text: '"The UV monitoring feature is a game changer for my psoriasis. I get alerts before high-risk days and the weekly progress tracker keeps me motivated. Finally, an app that understands the whole picture."' },
  { name: 'Aisha K.', condition: 'Vitiligo patient, 2 years', stars: 5, text: '"The AI diagnosis was surprisingly accurate — matched exactly what my dermatologist told me. The mood tracking helped me see that my anxiety was worsening my condition. Truly holistic healthcare."' },
];

const STEPS = [
  { num: '01', icon: '📸', title: 'Upload & Analyze', desc: 'Take a photo or upload an image of your skin. Our AI analyzes it in seconds using DINOv2 Vision Transformer technology.' },
  { num: '02', icon: '📊', title: 'Track Everything', desc: 'Log your daily mood, monitor environmental conditions, and upload weekly progress photos. All data feeds into your personal health intelligence.' },
  { num: '03', icon: '💡', title: 'Get AI Insights', desc: 'Receive personalized insights connecting your skin health, emotional wellbeing, and environment — all in one intelligent dashboard.' },
];

export default function Landing() {
  const { navigate } = useApp();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo gradient-text">SkinVeda.ai</div>
        <div className="landing-nav-links">
          <a className="landing-nav-link" href="#features">Features</a>
          <a className="landing-nav-link" href="#diseases">Conditions</a>
          <a className="landing-nav-link" href="#howitworks">How it works</a>
          <a className="landing-nav-link" href="#testimonials">Stories</a>
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('signup')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content animate-fade-in">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Powered by DINOv2 Vision Transformer · 98.2% Accuracy
          </div>

          <h1 className="hero-title">
            AI-Powered<br />
            <span className="gradient-text">Skin Health</span> &<br />
            Mental Wellness
          </h1>

          <p className="hero-subtitle">
            The first platform that connects your skin conditions, emotional health, and environment into one intelligent ecosystem — built for eczema, psoriasis, vitiligo, acne & dermatitis.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-xl" onClick={() => navigate('signup')} style={{ minWidth: 200, boxShadow: '0 12px 50px rgba(0,217,166,0.35)' }}>
              🚀 Start Free Analysis
            </button>
            <button className="btn btn-secondary btn-xl" onClick={() => navigate('login')}>
              Sign In →
            </button>
          </div>

          <div className="disclaimer-text" style={{ maxWidth: 600, margin: '0 auto 32px', textAlign: 'left' }}>
            ⚠️ <strong>Medical Disclaimer:</strong> SkinVeda.ai provides AI-powered informational analysis only. This application does not replace professional medical diagnosis, advice, or treatment. Always consult a qualified dermatologist for medical concerns.
          </div>

          <div className="hero-stats">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '98.2%', label: 'AI Accuracy' },
              { value: '5', label: 'Skin Conditions' },
              { value: 'Real-time', label: 'Env Monitoring' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="hero-stat-value gradient-text">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-container" style={{ background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">Platform Features</div>
          <h2 className="section-heading">Everything your skin health needs</h2>
          <p className="section-text" style={{ margin: '0 auto' }}>A complete ecosystem combining AI, mental wellness, and environmental intelligence — built specifically for chronic skin conditions.</p>
        </div>
        <div className="grid-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, borderColor: f.border, background: f.gradient }}>
              <div className="feature-icon-wrap" style={{ background: f.gradient, border: `1px solid ${f.border}` }}>
                <span style={{ fontSize: 28 }}>{f.icon}</span>
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Diseases */}
      <section id="diseases" className="section-container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">Supported Conditions</div>
          <h2 className="section-heading">Specialized for 5 chronic skin conditions</h2>
        </div>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {DISEASES.map((d, i) => (
            <div key={d.id} className="disease-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: d.gradient, borderRadius: '16px 16px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: d.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{d.emoji}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.subtitle}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>{d.description.slice(0, 120)}...</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {d.triggers.slice(0, 3).map(t => (
                  <span key={t} className="badge badge-gray" style={{ fontSize: 10 }}>⚡ {t}</span>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: d.color, fontWeight: 600 }}>👥 {d.prevalence}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="howitworks" className="section-container" style={{ background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">How It Works</div>
          <h2 className="section-heading">Three simple steps to better skin health</h2>
        </div>
        <div className="grid-3">
          {STEPS.map((s, i) => (
            <div key={i} className="card card-lg animate-slide-up" style={{ animationDelay: `${i * 0.15}s`, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 48, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">Patient Stories</div>
          <h2 className="section-heading">Real people, real results</h2>
        </div>
        <div className="grid-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card animate-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>{t.name[0]}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-condition">{t.condition}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-container" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,217,166,0.1), rgba(124,58,237,0.1))',
          border: '1px solid rgba(0,217,166,0.2)', borderRadius: 32, padding: '80px 60px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,217,166,0.08)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', filter: 'blur(60px)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>Start Today</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
              Your skin health journey<br />starts <span className="gradient-text">right now</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
              Join thousands managing their chronic skin conditions smarter with AI.
            </p>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('signup')} style={{ boxShadow: '0 16px 60px rgba(0,217,166,0.4)', minWidth: 240 }}>
              🚀 Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name gradient-text">SkinVeda.ai</div>
            <div className="footer-brand-desc">AI-powered skin disease management platform combining diagnosis, mental health, mood tracking, and environmental intelligence.</div>
          </div>
          {[
            { title: 'Platform', links: ['AI Diagnosis', 'Mood Tracker', 'Solace AI', 'Progress Tracker', 'Reports'] },
            { title: 'Conditions', links: ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne', 'Dermatitis'] },
            { title: 'Company', links: ['About', 'Privacy Policy', 'Terms of Service', 'Contact', 'Blog'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="footer-col-title">{col.title}</div>
              <div className="footer-links">
                {col.links.map(l => <a key={l} className="footer-link" href="#">{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 SkinVeda.ai. All rights reserved. Built for better skin & mental health.</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔬 Powered by DINOv2 AI</div>
        </div>
      </footer>
    </div>
  );
}
