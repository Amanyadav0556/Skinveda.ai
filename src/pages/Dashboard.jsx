import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../App';
import { Icon, LineChart, Meter, EmptyState } from '../components/ui';
import { SkinScoreCard, EscalationNotice, SafetyNotice } from '../components/skin';
import { AppointmentCard } from '../components/commerce';
import { buildRoutine, ingredientPlan } from '../lib/routine';
import { recommendProducts } from '../lib/catalog';
import { useRoutineLog, firstName, useNow } from '../lib/skin';
import { METRICS, readMetric } from '../lib/records';
import { INGREDIENTS, SKIN_TYPES } from '../data/skincare';
import { formatDate, timeAgo } from '../data/mockData';

const DAY = 864e5;
const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;

export default function Dashboard() {
  const { user, navigate, scans, openScan, appointments } = useApp();
  const [done, toggle] = useRoutineLog();
  const [products, setProducts] = useState([]);
  const now = useNow();

  const latest = scans[0];
  const prev = scans[1];
  const skinType = latest?.skinType || (SKIN_TYPES.includes(user?.skinType) ? user.skinType : 'Normal');
  const concernIds = useMemo(() => (latest ? latest.concerns.map(c => c.id) : []), [latest]);

  useEffect(() => {
    recommendProducts({ skinType, concerns: concernIds, limit: 2 }).then(setProducts);
  }, [skinType, concernIds]);

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isAM = hour < 15;
  const routine = buildRoutine(skinType, concernIds);
  const steps = isAM ? routine.am : routine.pm;
  const doneCount = steps.filter(s => done.includes(s.id)).length;
  const ingredient = INGREDIENTS[ingredientPlan(skinType, concernIds).recommended.find(i => i !== 'sunscreen') || 'sunscreen'];

  const daysSince = latest ? Math.floor((now - new Date(latest.timestamp).getTime()) / DAY) : null;
  const nextScanIn = latest ? Math.max(0, 7 - daysSince) : 0;
  const chart = [...scans].reverse().slice(-8).map(s => ({ label: formatDate(s.timestamp).replace(/, \d{4}$/, ''), value: s.skinScore }));
  const changes = latest && prev
    ? METRICS.map(m => ({ ...m, now: latest.metrics[m.key], diff: latest.metrics[m.key] - prev.metrics[m.key] }))
        .filter(m => m.diff !== 0).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 3)
    : [];
  const nextAppt = appointments.find(a => a.status !== 'cancelled' && new Date(a.slot).getTime() > now);

  return (
    <div className="stack">
      <header className="dash-head">
        <div>
          <h1>{greeting}, {firstName(user)}</h1>
          <p>{latest ? `Your last scan was ${timeAgo(latest.timestamp).toLowerCase()}.` : "Let's start with a quick face scan."}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> Scan skin</button>
      </header>

      {!latest ? (
        <section className="card">
          <EmptyState icon="face" title="Get your first skin report"
            text="One clear photo gives you a wellness score, a summary of visible concerns and a routine built around them. It takes about a minute."
            action={<button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> Scan my skin</button>} />
        </section>
      ) : (
        <>
          {latest.escalation?.recommended && <EscalationNotice reasons={latest.escalation.reasons} onFindDoctor={() => navigate('doctors')} />}
          <section className="grid g-main">
            {/* Current score + latest summary */}
            <div className="card">
              <div className="dash-summary">
                <SkinScoreCard score={latest.skinScore} delta={prev ? latest.skinScore - prev.skinScore : null} size={112} />
                <div>
                  <span className="stat-label">Latest scan · {formatDate(latest.timestamp)}</span>
                  <p style={{ fontSize: 15.5, color: 'var(--text)' }}>{latest.summary}</p>
                  <div className="chip-row mt-16">
                    {latest.concerns[0] && <span className="pill pill-primary">Main concern: {latest.concerns[0].name}</span>}
                    <span className="pill">{latest.skinType} skin (estimate)</span>
                  </div>
                  <button className="btn btn-sm btn-ghost mt-16" onClick={() => openScan(latest.id)}>View full report <Icon name="arrow" size={15} /></button>
                </div>
              </div>
            </div>
            {/* Next recommended scan */}
            <div className="card">
              <div className="card-head"><h3>Next recommended scan</h3><Icon name="calendar" size={18} className="muted" /></div>
              <div className="stat-value">{nextScanIn === 0 ? 'Today' : `In ${nextScanIn} day${nextScanIn > 1 ? 's' : ''}`}</div>
              <p className="t-small ink2 mt-8">Weekly scans in the same light and angle show real change most clearly.</p>
              <Meter value={Math.min(100, (daysSince / 7) * 100)} thin />
              <button className={`btn btn-sm mt-16 ${nextScanIn === 0 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => navigate('scan')}>Scan now</button>
            </div>
          </section>
        </>
      )}

      <section className="grid g-main">
        {/* Today's routine */}
        <div className="card">
          <div className="card-head">
            <div><h3>Today's {isAM ? 'morning' : 'night'} routine</h3><p className="card-sub">{doneCount} of {steps.length} done</p></div>
            <button className="btn-text t-small" onClick={() => navigate('my-skin/routine')}>Full routine</button>
          </div>
          <div className="routine-list">
            {steps.map(s => (
              <button key={s.id} className={`routine-item${done.includes(s.id) ? ' done' : ''}`} onClick={() => toggle(s.id)} aria-pressed={done.includes(s.id)}>
                <span className="routine-check"><Icon name="check" size={13} stroke={2.6} /></span>
                <span className="list-body"><strong>{s.title}</strong><small>{s.lookFor}</small></span>
                <span className="routine-step">{s.step}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Recommended ingredient */}
        <div className="card">
          <div className="card-head"><h3>Ingredient to look for</h3><Icon name="flask" size={18} className="muted" /></div>
          <strong className="h-card">{ingredient.name}</strong>
          <p className="t-small ink2 mt-8">{ingredient.mayHelp}</p>
          <p className="t-help mt-8">{ingredient.usage}</p>
          <button className="btn btn-sm btn-ghost mt-16" onClick={() => navigate('my-skin/ingredients')}>All ingredients for you</button>
        </div>
      </section>

      <section className="grid g-3">
        {/* Progress since last scan */}
        <div className="card">
          <div className="card-head"><h3>Progress</h3><button className="btn-text t-small" onClick={() => navigate('progress')}>Details</button></div>
          {chart.length >= 2 ? (
            <>
              <LineChart points={chart} height={120} ariaLabel="Skin score over recent scans" />
              <ul className="rows soft mt-8">
                {changes.map(c => {
                  const good = c.better === 'high' ? c.diff > 0 : c.better === 'low' ? c.diff < 0 : Math.abs(c.now - 42) < Math.abs(c.now - c.diff - 42);
                  return <li key={c.key}><span>{c.label}</span><b className={good ? 'up' : 'down'}>{c.diff > 0 ? '+' : ''}{c.diff} · {readMetric(c.key, c.now).text}</b></li>;
                })}
              </ul>
            </>
          ) : <p className="t-small ink2">Your progress appears after your second scan.</p>}
        </div>
        {/* Product suggestions */}
        <div className="card">
          <div className="card-head"><h3>Products you could explore</h3></div>
          {products.map(({ product, reason }) => (
            <button key={product.id} className="list-item" onClick={() => navigate(`products/${product.id}`)} title={reason}>
              <span className="list-thumb"><Icon name="bag" size={18} /></span>
              <span className="list-body"><strong>{product.name}</strong><small>{product.brand} · {inr(product.price)}</small></span>
              <Icon name="chevron" size={16} className="muted" />
            </button>
          ))}
          <p className="t-help mt-8">Optional — your routine works with any product that has the right ingredients.</p>
        </div>
        {/* Doctor shortcut */}
        <div className="card">
          <div className="card-head"><h3>Dermatologist</h3><Icon name="doctor" size={18} className="muted" /></div>
          {nextAppt ? (
            <><p className="t-small ink2" style={{ marginBottom: 10 }}>Your next consultation</p><AppointmentCard appt={nextAppt} /></>
          ) : (
            <p className="t-small ink2">Want a professional opinion on your skin? Video, chat and clinic consultations are available when you need them.</p>
          )}
          <button className="btn btn-sm btn-ghost mt-16" onClick={() => navigate('doctors')}>Consult a dermatologist</button>
        </div>
      </section>

      <SafetyNotice compact />
    </div>
  );
}
