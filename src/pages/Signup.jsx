import { useState } from 'react';
import { useApp } from '../App';

const SKIN_CONDITIONS = ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Contact Dermatitis', 'Other / Not Sure'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

const STEPS = [
  { label: 'Account', desc: 'Create your credentials' },
  { label: 'Profile', desc: 'Tell us about yourself' },
  { label: 'Skin Info', desc: 'Your skin health history' },
];

export default function Signup() {
  const { login, navigate, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', location: '',
    skinCondition: '', skinType: '', diagnosedBefore: false,
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.email) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'Minimum 8 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    } else if (step === 1) {
      if (!form.age) e.age = 'Age is required';
      else if (form.age < 10 || form.age > 100) e.age = 'Enter valid age';
      if (!form.gender) e.gender = 'Please select gender';
    }
    return e;
  };

  const nextStep = () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    login({
      name: form.name,
      email: form.email,
      age: form.age,
      gender: form.gender,
      location: form.location,
      skinCondition: form.skinCondition || 'Not specified',
      skinType: form.skinType || 'Not specified',
      joinedAt: new Date().toISOString(),
      streak: 1,
    });
    showToast(`Welcome to SkinVeda.ai, ${form.name.split(' ')[0]}! 🎉`, 'success');
  };

  const progress = ((step) / STEPS.length) * 100;

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(0,217,166,0.1)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 420 }} className="animate-fade-in">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
            Join <span className="gradient-text">10,000+</span> people managing skin conditions smarter
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
            Get personalized AI insights connecting your skin health, mood, and environment.
          </p>

          {/* Steps Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: i <= step ? 'rgba(0,217,166,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i === step ? 'rgba(0,217,166,0.3)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.3s' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < step ? 'var(--accent-teal)' : i === step ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-right">
          <div style={{ marginBottom: 28, cursor: 'pointer' }} onClick={() => navigate('landing')}>
            <span className="gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>SkinVeda.ai</span>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Step {step + 1} of {STEPS.length} — {STEPS[step].label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{Math.round(((step) / STEPS.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((step) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          {/* Step 0 — Account */}
          {step === 0 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title" style={{ fontSize: 24 }}>Create your account</h1>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="signup-name" type="text" className="form-input" placeholder="Dr. Alex Johnson" value={form.name} onChange={e => update('name', e.target.value)} />
                {errors.name && <div className="form-error">⚠ {errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="signup-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="signup-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>{showPass ? '🙈' : '👁'}</button>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input id="signup-confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={nextStep}>Continue →</button>
            </div>
          )}

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title" style={{ fontSize: 24 }}>Tell us about yourself</h1>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input id="signup-age" type="number" className="form-input" placeholder="25" min="10" max="100" value={form.age} onChange={e => update('age', e.target.value)} />
                  {errors.age && <div className="form-error">⚠ {errors.age}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <div className="form-error">⚠ {errors.gender}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">City / Location (for UV & weather alerts)</label>
                <input type="text" className="form-input" placeholder="e.g. Mumbai, India" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: 13 }} onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: 13 }} onClick={nextStep}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Skin Info */}
          {step === 2 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title" style={{ fontSize: 24 }}>Your skin health</h1>
              <div className="form-group">
                <label className="form-label">Primary Skin Condition (if known)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {SKIN_CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => update('skinCondition', c)} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${form.skinCondition === c ? 'rgba(0,217,166,0.5)' : 'rgba(255,255,255,0.08)'}`, background: form.skinCondition === c ? 'rgba(0,217,166,0.1)' : 'rgba(255,255,255,0.03)', color: form.skinCondition === c ? 'var(--accent-teal)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Skin Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SKIN_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => update('skinType', t)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${form.skinType === t ? 'rgba(0,217,166,0.5)' : 'rgba(255,255,255,0.08)'}`, background: form.skinType === t ? 'rgba(0,217,166,0.1)' : 'transparent', color: form.skinType === t ? 'var(--accent-teal)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: 13 }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: 13 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : '🚀 Create Account'}
                </button>
              </div>
              <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                ⚠️ Medical disclaimer: AI analysis does not replace professional dermatological advice.
              </div>
            </div>
          )}

          <div className="auth-switch">
            Already have an account? <span onClick={() => navigate('login')}>Sign in →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
