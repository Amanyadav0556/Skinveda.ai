import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/ui';

// NOTE: The backend has no password-reset endpoint yet. This flow is
// front-end only (any 6-digit code is accepted) until one is added.
const CODE_LEN = 6;

export default function ForgotPassword() {
  const { navigate, showToast } = useApp();
  const [stage, setStage] = useState('email'); // email → code → reset → done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(CODE_LEN).fill(''));
  const [pw, setPw] = useState({ a: '', b: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const fakeWait = ms => new Promise(r => setTimeout(r, ms));

  const sendCode = async e => {
    e?.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }
    setError(''); setLoading(true);
    await fakeWait(800);
    setLoading(false); setStage('code'); setResendIn(30);
    showToast(`Verification code sent to ${email}`, 'success');
    setTimeout(() => inputs.current[0]?.focus(), 50);
  };

  const setDigit = (i, v) => {
    const digits = v.replace(/\D/g, '');
    if (!digits) { setCode(c => c.map((d, j) => (j === i ? '' : d))); return; }
    setCode(c => {
      const next = [...c];
      digits.slice(0, CODE_LEN - i).split('').forEach((d, k) => { next[i + k] = d; });
      return next;
    });
    const nextIdx = Math.min(CODE_LEN - 1, i + digits.length);
    inputs.current[nextIdx]?.focus();
    setError('');
  };

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < CODE_LEN - 1) inputs.current[i + 1]?.focus();
  };

  const verify = async e => {
    e.preventDefault();
    if (code.join('').length < CODE_LEN) { setError('Enter all 6 digits'); return; }
    setLoading(true); await fakeWait(700); setLoading(false);
    setStage('reset');
  };

  const reset = async e => {
    e.preventDefault();
    if (pw.a.length < 8) { setError('Minimum 8 characters'); return; }
    if (pw.a !== pw.b) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true); await fakeWait(800); setLoading(false);
    setStage('done');
  };

  const back = (
    <button type="button" className="btn-text row" style={{ gap: 6, fontSize: 13.5, marginBottom: 22 }}
      onClick={() => (stage === 'email' ? navigate('login') : setStage(stage === 'reset' ? 'code' : 'email'))}>
      <Icon name="back" size={16} /> Back
    </button>
  );

  return (
    <AuthLayout
      title={<>Locked out? <em>No stress.</em></>}
      subtitle="We’ll verify it’s you and get you back to your routine in under a minute."
      topLink={<>Remembered it? <button onClick={() => navigate('login')}>Sign in</button></>}
    >
      {stage === 'email' && (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          {back}
          <h1>Reset your <em>password</em></h1>
          <p className="lead">Enter the email linked to your account and we’ll send a 6-digit code.</p>
          <div className="field">
            <label className="label" htmlFor="fp-email">Email</label>
            <div className="input-wrap">
              <Icon name="mail" size={18} />
              <input id="fp-email" type="email" autoComplete="email" className={`input${error ? ' has-error' : ''}`}
                placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
            </div>
            {error && <div className="field-error"><Icon name="alert" size={14} />{error}</div>}
          </div>
          <button type="submit" className="btn btn-dark btn-lg btn-block mt-24" disabled={loading}>
            {loading ? <><span className="spinner" /> Sending…</> : <>Send code <Icon name="arrow" size={18} /></>}
          </button>
        </form>
      )}

      {stage === 'code' && (
        <form className="auth-form" onSubmit={verify} noValidate>
          {back}
          <h1>Check your <em>inbox</em></h1>
          <p className="lead">We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.</p>
          <div className="otp" role="group" aria-label="Verification code">
            {code.map((d, i) => (
              <input key={i} ref={el => { inputs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={CODE_LEN} aria-label={`Digit ${i + 1}`} className={d ? 'filled' : ''}
                value={d} onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)} onFocus={e => e.target.select()} />
            ))}
          </div>
          {error && <div className="field-error mt-8"><Icon name="alert" size={14} />{error}</div>}
          <button type="submit" className="btn btn-dark btn-lg btn-block mt-24" disabled={loading}>
            {loading ? <><span className="spinner" /> Verifying…</> : <>Verify code <Icon name="check" size={18} /></>}
          </button>
          <p className="muted mt-16" style={{ textAlign: 'center', fontSize: 13.5 }}>
            Didn’t get it?{' '}
            {resendIn > 0
              ? <span>Resend in 0:{String(resendIn).padStart(2, '0')}</span>
              : <button type="button" className="btn-text" onClick={sendCode}>Resend code</button>}
          </p>
        </form>
      )}

      {stage === 'reset' && (
        <form className="auth-form" onSubmit={reset} noValidate>
          {back}
          <h1>Choose a new <em>password</em></h1>
          <p className="lead">Make it at least 8 characters. Avoid one you’ve used before.</p>
          <div className="field">
            <label className="label" htmlFor="fp-a">New password</label>
            <div className="input-wrap">
              <Icon name="lock" size={18} />
              <input id="fp-a" type="password" autoComplete="new-password" className="input" placeholder="New password"
                value={pw.a} onChange={e => { setPw(p => ({ ...p, a: e.target.value })); setError(''); }} />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="fp-b">Confirm password</label>
            <div className="input-wrap">
              <Icon name="shield" size={18} />
              <input id="fp-b" type="password" autoComplete="new-password" className="input" placeholder="Repeat password"
                value={pw.b} onChange={e => { setPw(p => ({ ...p, b: e.target.value })); setError(''); }} />
            </div>
          </div>
          {error && <div className="field-error mt-8"><Icon name="alert" size={14} />{error}</div>}
          <button type="submit" className="btn btn-dark btn-lg btn-block mt-24" disabled={loading}>
            {loading ? <><span className="spinner" /> Saving…</> : 'Update password'}
          </button>
        </form>
      )}

      {stage === 'done' && (
        <div className="auth-form">
          <div className="success-mark"><Icon name="check" size={30} stroke={2.4} /></div>
          <h1>You’re all <em>set</em></h1>
          <p className="lead">Your password has been updated. Sign in with your new password to continue.</p>
          <button className="btn btn-dark btn-lg btn-block" onClick={() => navigate('login')}>
            Back to sign in <Icon name="arrow" size={18} />
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
