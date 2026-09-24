import { Icon } from './ui';
import { INGREDIENTS } from '../data/skincare';
import { CONSULT_MODES } from '../data/doctors';
import { initialsOf } from '../lib/skin';

/* ================================================================
   Products & dermatologists — cards used by the marketplace,
   doctor directory, report and dashboard.
   ================================================================ */

const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;
const catClass = c => `pv-${c.toLowerCase().replace(/[^a-z]+/g, '-')}`;

/** Neutral product illustration (no fake packshots). */
export function ProductVisual({ product, large }) {
  return (
    <div className={`${large ? 'pd-visual' : 'product-visual'} ${catClass(product.category)}`} aria-hidden="true">
      {!large && <span className="pill pill-mono">{product.category}</span>}
      {product.sponsored && <span className="pill pill-sponsored">Sponsored</span>}
      <svg className="bottle" viewBox="0 0 64 100">
        <rect x="22" y="2" width="20" height="16" rx="4" fill="var(--pv-cap)" />
        <rect x="18" y="16" width="28" height="8" rx="2" fill="var(--pv-cap)" opacity=".85" />
        <rect x="8" y="24" width="48" height="74" rx="14" fill="var(--pv-body)" />
        <rect x="16" y="46" width="32" height="30" rx="5" fill="var(--surface)" opacity=".8" />
        <rect x="21" y="53" width="22" height="3" rx="1.5" fill="var(--pv-cap)" opacity=".6" />
        <rect x="21" y="60" width="15" height="3" rx="1.5" fill="var(--pv-cap)" opacity=".35" />
      </svg>
    </div>
  );
}

export function RecommendationExplanation({ reason, title = 'Why recommended?' }) {
  if (!reason) return null;
  return (
    <div className="why-box">
      <Icon name="spark" size={16} />
      <span><strong>{title}</strong> {reason}</span>
    </div>
  );
}

export function ProductCard({ product, reason, onOpen }) {
  const ingredients = product.keyIngredients.map(i => INGREDIENTS[i]?.short || i);
  return (
    <article className="product-card">
      <ProductVisual product={product} />
      <div>
        <span className="product-brand">{product.brand}</span>
        <h4>{product.name}</h4>
      </div>
      <div className="chip-row" aria-label="Key ingredients">
        {ingredients.slice(0, 2).map(i => <span key={i} className="pill">{i}</span>)}
      </div>
      <p className="t-small ink2">{product.benefit}</p>
      {reason && <RecommendationExplanation reason={reason} />}
      <div className="row-between" style={{ marginTop: 'auto' }}>
        <span className="product-price">{inr(product.price)} <small className="muted" style={{ fontWeight: 500, fontSize: 12.5 }}>· {product.size}</small></span>
        <button className="btn btn-sm btn-ghost" onClick={() => onOpen(product.id)} aria-label={`View details for ${product.name}`}>
          View details
        </button>
      </div>
    </article>
  );
}

export function DoctorAvatar({ doctor, size = 'lg' }) {
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{initialsOf(doctor.name.replace(/^Dr\.\s*/, ''))}</span>;
}

export function DoctorCard({ doctor, nextSlot, onOpen, onBook }) {
  const fees = doctor.modes.map(m => doctor.fees[m]).filter(Boolean);
  return (
    <article className="doctor-card">
      <div className="doctor-head">
        <DoctorAvatar doctor={doctor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-between" style={{ alignItems: 'flex-start' }}>
            <h3>{doctor.name}</h3>
            <span className="pill pill-info">Sample profile</span>
          </div>
          <p>{doctor.qualification} · {doctor.experience} yrs experience</p>
        </div>
      </div>
      <div className="chip-row">{doctor.expertise.map(e => <span key={e} className="pill">{e}</span>)}</div>
      <ul className="doctor-meta">
        <li><Icon name="video" size={15} /> {doctor.modes.map(m => CONSULT_MODES[m].short).join(' · ')}</li>
        <li><Icon name="pin" size={15} /> {doctor.area === 'Online only' ? 'Online only' : `${doctor.area}, ${doctor.city}`}</li>
        <li><Icon name="language" size={15} /> {doctor.languages.join(', ')}</li>
        {nextSlot && <li><Icon name="clock" size={15} /> Next available {nextSlot.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</li>}
      </ul>
      <div className="row-between" style={{ marginTop: 'auto' }}>
        <span className="t-small ink2">{fees.length ? `From ${inr(Math.min(...fees))}` : 'Fee on request'}</span>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => onOpen(doctor.id)}>View profile</button>
          <button className="btn btn-sm btn-primary" onClick={() => onBook(doctor.id)}>Book</button>
        </div>
      </div>
    </article>
  );
}

const STATUS_PILL = { requested: 'pill-info', confirmed: 'pill-good', cancelled: '', completed: 'pill-primary' };

export function AppointmentCard({ appt, onCancel }) {
  const d = new Date(appt.slot);
  const upcoming = d.getTime() > Date.parse(new Date().toISOString()) && appt.status !== 'cancelled';
  return (
    <div className="appointment">
      <div className="appointment-date">
        <small>{d.toLocaleString('en-IN', { month: 'short' })}</small>
        <b>{d.getDate()}</b>
      </div>
      <div className="list-body">
        <strong>{appt.doctorName}</strong>
        <small>{CONSULT_MODES[appt.mode]?.label} · {d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}{appt.fee ? ` · ${inr(appt.fee)}` : ''}</small>
      </div>
      <span className={`pill ${STATUS_PILL[appt.status] || ''}`} style={{ textTransform: 'capitalize' }}>{appt.status}</span>
      {upcoming && onCancel && <button className="btn btn-sm btn-text" onClick={() => onCancel(appt.id)}>Cancel</button>}
    </div>
  );
}
