import { useState } from 'react';
import { useApp } from '../App';

export default function Login() {
  const { login, navigate, showToast } = useApp();
  const [form, setForm]     = useState({ email: '', password: '' });
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
    await new Promise(r => setTimeout(r, 1100));
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

  const features = [
    { icon: '🔬', title: 'AI Skin Analysis', desc: 'Detect conditions with 98% accuracy' },
    { icon: '💭', title: 'Mood Correlation', desc: 'Track how emotions affect your skin' },
    { icon: '🌿', title: 'Environment Monitor', desc: 'Real-time UV & pollution alerts' },
    { icon: '🤖', title: 'Solace AI Companion', desc: 'Mental wellness support 24/7' },
  ];

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        {/* Ambient orbs */}
        <div style={{ position:'absolute', top:-100, right:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,114,182,0.22) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'35%', left:'25%', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:440 }} className="animate-fade-in">
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'#fff', boxShadow:'0 8px 24px rgba(139,92,246,0.35)' }}>✦</div>
            <span style={{ fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>SkinVeda.ai</span>
          </div>

          {/* 3D Floating Visual */}
          <div style={{ position:'relative', width:200, height:200, margin:'0 auto 32px', animation:'float 5s ease-in-out infinite' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'conic-gradient(from 0deg, rgba(167,139,250,0.4), rgba(244,114,182,0.3), rgba(251,113,133,0.35), rgba(96,165,250,0.25), rgba(167,139,250,0.4))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 20px 60px rgba(139,92,246,0.25), inset 0 0 40px rgba(167,139,250,0.15)', position:'relative' }}>
              <div style={{ width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(237,233,254,0.85) 40%, rgba(196,181,253,0.6) 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, boxShadow:'0 8px 24px rgba(139,92,246,0.2)' }}>🩺</div>
              {/* Spinning rings */}
              <div style={{ position:'absolute', inset:-14, borderRadius:'50%', border:'1.5px solid rgba(167,139,250,0.3)', borderTopColor:'rgba(167,139,250,0.7)', animation:'spin 10s linear infinite' }} />
              <div style={{ position:'absolute', inset:-28, borderRadius:'50%', border:'1px solid rgba(244,114,182,0.2)', borderRightColor:'rgba(244,114,182,0.6)', animation:'spin 18s linear infinite reverse' }} />
            </div>
          </div>

          <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px', marginBottom:12, lineHeight:1.2, color:'#111827' }}>
            Your skin health,<br /><span className="gradient-text">reimagined with AI</span>
          </h2>
          <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.7, marginBottom:28 }}>
            Combining AI skin diagnosis, mood tracking, and environmental intelligence for holistic skincare.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {features.map((f, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay:`${i*0.1+0.2}s`, display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.72)', border:'1px solid rgba(139,92,246,0.12)', borderRadius:12, padding:'10px 14px', backdropFilter:'blur(10px)', textAlign:'left', boxShadow:'0 2px 8px rgba(139,92,246,0.06)' }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.08))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:1 }}>{f.title}</div>
                  <div style={{ fontSize:11, color:'#6B7280' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-right">
          {/* Brand */}
          <div style={{ marginBottom:24, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }} onClick={() => navigate('landing')}>
            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff', fontWeight:900 }}>✦</div>
            <span style={{ fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>SkinVeda.ai</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your health dashboard</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="login-email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className="form-label">Password</label>
                <span style={{ fontSize:11, color:'#8B5CF6', cursor:'pointer', fontWeight:600 }}>Forgot password?</span>
              </div>
              <div style={{ position:'relative' }}>
                <input id="login-password" type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  style={{ paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9CA3AF', fontSize:15, cursor:'pointer', padding:2 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }} disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          <button id="demo-login" className="btn btn-secondary btn-lg" style={{ width:'100%' }} onClick={demoLogin} disabled={loading}>
            🚀 Try Demo — No Signup Required
          </button>

          <div className="auth-switch">
            Don't have an account? <span onClick={() => navigate('signup')}>Create one free →</span>
          </div>

          <div style={{ marginTop:16, padding:'10px 12px', borderRadius:10, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', fontSize:11, color:'#6B7280', lineHeight:1.6 }}>
            ⚠️ This application does not replace professional medical diagnosis. Always consult a qualified dermatologist.
          </div>
        </div>
      </div>
    </div>
  );
}
