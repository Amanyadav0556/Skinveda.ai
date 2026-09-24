import { useMemo, useState } from 'react';
import { useApp } from '../App';
import { Icon, ScoreRing, Meter, LineChart, Segmented, EmptyState } from '../components/ui';
import { ENV_DATA, MOODS, timeAgo, formatDate } from '../data/mockData';
import { enrichDiagnosis, scoreLabel, METRIC_LABELS, buildRoutine, useRoutineLog, guideFor, firstName, useNow } from '../lib/skin';

const QUICK = [
  { page: 'diagnosis',       icon: 'scan',  label: 'New scan',        sub: 'About 60 seconds' },
  { page: 'recommendations', icon: 'spark', label: 'My routine',      sub: 'AM & PM plan' },
  { page: 'mood',            icon: 'smile', label: 'Log mood',        sub: 'Stress affects skin' },
  { page: 'solace',          icon: 'chat',  label: 'Ask Solace',      sub: 'AI companion' },
];

export default function Dashboard() {
  const { user, navigate, moodLogs, diagnoses, openResult } = useApp();
  const [range, setRange] = useState('all');
  const [done, toggle] = useRoutineLog();
  const now = useNow();

  const history = useMemo(() => diagnoses.map(enrichDiagnosis), [diagnoses]);
  const latest = history[0];
  const prev = history[1];
  const delta = latest && prev ? latest.skinScore - prev.skinScore : null;

  const chartPoints = useMemo(() => {
    const cutoff = range === '30d' ? now - 30 * 864e5 : range === '90d' ? now - 90 * 864e5 : 0;
    return [...history].reverse()
      .filter(d => new Date(d.timestamp).getTime() >= cutoff)
      .map(d => ({ label: formatDate(d.timestamp).replace(/, \d{4}$/, ''), value: d.skinScore }));
  }, [history, range, now]);

  const hour = new Date().getHours();
  const isAM = hour < 15;
  const routine = buildRoutine(user?.skinType, latest?.disease || user?.skinCondition);
  const steps = isAM ? routine.am : routine.pm;
  const doneCount = steps.filter(s => done.includes(s.id)).length;

  const weekMoods = moodLogs.filter(m => now - new Date(m.timestamp).getTime() < 7 * 864e5);
  const avgMood = weekMoods.length
    ? (weekMoods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / weekMoods.length).toFixed(1)
    : null;

  const guide = guideFor(latest?.disease || user?.skinCondition);
  const env = ENV_DATA.current;
  const insights = [
    latest && { icon: 'target', title: `Focus on ${latest.disease.toLowerCase()} care`, text: guide.summary },
    { icon: 'sun', clay: true, title: `UV ${env.uvIndex} today — high`, text: 'Apply SPF 50 before going out and reapply every 2 hours outdoors.' },
    avgMood && Number(avgMood) < 5 && { icon: 'heart', clay: true, title: 'Stress may be affecting your skin', text: 'Your mood average dipped this week. A short breathing session with Solace can help.' },
    { icon: 'drop', title: 'Hydration tip', text: guide.tips[0] },
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="stack">
      {/* Hero */}
      <section className="dash-hero">
        {latest
          ? <ScoreRing value={latest.skinScore} size={128} stroke={11} color="#A8CBB9" label={`Skin score ${latest.skinScore}`} />
          : <div className="ui-empty-icon" style={{ width: 96, height: 96, borderRadius: 28, background: 'rgba(255,255,255,.1)', color: '#A8CBB9' }}><Icon name="scan" size={36} /></div>}
        <div>
          <span className="mono" style={{ color: '#F0A58C' }}>{latest ? 'Skin health summary' : 'Welcome to SkinVeda'}</span>
          {latest ? (
            <>
              <h2 style={{ marginTop: 8 }}>Your skin is looking <em>{scoreLabel(latest.skinScore).toLowerCase()}</em>, {firstName(user)}.</h2>
              <p>
                {delta === null ? 'Run another scan next week to start tracking your trend.'
                  : delta >= 0 ? `Up ${delta} points since your previous scan — your routine is working.`
                  : `Down ${Math.abs(delta)} points since your previous scan. Check today’s recommendations.`}
              </p>
              <div className="dash-hero-meta">
                <span className="pill"><Icon name="clock" size={13} /> Last scan {timeAgo(latest.timestamp)}</span>
                <span className="pill"><Icon name="target" size={13} /> {latest.disease}</span>
                <span className="pill"><Icon name="flame" size={13} /> {user?.streak || 1}-day streak</span>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 8 }}>Let’s get your <em>first reading</em>, {firstName(user)}.</h2>
              <p>One clear photo gives you a skin score, detected concerns and a routine built for you.</p>
            </>
          )}
        </div>
        <div className="dash-hero-actions">
          <button className="btn btn-light" onClick={() => navigate('diagnosis')}><Icon name="scan" size={17} /> New scan</button>
          {latest && <button className="btn" style={{ color: 'var(--sv-ivory)', borderColor: 'rgba(247,244,238,.3)' }} onClick={() => openResult(latest.id)}>View report <Icon name="arrow" size={17} /></button>}
        </div>
      </section>

      {/* Overview stats */}
      <section className="grid g-4">
        <div className="card stat">
          <span className="stat-icon"><Icon name="trend" size={18} /></span>
          <span className="stat-label">Score change</span>
          <span className="stat-value">{delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}<small>pts</small></span>
          <span className="stat-foot">vs previous scan</span>
        </div>
        <div className="card stat">
          <span className="stat-icon"><Icon name="scan" size={18} /></span>
          <span className="stat-label">Analyses</span>
          <span className="stat-value">{history.length}</span>
          <span className="stat-foot">{history.length ? `Since ${formatDate(history[history.length - 1].timestamp)}` : 'None yet'}</span>
        </div>
        <div className="card stat">
          <span className="stat-icon clay"><Icon name="check" size={18} /></span>
          <span className="stat-label">{isAM ? 'Morning' : 'Evening'} routine</span>
          <span className="stat-value">{doneCount}<small>/ {steps.length}</small></span>
          <Meter value={(doneCount / steps.length) * 100} thin />
        </div>
        <div className="card stat">
          <span className="stat-icon"><Icon name="smile" size={18} /></span>
          <span className="stat-label">Mood · 7 days</span>
          <span className="stat-value">{avgMood ?? '—'}<small>/ 10</small></span>
          <span className="stat-foot">{weekMoods.length} check-ins this week</span>
        </div>
      </section>

      <section className="grid g-main">
        <div className="stack">
          {/* Progress overview */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Progress overview</h3>
                <p className="card-sub">Skin score across your analyses</p>
              </div>
              <Segmented size="sm" value={range} onChange={setRange}
                options={[{ value: '30d', label: '30D' }, { value: '90d', label: '90D' }, { value: 'all', label: 'All' }]} />
            </div>
            {chartPoints.length >= 2
              ? <LineChart points={chartPoints} height={230} ariaLabel="Skin score over time" />
              : <EmptyState icon="chart" title="Your trend appears after two scans"
                  text="Scan once a week in similar lighting to see how your skin responds to your routine."
                  action={<button className="btn btn-soft btn-sm" onClick={() => navigate('diagnosis')}>Start a scan</button>} />}
          </div>

          {/* Recent analysis */}
          <div className="card">
            <div className="card-head">
              <h3>Recent analyses</h3>
              {history.length > 0 && <button className="btn-text" style={{ fontSize: 13.5 }} onClick={() => navigate('progress')}>View all</button>}
            </div>
            {history.length === 0
              ? <EmptyState icon="image" title="No analyses yet" text="Your scan history will live here." />
              : history.slice(0, 4).map(d => (
                <button key={d.id} className="list-item" onClick={() => openResult(d.id)}>
                  <span className="list-thumb">{d.imageData ? <img src={d.imageData} alt="" /> : <Icon name="scan" size={20} />}</span>
                  <span className="list-body">
                    <strong>{d.disease}</strong>
                    <small>{d.bodyRegion || 'Face'} · {timeAgo(d.timestamp)}</small>
                  </span>
                  <span className="pill pill-emerald">{d.skinScore}</span>
                  <Icon name="chevron" size={16} className="muted" />
                </button>
              ))}
          </div>
        </div>

        <div className="stack">
          {/* Skin health summary */}
          <div className="card card-tint">
            <div className="card-head">
              <h3>Skin health</h3>
              <span className="mono">{latest ? formatDate(latest.timestamp) : 'No data'}</span>
            </div>
            {latest ? (
              <ul className="metric-list">
                {Object.entries(METRIC_LABELS).slice(0, 5).map(([k, label]) => (
                  <li key={k}>
                    <div><span>{label}</span><b>{latest.metrics[k]}</b></div>
                    <Meter value={latest.metrics[k]} tone={latest.metrics[k] < 60 ? 'clay' : 'emerald'} />
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="drop" title="Awaiting your first scan" />}
          </div>

          {/* Today's routine */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>{isAM ? 'Morning' : 'Evening'} routine</h3>
                <p className="card-sub">Tap each step as you go</p>
              </div>
              <span className="pill pill-mono">{doneCount}/{steps.length}</span>
            </div>
            <div className="routine-list">
              {steps.map(s => (
                <button key={s.id} className={`routine-item${done.includes(s.id) ? ' done' : ''}`} onClick={() => toggle(s.id)}
                  aria-pressed={done.includes(s.id)}>
                  <span className="routine-check"><Icon name="check" size={13} stroke={2.6} /></span>
                  <span className="list-body"><strong>{s.product}</strong></span>
                  <span className="routine-step">{s.step}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="card">
            <div className="card-head">
              <h3>AI recommendations</h3>
              <button className="btn-text" style={{ fontSize: 13.5 }} onClick={() => navigate('recommendations')}>See plan</button>
            </div>
            {insights.map(i => (
              <div className="insight" key={i.title}>
                <span className={`insight-icon${i.clay ? ' clay' : ''}`}><Icon name={i.icon} size={17} /></span>
                <div><strong>{i.title}</strong><p>{i.text}</p></div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-head"><h3>Quick actions</h3></div>
            <div className="quick-actions">
              {QUICK.map(q => (
                <button key={q.page} className="quick-action" onClick={() => navigate(q.page)}>
                  <span><Icon name={q.icon} size={17} /></span>
                  {q.label}
                  <small>{q.sub}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
