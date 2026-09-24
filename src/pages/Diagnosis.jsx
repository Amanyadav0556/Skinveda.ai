import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { simulateAIDiagnosis } from '../data/mockData';
import { Icon, ScoreRing, Meter, PageHeader, Segmented, Disclaimer } from '../components/ui';
import { enrichDiagnosis, scoreLabel, severityOf, METRIC_LABELS } from '../lib/skin';
import { compressFile, compressImage } from '../lib/image';

const BODY_REGIONS = ['Face', 'Neck', 'Scalp', 'Chest', 'Back', 'Forearm', 'Inner elbow', 'Back of knee', 'Hand', 'Leg', 'Ankle', 'Other'];

const PIPELINE = [
  { label: 'Loading image into AI pipeline', p: 15, t: 400 },
  { label: 'Normalising light and colour', p: 35, t: 700 },
  { label: 'Running DINOv2 vision transformer', p: 60, t: 900 },
  { label: 'Scoring 40+ skin markers', p: 80, t: 600 },
  { label: 'Compiling report & recommendations', p: 95, t: 500 },
];

const TIPS = [
  { icon: 'sun',    title: 'Use natural, even light', text: 'Face a window. Avoid harsh overhead or coloured light.' },
  { icon: 'target', title: 'Fill the frame', text: 'Keep the area in focus, 15–30 cm from the camera.' },
  { icon: 'drop',   title: 'Bare skin works best', text: 'Remove makeup and wait 15 minutes after cleansing.' },
];

const DETECTS = ['Eczema', 'Psoriasis', 'Acne', 'Vitiligo', 'Dermatitis', 'Hydration', 'Texture', 'Tone'];

const sevPill = s => ({ high: 'pill-bad', moderate: 'pill-warn', low: 'pill-good' })[s];

