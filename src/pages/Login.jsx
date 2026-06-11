import { useState } from 'react';
import { useApp } from '../App';

export default function Login() {
  const { login, navigate, showToast } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    // Demo login — any valid email/password
    login({
      name: form.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email: form.email,
      skinCondition: 'Eczema',
      joinedAt: new Date().toISOString(),
      streak: 7,
    });
    showToast('Welcome back! 👋', 'success');
    setLoading(false);
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login({ name: 'Alex Johnson', email: 'alex@skinveda.ai', skinCondition: 'Eczema', streak: 12, joinedAt: new Date(Date.now() - 30 * 864e5).toISOString() });
    showToast('Demo mode activated! 🎉', 'success');
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,217,166,0.1)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 440 }} className="animate-fade-in">
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 4s ease-in-out infinite' }}>🩺</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            Your skin health,<br /><span className="gradient-text">reimagined with AI</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40 }}>
            Combining AI skin diagnosis, mental health support, and environmental intelligence for holistic care.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🔬', text: 'AI-powered skin disease detection' },
              { icon: '💭', text: 'Mood & stress correlation tracking' },
              { icon: '🌍', text: 'Real-time UV & environment alerts' },
              { icon: '🤖', text: 'Solace AI mental health companion' },
            ].map((f, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1 + 0.3}s`, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-right">
          <div style={{ marginBottom: 32, cursor: 'pointer' }} onClick={() => navigate('landing')}>
            <span className="gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>SkinVeda.ai</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your health dashboard</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <span style={{ fontSize: 12, color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }} disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">or</span><div className="auth-divider-line" /></div>

          <button id="demo-login" className="btn btn-secondary" style={{ width: '100%', padding: '13px', fontSize: 14 }} onClick={demoLogin} disabled={loading}>
            🚀 Try Demo — No Signup Required
          </button>

          <div className="auth-switch">
            Don't have an account? <span onClick={() => navigate('signup')}>Create one free →</span>
          </div>

          <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ⚠️ This application does not replace professional medical diagnosis. Always consult a qualified dermatologist.
          </div>
        </div>
      </div>
    </div>
  );
}
