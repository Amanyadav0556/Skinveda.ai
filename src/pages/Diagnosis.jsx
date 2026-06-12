import { useState, useRef } from 'react';
import { useApp } from '../App';
import { simulateAIDiagnosis, formatDate, timeAgo } from '../data/mockData';

const BODY_REGIONS = ['Face', 'Neck', 'Scalp', 'Chest', 'Back', 'Forearm', 'Inner elbow', 'Back of knee', 'Hand', 'Leg', 'Ankle', 'Other'];

const getRiskBadge = (risk) => ({ low: 'badge-green', moderate: 'badge-amber', high: 'badge-rose', severe: 'badge-red' })[risk] || 'badge-gray';

export default function Diagnosis() {
  const { addDiagnosis, diagnoses, showToast } = useApp();
  const [historyTab, setHistoryTab] = useState('analyze');
  const [activeTab, setActiveTab]   = useState('upload');
  const [dragOver, setDragOver]     = useState(false);
  const [image, setImage]           = useState(null);
  const [bodyRegion, setBodyRegion] = useState('');
  const [analyzing, setAnalyzing]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult]         = useState(null);
  const [webcamOn, setWebcamOn]     = useState(false);
  const fileRef  = useRef();
  const videoRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload a valid image file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => setImage(e.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const startAnalysis = async () => {
    if (!image) { showToast('Please upload an image first', 'error'); return; }
    setAnalyzing(true); setProgress(0); setResult(null);
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
      setProgress(100); setProgressLabel('Analysis complete!');
      await new Promise(r => setTimeout(r, 300));
      res.bodyRegion = bodyRegion || res.bodyRegion;
      res.imageData  = image;
      addDiagnosis(res); setResult(res);
      showToast(`Diagnosis complete: ${res.disease} detected`, 'success');
    } catch { showToast('Analysis failed. Please try again.', 'error'); }
    setAnalyzing(false);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream; setWebcamOn(true);
    } catch { showToast('Webcam access denied', 'error'); }
  };

  const captureFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setImage(canvas.toDataURL('image/jpeg'));
    setActiveTab('upload');
    videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
    setWebcamOn(false);
    showToast('Image captured!', 'success');
  };

  const reset = () => { setImage(null); setResult(null); setProgress(0); setBodyRegion(''); };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">🔬 AI Skin Diagnosis</h1>
          <p className="page-subtitle">Upload or capture a skin image. DINOv2 AI analyzes eczema, psoriasis, vitiligo, acne & dermatitis.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn ${historyTab==='analyze'?'btn-primary':'btn-secondary'}`} onClick={() => setHistoryTab('analyze')}>🔬 Analyze</button>
          <button className={`btn ${historyTab==='history'?'btn-primary':'btn-secondary'}`} onClick={() => setHistoryTab('history')}>📋 History ({diagnoses.length})</button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-warning" style={{ marginBottom:16 }}>
        <span className="alert-icon">⚠️</span>
        <div><strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified dermatologist.</div>
      </div>

      {historyTab === 'analyze' ? (
        <div style={{ display:'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap:16 }}>

          {/* Upload Panel */}
          <div>
            <div className="tabs" style={{ marginBottom:14 }}>
              <button className={`tab${activeTab==='upload'?' active':''}`} onClick={() => setActiveTab('upload')}>📁 Upload Image</button>
              <button className={`tab${activeTab==='webcam'?' active':''}`} onClick={() => { setActiveTab('webcam'); startWebcam(); }}>📷 Webcam</button>
            </div>

            {activeTab === 'upload' && (
              <div>
                {!image ? (
                  <div
                    className={`upload-area${dragOver?' dragging':''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  >
                    <div style={{ width:70, height:70, borderRadius:20, background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.08))', border:'1.5px dashed rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>🖼️</div>
                    <div style={{ fontSize:16, fontWeight:700, marginBottom:7, color:'#111827' }}>Drop your skin image here</div>
                    <div style={{ fontSize:13, color:'#6B7280', marginBottom:16 }}>or click to browse files</div>
                    <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap' }}>
                      {['JPG', 'PNG', 'WEBP', 'HEIC'].map(f => <span key={f} className="badge badge-purple">{f}</span>)}
                    </div>
                    <div style={{ fontSize:11, color:'#9CA3AF', marginTop:12 }}>Max 10MB · Clear, well-lit photos recommended</div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div className="card" style={{ padding:0, overflow:'hidden' }}>
                    <div style={{ position:'relative' }}>
                      <img src={image} alt="Skin" style={{ width:'100%', height:240, objectFit:'cover', display:'block' }} />
                      <div style={{ position:'absolute', top:10, right:10 }}>
                        <span className="badge badge-green" style={{ fontSize:11 }}>✓ Image Ready</span>
                      </div>
                    </div>
                    <div style={{ padding:16 }}>
                      <div className="form-group" style={{ marginBottom:14 }}>
                        <label className="form-label">Body Region (optional)</label>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {BODY_REGIONS.map(r => (
                            <button key={r} type="button" onClick={() => setBodyRegion(r)} style={{
                              padding:'4px 11px', borderRadius:20, cursor:'pointer', fontSize:11, fontWeight:600, transition:'all 0.2s',
                              border:`1.5px solid ${bodyRegion===r?'rgba(139,92,246,0.45)':'rgba(139,92,246,0.15)'}`,
                              background: bodyRegion===r?'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.06))':'#fff',
                              color: bodyRegion===r?'#7C3AED':'#6B7280',
                            }}>{r}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:9 }}>
                        <button className="btn btn-secondary btn-sm" onClick={reset}>↩ Change</button>
                        <button className="btn btn-primary" style={{ flex:1 }} onClick={startAnalysis} disabled={analyzing}>
                          {analyzing ? <><span className="spinner spinner-sm" /> Analyzing...</> : '🚀 Analyze with AI'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'webcam' && (
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width:'100%', height:240, objectFit:'cover', background:'#0f0f0f', display:'block' }} />
                <div style={{ padding:16, display:'flex', gap:10 }}>
                  <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t => t.stop()); setActiveTab('upload'); setWebcamOn(false); }}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex:2 }} onClick={captureFrame} disabled={!webcamOn}>📸 Capture & Analyze</button>
                </div>
              </div>
            )}

            {/* Analysis Progress */}
            {analyzing && (
              <div className="card" style={{ marginTop:14 }}>
                <div style={{ textAlign:'center', padding:'16px 0' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <div className="spinner" />
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:6, color:'#111827' }}>🧠 DINOv2 AI Analyzing...</div>
                  <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:14 }}>{progressLabel}</div>
                  <div className="progress-bar" style={{ height:7 }}>
                    <div className="progress-fill" style={{ width:`${progress}%` }} />
                  </div>
                  <div style={{ fontSize:12, color:'#8B5CF6', marginTop:7, fontWeight:700 }}>{progress}%</div>
                </div>
                <div style={{ borderTop:'1px solid rgba(139,92,246,0.1)', paddingTop:14, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {['Image Preprocessing', 'ViT Inference', 'Disease Classification'].map((s, i) => (
                    <div key={i} style={{ textAlign:'center', fontSize:11, color: progress>(i+1)*30?'#8B5CF6':'#9CA3AF' }}>
                      <div style={{ fontSize:18, marginBottom:3 }}>{progress>(i+1)*30?'✅':'⏳'}</div>
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
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>✅ Analysis Complete</div>
                    <h2 style={{ fontSize:22, fontWeight:900, marginBottom:3, color:'#111827' }}>{result.disease}</h2>
                    <div style={{ fontSize:11, color:'#9CA3AF' }}>Model: {result.modelVersion} · ID: {result.analysisId}</div>
                  </div>
                  <span className={`badge ${getRiskBadge(result.risk)}`} style={{ fontSize:11 }}>{result.risk?.toUpperCase()} RISK</span>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom:16, padding:'14px 16px', background:'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(236,72,153,0.04))', border:'1px solid rgba(139,92,246,0.15)', borderRadius:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#6B7280' }}>AI Confidence Score</span>
                    <span style={{ fontSize:18, fontWeight:900, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{Math.round(result.confidence*100)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height:8 }}>
                    <div className="progress-fill" style={{ width:`${result.confidence*100}%` }} />
                  </div>
                </div>

                {/* Body Region */}
                {result.bodyRegion && (
                  <div style={{ marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span className="badge badge-blue">📍 {result.bodyRegion}</span>
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>About This Condition</div>
                  <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.7 }}>{result.description}</p>
                </div>

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:9 }}>🩺 AI Recommendations</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {result.recommendations.map((r, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:12, color:'#6B7280', background:'rgba(139,92,246,0.04)', borderRadius:8, padding:'7px 10px', border:'1px solid rgba(139,92,246,0.08)' }}>
                          <span style={{ color:'#8B5CF6', fontWeight:700, flexShrink:0 }}>✓</span>{r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Triggers */}
                {result.triggers?.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>⚡ Known Triggers</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {result.triggers.map(t => <span key={t} className="badge badge-amber">{t}</span>)}
                    </div>
                  </div>
                )}

                <div className="alert alert-warning" style={{ marginBottom:14 }}>
                  <span>⚠️</span>
                  <div style={{ fontSize:11 }}>For informational use only. Please consult a qualified dermatologist for proper diagnosis and treatment.</div>
                </div>

                <div style={{ display:'flex', gap:9 }}>
                  <button className="btn btn-secondary" style={{ flex:1 }} onClick={reset}>New Analysis</button>
                  <button className="btn btn-primary" style={{ flex:1 }}>📋 Save Report</button>
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
            <div style={{ display:'grid', gap:12 }}>
              {diagnoses.map((d, i) => (
                <div key={d.id} className="card animate-fade-in" style={{ animationDelay:`${i*0.05}s` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                    {d.imageData && <img src={d.imageData} alt="Skin" style={{ width:70, height:70, borderRadius:12, objectFit:'cover', flexShrink:0, border:'2px solid rgba(139,92,246,0.15)' }} />}
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:6 }}>
                        <span style={{ fontSize:15, fontWeight:800, color:'#111827' }}>{d.disease}</span>
                        <span className={`badge ${getRiskBadge(d.risk)}`}>{d.risk}</span>
                      </div>
                      <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:6 }}>
                        📍 {d.bodyRegion||'Unknown'} · Confidence: {Math.round(d.confidence*100)}% · {formatDate(d.timestamp)}
                      </div>
                      {d.recommendations?.length > 0 && (
                        <div style={{ fontSize:11, color:'#6B7280' }}>✓ {d.recommendations[0]}</div>
                      )}
                    </div>
                    <div style={{ fontSize:20, fontWeight:900, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', flexShrink:0 }}>
                      {Math.round(d.confidence*100)}%
                    </div>
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
