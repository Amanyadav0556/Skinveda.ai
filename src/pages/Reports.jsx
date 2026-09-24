import { useMemo, useState } from 'react';
import { useApp } from '../App';
import { MOODS, ENV_DATA, formatDate } from '../data/mockData';
import { Icon, Logo, PageHeader, Segmented } from '../components/ui';
import { SafetyNotice } from '../components/skin';
import { useNow } from '../lib/skin';
import { buildRoutine } from '../lib/routine';

export default function Reports() {
  const { user, moodLogs, diagnoses, progressPhotos } = useApp();
  const [period, setPeriod] = useState('weekly');
  const now = useNow();

  const start = useMemo(() => {
    const d = new Date();
    if (period === 'weekly') d.setDate(d.getDate() - 7); else d.setDate(d.getDate() - 30);
    return d;
  }, [period]);

  const inPeriod = x => new Date(x.timestamp) >= start;
  const scans = diagnoses.filter(inPeriod);
  const moods = moodLogs.filter(inPeriod);
  const photos = progressPhotos.filter(inPeriod);
  const avgScore = scans.length ? Math.round(scans.reduce((s, d) => s + d.skinScore, 0) / scans.length) : null;
  const avgMood = moods.length ? (moods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / moods.length).toFixed(1) : null;
  const stressDays = moods.filter(m => ['stressed', 'anxious', 'angry'].includes(m.mood)).length;
  const latest = scans[0] || diagnoses[0];
  const primary = latest?.concerns?.[0]?.name;
  const tips = buildRoutine(latest?.skinType || user?.skinType || 'Normal', latest?.concerns?.map(c => c.id) || []).tips;
  // How often each visible concern appeared in this period
  const concernCounts = Object.values(scans.flatMap(s => s.concerns.slice(0, 3)).reduce((acc, c) => {
    acc[c.id] = acc[c.id] || { name: c.name, n: 0, total: 0 }; acc[c.id].n++; acc[c.id].total += c.score; return acc;
  }, {})).sort((a, b) => b.n - a.n);
  const label = period === 'weekly' ? 'Last 7 days' : 'Last 30 days';

  return (
    <>
      <PageHeader eyebrow="Reports" title='Your skin report summary'
        subtitle="A printable summary of your scans, routine and wellbeing — useful to share with a dermatologist."
        actions={<>
          <Segmented value={period} onChange={setPeriod} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}><Icon name="download" size={16} /> Save as PDF</button>
        </>}
      />

        <article className="card report-doc">
          <header className="report-doc-head">
            <div>
              <Logo size={28} sub="Skin health report" />
              <h2 className="mt-16">{user?.name}</h2>
              <p className="muted">{label} · {formatDate(start)} – {formatDate(new Date())}</p>
            </div>
            <ul className="rows soft" style={{ minWidth: 240 }}>
              <li><span>Report ID</span><b>RPT-{now.toString(36).slice(-6).toUpperCase()}</b></li>
              <li><span>Skin type (estimate)</span><b>{latest?.skinType || user?.skinType || '—'}</b></li>
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
                  <thead><tr><th>Date</th><th>Main visible concern</th><th>Areas</th><th>Confidence</th><th>Score</th></tr></thead>
                  <tbody>
                    {scans.map(d => (
                      <tr key={d.id} style={{ cursor: 'default' }}>
                        <td>{formatDate(d.timestamp)}</td><td>{d.concerns[0]?.name || 'None strong'}</td><td className="muted">{d.concerns[0]?.areas?.join(', ') || '—'}</td>
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
            <h4>Visible concerns this period</h4>
            {concernCounts.length ? (
              <ul className="rows soft">
                {concernCounts.map(c => <li key={c.name}><span>{c.name}</span><b>{c.n} scan{c.n > 1 ? 's' : ''} · avg visibility {Math.round(c.total / c.n)}</b></li>)}
              </ul>
            ) : <p className="muted">No scans in this period.</p>}
          </section>

          <section className="report-section">
            <h4>Routine reminders</h4>
            <ol className="next-steps">
              {tips.slice(0, 3).map(t => <li key={t}><div>{t}</div></li>)}
            </ol>
          </section>

          <SafetyNotice />
        </article>
    </>
  );
}
