import { useApp } from '../App';
import { Icon } from './ui';
import { ENV_DATA } from '../data/mockData';
import { firstName, initialsOf } from '../lib/skin';

const PAGE_LABELS = {
  dashboard:       'Dashboard',
  diagnosis:       'Skin Analysis',
  results:         'Analysis Results',
  recommendations: 'Recommendations',
  mood:            'Mood Tracker',
  solace:          'Solace AI',
  environment:     'Environment',
  progress:        'Progress',
  reports:         'Reports',
  profile:         'Profile',
  settings:        'Settings',
  pricing:         'Plans & Pricing',
  help:            'Help & Support',
};

export default function TopBar() {
  const { page, navigate, user, setNavOpen } = useApp();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn topbar-menu" onClick={() => setNavOpen(o => !o)} aria-label="Open navigation">
          <Icon name="menu" size={20} />
        </button>
        <div>
          <div className="topbar-greet">{greeting}, {firstName(user)}</div>
          <div className="topbar-title">{PAGE_LABELS[page] || 'SkinVeda.ai'}</div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-chip" onClick={() => navigate('environment')} title="Today's conditions">
          <Icon name="sun" size={16} />
          <span>{ENV_DATA.current.temperature}°</span>
          <span className="topbar-chip-sep" />
          <span>UV {ENV_DATA.current.uvIndex}</span>
        </button>
        <button className="icon-btn has-dot" title="Notifications" aria-label="Notifications">
          <Icon name="bell" size={18} />
        </button>
        <button className="btn btn-dark btn-sm topbar-cta" onClick={() => navigate('diagnosis')}>
          <Icon name="scan" size={16} /> <span>New scan</span>
        </button>
        <button className="avatar avatar-btn" onClick={() => navigate('profile')} aria-label="Profile">
          {initialsOf(user?.name)}
        </button>
      </div>
    </header>
  );
}
