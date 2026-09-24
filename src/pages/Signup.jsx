import { useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/ui';

const SKIN_CONDITIONS = ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Contact Dermatitis', 'Other / Not Sure'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

const STEPS = ['Account', 'About you', 'Your skin'];

const pwScore = pw => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return Math.max(1, s);
};

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
    try {
      const response = await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        location: form.location || null,
        skin_condition: form.skinCondition || 'Not specified',
        skin_type: form.skinType || 'Not specified',
      });
      login(response.user);
      showToast(`Welcome to SkinVeda.ai, ${form.name.split(' ')[0]}!`, 'success');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    if (step < STEPS.length - 1) nextStep();
    else handleSubmit();
  };

  const err = k => errors[k] && <div className="field-error"><Icon name="alert" size={14} />{errors[k]}</div>;
  const score = pwScore(form.password);

  return (
    <AuthLayout
      title={<>Join 10,000+ people caring for skin, <em>smarter.</em></>}
      subtitle="Three quick steps and your first AI skin analysis is ready to go."
      topLink={<>Already a member? <button onClick={() => navigate('login')}>Sign in</button></>}
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="steps-bar" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className={i < step ? 'done' : i === step ? 'current' : ''}>
              <span /><small>0{i + 1} · {s}</small>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h1>Create your <em>account</em></h1>
            <p className="lead">Free forever for your first analyses. No card needed.</p>
            <div className="field">
              <label className="label" htmlFor="su-name">Full name</label>
              <div className="input-wrap">
                <Icon name="user" size={18} />
                <input id="su-name" className={`input${errors.name ? ' has-error' : ''}`} placeholder="Priya Sharma" autoComplete="name"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              {err('name')}
            </div>
            <div className="field">
              <label className="label" htmlFor="su-email">Email</label>
              <div className="input-wrap">
                <Icon name="mail" size={18} />
                <input id="su-email" type="email" className={`input${errors.email ? ' has-error' : ''}`} placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              {err('email')}
            </div>
            <div className="field">
              <label className="label" htmlFor="su-pass">Password <small>8+ characters</small></label>
              <div className="input-wrap">
                <Icon name="lock" size={18} />
                <input id="su-pass" type={showPass ? 'text' : 'password'} autoComplete="new-password" style={{ paddingRight: 52 }}
                  className={`input${errors.password ? ' has-error' : ''}`} placeholder="Create a password"
                  value={form.password} onChange={e => update('password', e.target.value)} />
                <button type="button" className="icon-btn input-action" onClick={() => setShowPass(p => !p)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {form.password && (
                <div className="pw-meter" data-score={score} aria-label={`Password strength ${score} of 4`}>
                  <span /><span /><span /><span />
                </div>
              )}
              {err('password')}
            </div>
            <div className="field">
              <label className="label" htmlFor="su-confirm">Confirm password</label>
              <div className="input-wrap">
                <Icon name="shield" size={18} />
                <input id="su-confirm" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                  className={`input${errors.confirmPassword ? ' has-error' : ''}`} placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
              </div>
              {err('confirmPassword')}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1>A little <em>about you</em></h1>
            <p className="lead">Age and climate change how skin behaves — this sharpens your results.</p>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="su-age">Age</label>
                <input id="su-age" type="number" min="10" max="100" className={`input${errors.age ? ' has-error' : ''}`} placeholder="28"
                  value={form.age} onChange={e => update('age', e.target.value)} />
                {err('age')}
              </div>
              <div className="field">
                <label className="label" htmlFor="su-loc">City <small>optional</small></label>
                <input id="su-loc" className="input" placeholder="New Delhi" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div className="field span-all">
                <span className="label">Gender</span>
                <div className="option-grid">
                  {GENDERS.map(g => (
                    <button type="button" key={g} className={`option${form.gender === g ? ' active' : ''}`} onClick={() => update('gender', g)}>
                      <span className="dot">{form.gender === g && <Icon name="check" size={10} stroke={3} />}</span>{g}
                    </button>
                  ))}
                </div>
                {err('gender')}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Tell us about <em>your skin</em></h1>
            <p className="lead">Optional — you can change this anytime in your profile.</p>
            <div className="field">
              <span className="label">Skin type</span>
              <div className="chip-row">
                {SKIN_TYPES.map(t => (
                  <button type="button" key={t} className={`tag-chip${form.skinType === t ? ' active' : ''}`} onClick={() => update('skinType', t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">Main concern</span>
              <div className="option-grid">
                {SKIN_CONDITIONS.map(c => (
                  <button type="button" key={c} className={`option${form.skinCondition === c ? ' active' : ''}`} onClick={() => update('skinCondition', c)}>
                    <span className="dot">{form.skinCondition === c && <Icon name="check" size={10} stroke={3} />}</span>{c}
                  </button>
                ))}
              </div>
            </div>
            <label className="check mt-16">
              <input type="checkbox" checked={form.diagnosedBefore} onChange={e => update('diagnosedBefore', e.target.checked)} />
              A dermatologist has diagnosed this condition before
            </label>
          </>
        )}

        <div className="row mt-24">
          {step > 0 && (
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(s => s - 1)} aria-label="Back">
              <Icon name="back" size={18} />
            </button>
          )}
          <button type="submit" className="btn btn-dark btn-lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</>
              : step < STEPS.length - 1 ? <>Continue <Icon name="arrow" size={18} /></>
              : <>Create account <Icon name="check" size={18} /></>}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
