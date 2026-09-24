import { useState } from 'react';
import { useApp } from '../App';
import { Icon, PageHeader, Toggle, Segmented } from '../components/ui';

const DEFAULTS = {
  notifications: true, uvAlerts: true, moodReminders: true, weeklyReports: true, emailDigest: false,
  scanReminder: 'weekly', units: 'metric', language: 'English', reminderTime: '20:00',
  shareData: false, analyticsOpt: true, blurPhotos: false,
};

const SECTIONS = [
  { id: 'preferences',   label: 'Preferences',   icon: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'privacy',       label: 'Privacy & data', icon: 'shield' },
  { id: 'account',       label: 'Account',       icon: 'user' },
];

const readSettings = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sv_settings') || '{}') }; } catch { return DEFAULTS; }
};

function Row({ title, desc, children }) {
  return (
    <div className="setting-row">
      <div><strong>{title}</strong>{desc && <p>{desc}</p>}</div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, logout, showToast, clearData, navigate, theme } = useApp();
  const [settings, setSettings] = useState(readSettings);
  const [section, setSection] = useState('preferences');
  const [confirm, setConfirm] = useState(null);

  const update = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem('sv_settings', JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
    showToast('Setting saved', 'success');
  };

  const doClear = async kind => {
    setConfirm(null);
    try {
      await clearData(kind);
      showToast(`${kind === 'diagnoses' ? 'Analysis' : kind === 'moods' ? 'Mood' : 'Photo'} history cleared`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({
      user, diagnoses: JSON.parse(localStorage.getItem('sv_diagnoses') || '[]').map(d => ({ ...d, imageData: undefined })),
      moods: JSON.parse(localStorage.getItem('sv_moods') || '[]'), settings,
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'skinveda-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Your data export has downloaded', 'success');
  };

  const plan = user?.plan === 'pro' ? 'Pro' : user?.plan === 'clinic' ? 'Clinic' : 'Free';

  return (
    <>
      <PageHeader eyebrow="Settings" title="Preferences & account" subtitle="Control how SkinVeda works for you, what it reminds you about and how your data is handled." />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map(s => (
            <button key={s.id} className={section === s.id ? 'active' : ''} onClick={() => setSection(s.id)}>
              <Icon name={s.icon} size={17} /> {s.label}
            </button>
          ))}
        </nav>

        <div className="stack">
          {section === 'preferences' && (
            <div className="card">
              <div className="card-head"><h3>Preferences</h3></div>
              <Row title="Appearance" desc="Follow your device, or always use light or dark mode.">
                <Segmented size="sm" value={theme.pref} onChange={theme.setPref}
                  options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
              </Row>
              <Row title="Scan reminders" desc="How often we nudge you to re-scan for progress tracking.">
                <Segmented size="sm" value={settings.scanReminder} onChange={v => update('scanReminder', v)}
                  options={[{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: '2 weeks' }, { value: 'off', label: 'Off' }]} />
              </Row>
              <Row title="Units" desc="Temperature and measurements.">
                <Segmented size="sm" value={settings.units} onChange={v => update('units', v)}
                  options={[{ value: 'metric', label: '°C' }, { value: 'imperial', label: '°F' }]} />
              </Row>
              <Row title="Language">
                <select className="select" style={{ width: 170, height: 40 }} value={settings.language} onChange={e => update('language', e.target.value)}>
                  {['English', 'हिन्दी', 'Español', 'Français'].map(l => <option key={l}>{l}</option>)}
                </select>
              </Row>
              <Row title="Daily reminder time" desc="When routine and mood reminders arrive.">
                <input type="time" className="input" style={{ width: 130, height: 40 }} value={settings.reminderTime} onChange={e => update('reminderTime', e.target.value)} />
              </Row>
            </div>
          )}

          {section === 'notifications' && (
            <div className="card">
              <div className="card-head"><h3>Notifications</h3></div>
              <Row title="Push notifications" desc="Important updates, results and alerts."><Toggle label="Push notifications" checked={settings.notifications} onChange={v => update('notifications', v)} /></Row>
              <Row title="UV & air quality alerts" desc="When conditions are risky for your skin type."><Toggle label="UV alerts" checked={settings.uvAlerts} onChange={v => update('uvAlerts', v)} /></Row>
              <Row title="Routine & mood reminders" desc={`Every day at ${settings.reminderTime}.`}><Toggle label="Mood reminders" checked={settings.moodReminders} onChange={v => update('moodReminders', v)} /></Row>
              <Row title="Weekly report" desc="Your AI-generated summary every Monday."><Toggle label="Weekly report" checked={settings.weeklyReports} onChange={v => update('weeklyReports', v)} /></Row>
              <Row title="Monthly email digest" desc="A progress recap in your inbox."><Toggle label="Email digest" checked={settings.emailDigest} onChange={v => update('emailDigest', v)} /></Row>
            </div>
          )}

          {section === 'privacy' && (
            <>
              <div className="card">
                <div className="card-head"><h3>Privacy</h3><span className="pill pill-good"><Icon name="lock" size={12} /> Encrypted</span></div>
                <Row title="Blur photos in history" desc="Hide skin photos until you tap them."><Toggle label="Blur photos" checked={settings.blurPhotos} onChange={v => update('blurPhotos', v)} /></Row>
                <Row title="Contribute to research" desc="Share anonymised, de-identified results to improve the model."><Toggle label="Share data" checked={settings.shareData} onChange={v => update('shareData', v)} /></Row>
                <Row title="Product analytics" desc="Anonymous usage stats that help us fix bugs."><Toggle label="Analytics" checked={settings.analyticsOpt} onChange={v => update('analyticsOpt', v)} /></Row>
                <Row title="Export my data" desc="Download your profile, analyses and mood logs as JSON.">
                  <button className="btn btn-ghost btn-sm" onClick={exportData}><Icon name="download" size={15} /> Export</button>
                </Row>
              </div>
              <div className="card danger-zone">
                <div className="card-head"><h3>Clear history</h3><span className="pill pill-bad"><Icon name="alert" size={12} /> Permanent</span></div>
                {[
                  ['diagnoses', 'Analysis history', 'All scans, scores and reports'],
                  ['moods', 'Mood history', 'All mood check-ins'],
                  ['progress', 'Progress photos', 'All photos in your timeline'],
                ].map(([k, t, d]) => (
                  <Row key={k} title={t} desc={d}>
                    {confirm === k ? (
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger btn-sm" onClick={() => doClear(k)}>Yes, delete</button>
                      </div>
                    ) : <button className="btn btn-danger btn-sm" onClick={() => setConfirm(k)}><Icon name="trash" size={15} /> Clear</button>}
                  </Row>
                ))}
              </div>
            </>
          )}

          {section === 'account' && (
            <>
              <div className="card">
                <div className="card-head"><h3>Account</h3></div>
                <Row title="Email" desc={user?.email}><button className="btn btn-ghost btn-sm" onClick={() => showToast('Email change is coming soon', 'info')}>Change</button></Row>
                <Row title="Password" desc="Last changed — never"><button className="btn btn-ghost btn-sm" onClick={() => navigate('forgot')}>Reset</button></Row>
                <Row title="Plan" desc={`You’re on the ${plan} plan.`}><button className="btn btn-soft btn-sm" onClick={() => navigate('pricing')}><Icon name="crown" size={15} /> {plan === 'Free' ? 'Upgrade' : 'Manage'}</button></Row>
                <Row title="Sign out" desc="Sign out of SkinVeda on this device."><button className="btn btn-ghost btn-sm" onClick={() => logout()}><Icon name="logout" size={15} /> Sign out</button></Row>
              </div>
              <div className="card danger-zone">
                <Row title="Delete account" desc="Permanently remove your account and all data. Contact support to proceed.">
                  <button className="btn btn-danger btn-sm" onClick={() => navigate('help')}>Contact support</button>
                </Row>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
