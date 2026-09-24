import { useApp } from '../App';
import { Icon, Logo } from './ui';
import { initialsOf } from '../lib/skin';

const TITLES = {
  dashboard: 'Home', scan: 'Face scan', 'my-skin': 'My Skin', products: 'Products', doctors: 'Doctors',
  progress: 'Progress', mood: 'Mood & stress', solace: 'Solace AI', environment: 'UV & weather',
  reports: 'Reports', profile: 'Profile', settings: 'Settings', pricing: 'Plans', help: 'Help & safety',
};

export default function TopBar() {
  const { page, navigate, user, setNavOpen, theme } = useApp();
  const dark = theme.resolved === 'dark';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn topbar-menu" onClick={() => setNavOpen(o => !o)} aria-label="Open navigation"><Icon name="menu" size={20} /></button>
        <button className="topbar-mobile-logo" onClick={() => navigate('dashboard')} aria-label="SkinVeda home"><Logo size={28} /></button>
        <div className="topbar-title">{TITLES[page] || 'SkinVeda.ai'}</div>
      </div>
      <div className="topbar-right">
        <button className="icon-btn" onClick={theme.toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
          <Icon name={dark ? 'sun' : 'moon'} size={18} />
        </button>
        {page !== 'scan' && (
          <button className="btn btn-primary btn-sm topbar-hide-sm" onClick={() => navigate('scan')}><Icon name="scan" size={16} /> Scan skin</button>
        )}
        <button className="avatar avatar-btn" onClick={() => navigate('profile')} aria-label="Your profile">{initialsOf(user?.name)}</button>
      </div>
    </header>
  );
}
