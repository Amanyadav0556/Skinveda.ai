import { useMemo, useState } from 'react';
import { useApp } from '../App';
import { AI_INSIGHTS, MOODS, ENV_DATA, formatDate } from '../data/mockData';
import { Icon, Logo, PageHeader, Segmented, EmptyState, Disclaimer } from '../components/ui';
import { enrichDiagnosis, guideFor, useNow } from '../lib/skin';

export default function Reports() {
  const { user, moodLogs, diagnoses, progressPhotos } = useApp();
  const [period, setPeriod] = useState('weekly');
  const [generating, setGenerating] = useState(false);
  const [generatedFor, setGeneratedFor] = useState(null);
  const now = useNow();

  const start = useMemo(() => {
    const d = new Date();
    if (period === 'weekly') d.setDate(d.getDate() - 7); else d.setDate(d.getDate() - 30);
    return d;
  }, [period]);

  const inPeriod = x => new Date(x.timestamp) >= start;
  const scans = diagnoses.filter(inPeriod).map(enrichDiagnosis);
  const moods = moodLogs.filter(inPeriod);
  const photos = progressPhotos.filter(inPeriod);
  const avgScore = scans.length ? Math.round(scans.reduce((s, d) => s + d.skinScore, 0) / scans.length) : null;
  const avgMood = moods.length ? (moods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / moods.length).toFixed(1) : null;
  const stressDays = moods.filter(m => ['stressed', 'anxious', 'angry'].includes(m.mood)).length;
  const primary = scans[0]?.disease || diagnoses[0]?.disease || user?.skinCondition;
  const guide = guideFor(primary);
  const label = period === 'weekly' ? 'Last 7 days' : 'Last 30 days';

  const generate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1400));
    setGenerating(false);
    setGeneratedFor(period);
  };

  const ready = generatedFor === period;

  return (
    <>
      <PageHeader eyebrow="Reports" title={<>Your health <em>report</em></>}
        subtitle="A clean summary of your scans, mood and environment — ready to share with a dermatologist."
        actions={<>
          <Segmented value={period} onChange={setPeriod} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
          {ready
            ? <button className="btn btn-dark btn-sm" onClick={() => window.print()}><Icon name="download" size={16} /> Save as PDF</button>
            : <button className="btn btn-dark btn-sm" onClick={generate} disabled={generating}>{generating ? <><span className="spinner" /> Generating…</> : <><Icon name="spark" size={16} /> Generate</>}</button>}
        </>}
      />

      {!ready ? (
        <div className="card">
          <EmptyState icon="file" title={generating ? 'Compiling your report…' : `Generate your ${period} report`}
            text="We’ll combine your analyses, mood check-ins and local conditions into a single shareable document."
            action={!generating && <button className="btn btn-dark" onClick={generate}><Icon name="spark" size={16} /> Generate report</button>} />
        </div>
      ) : (
        <article className="card report-doc">
          <header className="report-doc-head">
            <div>
              <Logo size={28} sub="Skin health report" />
              <h2 className="mt-16">{user?.name}</h2>
              <p className="muted">{label} · {formatDate(start)} – {formatDate(new Date())}</p>
            </div>
            <ul className="rows soft" style={{ minWidth: 240 }}>
              <li><span>Report ID</span><b>RPT-{now.toString(36).slice(-6).toUpperCase()}</b></li>
              <li><span>Skin type</span><b>{user?.skinType || '—'}</b></li>
              <li><span>Main concern</span><b>{primary || '—'}</b></li>
            </ul>
          </header>

          <section className="report-section">
            <h4>Summary</h4>
            <div className="grid g-4">
              <div className="stat"><span className="stat-label">Analyses</span><span className="stat-value">{scans.length}</span></div>
              <div className="stat"><span className="stat-label">Avg skin score</span><span className="stat-value">{avgScore ?? '—'}</span></div>
              <div className="stat"><span className="stat-label">Avg mood</span><span className="stat-value">{avgMood ?? '—'}<small>/10</small></span></div>
              <div className="stat"><span className="stat-label">Stress days</span><span className="stat-value">{stressDays}</span></div>
            </div>
          </section>

          <section className="report-section">
            <h4>Skin analyses</h4>
            {scans.length ? (
              <div className="table-scroll">
                <table className="history-table">
                  <thead><tr><th>Date</th><th>Finding</th><th>Area</th><th>Confidence</th><th>Score</th></tr></thead>
                  <tbody>
                    {scans.map(d => (
                      <tr key={d.id} style={{ cursor: 'default' }}>
                        <td>{formatDate(d.timestamp)}</td><td>{d.disease}</td><td className="muted">{d.bodyRegion}</td>
                        <td className="num">{Math.round(d.confidence * 100)}%</td><td className="num">{d.skinScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="muted">No analyses in this period.</p>}
          </section>

          <section className="report-section grid g-2">
            <div>
              <h4>Mood &amp; wellbeing</h4>
              <ul className="rows soft">
                <li><span>Check-ins</span><b>{moods.length}</b></li>
                <li><span>Average mood</span><b>{avgMood ?? '—'} / 10</b></li>
                <li><span>Stress / anxiety days</span><b>{stressDays}</b></li>
                <li><span>Progress photos</span><b>{photos.length}</b></li>
              </ul>
            </div>
            <div>
              <h4>Environment snapshot</h4>
              <ul className="rows soft">
                <li><span>Location</span><b>{ENV_DATA.current.city}</b></li>
                <li><span>UV index</span><b>{ENV_DATA.current.uvIndex}</b></li>
                <li><span>Air quality</span><b>{ENV_DATA.current.aqi} AQI</b></li>
                <li><span>Humidity</span><b>{ENV_DATA.current.humidity}%</b></li>
              </ul>
            </div>
          </section>

          <section className="report-section">
            <h4>AI insights</h4>
            {AI_INSIGHTS.slice(0, 3).map(i => (
              <div className="insight" key={i.title}>
                <span className={`insight-icon${i.type === 'warning' ? ' clay' : ''}`}><Icon name={i.type === 'warning' ? 'alert' : 'trend'} size={16} /></span>
                <div><strong>{i.title}</strong><p>{i.message}</p></div>
              </div>
            ))}
          </section>

          <section className="report-section">
            <h4>Recommendations</h4>
            <ol className="next-steps">
              {guide.tips.slice(0, 3).map(t => <li key={t}><div>{t}</div></li>)}
            </ol>
          </section>

          <Disclaimer />
        </article>
      )}
    </>
  );
}
