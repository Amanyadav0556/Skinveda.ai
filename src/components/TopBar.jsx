import { useApp } from '../App';

const PAGE_LABELS = {
  dashboard:   { label: 'Dashboard',        icon: '🏠',  desc: 'Your skin health overview' },
  diagnosis:   { label: 'AI Skin Diagnosis', icon: '🔬', desc: 'Upload & analyze skin images' },
  mood:        { label: 'Mood Tracker',      icon: '💭',  desc: 'Track daily emotions' },
  solace:      { label: 'Solace AI',         icon: '🤖',  desc: 'Mental health support' },
  environment: { label: 'Environment',       icon: '🌿',  desc: 'Weather & UV monitoring' },
  progress:    { label: 'Progress',          icon: '📈',  desc: 'Track skin improvements' },
  reports:     { label: 'Reports',           icon: '📋',  desc: 'AI-generated reports' },
  profile:     { label: 'My Profile',        icon: '👤',  desc: 'Personal information' },
  settings:    { label: 'Settings',          icon: '⚙️',  desc: 'App preferences' },
};

export default function TopBar() {
  const { page, navigate, user } = useApp();

  const current  = PAGE_LABELS[page] || { label: 'SkinVeda.ai', icon: '✦', desc: '' };
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
            border: '1px solid rgba(139,92,246,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>{current.icon}</div>
          <div>
            <div className="topbar-breadcrumb">
              {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
            </div>
            <div className="topbar-page">{current.label}</div>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Analyze Skin CTA */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('diagnosis')}
          style={{ gap: 5 }}
        >
          🔬 Analyze Skin
        </button>

        {/* Solace */}
        <button className="topbar-btn" onClick={() => navigate('solace')} title="Solace AI">🤖</button>

        {/* Notifications */}
        <button className="topbar-btn" title="Alerts" style={{ position: 'relative' }}>
          🔔
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
            border: '2px solid #fff',
          }} />
        </button>

        {/* Weather */}
        <button
          className="topbar-btn"
          onClick={() => navigate('environment')}
          title="Environment"
          style={{ width: 'auto', padding: '0 10px', gap: 5, fontSize: 12 }}
        >
          <span>⛅</span>
          <span style={{ fontWeight: 700, color: '#6B7280' }}>34°C</span>
        </button>

        {/* User Avatar */}
        <div
          onClick={() => navigate('profile')}
          className="topbar-btn"
          title="Profile"
          style={{
            width: 34, height: 34, padding: 0,
            background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
            border: 'none',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
