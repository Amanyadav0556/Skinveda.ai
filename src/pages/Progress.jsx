import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App';
import { Icon, LineChart, PageHeader, EmptyState, CompareSlider } from '../components/ui';
import { SafetyNotice } from '../components/skin';
import { METRICS } from '../lib/records';
import { useNow } from '../lib/skin';
import { compressFile } from '../lib/image';
import { api, getToken } from '../api';
import { formatDate } from '../data/mockData';

const DAY = 864e5;
const isoDay = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const concernScore = (scan, id) => scan?.concerns?.find(c => c.id === id)?.score ?? 0;

// Rows compared across the journey; `better` says which direction is an improvement
const COMPARE_ROWS = [
  { label: 'Overall skin score', get: s => s.skinScore, better: 'high' },
  { label: 'Acne-like spots', get: s => concernScore(s, 'acne'), better: 'low' },
  { label: 'Pigmentation', get: s => s.metrics.pigmentation, better: 'low' },
  { label: 'Redness', get: s => s.metrics.redness, better: 'low' },
  { label: 'Texture', get: s => s.metrics.texture, better: 'high' },
  { label: 'Oiliness', get: s => s.metrics.oiliness, better: 'mid' },
];

function pickJourney(chrono) {
  if (!chrono.length) return [];
  const first = chrono[0];
  const t0 = new Date(first.timestamp).getTime();
  const nearest = target => chrono.reduce((best, s) => (Math.abs(new Date(s.timestamp) - target) < Math.abs(new Date(best.timestamp) - target) ? s : best), first);
  const day = s => Math.round((new Date(s.timestamp) - t0) / DAY) + 1;
  const mid = nearest(t0 + 13 * DAY);
  const last = chrono[chrono.length - 1];
  const picks = [first, mid, last].filter((s, i, a) => a.findIndex(x => x.id === s.id) === i);
  return picks.map(s => ({ scan: s, label: `Day ${day(s)}` }));
}

const toLevel = steps => (!steps?.length ? 0 : steps.length >= 3 ? 2 : 1);
const cachedLevels = dates => dates.map(d => { try { return toLevel(JSON.parse(localStorage.getItem(`sv_routine_${d}`))); } catch { return 0; } });

function useConsistency(days = 14) {
  const now = useNow();
  const dates = useMemo(() => Array.from({ length: days }, (_, i) => isoDay(new Date(now - (days - 1 - i) * DAY))), [now, days]);
  // Demo/offline: read the local cache right away; signed in: fetch the account's history
  const [levels, setLevels] = useState(() => (getToken() ? null : cachedLevels(dates)));
  useEffect(() => {
    if (!getToken()) return;
    api.routineHistory(dates[0], dates[dates.length - 1])
      .then(rows => { const map = Object.fromEntries(rows.map(r => [r.day, r.done_steps])); setLevels(dates.map(d => toLevel(map[d]))); })
      .catch(() => setLevels(cachedLevels(dates)));
  }, [dates]);
  return levels;
}

function NoteEditor({ scan }) {
  const { updateScanNote } = useApp();
  const [text, setText] = useState(scan.notes || '');
  const [saving, setSaving] = useState(false);
  const dirty = text !== (scan.notes || '');
  return (
    <div className="row" style={{ gap: 8, alignItems: 'stretch' }} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
      <input className="input" style={{ minHeight: 36, fontSize: 13.5 }} placeholder="Add a note (e.g. started niacinamide)" value={text}
        onChange={e => setText(e.target.value)} aria-label={`Note for scan on ${formatDate(scan.timestamp)}`} maxLength={300} />
      {dirty && <button className="btn btn-sm btn-soft" disabled={saving} onClick={async () => { setSaving(true); await updateScanNote(scan.id, text).catch(() => {}); setSaving(false); }}>Save</button>}
    </div>
  );
}

