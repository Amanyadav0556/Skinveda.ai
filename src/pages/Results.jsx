import { useMemo } from 'react';
import { useApp } from '../App';
import { DISEASES, formatDate, formatTime } from '../data/mockData';
import { Icon, ScoreRing, Meter, PageHeader, EmptyState, Disclaimer, CompareSlider } from '../components/ui';
import { enrichDiagnosis, scoreLabel, severityOf, METRIC_LABELS, guideFor } from '../lib/skin';

const sevPill = s => ({ high: 'pill-bad', moderate: 'pill-warn', low: 'pill-good' })[s];
const sevText = s => ({ high: 'Likely', moderate: 'Possible', low: 'Mild signs' })[s];

export default function Results() {
  const { diagnoses, selectedDiagnosisId, openResult, navigate } = useApp();
  const history = useMemo(() => diagnoses.map(enrichDiagnosis), [diagnoses]);
  const idx = Math.max(0, history.findIndex(d => d.id === selectedDiagnosisId));
  const d = history[idx];
  const prev = history[idx + 1];

  if (!d) {
    return (
      <>
        <PageHeader eyebrow="Analysis report" title="Your detailed report" />
        <div className="card"><EmptyState icon="file" title="No report yet"
          text="Run a skin analysis and your full, detailed report will appear here."
          action={<button className="btn btn-dark" onClick={() => navigate('diagnosis')}><Icon name="scan" size={17} /> Start analysis</button>} /></div>
      </>
    );
  }

  const info = DISEASES.find(x => x.name === d.disease) || DISEASES[0];
  const guide = guideFor(d.disease);
  const sev = severityOf(d.confidence);
  const recs = d.recommendations?.length ? d.recommendations : info.treatments.slice(0, 4);
  const delta = prev ? d.skinScore - prev.skinScore : null;

  const steps = [
    { title: 'Start your personalised routine', text: 'Follow the AM/PM plan built for this result for at least 4 weeks.' },
    { title: recs[0], text: 'The first-line approach for this concern.' },
    { title: 'Re-scan in 7 days', text: 'Use the same light and angle so the comparison is fair.' },
    { title: sev === 'high' ? 'Book a dermatologist visit' : 'See a dermatologist if it persists', text: 'Share this report — it includes confidence scores and history.' },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`Report · ${d.analysisId || 'SVD-' + d.id}`}
        title={<>Detailed skin <em>report</em></>}
        subtitle={`Analysed ${formatDate(d.timestamp)} at ${formatTime(d.timestamp)}`}
        actions={<>
          {history.length > 1 && (
            <select className="select" style={{ height: 40, width: 'auto', borderRadius: 99 }} value={d.id}
              onChange={e => openResult(Number(e.target.value))} aria-label="Choose report">
              {history.map(h => <option key={h.id} value={h.id}>{formatDate(h.timestamp)} · {h.skinScore}</option>)}
            </select>
          )}
          <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}><Icon name="download" size={16} /> Export</button>
          <button className="btn btn-dark btn-sm no-print" onClick={() => navigate('diagnosis')}><Icon name="scan" size={16} /> New scan</button>
        </>}
      />

      {/* Summary */}
      <div className="card card-flush report-head">
        <div className="report-photo">
          {d.imageData ? <img src={d.imageData} alt="Analysed skin" /> : <div className="report-photo-empty"><Icon name="image" size={34} /></div>}
        </div>
        <div className="report-summary">
          <div className="row wrap" style={{ gap: 8 }}>
            <span className={`pill ${sevPill(sev)}`}><Icon name={sev === 'low' ? 'check' : 'alert'} size={13} />{sevText(sev)}</span>
            <span className="pill">{d.bodyRegion || 'Face'}</span>
            <span className="pill">Risk · {d.risk}</span>
          </div>
          <h2>{d.disease}<span className="muted" style={{ fontWeight: 600, fontSize: '.6em', marginLeft: 10 }}>{info.subtitle}</span></h2>
          <p>{d.description || info.description}</p>
          <div className="report-meta">
            <span><Icon name="target" size={14} /> {Math.round(d.confidence * 100)}% confidence</span>
            <span><Icon name="cpu" size={14} /> {d.modelVersion || 'SkinVeda-DINOv2'}</span>
            <span><Icon name="lock" size={14} /> Private to you</span>
          </div>
        </div>
        <div className="report-score">
          <ScoreRing value={d.skinScore} size={116} stroke={10} />
          <div>
            <strong>{scoreLabel(d.skinScore)}</strong>
            <div className="muted" style={{ fontSize: 13 }}>
              {delta === null ? 'First recorded score' : <><span className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}</span> vs previous</>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid g-main section-gap">
        <div className="stack">
          {/* Metrics */}
          <div className="card">
            <div className="card-head"><div><h3>Skin metrics</h3><p className="card-sub">0–100, higher is healthier</p></div>{prev && <span className="mono">vs {formatDate(prev.timestamp)}</span>}</div>
            <div className="metric-tiles">
              {Object.entries(METRIC_LABELS).map(([k, l]) => {
                const v = d.metrics[k];
                const dv = prev ? v - prev.metrics[k] : null;
                return (
                  <div className="metric-tile" key={k}>
                    <div className="metric-tile-top"><span>{l}</span><b>{v}</b></div>
                    <Meter value={v} tone={v < 60 ? 'clay' : 'emerald'} thin />
                    <small className={dv === null ? 'muted' : dv >= 0 ? 'up' : 'down'}>
                      {dv === null ? (v < 60 ? 'Needs attention' : 'Healthy range') : `${dv >= 0 ? '+' : ''}${dv} since last scan`}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concerns */}
          <div className="card">
            <div className="card-head"><h3>Detected concerns</h3><span className="mono">Model confidence</span></div>
            <div className="grid g-3">
              {d.concerns.map(c => {
                const s = severityOf(c.confidence);
                return (
                  <div key={c.name} className={`concern-card${c.primary ? ' primary' : ''}`}>
                    <div className="concern-card-head">
                      <div><strong>{c.name}</strong><small>{c.primary ? 'Primary' : 'Secondary'} · {c.area}</small></div>
                    </div>
                    <div className="concern-conf"><Meter value={c.confidence * 100} tone={c.primary ? 'emerald' : 'sage'} thin /><b>{Math.round(c.confidence * 100)}%</b></div>
                    <span className={`pill ${sevPill(s)}`} style={{ justifySelf: 'start' }}>{sevText(s)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI insights */}
          <div className="card">
            <div className="card-head"><h3>AI insights</h3><span className="pill pill-emerald pill-mono"><Icon name="spark" size={12} /> Generated</span></div>
            <p className="ink2" style={{ fontSize: 14.5, marginBottom: 18 }}>{guide.summary}</p>
            <div className="grid g-2">
              <div>
                <span className="mono muted">Signs observed</span>
                <ul className="rows soft mt-8">
                  {(d.symptoms?.length ? d.symptoms : info.symptoms.slice(0, 4)).map(s => <li key={s}><span>{s}</span><b><Icon name="check" size={13} /></b></li>)}
                </ul>
              </div>
              <div>
                <span className="mono muted">Common triggers</span>
                <ul className="rows soft mt-8">
                  {(d.triggers?.length ? d.triggers : info.triggers.slice(0, 4)).map(t => <li key={t}><span>{t}</span><b className="muted">watch</b></li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="card">
            <div className="card-head"><div><h3>Before &amp; after</h3><p className="card-sub">{prev ? `Compared with ${formatDate(prev.timestamp)}` : 'Your next scan unlocks comparison'}</p></div></div>
            {prev?.imageData && d.imageData ? (
              <CompareSlider before={prev.imageData} after={d.imageData} />
            ) : prev ? (
              <div className="grid g-2">
                {[['Previous', prev], ['This scan', d]].map(([label, x]) => (
                  <div key={label} className="metric-tile" style={{ justifyItems: 'center', textAlign: 'center', padding: 22 }}>
                    <span className="mono muted">{label}</span>
                    <ScoreRing value={x.skinScore} size={88} stroke={8} color={label === 'Previous' ? 'var(--sv-sage)' : 'var(--sv-emerald)'} />
                    <small className="muted">{formatDate(x.timestamp)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="compare" title="Nothing to compare yet" text="Re-scan the same area next week to see a side-by-side comparison."
                action={<button className="btn btn-soft btn-sm" onClick={() => navigate('diagnosis')}>Schedule a re-scan</button>} />
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head"><h3>Recommended next steps</h3></div>
            <ol className="next-steps">
              {steps.map(s => <li key={s.title}><div><strong>{s.title}</strong>{s.text}</div></li>)}
            </ol>
          </div>

          <div className="card">
            <div className="card-head"><h3>Ingredients</h3></div>
            <div className="ingredient-cols">
              <div>
                <h4><span className="pill pill-good" style={{ height: 22 }}><Icon name="check" size={12} stroke={2.6} /> Use</span></h4>
                <ul>{guide.use.map(u => <li key={u}>{u}</li>)}</ul>
              </div>
              <div>
                <h4><span className="pill pill-bad" style={{ height: 22 }}><Icon name="x" size={12} stroke={2.6} /> Avoid</span></h4>
                <ul>{guide.avoid.map(u => <li key={u}>{u}</li>)}</ul>
              </div>
            </div>
          </div>

          <div className="card card-dark">
            <span className="mono" style={{ color: '#F0A58C' }}>Your plan is ready</span>
            <h3 style={{ fontSize: 20, letterSpacing: '-.025em', margin: '8px 0 6px' }}>A routine built for this result</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>Morning and night steps, matched products and concern-specific advice.</p>
            <button className="btn btn-light btn-block" onClick={() => navigate('recommendations')}>View recommendations <Icon name="arrow" size={17} /></button>
          </div>

          <Disclaimer />
        </div>
      </div>
    </>
  );
}
