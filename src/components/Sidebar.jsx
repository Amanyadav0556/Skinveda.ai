import { useApp } from '../App';
import { Icon, Logo } from './ui';
import { initialsOf } from '../lib/skin';

const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard',       label: 'Dashboard',       icon: 'home' },
  ]},
  { group: 'Skin', items: [
    { id: 'diagnosis',       label: 'Skin Analysis',   icon: 'scan', badge: 'AI' },
    { id: 'results',         label: 'Results',         icon: 'file' },
    { id: 'recommendations', label: 'Recommendations', icon: 'spark' },
    { id: 'progress',        label: 'Progress',        icon: 'trend' },
  ]},
  { group: 'Wellbeing', items: [
    { id: 'mood',            label: 'Mood Tracker',    icon: 'smile' },
    { id: 'solace',          label: 'Solace AI',       icon: 'chat' },
    { id: 'environment',     label: 'Environment',     icon: 'sun' },
  ]},
  { group: 'Account', items: [
    { id: 'reports',         label: 'Reports',         icon: 'chart' },
    { id: 'profile',         label: 'Profile',         icon: 'user' },
    { id: 'settings',        label: 'Settings',        icon: 'settings' },
  ]},
];

export default function Sidebar() {
  const { page, navigate, user, logout } = useApp();
  const isPro = user?.plan === 'pro' || user?.plan === 'clinic';

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="sidebar-brand" onClick={() => navigate('dashboard')} aria-label="Go to dashboard">
        <Logo size={32} />
      </button>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.group} className="sidebar-group">
            <div className="sidebar-label">{section.group}</div>
            {section.items.map(item => (
              <button key={item.id}
                className={`nav-item${page === item.id ? ' active' : ''}`}
                aria-current={page === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}>
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.badge && <em className="nav-badge">{item.badge}</em>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {!isPro && (
          <div className="sidebar-upgrade">
            <span className="sidebar-upgrade-icon"><Icon name="crown" size={16} /></span>
            <strong>SkinVeda Pro</strong>
            <p>Unlimited scans, full reports and expert-reviewed plans.</p>
            <button className="btn btn-dark btn-sm btn-block" onClick={() => navigate('pricing')}>Upgrade</button>
          </div>
        )}
        <button className={`nav-item${page === 'help' ? ' active' : ''}`} onClick={() => navigate('help')}>
          <Icon name="help" size={18} /><span>Help &amp; support</span>
        </button>
        <div className="sidebar-user">
          <button className="sidebar-user-main" onClick={() => navigate('profile')}>
            <span className="avatar">{initialsOf(user?.name)}</span>
            <span className="sidebar-user-info">
              <strong>{user?.name || 'User'}</strong>
              <small>{isPro ? 'Pro member' : 'Free plan'}</small>
            </span>
          </button>
          <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
