import { useApp } from '../App';
import { AI_INSIGHTS, ENV_DATA, MOODS, formatDate, timeAgo } from '../data/mockData';

const WEEK_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Dashboard() {
  const { user, navigate, moodLogs, diagnoses } = useApp();

  const recentDiagnoses = diagnoses.slice(0, 3);
  const recentMoods     = moodLogs.slice(0, 7);
  const streak          = user?.streak || 1;
  const avgMood         = recentMoods.length
    ? Math.round(recentMoods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / recentMoods.length)
    : 6;
  const skinScore = diagnoses.length ? Math.max(40, 90 - diagnoses.length * 5) : 78;

  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const log  = moodLogs.find(m => new Date(m.timestamp).toDateString() === d.toDateString());
      const mood = log ? MOODS.find(x => x.id === log.mood) : null;
      days.push({ day: WEEK_DAYS[d.getDay()], score: mood?.score || 0, mood: log?.mood });
    }
    return days;
  })();

  const stats = [
    { icon:'🔥', label:'Day Streak',      value: streak,          change:'+1 today',   dir:'up',
      bg:'rgba(245,158,11,0.1)',  color:'#D97706' },
    { icon:'🔬', label:'AI Diagnoses',    value: diagnoses.length, change: diagnoses.length > 0 ? 'Last: '+timeAgo(diagnoses[0]?.timestamp) : 'None yet', dir:'neutral',
      bg:'rgba(139,92,246,0.1)', color:'#7C3AED' },
    { icon:'💭', label:'Avg Mood Score',  value:`${avgMood}/10`,  change: avgMood > 5 ? 'Trending positive' : 'Monitor closely', dir: avgMood > 5 ? 'up' : 'down',
      bg:'rgba(236,72,153,0.1)', color:'#EC4899' },
    { icon:'🩺', label:'Skin Score',      value:`${skinScore}%`,  change:'AI-estimated health', dir: skinScore > 70 ? 'up' : 'down',
      bg:'rgba(45,212,191,0.1)',  color:'#0D9488' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="page-subtitle">
            Here's your skin & wellness overview for today, {formatDate(new Date().toISOString())}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('diagnosis')} style={{ gap:6 }}>
          🔬 New Diagnosis
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom:18 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay:`${i*0.07}s` }}>
            <div className="stat-icon" style={{ background:s.bg }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
              <div className={`stat-change ${s.dir}`}>
                {s.dir==='up' ? '↑' : s.dir==='down' ? '↓' : '—'} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

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
              <div className="empty-state" style={{ padding:'28px 20px' }}>
                <div className="empty-state-icon">💭</div>
                <div className="empty-state-title">No mood data yet</div>
                <div className="empty-state-text">Start logging your daily mood to see patterns.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('mood')}>Log Today's Mood</button>
              </div>
            ) : (
              <div>
                <div className="bar-chart">
                  {chartData.map((d, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-value">{d.score || '—'}</div>
                      <div className="bar" style={{
                        height:`${d.score ? (d.score/10)*100 : 0}%`,
                        background: d.score > 6
                          ? 'linear-gradient(180deg,#10B981,#059669)'
                          : d.score > 3
                          ? 'linear-gradient(180deg,#F59E0B,#D97706)'
                          : d.score > 0
                          ? 'linear-gradient(180deg,#EF4444,#DC2626)'
                          : 'rgba(139,92,246,0.08)',
                        opacity: d.score ? 1 : 0.4,
                        borderRadius:'5px 5px 0 0',
                      }} title={d.mood || 'No data'} />
                      <div className="bar-label">{d.day}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:14, marginTop:12, flexWrap:'wrap' }}>
                  {[{label:'Positive (7-10)',color:'#10B981'},{label:'Neutral (4-6)',color:'#F59E0B'},{label:'Low (1-3)',color:'#EF4444'}].map(l => (
                    <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9CA3AF' }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
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
              <div className="empty-state" style={{ padding:'28px 20px' }}>
                <div className="empty-state-icon">🔬</div>
                <div className="empty-state-title">No diagnoses yet</div>
                <div className="empty-state-text">Upload a skin image to get your first AI diagnosis.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('diagnosis')}>Start Analysis</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {recentDiagnoses.map((d, i) => (
                  <div key={d.id} className="animate-fade-in" style={{
                    animationDelay:`${i*0.08}s`,
                    display:'flex', alignItems:'center', gap:12,
                    padding:'12px 14px',
                    background:'linear-gradient(135deg,rgba(139,92,246,0.03),rgba(236,72,153,0.02))',
                    borderRadius:12,
                    border:'1px solid rgba(139,92,246,0.1)',
                    transition:'all 0.2s',
                  }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🔬</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:2, color:'#111827' }}>{d.disease}</div>
                      <div style={{ fontSize:11, color:'#9CA3AF' }}>Confidence: {Math.round(d.confidence*100)}% · {d.bodyRegion || 'Unknown region'}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span className={`badge badge-${d.risk==='low'?'green':d.risk==='moderate'?'amber':'red'}`}>{d.risk}</span>
                      <div style={{ fontSize:10, color:'#9CA3AF', marginTop:3 }}>{timeAgo(d.timestamp)}</div>
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
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {AI_INSIGHTS.slice(0, 3).map((ins, i) => (
                <div key={i} className={`alert alert-${ins.type}`}>
                  <span className="alert-icon">{ins.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:2, fontSize:13 }}>{ins.title}</div>
                    <div style={{ opacity:0.85, fontSize:12 }}>{ins.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Quick Actions */}
          <div className="card animate-fade-right delay-1">
            <div className="section-title" style={{ marginBottom:12 }}>⚡ Quick Actions</div>
            <div className="quick-actions">
              {[
                { icon:'🔬', title:'AI Diagnosis',   desc:'Analyze skin image',     page:'diagnosis', color:'#7C3AED' },
                { icon:'💭', title:'Log Mood',       desc:'How are you today?',     page:'mood',      color:'#EC4899' },
                { icon:'🤖', title:'Talk to Solace', desc:'Mental health support',  page:'solace',    color:'#F472B6' },
                { icon:'📈', title:'Track Progress', desc:'Upload weekly photo',    page:'progress',  color:'#10B981' },
              ].map((a, i) => (
                <button key={i} className="quick-action-btn" onClick={() => navigate(a.page)}>
                  <div className="quick-action-icon">{a.icon}</div>
                  <div className="quick-action-title" style={{ color:a.color }}>{a.title}</div>
                  <div className="quick-action-desc">{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment Widget */}
          <div className="card animate-fade-right delay-2" style={{ background:'linear-gradient(135deg,rgba(96,165,250,0.06),rgba(45,212,191,0.06))', borderColor:'rgba(96,165,250,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div className="section-title">🌿 Today's Environment</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('environment')}>Details →</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <span style={{ fontSize:36 }}>{ENV_DATA.current.weatherIcon}</span>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:'#111827' }}>{ENV_DATA.current.temperature}°C</div>
                <div style={{ fontSize:12, color:'#9CA3AF' }}>{ENV_DATA.current.weather} · {ENV_DATA.current.city}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:7 }}>
              {[
                { label:'Humidity',  value:`${ENV_DATA.current.humidity}%`, icon:'💧' },
                { label:'UV Index',  value:ENV_DATA.current.uvIndex,         icon:'☀️' },
                { label:'AQI',       value:ENV_DATA.current.aqi,             icon:'🌫️' },
                { label:'Wind',      value:`${ENV_DATA.current.windSpeed} km/h`, icon:'💨' },
              ].map((m, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.7)', borderRadius:9, padding:'9px 11px', textAlign:'center', border:'1px solid rgba(139,92,246,0.08)' }}>
                  <div style={{ fontSize:16 }}>{m.icon}</div>
                  <div style={{ fontSize:14, fontWeight:800, margin:'3px 0 1px', color:'#111827' }}>{m.value}</div>
                  <div style={{ fontSize:10, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em' }}>{m.label}</div>
                </div>
              ))}
            </div>
            {ENV_DATA.alerts.length > 0 && (
              <div className="alert alert-warning" style={{ marginTop:10 }}>
                <span>⚠️</span>
                <span style={{ fontSize:12 }}>{ENV_DATA.alerts[0].title}</span>
              </div>
            )}
          </div>

          {/* Solace AI Card */}
          <div className="card animate-fade-right delay-3" style={{
            background:'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(236,72,153,0.06))',
            borderColor:'rgba(139,92,246,0.18)',
            textAlign:'center',
          }}>
            <div style={{ fontSize:40, marginBottom:10, animation:'float 3.5s ease-in-out infinite' }}>🤖</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:7, color:'#111827' }}>Solace AI</div>
            <div style={{ fontSize:12, color:'#6B7280', marginBottom:14, lineHeight:1.65 }}>
              Your mental health companion is ready to listen and support your wellness journey.
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('solace')}>
              💬 Start a Conversation
            </button>
          </div>

          {/* Skin Condition */}
          {user?.skinCondition && user.skinCondition !== 'Not specified' && (
            <div className="card animate-fade-right delay-4" style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.04),rgba(236,72,153,0.03))' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:9 }}>Your Primary Condition</div>
              <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 4px 12px rgba(139,92,246,0.28)' }}>🩺</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{user.skinCondition}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>Monitoring active</div>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  <span className="badge badge-purple">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
