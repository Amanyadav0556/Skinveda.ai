import { useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/ui';

export default function Login() {
  const { login, loginDemo, navigate, showToast } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const response = await api.login({
        email: form.email,
        password: form.password
      });
      login(response.user); // pass token somewhere? for now just user
      showToast('Welcome back!', 'success');
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    loginDemo({ name: 'Alex Johnson', email: 'alex@skinveda.ai', skinCondition: 'Eczema', skinType: 'Combination', streak: 12, joinedAt: new Date(Date.now() - 56 * 864e5).toISOString() });
    showToast('Demo mode — sample history loaded', 'success');
  };

  return (
    <AuthLayout
      title={<>Your skin, <em>understood.</em></>}
      subtitle="Sign in to see your latest analysis, today’s routine and how far you’ve come."
      topLink={<>New to SkinVeda? <button onClick={() => navigate('signup')}>Create an account</button></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Welcome <em>back</em></h1>
        <p className="lead">Sign in to your skin health dashboard.</p>

        <div className="field">
          <label className="label" htmlFor="login-email">Email</label>
          <div className="input-wrap">
            <Icon name="mail" size={18} />
            <input id="login-email" type="email" autoComplete="email" className={`input${errors.email ? ' has-error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          {errors.email && <div className="field-error"><Icon name="alert" size={14} />{errors.email}</div>}
        </div>

        <div className="field">
          <label className="label" htmlFor="login-password">
            Password
            <button type="button" className="btn-text" style={{ fontSize: 13 }} onClick={() => navigate('forgot')}>Forgot password?</button>
          </label>
          <div className="input-wrap">
            <Icon name="lock" size={18} />
            <input id="login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
              className={`input${errors.password ? ' has-error' : ''}`} style={{ paddingRight: 52 }}
              placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} />
            <button type="button" className="icon-btn input-action" onClick={() => setShowPass(p => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}>
              <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
          {errors.password && <div className="field-error"><Icon name="alert" size={14} />{errors.password}</div>}
        </div>

        <label className="check mt-16">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Keep me signed in on this device
        </label>

        <button id="login-submit" type="submit" className="btn btn-dark btn-lg btn-block mt-24" disabled={loading}>
          {loading ? <><span className="spinner" /> Signing in…</> : <>Sign in <Icon name="arrow" size={18} /></>}
        </button>

        <div className="auth-divider">or</div>

        <button id="demo-login" type="button" className="btn btn-ghost btn-lg btn-block" onClick={demoLogin} disabled={loading}>
          <Icon name="spark" size={18} /> Explore the demo — no signup
        </button>
      </form>
    </AuthLayout>
  );
}
