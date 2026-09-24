import { useMemo, useState } from 'react';
import { useApp } from '../App';
import { Icon, Meter, PageHeader, Segmented } from '../components/ui';
import { ENV_DATA } from '../data/mockData';
import { buildRoutine, matchProducts, guideFor, useRoutineLog, CONCERN_GUIDE } from '../lib/skin';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const CATEGORIES = ['All', 'Cleanser', 'Moisturiser', 'Treatment', 'Sun care', 'Body'];

// Soft product "visual" colours by category
const CAT_TONE = {
  'Cleanser':    ['#EEF4F0', '#9DBFAE', '#1F4D43'],
  'Moisturiser': ['#F7EFE6', '#E7C9A9', '#8A5A2E'],
  'Treatment':   ['#F7E2D9', '#E7A58D', '#9A3F25'],
  'Sun care':    ['#FAF1DA', '#EBCB7B', '#8C6412'],
  'Body':        ['#ECEDF5', '#AEB3D4', '#4B5287'],
};

function Bottle({ tone }) {
  const [, body, cap] = tone;
  return (
    <svg className="bottle" viewBox="0 0 64 100" aria-hidden="true">
      <rect x="22" y="2" width="20" height="16" rx="4" fill={cap} />
      <rect x="18" y="16" width="28" height="8" rx="2" fill={cap} opacity=".85" />
      <rect x="8" y="24" width="48" height="74" rx="14" fill={body} />
      <rect x="16" y="46" width="32" height="30" rx="5" fill="#fff" opacity=".75" />
      <rect x="21" y="53" width="22" height="3" rx="1.5" fill={cap} opacity=".6" />
      <rect x="21" y="60" width="15" height="3" rx="1.5" fill={cap} opacity=".35" />
      <rect x="14" y="30" width="6" height="56" rx="3" fill="#fff" opacity=".25" />
    </svg>
  );
}

const LIFESTYLE = [
  { icon: 'moon',  title: 'Sleep 7–9 hours', text: 'Skin repair peaks between 11 PM and 3 AM. Short sleep raises cortisol and inflammation.' },
  { icon: 'heart', title: 'Manage stress',   text: 'Stress is a top flare trigger. Two minutes of slow breathing measurably lowers cortisol.' },
  { icon: 'drop',  title: 'Hydrate & eat well', text: 'Omega-3s, colourful vegetables and steady water intake support the barrier from within.' },
  { icon: 'sun',   title: `Today: UV ${ENV_DATA.current.uvIndex}`, text: `Humidity ${ENV_DATA.current.humidity}% · AQI ${ENV_DATA.current.aqi}. Reapply SPF and cleanse after being outdoors.` },
];

