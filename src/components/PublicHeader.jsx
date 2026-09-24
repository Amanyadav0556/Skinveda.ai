import { useApp } from '../App';
import { Logo } from './ui';

// Header for public, non-landing pages (Pricing, Help) when signed out.
export default function PublicHeader() {
  const { page, navigate } = useApp();
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <button onClick={() => navigate('landing')} aria-label="SkinVeda.ai home"><Logo /></button>
        <nav>
          <button className={page === 'pricing' ? 'active' : ''} onClick={() => navigate('pricing')}>Pricing</button>
          <button className={page === 'help' ? 'active' : ''} onClick={() => navigate('help')}>Help</button>
        </nav>
        <div className="public-header-cta">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('login')}>Sign in</button>
          <button className="btn btn-dark btn-sm" onClick={() => navigate('signup')}>Get Started</button>
        </div>
      </div>
    </header>
  );
}
