import { useState, useRef } from 'react';
import { useApp } from '../App';
import { simulateAIDiagnosis, DISEASES, timeAgo, formatDate } from '../data/mockData';

const BODY_REGIONS = ['Face', 'Neck', 'Scalp', 'Chest', 'Back', 'Forearm', 'Inner elbow', 'Back of knee', 'Hand', 'Leg', 'Ankle', 'Other'];

export default function Diagnosis() {
  const { addDiagnosis, diagnoses, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('upload');
  const [historyTab, setHistoryTab] = useState('analyze');
  const [dragOver, setDragOver] = useState(false);
  const [image, setImage] = useState(null);
  const [bodyRegion, setBodyRegion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [progressLabel, setProgressLabel] = useState('');
  const fileRef = useRef();
  const videoRef = useRef();
  const [webcamOn, setWebcamOn] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload a valid image file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => setImage(e.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const startAnalysis = async () => {
    if (!image) { showToast('Please upload an image first', 'error'); return; }
    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    const steps = [
      { label: 'Loading image into AI pipeline...', p: 15, t: 400 },
      { label: 'Preprocessing & normalizing...', p: 35, t: 700 },
      { label: 'Running DINOv2 Vision Transformer...', p: 60, t: 900 },
      { label: 'Generating classification scores...', p: 80, t: 600 },
      { label: 'Compiling report & recommendations...', p: 95, t: 500 },
    ];

    for (const step of steps) {
      setProgressLabel(step.label);
      await new Promise(r => setTimeout(r, step.t));
      setProgress(step.p);
    }

    try {
      const res = await simulateAIDiagnosis(image);
      setProgress(100);
      setProgressLabel('Analysis complete!');
      await new Promise(r => setTimeout(r, 300));
      res.bodyRegion = bodyRegion || res.bodyRegion;
      res.imageData = image;
      addDiagnosis(res);
      setResult(res);
      showToast(`Diagnosis complete: ${res.disease} detected`, 'success');
    } catch {
      showToast('Analysis failed. Please try again.', 'error');
    }
    setAnalyzing(false);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setWebcamOn(true);
    } catch {
      showToast('Webcam access denied', 'error');
    }
  };

  const captureFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
    setActiveTab('upload');
    videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
    setWebcamOn(false);
    showToast('Image captured!', 'success');
  };

  const reset = () => { setImage(null); setResult(null); setProgress(0); setBodyRegion(''); };

  const getRiskColor = (risk) => ({ low: '#22c55e', moderate: '#f59e0b', high: '#f97316', severe: '#ef4444' })[risk] || '#94a3b8';
  const getRiskBadge = (risk) => ({ low: 'badge-green', moderate: 'badge-amber', high: 'badge-rose', severe: 'badge-red' })[risk] || 'badge-gray';

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🔬 AI Skin Diagnosis</h1>
          <p className="page-subtitle">Upload or capture a skin image. DINOv2 AI analyzes eczema, psoriasis, vitiligo, acne & dermatitis.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${historyTab === 'analyze' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHistoryTab('analyze')}>🔬 Analyze</button>
          <button className={`btn ${historyTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHistoryTab('history')}>📋 History ({diagnoses.length})</button>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="alert alert-warning" style={{ marginBottom: 24 }}>
        <span className="alert-icon">⚠️</span>
        <div><strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified dermatologist for proper medical evaluation and treatment.</div>
      </div>

      {historyTab === 'analyze' ? (
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Upload Panel */}
          <div>
            {/* Tab Switcher */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              <button className={`tab${activeTab === 'upload' ? ' active' : ''}`} onClick={() => setActiveTab('upload')}>📁 Upload Image</button>
              <button className={`tab${activeTab === 'webcam' ? ' active' : ''}`} onClick={() => { setActiveTab('webcam'); startWebcam(); }}>📷 Webcam Capture</button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                {!image ? (
                  <div
                    className={`upload-area${dragOver ? ' dragging' : ''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon">🖼️</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Drop your skin image here</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>or click to browse files</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {['JPG', 'PNG', 'WEBP', 'HEIC'].map(f => <span key={f} className="badge badge-gray">{f}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Max file size: 10MB · Clear, well-lit photos recommended</div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={image} alt="Skin" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: 20 }}>
                      <span className="badge badge-green" style={{ marginBottom: 12 }}>✓ Image Ready</span>
                      <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Body Region (optional)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {BODY_REGIONS.map(r => (
                            <button key={r} type="button" onClick={() => setBodyRegion(r)} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${bodyRegion === r ? 'rgba(0,217,166,0.5)' : 'var(--border)'}`, background: bodyRegion === r ? 'rgba(0,217,166,0.1)' : 'transparent', color: bodyRegion === r ? 'var(--accent-teal)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary btn-sm" onClick={reset}>↩ Change Image</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={startAnalysis} disabled={analyzing}>
                          {analyzing ? <><span className="spinner spinner-sm" /> Analyzing...</> : '🚀 Analyze with AI'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Webcam Tab */}
            {activeTab === 'webcam' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 280, objectFit: 'cover', background: '#000', display: 'block' }} />
                <div style={{ padding: 20, display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t => t.stop()); setActiveTab('upload'); setWebcamOn(false); }}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={captureFrame} disabled={!webcamOn}>📸 Capture & Analyze</button>
                </div>
              </div>
            )}

            {/* Analysis Progress */}
            {analyzing && (
              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto 20px' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🧠 DINOv2 AI Analyzing...</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{progressLabel}</div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--accent-teal)', marginTop: 8, fontWeight: 700 }}>{progress}%</div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {['Image Preprocessing', 'ViT Inference', 'Disease Classification'].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 12, color: progress > (i + 1) * 30 ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{progress > (i + 1) * 30 ? '✅' : '⏳'}</div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          {result && !analyzing && (
            <div className="animate-scale-in">
              <div className="diagnosis-result">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>✅ Analysis Complete</div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{result.disease}</h2>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Model: {result.modelVersion} · ID: {result.analysisId}</div>
                  </div>
                  <span className={`badge ${getRiskBadge(result.risk)}`} style={{ fontSize: 13 }}>
                    {result.risk?.toUpperCase()} RISK
                  </span>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(0,217,166,0.06)', border: '1px solid rgba(0,217,166,0.2)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>AI Confidence Score</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent-teal)' }}>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 10 }}>
                    <div className="progress-fill" style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                </div>

                {/* Body Region */}
                {result.bodyRegion && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DETECTED REGION</span>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>📍 {result.bodyRegion}</div>
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>About This Condition</div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.description}</p>
                </div>

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>🩺 AI Recommendations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.recommendations.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent-teal)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Triggers */}
                {result.triggers?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>⚡ Known Triggers</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.triggers.map(t => <span key={t} className="badge badge-amber">{t}</span>)}
                    </div>
                  </div>
                )}

                <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                  <span>⚠️</span>
                  <div style={{ fontSize: 12 }}>This AI analysis is for informational purposes only. Please consult a qualified dermatologist for proper diagnosis and treatment.</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={reset}>New Analysis</button>
                  <button className="btn btn-primary" style={{ flex: 1 }}>📋 Save Report</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div>
          {diagnoses.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🔬</div>
                <div className="empty-state-title">No diagnoses yet</div>
                <div className="empty-state-text">Your AI diagnosis history will appear here after your first analysis.</div>
                <button className="btn btn-primary" onClick={() => setHistoryTab('analyze')}>Start First Analysis →</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {diagnoses.map((d, i) => (
                <div key={d.id} className="card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    {d.imageData && <img src={d.imageData} alt="Skin" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>{d.disease}</span>
                        <span className={`badge ${d.risk === 'low' ? 'badge-green' : d.risk === 'moderate' ? 'badge-amber' : 'badge-red'}`}>{d.risk}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                        📍 {d.bodyRegion || 'Unknown'} · Confidence: {Math.round(d.confidence * 100)}% · {formatDate(d.timestamp)}
                      </div>
                      {d.recommendations?.length > 0 && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          ✓ {d.recommendations[0]}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: getRiskColor(d.risk) }}>{Math.round(d.confidence * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
