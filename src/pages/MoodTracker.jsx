import { useMemo, useState } from 'react';
import { useApp } from '../App';
import { MOODS, AI_INSIGHTS, timeAgo, WEEK_DAYS } from '../data/mockData';
import { Icon, PageHeader, BarChart, EmptyState, Meter } from '../components/ui';
import { useNow } from '../lib/skin';

const TAG_OPTIONS = ['Work stress', 'Poor sleep', 'Skin flare', 'Exercise', 'Good diet', 'Social event', 'Medication', 'Weather'];
const INSIGHT_ICON = { warning: 'alert', info: 'info', success: 'trend' };

const scoreFor = log => MOODS.find(x => x.id === log.mood)?.score || log.score || 5;
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

export default function MoodTracker() {
  const { addMoodLog, moodLogs, showToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const now = useNow();

  const loggedToday = moodLogs.some(m => sameDay(m.timestamp, now));
  const toggleTag = t => setTags(p => (p.includes(t) ? p.filter(x => x !== t) : [...p, t]));

  const submit = async () => {
    if (!selected) { showToast('Pick how you feel first', 'error'); return; }
    setSaving(true);
    try {
      await addMoodLog({ mood: selected.id, score: selected.score, notes: note, tags });
      showToast(`Logged: ${selected.label}`, 'success');
      setSelected(null); setNote(''); setTags([]);
    } catch {
      // addMoodLog already showed the error; keep the form so the user can retry
    } finally {
      setSaving(false);
    }
  };

  const last14 = useMemo(() => Array.from({ length: 14 }, (_, k) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - k));
    const log = moodLogs.find(m => sameDay(m.timestamp, d));
    return { label: k === 13 ? 'Today' : WEEK_DAYS[d.getDay()].slice(0, 2), value: log ? scoreFor(log) : 0, highlight: k === 13 };
  }), [moodLogs]);

  const heat = useMemo(() => Array.from({ length: 91 }, (_, k) => {
    const d = new Date(); d.setDate(d.getDate() - (90 - k));
    const log = moodLogs.find(m => sameDay(m.timestamp, d));
    const s = log ? scoreFor(log) : 0;
    return { date: d, level: !s ? 0 : s >= 8 ? 4 : s >= 6 ? 3 : s >= 4 ? 2 : 1 };
  }), [moodLogs]);

  const logged = last14.filter(d => d.value);
  const avg = logged.length ? (logged.reduce((s, d) => s + d.value, 0) / logged.length).toFixed(1) : null;
  const stressDays = moodLogs.filter(m => ['stressed', 'anxious', 'angry'].includes(m.mood) && now - new Date(m.timestamp) < 14 * 864e5).length;
  const tagCounts = moodLogs.flatMap(m => m.tags || []).reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {});
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <>
      <PageHeader eyebrow="Mind & skin" title={<>How are you <em>feeling?</em></>}
        subtitle="Stress and sleep are among the strongest flare triggers. A 20-second daily check-in reveals your patterns." />

      <div className="grid g-main">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div><h3>Today’s check-in</h3><p className="card-sub">{loggedToday ? 'You’ve already checked in today — add another if things changed.' : 'How is your mood right now?'}</p></div>
              {loggedToday && <span className="pill pill-good"><Icon name="check" size={12} stroke={2.6} /> Logged</span>}
            </div>
            <div className="mood-grid">
              {MOODS.map(m => (
                <button key={m.id} className={`mood-option${selected?.id === m.id ? ' active' : ''}`} onClick={() => setSelected(m)} aria-pressed={selected?.id === m.id}>
                  <span className="mood-face" aria-hidden="true">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            <div className="field mt-24">
              <span className="label">What’s influencing it? <small>optional</small></span>
              <div className="chip-row">
                {TAG_OPTIONS.map(t => <button key={t} type="button" className={`tag-chip${tags.includes(t) ? ' active' : ''}`} onClick={() => toggleTag(t)}>{t}</button>)}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="mood-note">Note <small>optional</small></label>
              <textarea id="mood-note" className="textarea" rows={3} placeholder="Anything worth remembering about today?" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <button className="btn btn-dark btn-lg btn-block mt-16" onClick={submit} disabled={saving || !selected}>
              {saving ? <><span className="spinner" /> Saving…</> : <>Save check-in <Icon name="check" size={17} /></>}
            </button>
          </div>

          <div className="card">
            <div className="card-head"><div><h3>Last 14 days</h3><p className="card-sub">Mood score, 1–10</p></div><span className="mono">avg {avg ?? '—'}</span></div>
            {logged.length ? <BarChart bars={last14} height={170} max={10} format={v => `${v}/10`} empty="No check-in" /> : <EmptyState icon="smile" title="No check-ins yet" text="Your first entry starts the chart." />}
          </div>

          <div className="card">
            <div className="card-head">
              <div><h3>90-day pattern</h3><p className="card-sub">Darker = better mood</p></div>
              <div className="heat-legend">Low
                {[0, 1, 2, 3, 4].map(l => <span key={l} className="heatmap-key" style={{ background: ['var(--track)', '#C9DCD1', '#93B8A5', '#4F8373', 'var(--primary)'][l] }} />)} High
              </div>
            </div>
            <div className="heatmap" role="img" aria-label="Mood heatmap for the last 90 days">
              {heat.map((c, i) => <span key={i} data-l={c.level} title={`${c.date.toDateString()}${c.level ? '' : ' · no entry'}`} />)}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card card-tint">
            <div className="grid g-2">
              <div className="stat"><span className="stat-label">14-day average</span><span className="stat-value">{avg ?? '—'}<small>/10</small></span></div>
              <div className="stat"><span className="stat-label">Stress days</span><span className="stat-value">{stressDays}</span></div>
            </div>
            {topTags.length > 0 && (
              <>
                <span className="mono muted" style={{ display: 'block', margin: '18px 0 10px' }}>Top influences</span>
                <ul className="metric-list">
                  {topTags.map(([t, c]) => <li key={t}><div><span>{t}</span><b>{c}×</b></div><Meter value={(c / topTags[0][1]) * 100} tone="sage" thin /></li>)}
                </ul>
              </>
            )}
          </div>

          <div className="card">
            <div className="card-head"><h3>Mind–skin insights</h3></div>
            {AI_INSIGHTS.slice(0, 4).map(i => (
              <div className="insight" key={i.title}>
                <span className={`insight-icon${i.type === 'warning' ? ' clay' : ''}`}><Icon name={INSIGHT_ICON[i.type] || 'info'} size={16} /></span>
                <div><strong>{i.title}</strong><p>{i.message}</p></div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-head"><h3>Recent entries</h3></div>
            {moodLogs.length === 0 ? <EmptyState icon="list" title="Nothing logged yet" /> : moodLogs.slice(0, 6).map(m => {
              const mood = MOODS.find(x => x.id === m.mood);
              return (
                <div className="list-item" key={m.id || m.timestamp}>
                  <span className="list-thumb" style={{ fontSize: 20 }} aria-hidden="true">{mood?.emoji}</span>
                  <span className="list-body"><strong>{mood?.label || m.mood}</strong><small>{m.notes || (m.tags || []).join(', ') || 'No note'}</small></span>
                  <small className="muted nowrap">{timeAgo(m.timestamp)}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
