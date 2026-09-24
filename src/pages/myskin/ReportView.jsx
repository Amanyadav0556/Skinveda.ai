import { useApp } from '../../App';
import { Icon, Meter } from '../../components/ui';
import { SkinScoreCard, ConcernCard, MetricTile, FaceMap, EscalationNotice, NextActions, SafetyNotice } from '../../components/skin';
import { METRICS } from '../../lib/records';
import { formatDate } from '../../data/mockData';

const confidenceWord = c => (c >= 0.8 ? 'High' : c >= 0.6 ? 'Moderate' : 'Low');

export default function ReportView({ scan, prev }) {
  const { navigate, openScan, scans } = useApp();
  const top = scan.concerns.slice(0, 4);
  const main = top[0];

  return (
    <div className="stack">
      {scans.length > 1 && (
        <div className="row-between wrap">
          <span className="t-small ink2">Report from {formatDate(scan.timestamp)}</span>
          <label className="row" style={{ gap: 8 }}>
            <span className="t-small muted">Show report</span>
            <select className="select select-sm" value={String(scan.id)} aria-label="Choose a report"
              onChange={e => openScan(scans.find(s => String(s.id) === e.target.value)?.id)}>
              {scans.map(s => <option key={s.id} value={String(s.id)}>{formatDate(s.timestamp)} · score {s.skinScore}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* Summary */}
      <section className="card card-flush report-hero" aria-labelledby="summary-h">
        <div className="report-photo">
          {scan.imageData ? <img src={scan.imageData} alt="Photo used for this report" /> : <div className="report-photo-empty"><Icon name="face" size={34} /></div>}
        </div>
        <div className="report-summary">
          <span className="ui-eyebrow" id="summary-h" style={{ marginBottom: 0 }}>Your skin summary</span>
          <h2>{scan.summary}</h2>
          <div className="chip-row">
            <span className="pill pill-primary">Skin type: {scan.skinType} (estimate)</span>
            {main && <span className="pill">Main concern: {main.name}</span>}
          </div>
          <div className="report-meta">
            <span><Icon name="calendar" size={14} /> {formatDate(scan.timestamp)}</span>
            <span><Icon name="cpu" size={14} /> AI-assisted assessment (preview model)</span>
            <span><Icon name="lock" size={14} /> Private to you</span>
          </div>
        </div>
        <div className="report-score">
          <SkinScoreCard score={scan.skinScore} delta={prev ? scan.skinScore - prev.skinScore : null} size={96} />
        </div>
      </section>

      {scan.escalation?.recommended && <EscalationNotice reasons={scan.escalation.reasons} onFindDoctor={() => navigate('doctors')} />}

      {/* Key findings */}
      <section className="grid g-main">
        <div className="card">
          <div className="card-head">
            <div><h3>Visible skin concerns</h3><p className="card-sub">The most noticeable findings in this photo</p></div>
          </div>
          {top.length ? (
            <div className="stack-sm">{top.map((c, i) => <ConcernCard key={c.id} concern={c} primary={i === 0} />)}</div>
          ) : <p className="ink2">No strong visible concerns in this photo. Keep up your routine and sunscreen.</p>}
        </div>
        <div className="stack">
          <div className="card">
            <div className="card-head"><h3>Concern areas</h3></div>
            <FaceMap concerns={top} />
          </div>
          <div className="card">
            <div className="card-head"><h3>How sure is this?</h3><span className="pill">{confidenceWord(scan.confidence)}</span></div>
            <Meter value={scan.confidence * 100} thin />
            <p className="t-small ink2 mt-8">
              {Math.round(scan.confidence * 100)}% confidence, based on lighting, focus and how much skin is visible.
              {scan.confidence < 0.6 && ' A clearer photo will give you a more reliable report.'}
            </p>
          </div>
        </div>
      </section>

      {/* Measurements */}
      <section className="card" aria-labelledby="measure-h">
        <div className="card-head">
          <div><h3 id="measure-h">Skin measurements</h3><p className="card-sub">Estimates from your photo, 0–100{prev ? ` · compared with ${formatDate(prev.timestamp)}` : ''}</p></div>
        </div>
        <div className="metric-grid">
          {METRICS.map(m => <MetricTile key={m.key} metricKey={m.key} value={scan.metrics[m.key]} previous={prev?.metrics?.[m.key]} />)}
        </div>
      </section>

      <section className="card" aria-labelledby="next-h">
        <div className="card-head"><h3 id="next-h">What's next?</h3></div>
        <NextActions actions={[
          { icon: 'list', label: 'View my routine', sub: 'Morning and night steps', primary: true, onClick: () => navigate('my-skin/routine') },
          { icon: 'flask', label: 'Ingredients for you', sub: 'What to look for', onClick: () => navigate('my-skin/ingredients') },
          { icon: 'bag', label: 'Explore products', sub: 'Optional suggestions', onClick: () => navigate('products') },
          { icon: 'doctor', label: 'Talk to a dermatologist', sub: 'Professional guidance', onClick: () => navigate('doctors') },
          { icon: 'save', label: 'Save report', sub: 'Download as PDF', onClick: () => window.print() },
          { icon: 'trend', label: 'Track progress', sub: 'See your journey', onClick: () => navigate('progress') },
        ]} />
      </section>

      <SafetyNotice />
    </div>
  );
}
