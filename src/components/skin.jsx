import { useEffect, useRef } from 'react';
import { Icon, ScoreRing, Meter } from './ui';
import { CONCERNS, INGREDIENTS } from '../data/skincare';
import { METRICS, readMetric, scoreWord } from '../lib/records';
import { SEVERITY_LABEL } from '../lib/analysis';

/* ================================================================
   Skin-specific building blocks shared by Scan, Report, Dashboard
   and Progress.
   ================================================================ */

export function SkinScoreCard({ score, delta, size = 104, caption = 'Skin wellness score' }) {
  return (
    <div className="score-card">
      <ScoreRing value={score} size={size} stroke={Math.round(size / 11)} label={`${caption} ${score} out of 100`} />
      <div>
        <span className="stat-label">{caption}</span>
        <strong>{scoreWord(score)}</strong>
        {delta != null && (
          <span className={`score-delta ${delta >= 0 ? 'up' : 'down'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} since last scan
          </span>
        )}
      </div>
    </div>
  );
}

const SEV_PILL = { mild: 'pill-good', moderate: 'pill-warn', noticeable: 'pill-bad' };

export function ConcernCard({ concern, primary, explain = true }) {
  const info = CONCERNS[concern.id];
  return (
    <article className={`finding${primary ? ' primary' : ''}`}>
      <div className="finding-head">
        <div>
          <strong>{concern.name}</strong>
          <small>{primary ? 'Main visible concern' : 'Also visible'}{concern.areas?.length ? ` · ${concern.areas.join(', ')}` : ''}</small>
        </div>
        <span className={`pill ${SEV_PILL[concern.severity] || ''}`}>{SEVERITY_LABEL[concern.severity] || concern.severity}</span>
      </div>
      {explain && info && <p>{info.short}</p>}
      <div className="finding-meter" title="How visible this looks in your photo">
        <span>Visibility</span>
        <Meter value={concern.score} tone={primary ? 'emerald' : 'sage'} thin />
        {concern.confidence != null && <span className="nowrap">{Math.round(concern.confidence * 100)}% confidence</span>}
      </div>
    </article>
  );
}

export function MetricTile({ metricKey, value, previous }) {
  const m = METRICS.find(x => x.key === metricKey);
  const read = readMetric(metricKey, value);
  const diff = previous != null ? value - previous : null;
  const improved = diff == null ? null : m.better === 'high' ? diff >= 0 : m.better === 'low' ? diff <= 0 : Math.abs(value - 42) <= Math.abs(previous - 42);
  return (
    <div className="metric" title={m.hint}>
      <div className="metric-top"><span>{m.label}</span><b>{value}</b></div>
      <Meter value={value} tone={read.attention ? 'accent' : 'emerald'} thin />
      <small className={read.attention ? 'attention' : 'ok'}>
        {read.text}
        {diff != null && diff !== 0 && <span className={improved ? 'up' : 'down'}> · {diff > 0 ? '+' : ''}{diff}</span>}
      </small>
    </div>
  );
}

// Simple face outline with the zones where concerns were seen
const ZONE_SHAPES = {
  'Forehead':         { el: 'ellipse', cx: 100, cy: 62,  rx: 46, ry: 18 },
  'Under eyes':       { el: 'ellipse', cx: 100, cy: 112, rx: 50, ry: 8 },
  'Nose':             { el: 'ellipse', cx: 100, cy: 128, rx: 11, ry: 22 },
  'Cheeks':           [{ el: 'ellipse', cx: 62, cy: 142, rx: 20, ry: 22 }, { el: 'ellipse', cx: 138, cy: 142, rx: 20, ry: 22 }],
  'Around the mouth': { el: 'ellipse', cx: 100, cy: 172, rx: 28, ry: 10 },
  'Upper lip':        { el: 'ellipse', cx: 100, cy: 160, rx: 18, ry: 5 },
  'Chin':             { el: 'ellipse', cx: 100, cy: 200, rx: 22, ry: 12 },
  'Around the eyes':  [{ el: 'ellipse', cx: 72, cy: 102, rx: 18, ry: 9 }, { el: 'ellipse', cx: 128, cy: 102, rx: 18, ry: 9 }],
};

export function FaceMap({ concerns = [] }) {
  const zones = [...new Set(concerns.slice(0, 3).flatMap(c => c.areas || []))];
  return (
    <figure className="face-map" aria-label={zones.length ? `Concern areas: ${zones.join(', ')}` : 'No concern areas'}>
      <svg viewBox="0 0 200 240" role="img">
        <path className="face-outline" d="M100 20c-44 0-70 34-70 84 0 58 30 116 70 116s70-58 70-116c0-50-26-84-70-84z" />
        {zones.flatMap(z => [].concat(ZONE_SHAPES[z] || [])).map((s, i) => (
          <ellipse key={i} className="zone" cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />
        ))}
      </svg>
      {zones.length > 0 && <figcaption className="t-help" style={{ textAlign: 'center', marginTop: 6 }}>Highlighted: {zones.join(', ')}</figcaption>}
    </figure>
  );
}

export function RoutineStep({ step, index, done, onToggle }) {
  return (
    <li className={`rstep${done ? ' done' : ''}`}>
      <span className="rstep-num" aria-hidden="true">{done ? <Icon name="check" size={14} stroke={2.6} /> : index + 1}</span>
      <div>
        <div className="rstep-title">
          <div><small>{step.step}</small><strong>{step.title}</strong></div>
          {onToggle && (
            <button className={`btn btn-sm ${done ? 'btn-soft' : 'btn-ghost'}`} onClick={() => onToggle(step.id)} aria-pressed={done}>
              {done ? 'Done' : 'Mark done'}
            </button>
          )}
        </div>
        <dl>
          <dt>Why</dt><dd>{step.why}</dd>
          {step.lookFor && <><dt>Look for</dt><dd>{step.lookFor}</dd></>}
          <dt>How often</dt><dd>{step.frequency}</dd>
          {step.precaution && <><dt>Note</dt><dd>{step.precaution}</dd></>}
        </dl>
      </div>
    </li>
  );
}

export function IngredientCard({ id, skinType, careful }) {
  const ing = INGREDIENTS[id];
  if (!ing) return null;
  const suits = skinType && ing.skinTypes.includes(skinType);
  return (
    <article className={`ingredient${careful ? ' careful' : ''}`}>
      <div className="row-between">
        <h4>{ing.name}</h4>
        {careful
          ? <span className="pill pill-warn"><Icon name="alert" size={12} /> Use carefully</span>
          : suits ? <span className="pill pill-primary"><Icon name="check" size={12} stroke={2.4} /> For you</span> : null}
      </div>
      <p>{ing.mayHelp}</p>
      <dl>
        <div><dt>Suits</dt><dd>{ing.skinTypes.join(', ')} skin</dd></div>
        <div><dt>How to use</dt><dd>{ing.usage}</dd></div>
        <div><dt>Precautions</dt><dd>{ing.precautions}</dd></div>
      </dl>
    </article>
  );
}

export function SafetyNotice({ compact }) {
  return (
    <div className={`ui-disclaimer${compact ? ' compact' : ''}`} role="note">
      <Icon name="shield" size={16} />
      <span>SkinVeda.ai provides AI-assisted skincare guidance and does not replace professional medical diagnosis.</span>
    </div>
  );
}

export function EscalationNotice({ reasons = [], onFindDoctor }) {
  return (
    <div className="callout callout-warn" role="alert">
      <Icon name="doctor" size={20} />
      <div>
        <strong>Professional consultation recommended</strong>
        Our AI assessment may not be sufficient for this concern. Consider speaking with a qualified dermatologist.
        {reasons.length > 0 && <ul style={{ margin: '8px 0 0', paddingLeft: 18, listStyle: 'disc' }}>{reasons.map(r => <li key={r}>{r}</li>)}</ul>}
        {onFindDoctor && <button className="btn btn-sm btn-ghost mt-8" onClick={onFindDoctor}><Icon name="doctor" size={15} /> Find a dermatologist</button>}
      </div>
    </div>
  );
}

export function NextActions({ actions }) {
  return (
    <nav className="next-actions" aria-label="What to do next">
      {actions.map(a => (
        <button key={a.label} className={`next-action${a.primary ? ' primary' : ''}`} onClick={a.onClick}>
          <span><Icon name={a.icon} size={17} /></span>
          <span>{a.label}{a.sub && <small>{a.sub}</small>}</span>
        </button>
      ))}
    </nav>
  );
}

export function SampleBanner({ children }) {
  return (
    <div className="sample-banner" role="note">
      <Icon name="info" size={16} />
      <span>{children}</span>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton skeleton-title" />
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skeleton skeleton-text" style={{ width: `${90 - i * 12}%` }} />)}
    </div>
  );
}

/** Accessible modal dialog: Esc closes, focus moves inside, backdrop click closes. */
export function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    ref.current?.querySelector('button, input, select, textarea')?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="dialog-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