function RoutineCard({ kind, steps, done, toggle }) {
  const count = steps.filter(s => done.includes(s.id)).length;
  return (
    <div className="card">
      <div className="routine-card-head">
        <span className={kind}><Icon name={kind === 'am' ? 'sun' : 'moon'} size={20} /></span>
        <div style={{ flex: 1 }}>
          <h3>{kind === 'am' ? 'Morning routine' : 'Night routine'}</h3>
          <small>{steps.length} steps · about {kind === 'am' ? 4 : 5} minutes</small>
        </div>
        <span className="pill pill-mono">{count}/{steps.length}</span>
      </div>
      <Meter value={(count / steps.length) * 100} thin />
      <ol className="routine-steps mt-8">
        {steps.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <li key={s.id} className={isDone ? 'done' : ''}>
              <span className="routine-num">{isDone ? <Icon name="check" size={13} stroke={2.6} /> : `0${i + 1}`}</span>
              <div className="list-body">
                <span className="mono muted">{s.step}</span>
                <strong>{s.product}</strong>
                <small>{s.why}</small>
              </div>
              <button className={`btn btn-sm ${isDone ? 'btn-soft' : 'btn-ghost'}`} onClick={() => toggle(s.id)} aria-pressed={isDone}>
                {isDone ? 'Done' : 'Mark done'}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function Recommendations() {
  const { user, diagnoses, showToast } = useApp();
  const latestDisease = diagnoses[0]?.disease;
  const [skinType, setSkinType] = useState(SKIN_TYPES.includes(user?.skinType) ? user.skinType : 'Combination');
  const [concern, setConcern] = useState(CONCERN_GUIDE[latestDisease] ? latestDisease : CONCERN_GUIDE[user?.skinCondition] ? user.skinCondition : 'Eczema');
  const [cat, setCat] = useState('All');
  const [saved, setSaved] = useState([]);
  const [done, toggle] = useRoutineLog();

  const routine = buildRoutine(skinType, concern);
  const products = useMemo(() => matchProducts(skinType, concern), [skinType, concern]);
  const shown = products.filter(p => cat === 'All' || p.category === cat);
  const guide = guideFor(concern);

  const toggleSave = p => {
    setSaved(s => (s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id]));
    if (!saved.includes(p.id)) showToast(`${p.name} saved to your shelf`, 'success');
  };

  return (
    <>
      <PageHeader
        eyebrow="Personalised for you"
        title={<>Your skincare <em>plan</em></>}
        subtitle={`Built for ${skinType.toLowerCase()} skin focusing on ${concern.toLowerCase()}${latestDisease ? ', based on your latest analysis' : ''}.`}
        actions={<>
          <select className="select" style={{ height: 40, width: 'auto', borderRadius: 99 }} value={skinType} onChange={e => setSkinType(e.target.value)} aria-label="Skin type">
            {SKIN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="select" style={{ height: 40, width: 'auto', borderRadius: 99 }} value={concern} onChange={e => setConcern(e.target.value)} aria-label="Focus concern">
            {Object.keys(CONCERN_GUIDE).map(c => <option key={c}>{c}</option>)}
          </select>
        </>}
      />

      <div className="card card-tint">
        <div className="grid g-4" style={{ alignItems: 'center' }}>
          <div className="stat"><span className="stat-label">Skin type</span><span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{skinType}</span></div>
          <div className="stat"><span className="stat-label">Focus concern</span><span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{concern}</span></div>
          <div className="stat"><span className="stat-label">Plan length</span><span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>8 weeks</span></div>
          <p className="ink2" style={{ fontSize: 13.5 }}>{guide.summary}</p>
        </div>
      </div>

      <div className="routine-cols section-gap">
        <RoutineCard kind="am" steps={routine.am} done={done} toggle={toggle} />
        <RoutineCard kind="pm" steps={routine.pm} done={done} toggle={toggle} />
      </div>

      {/* Products */}
      <div className="card section-gap">
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <div><h3>Product suggestions</h3><p className="card-sub">Generic formulations ranked by match — look for these on any label</p></div>
          <Segmented size="sm" value={cat} onChange={setCat} options={CATEGORIES} />
        </div>
        <div className="product-grid">
          {shown.map(p => {
            const tone = CAT_TONE[p.category];
            const isSaved = saved.includes(p.id);
            return (
              <article key={p.id} className="product-card">
                <div className="product-visual" style={{ background: tone[0] }}>
                  <span className="pill pill-mono" style={{ background: '#fff' }}>{p.category}</span>
                  <Bottle tone={tone} />
                </div>
                <div>
                  <h4>{p.name}</h4>
                  <div className="row-between mt-8"><small>Key: {p.key}</small><small className="mono">{p.tier}</small></div>
                </div>
                <div className="product-match"><span>Match</span><Meter value={p.match} thin /><b className="mono">{p.match}%</b></div>
                <button className={`btn btn-sm btn-block ${isSaved ? 'btn-soft' : 'btn-ghost'}`} onClick={() => toggleSave(p)} aria-pressed={isSaved}>
                  <Icon name={isSaved ? 'check' : 'plus'} size={15} /> {isSaved ? 'Saved' : 'Save to shelf'}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* Concern advice */}
      <div className="grid g-main section-gap">
        <div className="card advice-card">
          <div className="card-head" style={{ marginBottom: 4 }}>
            <div><span className="ui-eyebrow" style={{ marginBottom: 4 }}>Concern-based advice</span><h3 style={{ fontSize: 20 }}>Caring for {concern.toLowerCase()}</h3></div>
          </div>
          <ul className="tip-bullets">
            {guide.tips.map(t => <li key={t}><Icon name="check" size={15} stroke={2.4} />{t}</li>)}
          </ul>
          <div className="ingredient-cols mt-16">
            <div>
              <h4><span className="pill pill-good" style={{ height: 22 }}><Icon name="check" size={12} stroke={2.6} /> Look for</span></h4>
              <ul>{guide.use.map(u => <li key={u}>{u}</li>)}</ul>
            </div>
            <div>
              <h4><span className="pill pill-bad" style={{ height: 22 }}><Icon name="x" size={12} stroke={2.6} /> Avoid</span></h4>
              <ul>{guide.avoid.map(u => <li key={u}>{u}</li>)}</ul>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Lifestyle factors</h3></div>
          {LIFESTYLE.map(l => (
            <div className="insight" key={l.title}>
              <span className="insight-icon"><Icon name={l.icon} size={17} /></span>
              <div><strong>{l.title}</strong><p>{l.text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
