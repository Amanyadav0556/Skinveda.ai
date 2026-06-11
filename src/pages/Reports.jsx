import { useState } from 'react';
import { useApp } from '../App';
import { AI_INSIGHTS, MOODS, ENV_DATA, formatDate } from '../data/mockData';

export default function Reports() {
  const { user, moodLogs, diagnoses, progressPhotos } = useApp();
  const [reportType, setReportType] = useState('weekly');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now); monthStart.setDate(1);

  const periodStart = reportType === 'weekly' ? weekStart : monthStart;
  const periodLabel = reportType === 'weekly' ? 'This Week' : 'This Month';

  const periodMoods = moodLogs.filter(m => new Date(m.timestamp) >= periodStart);
  const periodDiagnoses = diagnoses.filter(d => new Date(d.timestamp) >= periodStart);
  const periodPhotos = progressPhotos.filter(p => new Date(p.timestamp) >= periodStart);

  const avgMoodScore = periodMoods.length
    ? (periodMoods.reduce((s, m) => s + (MOODS.find(x => x.id === m.mood)?.score || 5), 0) / periodMoods.length).toFixed(1)
    : 'N/A';

  const stressedDays = periodMoods.filter(m => ['stressed', 'anxious', 'angry'].includes(m.mood)).length;

  const generateReport = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
  };

  const printReport = () => window.print();

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">📋 AI Health Reports</h1>
          <p className="page-subtitle">Comprehensive AI-generated reports combining skin, mood, and environmental data.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="tabs">
            <button className={`tab${reportType === 'weekly' ? ' active' : ''}`} onClick={() => { setReportType('weekly'); setGenerated(false); }}>Weekly</button>
            <button className={`tab${reportType === 'monthly' ? ' active' : ''}`} onClick={() => { setReportType('monthly'); setGenerated(false); }}>Monthly</button>
          </div>
        </div>
      </div>

      {!generated ? (
        /* Generate Report CTA */
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="card card-lg" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,217,166,0.08),rgba(124,58,237,0.08))', borderColor: 'rgba(0,217,166,0.2)' }}>
            <div style={{ fontSize: 72, marginBottom: 24, animation: 'float 4s ease-in-out infinite' }}>📊</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Generate Your {reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
              AI will analyze your data from <strong>{formatDate(periodStart.toISOString())}</strong> to <strong>{formatDate(now.toISOString())}</strong>
            </p>

            {/* Summary of available data */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, margin: '28px 0', textAlign: 'center' }}>
              {[
                { icon: '🔬', value: periodDiagnoses.length, label: 'Diagnoses', color: 'var(--accent-teal)' },
                { icon: '💭', value: periodMoods.length, label: 'Mood Logs', color: 'var(--accent-purple-light)' },
                { icon: '📷', value: periodPhotos.length, label: 'Photos', color: 'var(--accent-amber)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: 24 }}>
              <span>🤖</span>
              <div>AI will correlate your skin conditions, mood patterns, UV exposure, and environmental data to generate personalized insights and recommendations.</div>
            </div>

            <button className="btn btn-primary btn-xl" onClick={generateReport} disabled={generating} style={{ minWidth: 240, boxShadow: '0 12px 50px rgba(0,217,166,0.3)' }}>
              {generating ? <><span className="spinner spinner-sm" /> Generating AI Report...</> : '🚀 Generate Report'}
            </button>
          </div>
        </div>
      ) : (
        /* Generated Report */
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="animate-fade-in">
          {/* Report Header */}
          <div className="report-header" style={{ marginBottom: 24 }}>
            <div className="report-meta">SkinVeda.ai · AI Health Report · Generated {formatDate(now.toISOString())}</div>
            <div className="report-title">{reportType === 'weekly' ? 'Weekly' : 'Monthly'} Skin & Wellness Report</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{periodLabel} · {formatDate(periodStart.toISOString())} — {formatDate(now.toISOString())}</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', borderColor: 'transparent', color: '#fff' }} onClick={printReport}>🖨 Print</button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid-4 animate-fade-in" style={{ marginBottom: 24 }}>
            {[
              { icon: '🔬', label: 'Diagnoses', value: periodDiagnoses.length, color: 'var(--accent-teal)', sub: periodDiagnoses[0]?.disease || 'None this period' },
              { icon: '💭', label: 'Avg Mood', value: avgMoodScore, color: 'var(--accent-purple-light)', sub: `${stressedDays} high-stress days` },
              { icon: '📷', label: 'Photos', value: periodPhotos.length, color: 'var(--accent-amber)', sub: `${periodPhotos.filter(p => p.aiComparison?.trend === 'improving').length} improving` },
              { icon: '🌍', label: 'Avg UV', value: ENV_DATA.current.uvIndex, color: 'var(--accent-rose)', sub: 'High UV exposure week' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: 22 }}>{s.icon}</div>
                <div className="stat-content">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
                  <div className="stat-change neutral" style={{ fontSize: 11 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights Section */}
          <div className="card animate-slide-up" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>🧠 AI-Generated Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} className={`alert alert-${ins.type}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="alert-icon">{ins.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{ins.title}</div>
                    <div style={{ opacity: 0.85, fontSize: 13 }}>{ins.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis Summary */}
          {diagnoses.length > 0 && (
            <div className="card animate-slide-up" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>🔬 Diagnosis Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {diagnoses.slice(0, 5).map((d, i) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 20 }}>🔬</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{d.disease}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.bodyRegion} · Confidence: {Math.round(d.confidence * 100)}%</div>
                    </div>
                    <span className={`badge badge-${d.risk === 'low' ? 'green' : 'amber'}`}>{d.risk}</span>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(d.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="card animate-slide-up" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>✅ AI Recommendations for Next Week</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
              {[
                { icon: '🧘', title: 'Stress Management', desc: 'Practice daily breathing exercises or meditation to reduce cortisol and prevent stress-induced flares.' },
                { icon: '☀️', title: 'UV Protection', desc: 'Apply SPF 50+ sunscreen daily. UV Index is forecasted high this week. Especially important for vitiligo.' },
                { icon: '💧', title: 'Hydration', desc: 'Drink 2.5L+ water daily. Low humidity conditions require extra skin moisturization — apply emollient twice daily.' },
                { icon: '🥗', title: 'Anti-Inflammatory Diet', desc: 'Focus on omega-3 rich foods, avoid processed sugars and dairy which may trigger inflammatory responses.' },
              ].map((r, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(0,217,166,0.04)', border: '1px solid rgba(0,217,166,0.15)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{r.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-text">
            ⚠️ <strong>Medical Disclaimer:</strong> This report is generated by AI for informational and monitoring purposes only. It does not constitute medical advice or replace professional dermatological consultation. Always consult a qualified healthcare provider for diagnosis and treatment decisions.
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setGenerated(false)}>← Generate New Report</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={printReport}>📄 Print / Export PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
