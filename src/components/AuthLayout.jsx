import { useApp } from '../App';
import { Icon, Logo, ScoreRing } from './ui';

const POINTS = [
  { icon: 'scan',   text: 'AI-assisted skin analysis from a single photo' },
  { icon: 'spark',  text: 'A routine and ingredients matched to your skin' },
  { icon: 'doctor', text: 'Dermatologists available when you want expert advice' },
  { icon: 'lock',   text: 'Your photos stay private — delete them anytime' },
];

/** Split-screen auth frame: brand panel left, form right. */
export default function AuthLayout({ title, subtitle, topLink, children }) {
  const { navigate } = useApp();
  return (
    <div className="auth">
      <aside className="auth-visual" aria-hidden="true">
        <svg className="auth-contours" viewBox="0 0 400 400">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <ellipse key={i} cx="200" cy="200" rx={190 - i * 24} ry={170 - i * 22} fill="none"
              stroke="#A8CBB9" strokeOpacity={0.15 + i * 0.07} strokeDasharray={i % 2 ? '3 6' : 'none'} />
          ))}
        </svg>
        <Logo size={34} />
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div style={{ display: 'grid', gap: 22 }}>
          <div className="auth-card-float">
            <ScoreRing value={78} size={64} stroke={6} color="var(--inverse-accent)" />
            <div>
              <small className="mono">Example report</small>
              <strong>Very good · ▲ 5 since last scan</strong>
              <small>Combination skin · mild pigmentation</small>
            </div>
          </div>
          <ul className="auth-points">
            {POINTS.map(p => (
              <li key={p.text}><span><Icon name={p.icon} size={15} /></span><span>{p.text}</span></li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top">
          <button className="auth-mobile-logo" onClick={() => navigate('landing')} aria-label="Home"><Logo size={28} /></button>
          {topLink && <div className="auth-top-link">{topLink}</div>}
        </div>
        {children}
        <p className="auth-foot">
          By continuing you agree to our Terms and Privacy Policy. SkinVeda provides AI-assisted insights, not medical diagnosis.
        </p>
      </main>
    </div>
  );
}
