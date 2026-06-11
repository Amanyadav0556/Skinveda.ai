import { useState, useRef } from 'react';
import { useApp } from '../App';
import { formatDate, timeAgo } from '../data/mockData';

const BODY_REGIONS = ['Face', 'Neck', 'Forearm', 'Inner elbow', 'Back of knee', 'Chest', 'Back', 'Scalp', 'Hand', 'Leg'];

export default function Progress() {
  const { progressPhotos, addProgressPhoto, showToast } = useApp();
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [bodyRegion, setBodyRegion] = useState('Forearm');
  const [notes, setNotes] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePos, setComparePos] = useState(50);
  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const fileRef = useRef();

  const weekNum = Math.ceil((new Date().getDay() + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7);

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImages(prev => [...prev, { url: ev.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) { showToast('Please select at least one image', 'error'); return; }
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    const aiChange = (Math.random() * 20 - 5).toFixed(1);
    const trend = parseFloat(aiChange) > 0 ? 'improving' : parseFloat(aiChange) < -3 ? 'worsening' : 'stable';
    selectedImages.forEach(img => {
      addProgressPhoto({
        imageData: img.url,
        bodyRegion,
        notes,
        weekNumber: weekNum,
        year: new Date().getFullYear(),
        aiComparison: { changePct: parseFloat(aiChange), trend },
      });
    });
    showToast(`${selectedImages.length} photo(s) uploaded! AI analysis complete.`, 'success');
    setSelectedImages([]);
    setNotes('');
    setUploading(false);
    setActiveTab('gallery');
  };

  const handleMouseMove = (e) => {
    if (!compareMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setComparePos(Math.max(10, Math.min(90, x)));
  };

  const getTrendColor = (trend) => ({ improving: '#22c55e', stable: '#f59e0b', worsening: '#ef4444' })[trend] || '#94a3b8';
  const getTrendIcon = (trend) => ({ improving: '📈', stable: '➡️', worsening: '📉' })[trend] || '—';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📊 Weekly Progress Tracker</h1>
        <p className="page-subtitle">Upload weekly skin photos for AI-powered before/after comparison and trend analysis.</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {[
          { id: 'upload', label: '📤 Upload Photo' },
          { id: 'gallery', label: `🖼️ Gallery (${progressPhotos.length})` },
          { id: 'compare', label: '🔄 Before/After' },
        ].map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="card card-lg animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Week {weekNum} · {new Date().getFullYear()}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(new Date().toISOString())}</div>
              </div>
              <span className="badge badge-teal">📸 Week {weekNum}</span>
            </div>

            {/* Drop Zone */}
            {selectedImages.length === 0 ? (
              <div className="upload-area" onClick={() => fileRef.current.click()}>
                <div className="upload-icon">📷</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload Weekly Skin Photos</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Take photos in consistent lighting for accurate AI comparison</div>
                <button className="btn btn-primary">Choose Photos</button>
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>📝 Tips: Same lighting, same angle, same distance each week</div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                  {selectedImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img.url} alt="Progress" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                      <button onClick={() => setSelectedImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current.click()} style={{ height: 120, borderRadius: 10, border: '2px dashed rgba(255,255,255,0.12)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, transition: 'all 0.2s' }}>+</button>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
                </div>
              </div>
            )}

            {/* Body Region */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Body Region</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {BODY_REGIONS.map(r => (
                  <button key={r} type="button" onClick={() => setBodyRegion(r)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${bodyRegion === r ? 'rgba(0,217,166,0.5)' : 'var(--border)'}`, background: bodyRegion === r ? 'rgba(0,217,166,0.1)' : 'transparent', color: bodyRegion === r ? 'var(--accent-teal)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input form-textarea" placeholder="Any changes noticed, treatments applied, triggers this week..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleUpload} disabled={uploading || selectedImages.length === 0}>
              {uploading ? <><span className="spinner spinner-sm" /> Uploading & Analyzing...</> : `📤 Upload ${selectedImages.length > 0 ? selectedImages.length + ' Photo(s)' : ''}`}
            </button>

            {/* AI Note */}
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              <span>🤖</span>
              <div style={{ fontSize: 12 }}>AI will compare this week's photos with previous uploads to detect changes, track progress, and generate insights. Results appear in your gallery within seconds.</div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div>
          {progressPhotos.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">📷</div><div className="empty-state-title">No photos uploaded yet</div><div className="empty-state-text">Upload your first weekly progress photo to start tracking your skin improvements over time.</div><button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>Upload First Photo →</button></div></div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid-3 animate-fade-in" style={{ marginBottom: 24 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent-teal)' }}>{progressPhotos.length}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Total Photos</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#22c55e' }}>
                    {progressPhotos.filter(p => p.aiComparison?.trend === 'improving').length}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Improving Weeks</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent-purple-light)' }}>
                    Week {progressPhotos[0]?.weekNumber || weekNum}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Latest Upload</div>
                </div>
              </div>

              {/* Photo Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                {progressPhotos.map((photo, i) => (
                  <div key={photo.id} className="card card-sm animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, padding: 0, overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={photo.imageData} alt="Progress" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <span className="badge badge-teal" style={{ fontSize: 10, backdropFilter: 'blur(8px)' }}>Week {photo.weekNumber}</span>
                      </div>
                      {photo.aiComparison && (
                        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                          <span style={{ background: 'rgba(0,0,0,0.75)', color: getTrendColor(photo.aiComparison.trend), fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
                            {getTrendIcon(photo.aiComparison.trend)} {photo.aiComparison.changePct > 0 ? '+' : ''}{photo.aiComparison.changePct}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>📍 {photo.bodyRegion}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(photo.timestamp)}</span>
                      </div>
                      {photo.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>{photo.notes}</p>}
                      {photo.aiComparison && (
                        <div style={{ fontSize: 12, color: getTrendColor(photo.aiComparison.trend), fontWeight: 700 }}>
                          {getTrendIcon(photo.aiComparison.trend)} AI: {photo.aiComparison.trend.charAt(0).toUpperCase() + photo.aiComparison.trend.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <div>
          {progressPhotos.length < 2 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">🔄</div><div className="empty-state-title">Need at least 2 photos</div><div className="empty-state-text">Upload photos from at least 2 different weeks to use the before/after comparison slider.</div><button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>Upload Photos →</button></div></div>
          ) : (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {/* Photo Selectors */}
              <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Before Photo</label>
                  <select className="form-select" onChange={e => setImg1(progressPhotos[parseInt(e.target.value)])}>
                    <option value="">Select photo</option>
                    {progressPhotos.map((p, i) => <option key={p.id} value={i}>Week {p.weekNumber} · {p.bodyRegion} · {timeAgo(p.timestamp)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">After Photo</label>
                  <select className="form-select" onChange={e => setImg2(progressPhotos[parseInt(e.target.value)])}>
                    <option value="">Select photo</option>
                    {progressPhotos.map((p, i) => <option key={p.id} value={i}>Week {p.weekNumber} · {p.bodyRegion} · {timeAgo(p.timestamp)}</option>)}
                  </select>
                </div>
              </div>

              {/* Comparison Slider */}
              {img1 && img2 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div onMouseMove={handleMouseMove} style={{ position: 'relative', height: 400, cursor: 'col-resize', userSelect: 'none', overflow: 'hidden' }}>
                    {/* Before */}
                    <img src={img1.imageData} alt="Before" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* After (clipped) */}
                    <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${comparePos}%)` }}>
                      <img src={img2.imageData} alt="After" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {/* Divider */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${comparePos}%`, width: 3, background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', fontSize: 16, color: '#333' }}>⇔</div>
                    </div>
                    {/* Labels */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(8px)' }}>BEFORE · Week {img1.weekNumber}</div>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(8px)' }}>AFTER · Week {img2.weekNumber}</div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>← Drag to compare →</div>
                    {img2.aiComparison && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: img2.aiComparison.trend === 'improving' ? '#22c55e' : '#ef4444' }}>
                        {getTrendIcon(img2.aiComparison.trend)} AI Analysis: {img2.aiComparison.trend}
                        {img2.aiComparison.changePct ? ` (${img2.aiComparison.changePct > 0 ? '+' : ''}${img2.aiComparison.changePct}%)` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
                  <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Select a Before and After photo above to see the comparison</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
