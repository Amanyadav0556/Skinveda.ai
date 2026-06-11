import { useState } from 'react';
import { useApp } from '../App';

export default function Settings() {
  const { user, logout, showToast } = useApp();
  const [settings, setSettings] = useState({
    notifications: true,
    uvAlerts: true,
    moodReminders: true,
    weeklyReports: true,
    emailDigest: false,
    shareData: false,
    analyticsOpt: true,
    darkMode: true,
  });

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Setting updated', 'success');
  };

  const SETTINGS_SECTIONS = [
    {
      icon: '🔔', title: 'Notifications',
      items: [
        { key: 'notifications', label: 'Push Notifications', desc: 'Receive push notifications for important updates and alerts' },
        { key: 'uvAlerts', label: 'UV & Environmental Alerts', desc: 'Get notified when UV index or AQI exceeds safe levels for your condition' },
        { key: 'moodReminders', label: 'Daily Mood Reminders', desc: 'Reminder at 8 PM to log your daily mood entry' },
        { key: 'weeklyReports', label: 'Weekly Report Notifications', desc: 'Receive your AI-generated weekly health report every Monday' },
        { key: 'emailDigest', label: 'Email Digest', desc: 'Monthly summary email with your skin health progress' },
      ]
    },
    {
      icon: '🔒', title: 'Privacy & Data',
      items: [
        { key: 'shareData', label: 'Share Anonymized Data', desc: 'Contribute anonymous health data to improve AI model accuracy for chronic skin conditions' },
        { key: 'analyticsOpt', label: 'Analytics & Improvement', desc: 'Allow usage analytics to help us improve SkinVeda.ai' },
      ]
    },
    {
      icon: '🎨', title: 'Appearance',
      items: [
        { key: 'darkMode', label: 'Dark Mode', desc: 'Premium dark theme for reduced eye strain (currently the only theme)' },
      ]
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Manage your SkinVeda.ai preferences, notifications, and privacy settings.</p>
      </div>

      {/* Account Overview */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, background: 'linear-gradient(135deg,rgba(0,217,166,0.06),rgba(124,58,237,0.06))', borderColor: 'rgba(0,217,166,0.15)' }}>
        <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', fontSize: 28, flexShrink: 0 }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user?.email} · {user?.skinCondition || 'No condition set'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-teal">Free Plan</span>
        </div>
      </div>

      {/* Settings Sections */}
      {SETTINGS_SECTIONS.map((section, si) => (
        <div key={si} className="settings-section animate-slide-up" style={{ animationDelay: `${si * 0.1}s` }}>
          <div className="settings-section-header">
            <span className="settings-section-icon">{section.icon}</span>
            <span className="settings-section-title">{section.title}</span>
          </div>
          <div className="settings-section-body">
            {section.items.map((item, ii) => (
              <div key={item.key} className="settings-item" style={{ borderBottom: ii < section.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="settings-item-info">
                  <div className="settings-item-label">{item.label}</div>
                  <div className="settings-item-desc">{item.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings[item.key]} onChange={() => toggle(item.key)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Data Management */}
      <div className="settings-section animate-slide-up delay-3">
        <div className="settings-section-header">
          <span className="settings-section-icon">🗄️</span>
          <span className="settings-section-title">Data Management</span>
        </div>
        <div className="settings-section-body">
          {[
            { icon: '📤', label: 'Export My Data', desc: 'Download all your health data in JSON format', action: () => showToast('Data export started — check your email', 'info'), btn: 'Export', cls: 'btn-secondary' },
            { icon: '🗑️', label: 'Clear Diagnosis History', desc: 'Delete all AI diagnosis records', action: () => { localStorage.removeItem('sv_diagnoses'); showToast('Diagnosis history cleared', 'info'); }, btn: 'Clear', cls: 'btn-danger' },
            { icon: '🗑️', label: 'Clear Mood History', desc: 'Delete all mood log entries', action: () => { localStorage.removeItem('sv_moods'); showToast('Mood history cleared', 'info'); }, btn: 'Clear', cls: 'btn-danger' },
          ].map((item, i) => (
            <div key={i} className="settings-item" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div className="settings-item-info">
                <div className="settings-item-label">{item.icon} {item.label}</div>
                <div className="settings-item-desc">{item.desc}</div>
              </div>
              <button className={`btn ${item.cls} btn-sm`} onClick={item.action}>{item.btn}</button>
            </div>
          ))}
        </div>
      </div>

      {/* About & Version */}
      <div className="settings-section animate-slide-up delay-4">
        <div className="settings-section-header">
          <span className="settings-section-icon">ℹ️</span>
          <span className="settings-section-title">About SkinVeda.ai</span>
        </div>
        <div className="settings-section-body">
          {[
            { label: 'Version', value: '2.1.0' },
            { label: 'AI Model', value: 'SkinVeda-DINOv2-v2.1' },
            { label: 'Supported Conditions', value: 'Eczema, Psoriasis, Vitiligo, Acne, Dermatitis' },
            { label: 'Backend', value: 'FastAPI + MongoDB Atlas' },
            { label: 'AI Accuracy', value: '98.2% (ISIC 2024 benchmark)' },
          ].map((item, i) => (
            <div key={i} className="settings-item" style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div className="settings-item-label" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-text" style={{ margin: '20px 0' }}>
        ⚠️ <strong>Medical Disclaimer:</strong> SkinVeda.ai provides AI-powered informational analysis only. This application does not replace professional medical diagnosis, treatment, or advice. Always consult a qualified dermatologist or healthcare provider for skin-related medical concerns. In case of emergency, contact your local emergency services immediately.
      </div>

      {/* Sign Out */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 20 }}>
        <button className="btn btn-danger" style={{ minWidth: 180, padding: '12px 24px' }} onClick={logout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
