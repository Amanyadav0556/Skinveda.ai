import { useState } from 'react';
import { useApp } from '../App';
import { formatDate, MOODS } from '../data/mockData';

const SKIN_CONDITIONS = ['Eczema', 'Psoriasis', 'Vitiligo', 'Acne Vulgaris', 'Contact Dermatitis', 'Other'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

export default function Profile() {
  const { user, updateUser, showToast, moodLogs, diagnoses, progressPhotos, navigate } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    updateUser(form);
    setEditing(false);
    setSaving(false);
    showToast('Profile updated successfully!', 'success');
  };

  const avgMood = moodLogs.length
    ? (moodLogs.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / moodLogs.length).toFixed(1)
    : 'N/A';

  const joinDays = user?.joinedAt ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / 864e5) : 0;

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="profile-banner" />

      {/* Profile Header */}
      <div className="profile-avatar-wrap" style={{ paddingTop: 0 }}>
        <div className="profile-avatar-border">
          <div className="avatar avatar-xl" style={{ background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', fontSize: 40 }}>{initials}</div>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{user?.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user?.email}</span>
            {user?.skinCondition && user.skinCondition !== 'Not specified' && (
              <span className="badge badge-teal">{user.skinCondition}</span>
            )}
            {user?.role === 'admin' && <span className="badge badge-purple">Admin</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Member since {formatDate(user?.joinedAt || new Date().toISOString())} · {joinDays} days on SkinVeda.ai
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
          {editing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 animate-fade-in" style={{ marginBottom: 28 }}>
        {[
          { icon: '🔥', label: 'Day Streak', value: user?.streak || 1, color: '#f59e0b' },
          { icon: '🔬', label: 'Diagnoses', value: diagnoses.length, color: 'var(--accent-teal)' },
          { icon: '💭', label: 'Avg Mood', value: avgMood !== 'N/A' ? `${avgMood}/10` : '—', color: 'var(--accent-purple-light)' },
          { icon: '📷', label: 'Progress Photos', value: progressPhotos.length, color: 'var(--accent-amber)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Profile Form */}
        <div>
          <div className="card animate-slide-up">
            <div className="section-header">
              <div className="section-title">👤 Personal Information</div>
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-input" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender || ''} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select</option>
                      {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="City, Country" value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner spinner-sm" /> Saving...</> : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Full Name', value: user?.name, icon: '👤' },
                  { label: 'Email', value: user?.email, icon: '📧' },
                  { label: 'Age', value: user?.age ? `${user.age} years` : 'Not set', icon: '🎂' },
                  { label: 'Gender', value: user?.gender || 'Not set', icon: '⚥' },
                  { label: 'Location', value: user?.location || 'Not set', icon: '📍' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 15, color: item.value ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: item.value ? 'normal' : 'italic' }}>{item.value || 'Not set'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skin Health Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card animate-slide-up delay-1">
            <div className="section-title" style={{ marginBottom: 16 }}>🩺 Skin Health Profile</div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Primary Condition</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {SKIN_CONDITIONS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, skinCondition: c }))} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${form.skinCondition === c ? 'rgba(0,217,166,0.5)' : 'var(--border)'}`, background: form.skinCondition === c ? 'rgba(0,217,166,0.1)' : 'transparent', color: form.skinCondition === c ? 'var(--accent-teal)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Skin Type</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {SKIN_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, skinType: t }))} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${form.skinType === t ? 'rgba(0,217,166,0.5)' : 'var(--border)'}`, background: form.skinType === t ? 'rgba(0,217,166,0.1)' : 'transparent', color: form.skinType === t ? 'var(--accent-teal)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Primary Condition', value: user?.skinCondition, icon: '🦠', badge: 'badge-teal' },
                  { label: 'Skin Type', value: user?.skinType, icon: '🧴', badge: 'badge-purple' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</div>
                      {item.value && item.value !== 'Not specified' ? (
                        <span className={`badge ${item.badge}`}>{item.value}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card animate-slide-up delay-2">
            <div className="section-title" style={{ marginBottom: 14 }}>📊 Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ...(diagnoses.slice(0, 2).map(d => ({ icon: '🔬', text: `Diagnosed: ${d.disease}`, time: d.timestamp, color: 'var(--accent-teal)' }))),
                ...(moodLogs.slice(0, 2).map(m => ({ icon: '💭', text: `Mood logged: ${m.mood}`, time: m.timestamp, color: 'var(--accent-purple-light)' }))),
                ...(progressPhotos.slice(0, 1).map(p => ({ icon: '📷', text: `Photo: ${p.bodyRegion}`, time: p.timestamp, color: 'var(--accent-amber)' }))),
              ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <span>{item.icon}</span>
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.text}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatDate(item.time)}</span>
                </div>
              ))}
              {diagnoses.length === 0 && moodLogs.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No activity yet</div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card animate-slide-up delay-3" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="section-title" style={{ marginBottom: 12, color: 'var(--accent-red)' }}>⚠️ Account</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>Manage your account settings and data.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('settings')}>⚙️ Account Settings</button>
              <button className="btn btn-danger btn-sm">🗑 Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
