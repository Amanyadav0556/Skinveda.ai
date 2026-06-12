import { useApp } from '../App';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',     icon: '🏠' },
  { id: 'diagnosis',   label: 'AI Diagnosis',  icon: '🔬', badge: 'NEW' },
  { id: 'mood',        label: 'Mood Tracker',  icon: '💭' },
  { id: 'solace',      label: 'Solace AI',     icon: '🤖', badge: 'AI' },
  { id: 'environment', label: 'Environment',   icon: '🌿' },
  { id: 'progress',    label: 'Progress',      icon: '📈' },
];

const NAV_SECONDARY = [
  { id: 'reports',  label: 'Reports',   icon: '📋' },
  { id: 'profile',  label: 'My Profile', icon: '👤' },
  { id: 'settings', label: 'Settings',  icon: '⚙️' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(139,92,246,0.35)',
          }}>✦</div>
          <div>
            <div className="sidebar-logo-text gradient-text-static">SkinVeda.ai</div>
            <div className="sidebar-logo-sub">AI Health Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                background: item.badge === 'AI'
                  ? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
                  : 'rgba(139,92,246,0.1)',
                color: item.badge === 'AI' ? '#fff' : '#8B5CF6',
                borderRadius: 4,
                padding: '1px 5px',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.05em',
                border: item.badge === 'AI' ? 'none' : '1px solid rgba(139,92,246,0.25)',
              }}>{item.badge}</span>
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
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Disclaimer */}
        <div style={{
          margin: '14px 4px 0',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.18)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
            ⚠ Medical Disclaimer
          </div>
          <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.5 }}>
            Does not replace professional diagnosis. Consult a dermatologist.
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('profile')}>
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', fontSize: 11 }}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.email?.split('@')[0] || 'member'}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); logout(); }}
            style={{
              background: 'none', border: 'none',
              color: '#9CA3AF', fontSize: 14, padding: '4px',
              cursor: 'pointer', borderRadius: 6,
              transition: 'all 0.2s',
            }}
            title="Logout"
            onMouseEnter={e => e.target.style.color = '#EF4444'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}
          >⏏</button>
        </div>
      </div>
    </aside>
  );
}
