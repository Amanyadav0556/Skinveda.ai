import { useState } from 'react';
import { useApp } from '../App';
import { MOODS, AI_INSIGHTS, timeAgo, MONTHS } from '../data/mockData';

const WEEK_DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MoodTracker() {
  const { addMoodLog, moodLogs, showToast } = useApp();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [activeTab, setActiveTab] = useState('log');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const TAG_OPTIONS = ['Work Stress', 'Poor Sleep', 'Skin Flare', 'Exercise', 'Good Diet', 'Social Event', 'Medication', 'Weather'];

  const toggleTag = (tag) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmit = async () => {
    if (!selectedMood) { showToast('Please select your mood first', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    addMoodLog({ mood: selectedMood.id, score: selectedMood.score, notes: note, tags });
    setSubmitted(true);
    setLoading(false);
    showToast(`Mood logged: ${selectedMood.label} ${selectedMood.emoji}`, 'success');
  };

  const resetForm = () => { setSelectedMood(null); setNote(''); setTags([]); setSubmitted(false); };

  // Chart data — last 14 days
  const chartData = (() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const log = moodLogs.find(m => new Date(m.timestamp).toDateString() === d.toDateString());
      const mood = log ? MOODS.find(x => x.id === log.mood) : null;
      days.push({ date: d, score: mood?.score || 0, mood: mood, log });
    }
    return days;
  })();

  // Heatmap data — last 90 days
  const heatmapData = (() => {
    const cells = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const log = moodLogs.find(m => new Date(m.timestamp).toDateString() === d.toDateString());
      const mood = log ? MOODS.find(x => x.id === log.mood) : null;
      cells.push({ date: d, score: mood?.score || 0, mood: mood?.id });
    }
    return cells;
  })();

  const getHeatClass = (score) => {
    if (!score) return '';
    if (score >= 8) return 'heatmap-4';
    if (score >= 6) return 'heatmap-3';
    if (score >= 4) return 'heatmap-2';
    return 'heatmap-1';
  };

  const moodCounts = MOODS.map(m => ({
    ...m,
    count: moodLogs.filter(l => l.mood === m.id).length,
  })).filter(m => m.count > 0).sort((a, b) => b.count - a.count);

  const avgScore = moodLogs.length
    ? (moodLogs.reduce((s, l) => s + (MOODS.find(m => m.id === l.mood)?.score || 5), 0) / moodLogs.length).toFixed(1)
    : '—';

  const correlation = moodLogs.filter(l => ['stressed', 'anxious', 'angry'].includes(l.mood)).length;
  const correlationPct = moodLogs.length ? Math.round((correlation / moodLogs.length) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💭 Mood Tracker</h1>
        <p className="page-subtitle">Log your daily emotions to discover patterns affecting your skin health.</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 28 }}>
        {[
          { id: 'log', label: "📝 Today's Mood" },
          { id: 'timeline', label: '📊 Timeline' },
          { id: 'analytics', label: '📈 Analytics' },
          { id: 'history', label: `📋 History (${moodLogs.length})` },
        ].map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Log Mood Tab */}
      {activeTab === 'log' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {submitted ? (
            <div className="card card-lg" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,217,166,0.08),rgba(124,58,237,0.08))', border: '1px solid rgba(0,217,166,0.2)' }} >
              <div style={{ fontSize: 72, marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>{selectedMood?.emoji}</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Mood Logged! 🎉</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Feeling <strong style={{ color: 'var(--accent-teal)' }}>{selectedMood?.label}</strong> · Score: {selectedMood?.score}/10
              </p>
              <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: 24 }}>
                <span>💡</span>
                <div>
                  <strong>AI Insight:</strong> {selectedMood?.score < 4
                    ? 'Low mood detected. Studies show stress and negative emotions can trigger skin flare-ups. Consider using Solace AI for support.'
                    : selectedMood?.score > 7
                      ? 'Great mood! Positive emotional states support skin healing. Keep tracking to identify what helps you feel good.'
                      : 'Moderate mood logged. Stay consistent with tracking to identify patterns in your emotional health.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetForm}>Log Another</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveTab('analytics')}>View Analytics</button>
              </div>
            </div>
          ) : (
            <div className="card card-lg animate-scale-in">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>How are you feeling today?</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

              {/* Mood Grid */}
              <div className="mood-grid" style={{ marginBottom: 28 }}>
                {MOODS.map(mood => (
                  <button key={mood.id} className={`mood-btn${selectedMood?.id === mood.id ? ' selected' : ''}`} onClick={() => setSelectedMood(mood)}>
                    <span className="mood-emoji">{mood.emoji}</span>
                    <span>{mood.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{mood.score}/10</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">How are you feeling? (optional)</label>
                <textarea className="form-input form-textarea" placeholder="Add notes about your mood, what might have caused it, any skin symptoms..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 90 }} />
              </div>

              {/* Tags */}
              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label">Contributing Factors (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TAG_OPTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${tags.includes(tag) ? 'rgba(0,217,166,0.5)' : 'var(--border)'}`, background: tags.includes(tag) ? 'rgba(0,217,166,0.1)' : 'transparent', color: tags.includes(tag) ? 'var(--accent-teal)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {tags.includes(tag) ? '✓ ' : ''}{tag}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={handleSubmit} disabled={!selectedMood || loading}>
                {loading ? <><span className="spinner spinner-sm" /> Saving...</> : selectedMood ? `${selectedMood.emoji} Log ${selectedMood.label} Mood` : 'Select a mood to continue'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="card animate-fade-in">
          <div className="section-header">
            <div className="section-title">📊 14-Day Mood Timeline</div>
          </div>
          {moodLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No data yet</div>
              <div className="empty-state-text">Start logging your mood daily to see the timeline chart.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('log')}>Log Today's Mood</button>
            </div>
          ) : (
            <>
              <div className="bar-chart" style={{ height: 180, marginBottom: 20 }}>
                {chartData.map((d, i) => (
                  <div key={i} className="bar-item" title={d.mood?.label || 'No data'}>
                    <div className="bar-value" style={{ color: d.mood?.color || 'transparent', fontSize: 12 }}>{d.score || ''}</div>
                    <div className="bar" style={{ height: `${d.score ? (d.score / 10) * 100 : 0}%`, background: d.mood ? `linear-gradient(180deg, ${d.mood.color}, ${d.mood.color}88)` : 'rgba(255,255,255,0.05)', opacity: d.score ? 1 : 0.3 }} />
                    <div className="bar-label" style={{ fontSize: 10 }}>{d.date.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Mood Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {MOODS.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                    <span>{m.emoji} {m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats Row */}
          <div className="grid-3 animate-fade-in">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--accent-teal)' }}>{avgScore}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Average Mood Score</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--accent-purple-light)' }}>{moodLogs.length}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Total Entries</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--accent-rose)' }}>{correlationPct}%</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>High-Stress Days</div>
            </div>
          </div>

          {/* AI Skin Correlation Insight */}
          {moodLogs.length > 3 && (
            <div className="card animate-fade-in" style={{ background: 'linear-gradient(135deg,rgba(244,63,143,0.08),rgba(124,58,237,0.08))', borderColor: 'rgba(244,63,143,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-rose)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>🧠 AI Skin-Mood Correlation</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Insights from your mood data</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {AI_INSIGHTS.slice(0, 3).map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ flexShrink: 0 }}>{ins.icon}</span>
                    <span>{ins.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mood Distribution */}
          {moodCounts.length > 0 && (
            <div className="card animate-fade-in">
              <div className="section-title" style={{ marginBottom: 20 }}>Mood Distribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {moodCounts.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 80, fontSize: 13, color: 'var(--text-secondary)' }}>{m.emoji} {m.label}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(m.count / moodLogs.length) * 100}%`, background: m.color, borderRadius: 4, transition: 'width 1s' }} />
                    </div>
                    <span style={{ width: 40, fontSize: 13, fontWeight: 700, color: m.color, textAlign: 'right' }}>{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap */}
          <div className="card animate-fade-in">
            <div className="section-title" style={{ marginBottom: 16 }}>90-Day Mood Heatmap</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {WEEK_DAYS_SHORT.map(d => <div key={d} style={{ width: 14, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{d}</div>)}
            </div>
            <div className="heatmap">
              {heatmapData.map((cell, i) => (
                <div key={i} className={`heatmap-cell ${getHeatClass(cell.score)}`} title={`${cell.date.toLocaleDateString()}: ${cell.mood || 'No data'} ${cell.score ? `(${cell.score}/10)` : ''}`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              Less
              {[0, 1, 2, 3, 4].map(i => <div key={i} className={`heatmap-cell ${i ? `heatmap-${i}` : ''}`} style={{ flexShrink: 0 }} />)}
              More
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {moodLogs.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No mood history yet</div><button className="btn btn-primary btn-sm" onClick={() => setActiveTab('log')}>Log First Mood →</button></div></div>
          ) : (
            <div className="timeline">
              {moodLogs.map((log, i) => {
                const mood = MOODS.find(m => m.id === log.mood);
                return (
                  <div key={log.id} className="timeline-item animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="timeline-dot" style={{ background: mood?.color || 'var(--accent-teal)' }} />
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: log.notes ? 8 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{mood?.emoji}</span>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: mood?.color }}>{mood?.label}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>Score: {mood?.score}/10</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(log.timestamp)}</span>
                      </div>
                      {log.notes && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{log.notes}</p>}
                      {log.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {log.tags.map(t => <span key={t} className="badge badge-gray" style={{ fontSize: 10 }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