export default function Diagnosis() {
  const { addDiagnosis, showToast, openResult, navigate } = useApp();
  const [mode, setMode] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const [image, setImage] = useState(null);
  const [bodyRegion, setBodyRegion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [camOn, setCamOn] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();
  const streamRef = useRef(null);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload a valid image file', 'error'); return; }
    if (file.size > 20 * 1024 * 1024) { showToast('Image must be under 20 MB', 'error'); return; }
    setResult(null);
    try {
      setImage(await compressFile(file));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch { showToast('Camera access was blocked. Upload a photo instead.', 'error'); setMode('upload'); }
  };

  const switchMode = m => {
    setMode(m);
    if (m === 'camera') { setImage(null); setResult(null); startCam(); } else stopCam();
  };

  const capture = async () => {
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    setImage(await compressImage(canvas.toDataURL('image/jpeg', 0.92)));
    stopCam(); setMode('upload');
    showToast('Photo captured', 'success');
  };

  const analyze = async () => {
    if (!image) { showToast('Add a photo first', 'error'); return; }
    setAnalyzing(true); setResult(null); setProgress(0);
    for (let i = 0; i < PIPELINE.length; i++) {
      setStepIdx(i);
      await new Promise(r => setTimeout(r, PIPELINE[i].t));
      setProgress(PIPELINE[i].p);
    }
    try {
      const res = await simulateAIDiagnosis(image);
      setProgress(100); setStepIdx(PIPELINE.length);
      res.bodyRegion = bodyRegion || res.bodyRegion;
      res.imageData = image;
      const saved = await addDiagnosis(enrichDiagnosis(res));
      setResult(saved);
      showToast(saved.unsynced ? 'Analysis complete — not saved to your account yet' : 'Analysis complete', saved.unsynced ? 'warning' : 'success');
    } catch { showToast('Analysis failed. Please try again.', 'error'); }
    setAnalyzing(false);
  };

  const reset = () => { setImage(null); setResult(null); setProgress(0); setStepIdx(-1); setBodyRegion(''); };

  return (
    <>
      <PageHeader
        eyebrow="AI skin analysis"
        title={<>Scan your skin in <em>seconds</em></>}
        subtitle="Upload or capture a clear photo. Our vision model screens for five common conditions and scores hydration, texture, tone and more."
        actions={<Segmented value={mode} onChange={switchMode}
          options={[{ value: 'upload', label: 'Upload', icon: 'upload' }, { value: 'camera', label: 'Camera', icon: 'camera' }]} />}
      />

      <div className="scan-layout">
        {/* Left: capture */}
        <div className="stack">
          {mode === 'camera' && !image ? (
            <div className="scan-stage">
              <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
              <div className="scan-stage-overlay"><div className="scan-corners"><span /><span /><span /><span /></div></div>
              {!camOn && <div className="report-photo-empty"><span className="spinner" /></div>}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-light btn-lg" onClick={capture} disabled={!camOn}><Icon name="camera" size={18} /> Capture</button>
              </div>
            </div>
          ) : !image ? (
            <div className={`dropzone${dragOver ? ' drag' : ''}`} role="button" tabIndex={0}
              onClick={() => fileRef.current.click()}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
              <span className="dropzone-icon"><Icon name="upload" size={30} /></span>
              <h3>Drop a skin photo here</h3>
              <p>or <span className="accent" style={{ fontWeight: 700 }}>browse files</span> — JPG, PNG or WEBP up to 20 MB</p>
              <div className="chip-row">
                {['Face', 'Body', 'Close-up'].map(t => <span key={t} className="pill">{t}</span>)}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="scan-stage">
              <img src={image} alt="Selected skin area" />
              <div className="scan-stage-overlay">
                {analyzing && <><div className="scan-grid" /><div className="scan-beam" /></>}
                <div className="scan-corners"><span /><span /><span /><span /></div>
                <span className="scan-stage-tag">
                  {analyzing ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Analysing · {progress}%</>
                    : result ? <><Icon name="check" size={13} stroke={2.6} /> Analysis complete</>
                    : <><Icon name="image" size={13} /> Ready to analyse</>}
                </span>
                {!analyzing && (
                  <div className="scan-stage-actions">
                    <button className="icon-btn" onClick={reset} title="Remove photo" aria-label="Remove photo"><Icon name="x" size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {image && !result && (
            <div className="card">
              <div className="field">
                <span className="label">Where is this photo from? <small>optional</small></span>
                <div className="chip-row">
                  {BODY_REGIONS.map(r => (
                    <button key={r} type="button" className={`tag-chip${bodyRegion === r ? ' active' : ''}`}
                      onClick={() => setBodyRegion(b => (b === r ? '' : r))} disabled={analyzing}>{r}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-dark btn-lg btn-block mt-24" onClick={analyze} disabled={analyzing}>
                {analyzing ? <><span className="spinner" /> Analysing your skin…</> : <><Icon name="scan" size={18} /> Analyse skin</>}
              </button>
            </div>
          )}

          <Disclaimer />
        </div>

        {/* Right: guidance → progress → results */}
        <div className="stack">
          {analyzing || (stepIdx >= 0 && !result) ? (
            <div className="card">
              <div className="card-head">
                <div><h3>Analysing</h3><p className="card-sub">This usually takes about 3 seconds</p></div>
                <span className="mono">{progress}%</span>
              </div>
              <Meter value={progress} />
              <ol className="pipeline mt-16">
                {PIPELINE.map((s, i) => (
                  <li key={s.label} className={i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}>
                    <span className="pipeline-dot"><Icon name="check" size={12} stroke={2.8} /></span>{s.label}
                  </li>
                ))}
              </ol>
            </div>
          ) : result ? (
            <>
              <div className="card card-tint">
                <div className="row" style={{ gap: 18 }}>
                  <ScoreRing value={result.skinScore} size={96} stroke={9} />
                  <div>
                    <span className="mono muted">Skin score</span>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em' }}>{scoreLabel(result.skinScore)}</div>
                    <p className="ink2" style={{ fontSize: 13.5 }}>{result.bodyRegion} · {result.modelVersion}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3>Detected concerns</h3><span className="mono">Confidence</span></div>
                <div className="stack" style={{ gap: 10 }}>
                  {result.concerns.map(c => {
                    const sev = severityOf(c.confidence);
                    return (
                      <div key={c.name} className={`concern-card${c.primary ? ' primary' : ''}`}>
                        <div className="concern-card-head">
                          <div><strong>{c.name}</strong><small>{c.primary ? 'Primary finding' : 'Secondary sign'} · {c.area}</small></div>
                          <span className={`pill ${sevPill(sev)}`}>{sev === 'high' ? 'Likely' : sev === 'moderate' ? 'Possible' : 'Mild'}</span>
                        </div>
                        <div className="concern-conf">
                          <Meter value={c.confidence * 100} tone={c.primary ? 'emerald' : 'sage'} thin />
                          <b>{Math.round(c.confidence * 100)}%</b>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3>Key metrics</h3></div>
                <ul className="metric-list">
                  {Object.entries(METRIC_LABELS).slice(0, 4).map(([k, l]) => (
                    <li key={k}><div><span>{l}</span><b>{result.metrics[k]}</b></div><Meter value={result.metrics[k]} tone={result.metrics[k] < 60 ? 'clay' : 'emerald'} thin /></li>
                  ))}
                </ul>
              </div>

              <div className="grid g-2">
                <button className="btn btn-dark btn-lg" onClick={() => openResult(result.id)}>Full report <Icon name="arrow" size={18} /></button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('recommendations')}><Icon name="spark" size={18} /> My plan</button>
              </div>
              <button className="btn-text" style={{ justifySelf: 'center', fontSize: 13.5 }} onClick={reset}>Start a new scan</button>
            </>
          ) : (
            <>
              <div className="card">
                <div className="card-head"><h3>For the best results</h3></div>
                <ul className="tips-list">
                  {TIPS.map(t => (
                    <li key={t.title}><span><Icon name={t.icon} size={16} /></span><div><strong>{t.title}</strong>{t.text}</div></li>
                  ))}
                </ul>
              </div>
              <div className="card card-tint">
                <div className="card-head"><h3>What we analyse</h3><span className="pill pill-mono pill-emerald">40+ markers</span></div>
                <div className="chip-row">
                  {DETECTS.map(d => <span key={d} className="pill">{d}</span>)}
                </div>
                <ul className="rows soft mt-16">
                  <li><span>Model</span><b>DINOv2 ViT · v2.1</b></li>
                  <li><span>Average time</span><b>3.2 s</b></li>
                  <li><span>Your photo</span><b>Encrypted · private</b></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
