import { useApp } from '../App';

const PAGE_LABELS = {
  dashboard: { label: 'Dashboard', icon: '🏠', desc: 'Your skin health overview' },
  diagnosis: { label: 'AI Skin Diagnosis', icon: '🔬', desc: 'Upload & analyze skin images' },
  mood: { label: 'Mood Tracker', icon: '💭', desc: 'Track daily emotions' },
  solace: { label: 'Solace AI', icon: '🤖', desc: 'Mental health support' },
  environment: { label: 'Environment', icon: '🌍', desc: 'Weather & UV monitoring' },
  progress: { label: 'Weekly Progress', icon: '📊', desc: 'Track skin improvements' },
  reports: { label: 'Reports', icon: '📋', desc: 'AI-generated reports' },
  profile: { label: 'My Profile', icon: '👤', desc: 'Personal information' },
  settings: { label: 'Settings', icon: '⚙️', desc: 'App preferences' },
};

export default function TopBar() {
  const { page, navigate, user } = useApp();

  const current = PAGE_LABELS[page] || { label: 'SkinVeda.ai', icon: '🏥', desc: '' };
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{current.icon}</span>
          <div>
            <div className="topbar-breadcrumb">SkinVeda.ai · {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</div>
            <div className="topbar-page">{current.label}</div>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quick Analysis */}
        <button className="btn btn-primary btn-sm" style={{ gap: 6 }} onClick={() => navigate('diagnosis')}>
          <span>🔬</span> Analyze Skin
        </button>

        {/* Solace */}
        <button className="topbar-btn" onClick={() => navigate('solace')} title="Solace AI">🤖</button>

        {/* Notifications */}
        <button className="topbar-btn" title="Alerts" style={{ position: 'relative' }}>
          🔔
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)', border: '2px solid var(--bg-primary)' }} />
        </button>

        {/* Environment badge */}
        <button className="topbar-btn" onClick={() => navigate('environment')} title="Environment" style={{ gap: 4, fontSize: 12, width: 'auto', padding: '8px 12px' }}>
          <span>⛅</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>34°C</span>
        </button>

        {/* User Avatar */}
        <div
          onClick={() => navigate('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 12, transition: 'all 0.2s' }}
          className="topbar-btn"
          title="Profile"
        >
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', fontSize: 12 }}>{initials}</div>
        </div>
      </div>
    </header>
  );
}
