import { useState } from 'react';
import { useApp } from '../App';

const SKIN_CONDITIONS = ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Contact Dermatitis', 'Other / Not Sure'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

const STEPS = [
  { label: 'Account',  desc: 'Create your credentials', icon: '🔐' },
  { label: 'Profile',  desc: 'Tell us about yourself',  icon: '👤' },
  { label: 'Skin Info', desc: 'Your skin health history', icon: '🩺' },
];

export default function Signup() {
  const { login, navigate, showToast } = useApp();
  const [step, setStep]     = useState(0);
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
    await new Promise(r => setTimeout(r, 1400));
    login({
      name: form.name, email: form.email,
      age: form.age, gender: form.gender, location: form.location,
      skinCondition: form.skinCondition || 'Not specified',
      skinType: form.skinType || 'Not specified',
      joinedAt: new Date().toISOString(), streak: 1,
    });
    showToast(`Welcome to SkinVeda.ai, ${form.name.split(' ')[0]}! 🎉`, 'success');
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ position:'absolute', top:-100, right:-80, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,114,182,0.22) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, maxWidth:420 }} className="animate-fade-in">
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'#fff', boxShadow:'0 6px 20px rgba(139,92,246,0.35)' }}>✦</div>
            <span style={{ fontSize:20, fontWeight:800, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>SkinVeda.ai</span>
          </div>

          <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:10, lineHeight:1.2, color:'#111827' }}>
            Join <span className="gradient-text">10,000+</span> people managing skin health smarter
          </h2>
          <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.7, marginBottom:28 }}>
            Get personalized AI insights connecting your skin health, mood, and environment.
          </p>

          {/* Steps Progress */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'12px 14px',
                borderRadius:12,
                background: i <= step ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${i === step ? 'rgba(139,92,246,0.28)' : i < step ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.1)'}`,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
                boxShadow: i === step ? '0 4px 14px rgba(139,92,246,0.1)' : 'none',
              }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%',
                  background: i < step
                    ? 'linear-gradient(135deg,#10B981,#059669)'
                    : i === step
                    ? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
                    : 'rgba(139,92,246,0.08)',
                  border: i >= step ? '1px solid rgba(139,92,246,0.2)' : 'none',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, color: i >= step ? '#8B5CF6' : '#fff',
                  flexShrink:0,
                  boxShadow: i <= step ? '0 3px 10px rgba(139,92,246,0.2)' : 'none',
                }}>
                  {i < step ? '✓' : s.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color: i <= step ? '#111827' : '#9CA3AF' }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>{s.desc}</div>
                </div>
                {i === step && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', animation:'pulse 2s ease-in-out infinite' }} />}
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:10, marginTop:20, flexWrap:'wrap' }}>
            {['🔒 HIPAA Safe', '🌐 256-bit SSL', '✦ AI Powered'].map(b => (
              <span key={b} style={{ fontSize:10, fontWeight:600, color:'#6B7280', background:'rgba(255,255,255,0.7)', border:'1px solid rgba(139,92,246,0.12)', borderRadius:20, padding:'4px 10px', backdropFilter:'blur(6px)' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-right">
          {/* Brand */}
          <div style={{ marginBottom:20, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }} onClick={() => navigate('landing')}>
            <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:900 }}>✦</div>
            <span style={{ fontSize:15, fontWeight:800, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>SkinVeda.ai</span>
          </div>

          {/* Progress */}
          <div style={{ marginBottom:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Step {step+1} of {STEPS.length} — {STEPS[step].label}</span>
              <span style={{ fontSize:12, color:'#9CA3AF' }}>{Math.round((step/STEPS.length)*100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${(step/STEPS.length)*100}%` }} />
            </div>
          </div>

          {/* Step 0 — Account */}
          {step === 0 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title">Create your account</h1>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="signup-name" type="text" className="form-input" placeholder="Alex Johnson"
                  value={form.name} onChange={e => update('name', e.target.value)} />
                {errors.name && <div className="form-error">⚠ {errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="signup-email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position:'relative' }}>
                  <input id="signup-password" type={showPass ? 'text' : 'password'} className="form-input"
                    placeholder="Min. 8 characters" value={form.password}
                    onChange={e => update('password', e.target.value)} style={{ paddingRight:44 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9CA3AF', fontSize:15, cursor:'pointer' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input id="signup-confirm" type="password" className="form-input" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
              </div>
              <button className="btn btn-primary btn-lg" style={{ width:'100%' }} onClick={nextStep}>Continue →</button>
            </div>
          )}

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title">Tell us about yourself</h1>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input id="signup-age" type="number" className="form-input" placeholder="25" min="10" max="100"
                    value={form.age} onChange={e => update('age', e.target.value)} />
                  {errors.age && <div className="form-error">⚠ {errors.age}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option>
                    <option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                  {errors.gender && <div className="form-error">⚠ {errors.gender}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">City / Location (for UV & weather alerts)</label>
                <input type="text" className="form-input" placeholder="e.g. Mumbai, India"
                  value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-secondary" style={{ flex:1, padding:'11px 0' }} onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex:2, padding:'11px 0' }} onClick={nextStep}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Skin Info */}
          {step === 2 && (
            <div className="auth-form animate-fade-in">
              <h1 className="auth-title">Your skin health</h1>
              <div className="form-group">
                <label className="form-label">Primary Skin Condition (if known)</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:7 }}>
                  {SKIN_CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => update('skinCondition', c)} style={{
                      padding:'9px 10px', borderRadius:10, textAlign:'left',
                      border:`1.5px solid ${form.skinCondition === c ? 'rgba(139,92,246,0.45)' : 'rgba(139,92,246,0.12)'}`,
                      background: form.skinCondition === c ? 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.06))' : '#fff',
                      color: form.skinCondition === c ? '#7C3AED' : '#6B7280',
                      fontSize:12, fontWeight:600, cursor:'pointer',
                      transition:'all 0.2s',
                      boxShadow: form.skinCondition === c ? '0 3px 10px rgba(139,92,246,0.15)' : 'none',
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Skin Type</label>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {SKIN_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => update('skinType', t)} style={{
                      padding:'7px 14px', borderRadius:20,
                      border:`1.5px solid ${form.skinType === t ? 'rgba(139,92,246,0.45)' : 'rgba(139,92,246,0.12)'}`,
                      background: form.skinType === t ? 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.06))' : '#fff',
                      color: form.skinType === t ? '#7C3AED' : '#6B7280',
                      fontSize:12, fontWeight:600, cursor:'pointer',
                      transition:'all 0.2s',
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-secondary" style={{ flex:1, padding:'11px 0' }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex:2, padding:'11px 0' }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : '🚀 Create Account'}
                </button>
              </div>
              <div style={{ marginTop:8, padding:'9px 12px', borderRadius:10, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', fontSize:11, color:'#6B7280', lineHeight:1.6 }}>
                ⚠️ AI analysis does not replace professional dermatological advice.
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
