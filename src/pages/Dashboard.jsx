import { useApp } from '../App';
import { AI_INSIGHTS, ENV_DATA, MOODS, formatDate, timeAgo } from '../data/mockData';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const { user, navigate, moodLogs, diagnoses, showToast } = useApp();

  const recentDiagnoses = diagnoses.slice(0, 3);
  const recentMoods = moodLogs.slice(0, 7);

  // Streak
  const streak = user?.streak || 1;

  // Avg mood score
  const avgMood = recentMoods.length
    ? Math.round(recentMoods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / recentMoods.length)
    : 6;

  // Skin score (simulated)
  const skinScore = diagnoses.length ? Math.max(40, 90 - diagnoses.length * 5) : 78;

  // Chart bars — last 7 days mood scores
  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayName = WEEK_DAYS[d.getDay()];
      const log = moodLogs.find(m => new Date(m.timestamp).toDateString() === d.toDateString());
      const mood = log ? MOODS.find(x => x.id === log.mood) : null;
      days.push({ day: dayName, score: mood?.score || 0, mood: log?.mood });
    }
    return days;
  })();

  const maxScore = 10;

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="page-subtitle">Here's your skin & wellness overview for today, {formatDate(new Date().toISOString())}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('diagnosis')}>
          🔬 New Diagnosis
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '🔥', label: 'Day Streak', value: streak, change: '+1 today', dir: 'up', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
          { icon: '🔬', label: 'Total Diagnoses', value: diagnoses.length, change: diagnoses.length > 0 ? 'Last: ' + timeAgo(diagnoses[0]?.timestamp) : 'None yet', dir: 'neutral', bg: 'rgba(0,217,166,0.12)', color: '#00d9a6' },
          { icon: '💭', label: 'Avg Mood Score', value: `${avgMood}/10`, change: avgMood > 5 ? 'Trending positive' : 'Monitor closely', dir: avgMood > 5 ? 'up' : 'down', bg: 'rgba(124,58,237,0.12)', color: '#a78bfa' },
          { icon: '🩺', label: 'Skin Score', value: `${skinScore}%`, change: 'AI-estimated health', dir: skinScore > 70 ? 'up' : 'down', bg: 'rgba(244,63,143,0.12)', color: '#f43f8f' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className={`stat-change ${s.dir}`}>{s.dir === 'up' ? '↑' : s.dir === 'down' ? '↓' : '—'} {s.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Mood Chart */}
          <div className="card animate-slide-up delay-1">
            <div className="section-header">
              <div>
                <div className="section-title">💭 Mood Timeline — Last 7 Days</div>
                <div className="section-subtitle">Daily emotional health tracking</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('mood')}>View all →</button>
            </div>

            {recentMoods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💭</div>
                <div className="empty-state-title">No mood data yet</div>
                <div className="empty-state-text">Start logging your daily mood to see patterns and correlations with your skin health.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('mood')}>Log Today's Mood</button>
              </div>
            ) : (
              <div>
                <div className="bar-chart">
                  {chartData.map((d, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-value">{d.score || '—'}</div>
                      <div
                        className="bar"
                        style={{
                          height: `${d.score ? (d.score / maxScore) * 100 : 0}%`,
                          background: d.score > 6 ? 'linear-gradient(180deg,#22c55e,#10b981)' : d.score > 3 ? 'linear-gradient(180deg,#f59e0b,#f97316)' : d.score > 0 ? 'linear-gradient(180deg,#ef4444,#f97316)' : 'rgba(255,255,255,0.05)',
                          opacity: d.score ? 1 : 0.3,
                        }}
                        title={d.mood || 'No data'}
                      />
                      <div className="bar-label">{d.day}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                  {[{ label: 'Positive (7-10)', color: '#22c55e' }, { label: 'Neutral (4-6)', color: '#f59e0b' }, { label: 'Low (1-3)', color: '#ef4444' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Diagnoses */}
          <div className="card animate-slide-up delay-2">
            <div className="section-header">
              <div>
                <div className="section-title">🔬 Recent Diagnoses</div>
                <div className="section-subtitle">AI skin analysis history</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('diagnosis')}>New Analysis →</button>
            </div>

            {recentDiagnoses.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">🔬</div>
                <div className="empty-state-title">No diagnoses yet</div>
                <div className="empty-state-text">Upload a skin image to get your first AI diagnosis.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('diagnosis')}>Start Analysis</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentDiagnoses.map((d, i) => (
                  <div key={d.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,rgba(0,217,166,0.15),rgba(124,58,237,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{d.disease}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence: {Math.round(d.confidence * 100)}% · {d.bodyRegion || 'Unknown region'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge badge-${d.risk === 'low' ? 'green' : d.risk === 'moderate' ? 'amber' : 'red'}`}>{d.risk}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(d.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="card animate-slide-up delay-3">
            <div className="section-header">
              <div className="section-title">💡 AI Personalized Insights</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {AI_INSIGHTS.slice(0, 3).map((ins, i) => (
                <div key={i} className={`alert alert-${ins.type}`} style={{ cursor: 'default' }}>
                  <span className="alert-icon">{ins.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{ins.title}</div>
                    <div style={{ opacity: 0.85, fontSize: 13 }}>{ins.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="card animate-fade-right delay-1">
            <div className="section-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
            <div className="quick-actions">
              {[
                { icon: '🔬', title: 'AI Diagnosis', desc: 'Analyze skin image', page: 'diagnosis', color: 'var(--accent-teal)' },
                { icon: '💭', title: 'Log Mood', desc: 'How are you today?', page: 'mood', color: 'var(--accent-purple-light)' },
                { icon: '🤖', title: 'Talk to Solace', desc: 'Mental health support', page: 'solace', color: 'var(--accent-rose)' },
                { icon: '📊', title: 'Track Progress', desc: 'Upload weekly photo', page: 'progress', color: 'var(--accent-amber)' },
              ].map((a, i) => (
                <button key={i} className="quick-action-btn" onClick={() => navigate(a.page)}>
                  <div className="quick-action-icon">{a.icon}</div>
                  <div className="quick-action-title" style={{ color: a.color }}>{a.title}</div>
                  <div className="quick-action-desc">{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment Widget */}
          <div className="card animate-fade-right delay-2" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(0,217,166,0.08))', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div className="section-title">🌍 Today's Environment</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('environment')}>Details →</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>{ENV_DATA.current.weatherIcon}</span>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{ENV_DATA.current.temperature}°C</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ENV_DATA.current.weather} · {ENV_DATA.current.city}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {[
                { label: 'Humidity', value: `${ENV_DATA.current.humidity}%`, icon: '💧' },
                { label: 'UV Index', value: ENV_DATA.current.uvIndex, icon: '☀️' },
                { label: 'AQI', value: ENV_DATA.current.aqi, icon: '🌫️' },
                { label: 'Wind', value: `${ENV_DATA.current.windSpeed} km/h`, icon: '💨' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>{m.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px' }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                </div>
              ))}
            </div>
            {ENV_DATA.alerts.length > 0 && (
              <div className="alert alert-warning" style={{ marginTop: 12 }}>
                <span>⚠️</span>
                <span style={{ fontSize: 13 }}>{ENV_DATA.alerts[0].title}</span>
              </div>
            )}
          </div>

          {/* Solace AI Card */}
          <div className="card animate-fade-right delay-3" style={{ background: 'linear-gradient(135deg,rgba(244,63,143,0.08),rgba(124,58,237,0.08))', borderColor: 'rgba(244,63,143,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>🤖</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Solace AI</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>Your mental health companion is ready to listen and support your wellness journey.</div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('solace')}>
              💬 Start a Conversation
            </button>
          </div>

          {/* Skin Condition Card */}
          {user?.skinCondition && user.skinCondition !== 'Not specified' && (
            <div className="card animate-fade-right delay-4">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Primary Condition</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d9a6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🩺</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{user.skinCondition}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monitoring active</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
