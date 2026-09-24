import { useApp } from '../App';
import { Icon, Logo } from './ui';
import { initialsOf } from '../lib/skin';

const PRIMARY_NAV = [
  { id: 'dashboard', label: 'Home',     icon: 'home' },
  { id: 'my-skin',   label: 'My Skin',  icon: 'face' },
  { id: 'products',  label: 'Products', icon: 'bag' },
  { id: 'doctors',   label: 'Doctors',  icon: 'doctor' },
  { id: 'progress',  label: 'Progress', icon: 'trend' },
];

const MORE_NAV = [
  { id: 'mood',        label: 'Mood & stress', icon: 'smile' },
  { id: 'solace',      label: 'Solace AI',     icon: 'chat' },
  { id: 'environment', label: 'UV & weather',  icon: 'sun' },
  { id: 'reports',     label: 'Reports',       icon: 'file' },
];

export default function Sidebar() {
  const { page, navigate, user, logout } = useApp();

  const item = n => (
    <button key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`}
      aria-current={page === n.id ? 'page' : undefined} onClick={() => navigate(n.id)}>
      <Icon name={n.icon} size={18} /><span>{n.label}</span>
    </button>
  );

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="sidebar-brand" onClick={() => navigate('dashboard')} aria-label="SkinVeda home"><Logo size={32} /></button>
      <button className={`btn btn-primary btn-block sidebar-cta${page === 'scan' ? ' active' : ''}`} onClick={() => navigate('scan')}>
        <Icon name="scan" size={17} /> Scan skin
      </button>

      <nav className="sidebar-nav">
        <div className="sidebar-group">{PRIMARY_NAV.map(item)}</div>
        <div className="sidebar-group">
          <div className="sidebar-label">More</div>
          {MORE_NAV.map(item)}
        </div>
      </nav>

      <div className="sidebar-bottom">
        {item({ id: 'help', label: 'Help & safety', icon: 'help' })}
        {item({ id: 'settings', label: 'Settings', icon: 'settings' })}
        <div className="sidebar-user">
          <button className="sidebar-user-main" onClick={() => navigate('profile')} aria-label="Your profile">
            <span className="avatar">{initialsOf(user?.name)}</span>
            <span className="sidebar-user-info">
              <strong>{user?.name || 'You'}</strong>
              <small>View profile</small>
            </span>
          </button>
          <button className="icon-btn" onClick={() => logout()} title="Sign out" aria-label="Sign out"><Icon name="logout" size={17} /></button>
        </div>
      </div>
    </aside>
  );
}
