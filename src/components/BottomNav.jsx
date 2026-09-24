import { useApp } from '../App';
import { Icon } from './ui';

const ITEMS = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'progress', label: 'Progress', icon: 'trend' },
  { id: 'scan', label: 'Scan', icon: 'scan', primary: true },
  { id: 'doctors', label: 'Doctors', icon: 'doctor' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

/** Mobile-only tab bar (hidden above 720px via CSS). */
export default function BottomNav() {
  const { page, navigate } = useApp();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map(i => (
        <button key={i.id} className={`${page === i.id ? 'active' : ''}${i.primary ? ' bottom-scan' : ''}`}
          aria-current={page === i.id ? 'page' : undefined} onClick={() => navigate(i.id)}>
          <span><Icon name={i.icon} size={i.primary ? 22 : 20} /></span>
          <span>{i.label}</span>
        </button>
      ))}
    </nav>
  );
}
