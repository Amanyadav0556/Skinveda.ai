import { useApp } from '../App';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬛', emoji: '🏠' },
  { id: 'diagnosis', label: 'AI Diagnosis', icon: '🔬', emoji: '🔬' },
  { id: 'mood', label: 'Mood Tracker', icon: '💭', emoji: '💭' },
  { id: 'solace', label: 'Solace AI', icon: '🤖', emoji: '🤖' },
  { id: 'environment', label: 'Environment', icon: '🌍', emoji: '🌍' },
  { id: 'progress', label: 'Progress', icon: '📊', emoji: '📊' },
];

const NAV_SECONDARY = [
  { id: 'reports', label: 'Reports', icon: '📋', emoji: '📋' },
  { id: 'profile', label: 'My Profile', icon: '👤', emoji: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️', emoji: '⚙️' },
];

export default function Sidebar() {
  const { page, navigate, user, logout } = useApp();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar animate-fade-left">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #00d9a6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>S</div>
          <div>
            <div className="sidebar-logo-text gradient-text">SkinVeda.ai</div>
            <div className="sidebar-logo-sub">AI Health Platform</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <span className="nav-item-icon">{item.emoji}</span>
            <span>{item.label}</span>
            {item.id === 'solace' && (
              <span style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, color: '#fff' }}>AI</span>
            )}
            {item.id === 'diagnosis' && (
              <span style={{ marginLeft: 'auto', background: 'rgba(0,217,166,0.15)', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, color: '#00d9a6', border: '1px solid rgba(0,217,166,0.3)' }}>NEW</span>
            )}
          </button>
        ))}

        <div className="sidebar-section-label">Account</div>
        {NAV_SECONDARY.map(item => (
          <button
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-item-icon">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Disclaimer */}
        <div style={{ margin: '16px 8px 0', padding: '12px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>⚠ Medical Disclaimer</div>
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>This app does not replace professional medical diagnosis. Always consult a dermatologist.</div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('profile')}>
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', fontSize: 12 }}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.email || ''}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); logout(); }}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: 16, padding: '4px', cursor: 'pointer', borderRadius: 6, transition: 'all 0.2s' }}
            title="Logout"
          >⬚</button>
        </div>
      </div>
    </aside>
  );
}
