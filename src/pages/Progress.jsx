import { useMemo, useRef, useState } from 'react';
import { useApp } from '../App';
import { formatDate, timeAgo, MONTHS } from '../data/mockData';
import { Icon, Meter, LineChart, PageHeader, Segmented, EmptyState, CompareSlider } from '../components/ui';
import { enrichDiagnosis, METRIC_LABELS } from '../lib/skin';

const REGIONS = ['Face', 'Neck', 'Forearm', 'Inner elbow', 'Back of knee', 'Chest', 'Back', 'Scalp', 'Hand', 'Leg'];

const weekOf = d => {
  const t = new Date(d); t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); // Monday
  return t;
};

const valueOf = (d, m) => (m === 'skinScore' ? d.skinScore : d.metrics[m]);

export default function Progress() {
  const { diagnoses, progressPhotos, addProgressPhoto, openResult, navigate, showToast } = useApp();
  const [period, setPeriod] = useState('weekly');
  const [metric, setMetric] = useState('skinScore');
  const [region, setRegion] = useState('Face');
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const history = useMemo(() => diagnoses.map(enrichDiagnosis), [diagnoses]);
  const chrono = useMemo(() => [...history].reverse(), [history]);
  const first = chrono[0];
  const latest = history[0];

  // Aggregate by week or month (average of scans in the bucket)
  const series = useMemo(() => {
    const buckets = new Map();
    chrono.forEach(d => {
      const key = period === 'weekly' ? weekOf(d.timestamp).getTime() : new Date(new Date(d.timestamp).getFullYear(), new Date(d.timestamp).getMonth(), 1).getTime();
      const b = buckets.get(key) || [];
      b.push(valueOf(d, metric));
      buckets.set(key, b);
    });
    return [...buckets.entries()].map(([k, vals]) => {
      const dt = new Date(k);
      return {
        label: period === 'weekly' ? `${MONTHS[dt.getMonth()]} ${dt.getDate()}` : `${MONTHS[dt.getMonth()]} ’${String(dt.getFullYear()).slice(2)}`,
        value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      };
    });
  }, [chrono, period, metric]);

  const change = first && latest ? latest.skinScore - first.skinScore : 0;
  const best = history.length ? Math.max(...history.map(d => d.skinScore)) : 0;
  const thisMonth = history.filter(d => new Date(d.timestamp).getMonth() === new Date().getMonth() && new Date(d.timestamp).getFullYear() === new Date().getFullYear()).length;

  const milestones = [
    { title: 'First analysis', sub: first ? formatDate(first.timestamp) : 'Run your first scan', reached: history.length >= 1 },
    { title: '3 scans completed', sub: 'Enough data to see a trend', reached: history.length >= 3 },
    { title: '+5 point improvement', sub: 'Your routine is working', reached: change >= 5 },
    { title: 'Score of 75+', sub: 'Very good skin health', reached: best >= 75 },
    { title: '+15 point improvement', sub: 'A visible transformation', reached: change >= 15 },
    { title: 'Score of 85+', sub: 'Excellent — maintain it', reached: best >= 85 },
  ];
  const nextIdx = milestones.findIndex(m => !m.reached);

  const onFiles = e => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true);
    let pending = files.length;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        addProgressPhoto({ imageData: ev.target.result, bodyRegion: region, notes: '' });
        if (--pending === 0) { setUploading(false); showToast(`${files.length} photo${files.length > 1 ? 's' : ''} added to your timeline`, 'success'); }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const toggleSelect = id => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s.slice(-1), id]));
  const pair = selected.map(id => progressPhotos.find(p => p.id === id)).filter(Boolean)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <>
      <PageHeader
        eyebrow="Progress tracking"
        title={<>How your skin is <em>changing</em></>}
        subtitle="Every scan adds a data point. Consistent weekly scans in similar light give the clearest picture."
        actions={<>
          <Segmented value={period} onChange={setPeriod} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
          <button className="btn btn-dark btn-sm" onClick={() => navigate('diagnosis')}><Icon name="scan" size={16} /> New scan</button>
        </>}
      />

      <section className="grid g-4">
        <div className="card stat">
          <span className="stat-label">Current score</span>
          <span className="stat-value">{latest?.skinScore ?? '—'}</span>
          <span className="stat-foot">{latest ? timeAgo(latest.timestamp) : 'No scans yet'}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Since first scan</span>
          <span className={`stat-value ${change > 0 ? 'up' : change < 0 ? 'down' : ''}`} style={{ fontWeight: 800 }}>{history.length > 1 ? `${change >= 0 ? '+' : ''}${change}` : '—'}<small>pts</small></span>
          <span className="stat-foot">{first ? `From ${first.skinScore} on ${formatDate(first.timestamp)}` : '—'}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Best score</span>
          <span className="stat-value">{best || '—'}</span>
          <span className="stat-foot">Personal record</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Scans this month</span>
          <span className="stat-value">{thisMonth}<small>/ 4</small></span>
          <Meter value={Math.min(100, (thisMonth / 4) * 100)} thin />
        </div>
      </section>

      <div className="card section-gap">
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <div><h3>{metric === 'skinScore' ? 'Skin score' : METRIC_LABELS[metric]} · {period}</h3><p className="card-sub">Average of scans in each {period === 'weekly' ? 'week' : 'month'}</p></div>
          <select className="select" style={{ height: 38, width: 'auto', borderRadius: 99, fontSize: 13.5 }} value={metric} onChange={e => setMetric(e.target.value)} aria-label="Metric">
            <option value="skinScore">Skin score</option>
            {Object.entries(METRIC_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {series.length >= 2
          ? <LineChart points={series} height={260} ariaLabel={`${metric} ${period} trend`} />
          : <EmptyState icon="chart" title="Not enough data yet" text={`You need scans in at least two different ${period === 'weekly' ? 'weeks' : 'months'} to draw a trend.`}
              action={<button className="btn btn-soft btn-sm" onClick={() => navigate('diagnosis')}>Add a scan</button>} />}
      </div>

      <div className="grid g-main section-gap">
        <div className="stack">
          {/* Metric change */}
          {first && latest && history.length > 1 && (
            <div className="card">
              <div className="card-head"><h3>What’s improved</h3><span className="mono">First → latest</span></div>
              <ul className="metric-list">
                {Object.entries(METRIC_LABELS).map(([k, l]) => {
                  const dv = latest.metrics[k] - first.metrics[k];
                  return (
                    <li key={k}>
                      <div><span>{l}</span><b>{first.metrics[k]} → {latest.metrics[k]} <span className={dv >= 0 ? 'up' : 'down'}>({dv >= 0 ? '+' : ''}{dv})</span></b></div>
                      <Meter value={latest.metrics[k]} tone={dv >= 0 ? 'emerald' : 'clay'} thin />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* History */}
          <div className="card">
            <div className="card-head"><h3>Scan history</h3><span className="mono">{history.length} total</span></div>
            {history.length ? (
              <div className="table-scroll">
                <table className="history-table">
                  <thead><tr><th>Date</th><th>Finding</th><th>Area</th><th>Confidence</th><th>Score</th><th /></tr></thead>
                  <tbody>
                    {history.map((d, i) => {
                      const dv = history[i + 1] ? d.skinScore - history[i + 1].skinScore : null;
                      return (
                        <tr key={d.id} onClick={() => openResult(d.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && openResult(d.id)}>
                          <td className="nowrap">{formatDate(d.timestamp)}</td>
                          <td><strong style={{ fontWeight: 600 }}>{d.disease}</strong></td>
                          <td className="muted">{d.bodyRegion || 'Face'}</td>
                          <td className="num">{Math.round(d.confidence * 100)}%</td>
                          <td className="nowrap"><span className="pill pill-emerald">{d.skinScore}</span>{dv !== null && <small className={dv >= 0 ? 'up' : 'down'} style={{ marginLeft: 8 }}>{dv >= 0 ? '▲' : '▼'}{Math.abs(dv)}</small>}</td>
                          <td><Icon name="chevron" size={16} className="muted" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon="list" title="No scans yet" text="Your analyses will be listed here with their scores." />}
          </div>

          {/* Photo timeline */}
          <div className="card">
            <div className="card-head" style={{ flexWrap: 'wrap' }}>
              <div><h3>Photo timeline</h3><p className="card-sub">Select two photos to compare them side by side</p></div>
              <select className="select" style={{ height: 36, width: 'auto', borderRadius: 99, fontSize: 13 }} value={region} onChange={e => setRegion(e.target.value)} aria-label="Body region for new photos">
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {pair.length === 2 && (
              <div style={{ marginBottom: 16 }}>
                <CompareSlider before={pair[0].imageData} after={pair[1].imageData} />
                <div className="row-between mt-8 muted" style={{ fontSize: 12.5 }}>
                  <span>{formatDate(pair[0].timestamp)}</span><button className="btn-text" onClick={() => setSelected([])}>Clear selection</button><span>{formatDate(pair[1].timestamp)}</span>
                </div>
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
                    <img src={p.imageData} alt={`${p.bodyRegion} on ${formatDate(p.timestamp)}`} />
                    {si >= 0 && <span className="photo-tile-sel">{si + 1}</span>}
                    <span className="photo-tile-meta"><span>{p.bodyRegion}</span><span>{formatDate(p.timestamp).replace(/, \d{4}$/, '')}</span></span>
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head"><h3>Milestones</h3><span className="pill pill-mono">{milestones.filter(m => m.reached).length}/{milestones.length}</span></div>
            <ol className="timeline">
              {milestones.map((m, i) => (
                <li key={m.title} className={m.reached ? 'reached' : i === nextIdx ? 'next' : ''}>
                  <span className="timeline-dot"><Icon name={m.reached ? 'check' : i === nextIdx ? 'target' : 'award'} size={14} stroke={m.reached ? 2.6 : 1.8} /></span>
                  <div><strong>{m.title}</strong><small>{m.reached ? m.sub : i === nextIdx ? 'Up next · ' + m.sub : m.sub}</small></div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card card-dark">
            <span className="mono" style={{ color: '#F0A58C' }}>Consistency tip</span>
            <h3 style={{ fontSize: 19, letterSpacing: '-.02em', margin: '8px 0 6px' }}>Same time, same light, same angle</h3>
            <p className="muted" style={{ fontSize: 13.5 }}>Scanning every Sunday morning by a window keeps your trend honest — and makes small wins visible.</p>
          </div>
        </div>
      </div>
    </>
  );
}