export default function Progress() {
  const { scans, progressPhotos, addProgressPhoto, openScan, navigate, showToast } = useApp();
  const [metric, setMetric] = useState('skinScore');
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const consistency = useConsistency(14);

  const chrono = useMemo(() => [...scans].reverse(), [scans]);
  const journey = pickJourney(chrono);
  const series = chrono.map(s => ({
    label: formatDate(s.timestamp).replace(/, \d{4}$/, ''),
    value: metric === 'skinScore' ? s.skinScore : s.metrics[metric],
  }));
  const first = chrono[0], last = chrono[chrono.length - 1];
  const photoPair = chrono.filter(s => s.imageData);
  const activeDays = consistency ? consistency.filter(Boolean).length : 0;

  const onFiles = async e => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    let added = 0;
    for (const file of files) {
      try { await addProgressPhoto({ imageData: await compressFile(file), bodyRegion: 'Face', notes: '' }); added++; }
      catch (err) { showToast(`${file.name}: ${err.message}`, 'error'); }
    }
    setUploading(false);
    if (added) showToast(`${added} photo${added > 1 ? 's' : ''} added to your journey`, 'success');
  };
  const toggleSelect = id => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s.slice(-1), id]));
  const pair = selected.map(id => progressPhotos.find(p => p.id === id)).filter(Boolean).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (!scans.length) {
    return (
      <>
        <PageHeader eyebrow="Progress" title="My skin journey" />
        <div className="card"><EmptyState icon="trend" title="Your journey starts with your first scan"
          text="Scan once a week in similar light. We'll compare Day 1, Day 14 and Day 30 so you can see what's changing."
          action={<button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> Scan my skin</button>} /></div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Progress" title="My skin journey"
        subtitle="Honest comparisons of your own scans over time. Photos are shown exactly as taken — nothing is retouched."
        actions={<button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> New scan</button>} />

      <div className="stack">
        {/* Day 1 / 14 / 30 */}
        <section className="card" aria-labelledby="journey-h">
          <div className="card-head"><h3 id="journey-h">Your journey so far</h3><span className="t-small muted">{scans.length} scan{scans.length > 1 ? 's' : ''}</span></div>
          <div className="journey">
            {journey.map((j, i) => (
              <button key={j.scan.id} className={`journey-col${i === journey.length - 1 ? ' current' : ''}`} onClick={() => openScan(j.scan.id)} style={{ textAlign: 'left' }}>
                <div className="row-between"><strong>{j.label}</strong><span className="t-help">{formatDate(j.scan.timestamp)}</span></div>
                <div className="journey-photo">{j.scan.imageData ? <img src={j.scan.imageData} alt={`Scan from ${j.label}`} /> : <Icon name="face" size={28} />}</div>
                <div className="row-between"><span className="t-small ink2">Score</span><b className="num" style={{ fontSize: 20 }}>{j.scan.skinScore}</b></div>
                {j.scan.concerns[0] && <span className="pill">{j.scan.concerns[0].name}</span>}
              </button>
            ))}
          </div>
          {journey.length > 1 && (
            <div className="table-scroll mt-24">
              <table className="compare-table-sm">
                <thead><tr><th>Measure</th>{journey.map(j => <th key={j.scan.id}>{j.label}</th>)}<th>Change</th></tr></thead>
                <tbody>
                  {COMPARE_ROWS.map(r => {
                    const a = r.get(journey[0].scan), b = r.get(journey[journey.length - 1].scan);
                    const diff = b - a;
                    const good = r.better === 'high' ? diff > 0 : r.better === 'low' ? diff < 0 : Math.abs(b - 42) < Math.abs(a - 42);
                    return (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        {journey.map(j => <td key={j.scan.id}>{r.get(j.scan)}</td>)}
                        <td className={diff === 0 ? 'muted' : good ? 'up' : 'down'}>{diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid g-main">
          {/* Graph */}
          <section className="card" aria-labelledby="graph-h">
            <div className="card-head" style={{ flexWrap: 'wrap' }}>
              <h3 id="graph-h">Progress graph</h3>
              <select className="select select-sm" value={metric} onChange={e => setMetric(e.target.value)} aria-label="Measure to show">
                <option value="skinScore">Overall skin score</option>
                {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            {series.length >= 2 ? <LineChart points={series} height={240} ariaLabel={`${metric} over time`} />
              : <p className="t-small ink2">Your graph appears after your second scan.</p>}
          </section>

          {/* Consistency */}
          <section className="card" aria-labelledby="cons-h">
            <div className="card-head"><h3 id="cons-h">Routine consistency</h3><span className="t-small muted">Last 14 days</span></div>
            {consistency ? (
              <>
                <div className="consistency" role="img" aria-label={`Routine followed on ${activeDays} of the last 14 days`}>
                  {consistency.map((l, i) => <span key={i} data-l={l} />)}
                </div>
                <p className="t-small ink2 mt-16"><b>{activeDays} of 14 days</b> with at least one step ticked. Consistency matters more than perfection.</p>
              </>
            ) : <div className="skeleton" style={{ height: 40 }} />}
            <button className="btn btn-sm btn-ghost mt-16" onClick={() => navigate('my-skin/routine')}>Open my routine</button>
          </section>
        </div>

        {/* Before / after */}
        {photoPair.length >= 2 && (
          <section className="card" aria-labelledby="ba-h">
            <div className="card-head"><div><h3 id="ba-h">Before and after</h3><p className="card-sub">{formatDate(photoPair[0].timestamp)} → {formatDate(photoPair[photoPair.length - 1].timestamp)} · drag to compare</p></div></div>
            <CompareSlider before={photoPair[0].imageData} after={photoPair[photoPair.length - 1].imageData} />
            <p className="t-help mt-8">Lighting and angle affect how skin looks. Compare photos taken in similar conditions.</p>
          </section>
        )}

        {/* History + notes */}
        <section className="card" aria-labelledby="hist-h">
          <div className="card-head"><h3 id="hist-h">Previous scans</h3><span className="t-small muted">Tap a row to open the report</span></div>
          <div className="table-scroll">
            <table className="history-table">
              <thead><tr><th>Date</th><th>Main concern</th><th>Score</th><th>Notes</th></tr></thead>
              <tbody>
                {scans.map((s, i) => {
                  const dv = scans[i + 1] ? s.skinScore - scans[i + 1].skinScore : null;
                  return (
                    <tr key={s.id} onClick={() => openScan(s.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && e.target === e.currentTarget && openScan(s.id)}>
                      <td className="nowrap">{formatDate(s.timestamp)}</td>
                      <td>{s.concerns[0]?.name || 'No strong concerns'}</td>
                      <td className="nowrap num"><span className="pill pill-primary">{s.skinScore}</span>{dv !== null && dv !== 0 && <small className={dv > 0 ? 'up' : 'down'} style={{ marginLeft: 8 }}>{dv > 0 ? '▲' : '▼'}{Math.abs(dv)}</small>}</td>
                      <td style={{ minWidth: 240 }}><NoteEditor scan={s} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {first && last && first.id !== last.id && (
            <p className="t-small ink2 mt-16">Since {formatDate(first.timestamp)}: overall score {last.skinScore - first.skinScore >= 0 ? 'up' : 'down'} {Math.abs(last.skinScore - first.skinScore)} points.</p>
          )}
        </section>

        {/* Extra photos */}
        <section className="card" aria-labelledby="photos-h">
          <div className="card-head"><div><h3 id="photos-h">Photo diary</h3><p className="card-sub">Optional extra photos. Select two to compare.</p></div></div>
          {pair.length === 2 && (
            <div style={{ marginBottom: 14 }}>
              <CompareSlider before={pair[0].imageData} after={pair[1].imageData} />
              <div className="row-between mt-8 t-small muted"><span>{formatDate(pair[0].timestamp)}</span><button className="btn-text" onClick={() => setSelected([])}>Clear</button><span>{formatDate(pair[1].timestamp)}</span></div>
            </div>
          )}
          <div className="photo-grid">
            <button className="photo-tile photo-add" onClick={() => fileRef.current.click()} disabled={uploading}>
              <span>{uploading ? <span className="spinner" /> : <Icon name="plus" size={22} />}<br />Add photo</span>
            </button>
            {progressPhotos.map(p => {
              const si = selected.indexOf(p.id);
              return (
                <button key={p.id} className={`photo-tile${si >= 0 ? ' selected' : ''}`} onClick={() => toggleSelect(p.id)} aria-pressed={si >= 0}>
                  <img src={p.imageData} alt={`Photo from ${formatDate(p.timestamp)}`} />
                  {si >= 0 && <span className="photo-tile-sel">{si + 1}</span>}
                  <span className="photo-tile-meta"><span>{formatDate(p.timestamp).replace(/, \d{4}$/, '')}</span></span>
                </button>
              );
            })}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
        </section>

        <SafetyNotice compact />
      </div>
    </>
  );
}
