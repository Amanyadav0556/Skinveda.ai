import { useState } from 'react';
import { useApp } from '../App';
import { Icon, Segmented } from '../components/ui';

const PLANS = [
  {
    id: 'free', name: 'Free', monthly: 0, yearly: 0,
    desc: 'Everything you need to understand your skin today.',
    cta: 'Start free',
    features: ['3 AI skin analyses / month', 'Skin score & key metrics', 'Basic AM/PM routine', 'Mood tracker', 'UV & air quality alerts'],
  },
  {
    id: 'pro', name: 'Pro', monthly: 299, yearly: 199, featured: true,
    desc: 'For people serious about seeing — and proving — real change.',
    cta: 'Go Pro',
    features: ['Unlimited analyses', 'Full detailed reports & exports', 'Personalised routine + product matching', 'Progress charts, photo compare & milestones', 'Unlimited Solace AI conversations', 'Priority model updates'],
  },
  {
    id: 'clinic', name: 'Clinic', monthly: 1499, yearly: 1199,
    desc: 'For dermatologists and clinics monitoring patients remotely.',
    cta: 'Talk to us',
    features: ['Everything in Pro', 'Up to 50 patient profiles', 'Shared reports with patients', 'Clinician review workflow', 'Dedicated support'],
  },
];

const ROWS = [
  { group: 'Analysis' },
  { label: 'AI skin analyses', v: ['3 / month', 'Unlimited', 'Unlimited'] },
  { label: 'Skin score & 6 metrics', v: [true, true, true] },
  { label: 'Concern detection with confidence', v: [true, true, true] },
  { label: 'Detailed report & PDF export', v: [false, true, true] },
  { group: 'Care plan' },
  { label: 'AM/PM routine', v: ['Basic', 'Personalised', 'Personalised'] },
  { label: 'Product matching', v: [false, true, true] },
  { label: 'Concern-based advice', v: [true, true, true] },
  { group: 'Tracking' },
  { label: 'Progress charts', v: ['30 days', 'Full history', 'Full history'] },
  { label: 'Before/after photo compare', v: [false, true, true] },
  { label: 'Weekly AI reports', v: [false, true, true] },
  { group: 'Support' },
  { label: 'Solace AI companion', v: ['10 msgs / day', 'Unlimited', 'Unlimited'] },
  { label: 'Patient management', v: [false, false, true] },
  { label: 'Support', v: ['Community', 'Priority email', 'Dedicated'] },
];

const fmt = n => n.toLocaleString('en-IN');

export default function Pricing() {
  const { user, updateUser, navigate, showToast } = useApp();
  const [billing, setBilling] = useState('yearly');
  const current = user?.plan || 'free';

  const choose = plan => {
    if (!user) { navigate('signup'); return; }
    if (plan.id === 'clinic') { navigate('help'); return; }
    if (plan.id === current) return;
    // Demo only — no payment integration yet
    updateUser({ plan: plan.id });
    showToast(plan.id === 'free' ? 'Switched to the Free plan' : 'Pro activated (demo — no payment taken)', 'success');
  };

  return (
    <>
      <section className="help-hero">
        <span className="ui-eyebrow">Plans &amp; pricing</span>
        <h1>Invest in skin that’s <em>measurably</em> better</h1>
        <p>Start free. Upgrade when you want the full picture — cancel anytime.</p>
      </section>
      <div className="price-toggle">
        <Segmented value={billing} onChange={setBilling}
          options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly · save 33%' }]} />
      </div>

      <div className="price-grid">
        {PLANS.map(p => {
          const price = billing === 'yearly' ? p.yearly : p.monthly;
          const isCurrent = user && current === p.id;
          return (
            <article key={p.id} className={`price-card${p.featured ? ' featured' : ''}`}>
              <div className="price-name">
                <h3>{p.name}</h3>
                {p.featured ? <span className="pill pill-clay">Most popular</span> : isCurrent ? <span className="pill pill-emerald">Current</span> : null}
              </div>
              <div className="price-amount">
                <b>₹{fmt(price)}</b>
                <span>{price ? `/ month${billing === 'yearly' ? ', billed yearly' : ''}` : 'forever'}</span>
              </div>
              <p className="price-desc">{p.desc}</p>
              <button className={`btn btn-lg btn-block ${p.featured ? 'btn-light' : isCurrent ? 'btn-soft' : 'btn-dark'}`} onClick={() => choose(p)} disabled={isCurrent && p.featured}>
                {isCurrent ? 'Current plan' : p.cta} {!isCurrent && <Icon name="arrow" size={17} />}
              </button>
              <ul className="price-list">
                {p.features.map(f => <li key={f}><Icon name="check" size={16} stroke={2.4} />{f}</li>)}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="card section-gap" style={{ marginTop: 48 }}>
        <div className="card-head"><div><h3 style={{ fontSize: 20 }}>Compare plans</h3><p className="card-sub">Every feature, side by side</p></div></div>
        <div className="table-scroll">
          <table className="compare-table">
            <thead>
              <tr><th>Feature</th>{PLANS.map(p => <th key={p.id} className={p.featured ? 'hl' : ''}>{p.name}</th>)}</tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => r.group ? (
                <tr key={i} className="group"><td colSpan={4}>{r.group}</td></tr>
              ) : (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  {r.v.map((v, j) => (
                    <td key={j} className={`${PLANS[j].featured ? 'hl' : ''}${typeof v === 'string' ? ' mono-val' : ''}`}>
                      {v === true ? <span className="yes" aria-label="Included"><Icon name="check" size={18} stroke={2.4} /></span>
                        : v === false ? <span className="no" aria-label="Not included">—</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-tint section-gap guarantee">
        <div className="row" style={{ gap: 16 }}>
          <span className="stat-icon" style={{ margin: 0 }}><Icon name="shield" size={20} /></span>
          <div>
            <strong style={{ fontSize: 16 }}>14-day money-back guarantee</strong>
            <p className="ink2" style={{ fontSize: 14 }}>Not seeing value? Get a full refund, no questions asked. Your data stays yours either way.</p>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('help')}>Questions? Visit Help <Icon name="arrow" size={16} /></button>
      </div>
    </>
  );
}
