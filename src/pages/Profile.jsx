import { useState } from 'react';
import { useApp } from '../App';
import { formatDate } from '../data/mockData';
import { Icon, PageHeader } from '../components/ui';
import { initialsOf, useNow } from '../lib/skin';

const SKIN_CONDITIONS = ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Contact Dermatitis', 'Other'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const SENSITIVITIES = ['Fragrance', 'Sunlight', 'Nickel', 'Dust', 'Latex', 'Essential oils'];
const GOALS = ['Clear breakouts', 'Deep hydration', 'Even tone', 'Calm redness', 'Smoother texture', 'Healthy ageing'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function Profile() {
  const { user, updateUser, showToast, moodLogs, diagnoses, progressPhotos, navigate } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ sensitivities: [], goals: [], ...user });
  const [saving, setSaving] = useState(false);
  const now = useNow();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleIn = (k, v) => setForm(p => ({ ...p, [k]: (p[k] || []).includes(v) ? p[k].filter(x => x !== v) : [...(p[k] || []), v] }));

  const handleSave = async () => {
    if (!form.name?.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    updateUser(form);
    setEditing(false);
    setSaving(false);
    showToast('Profile updated', 'success');
  };

  const cancel = () => { setForm({ sensitivities: [], goals: [], ...user }); setEditing(false); };
  const joinDays = user?.joinedAt ? Math.max(1, Math.floor((now - new Date(user.joinedAt).getTime()) / 864e5)) : 1;
  const plan = user?.plan === 'pro' ? 'Pro' : user?.plan === 'clinic' ? 'Clinic' : 'Free';

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title={<>Profile</>}
        subtitle="Keep your details current — skin type, concerns and sensitivities all shape your analysis and recommendations."
        actions={editing ? <>
          <button className="btn btn-ghost btn-sm" onClick={cancel} disabled={saving}>Cancel</button>
          <button className="btn btn-dark btn-sm" onClick={handleSave} disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : <><Icon name="check" size={16} /> Save changes</>}</button>
        </> : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Icon name="edit" size={16} /> Edit profile</button>}
      />

      <div className="card">
        <div className="profile-hero">
          <span className="avatar avatar-xl">{initialsOf(form.name)}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="row wrap" style={{ gap: 10 }}>
              <h2>{user?.name}</h2>
              <span className={`pill ${plan === 'Free' ? '' : 'pill-clay'}`}><Icon name="crown" size={13} /> {plan} plan</span>
            </div>
            <p>{user?.email} · Member since {formatDate(user?.joinedAt)}</p>
          </div>
          {plan === 'Free' && <button className="btn btn-soft btn-sm" onClick={() => navigate('pricing')}>Upgrade to Pro</button>}
        </div>
        <div className="profile-stats">
          <div className="stat"><span className="stat-label">Analyses</span><span className="stat-value">{diagnoses.length}</span></div>
          <div className="stat"><span className="stat-label">Mood logs</span><span className="stat-value">{moodLogs.length}</span></div>
          <div className="stat"><span className="stat-label">Photos</span><span className="stat-value">{progressPhotos.length}</span></div>
          <div className="stat"><span className="stat-label">Days with us</span><span className="stat-value">{joinDays}</span></div>
        </div>
      </div>

      <div className="grid g-2 section-gap">
        <div className="card">
          <div className="card-head"><h3>Personal information</h3></div>
          <div className="form-grid">
            <div className="field span-all">
              <label className="label" htmlFor="pf-name">Full name</label>
              <input id="pf-name" className="input" value={form.name || ''} disabled={!editing} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="field span-all">
              <label className="label" htmlFor="pf-email">Email <small>managed in Settings</small></label>
              <input id="pf-email" className="input" value={form.email || ''} disabled />
            </div>
            <div className="field">
              <label className="label" htmlFor="pf-age">Age</label>
              <input id="pf-age" type="number" className="input" value={form.age || ''} disabled={!editing} onChange={e => set('age', e.target.value)} placeholder="—" />
            </div>
            <div className="field">
              <label className="label" htmlFor="pf-gender">Gender</label>
              <select id="pf-gender" className="select" value={form.gender || ''} disabled={!editing} onChange={e => set('gender', e.target.value)}>
                <option value="">—</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field span-all">
              <label className="label" htmlFor="pf-loc">City <small>used for UV & air quality alerts</small></label>
              <div className="input-wrap">
                <Icon name="globe" size={18} />
                <input id="pf-loc" className="input" value={form.location || ''} disabled={!editing} onChange={e => set('location', e.target.value)} placeholder="Add your city" />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-tint">
          <div className="card-head"><h3>Skin profile</h3><span className="pill pill-emerald pill-mono">Shapes your plan</span></div>
          <div className="field">
            <span className="label">Skin type</span>
            <div className="chip-row">
              {SKIN_TYPES.map(t => (
                <button key={t} type="button" className={`tag-chip${form.skinType === t ? ' active' : ''}`} disabled={!editing} onClick={() => set('skinType', t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Main concern</span>
            <div className="chip-row">
              {SKIN_CONDITIONS.map(c => (
                <button key={c} type="button" className={`tag-chip${form.skinCondition === c ? ' active' : ''}`} disabled={!editing} onClick={() => set('skinCondition', c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Known sensitivities</span>
            <div className="chip-row">
              {SENSITIVITIES.map(s => (
                <button key={s} type="button" className={`tag-chip${form.sensitivities?.includes(s) ? ' active' : ''}`} disabled={!editing} onClick={() => toggleIn('sensitivities', s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Goals</span>
            <div className="chip-row">
              {GOALS.map(g => (
                <button key={g} type="button" className={`tag-chip${form.goals?.includes(g) ? ' active' : ''}`} disabled={!editing} onClick={() => toggleIn('goals', g)}>{g}</button>
              ))}
            </div>
          </div>
          {!editing && <p className="muted mt-16" style={{ fontSize: 12.5 }}>Select “Edit profile” to make changes.</p>}
        </div>
      </div>
    </>
  );
}
