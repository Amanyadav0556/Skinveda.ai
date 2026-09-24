import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { Icon, PageHeader, Segmented, Meter } from '../components/ui';
import { SkinScoreCard, ConcernCard, EscalationNotice, NextActions, SafetyNotice } from '../components/skin';
import { analyzeSkin } from '../lib/analysis';
import { compressFile, compressImage } from '../lib/image';

const STEPS = [
  { label: 'Checking photo quality', t: 450 },
  { label: 'Finding skin areas', t: 550 },
  { label: 'Measuring tone and texture', t: 650 },
  { label: 'Estimating visible concerns', t: 600 },
  { label: 'Preparing your report', t: 450 },
];

const GUIDE = [
  { icon: 'face', title: 'Centre your face in the oval', text: 'Look straight at the camera, hair off your forehead, glasses off.' },
  { icon: 'sun', title: 'Use soft, even light', text: 'Face a window in daylight. Avoid flash, backlight and coloured bulbs.' },
  { icon: 'drop', title: 'Bare skin, no filters', text: 'Remove makeup and wait a few minutes after washing your face.' },
];

const FEEL = [
  { value: 'tight', label: 'Tight or flaky' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'tzone', label: 'Shiny T-zone' },
  { value: 'oily', label: 'Shiny all over' },
];

export default function Scan() {
  const { saveScan, openScan, navigate, showToast, scans } = useApp();
  const [mode, setMode] = useState('upload');
  const [image, setImage] = useState(null);
  const [drag, setDrag] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [answers, setAnswers] = useState({ feel: '', reactive: false, worsening: false, unusualSpot: false });
  const [phase, setPhase] = useState('idle'); // idle | analysing | done | retake
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCam = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCamOn(false); };
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const startCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { showToast('Camera is not supported in this browser — upload a photo instead.', 'warning'); setMode('upload'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch {
      showToast('Camera access was not allowed. You can upload a photo instead.', 'warning');
      setMode('upload');
    }
  };

  const switchMode = m => {
    setMode(m);
    if (m === 'camera') { setImage(null); setResult(null); setPhase('idle'); startCam(); } else stopCam();
  };

  const pickFile = async file => {
    if (!file || !file.type.startsWith('image/')) { showToast('Please choose a photo (JPG, PNG or WEBP).', 'error'); return; }
    if (file.size > 20 * 1024 * 1024) { showToast('That photo is over 20 MB — please choose a smaller one.', 'error'); return; }
    try { setImage(await compressFile(file)); setPhase('idle'); setResult(null); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const capture = async () => {
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.translate(c.width, 0); ctx.scale(-1, 1); // un-mirror the selfie preview
    ctx.drawImage(v, 0, 0);
    setImage(await compressImage(c.toDataURL('image/jpeg', 0.92)));
    stopCam(); setMode('upload');
  };

  const retake = () => { setImage(null); setResult(null); setPhase('idle'); setStepIdx(-1); if (mode === 'camera') startCam(); };

  const analyse = async () => {
    setPhase('analysing'); setResult(null);
    try {
      const run = analyzeSkin(image, answers);
      for (let i = 0; i < STEPS.length; i++) { setStepIdx(i); await new Promise(r => setTimeout(r, STEPS[i].t)); }
      const assessment = await run;
      setStepIdx(STEPS.length);
      if (!assessment.reliable) { setResult(assessment); setPhase('retake'); return; }
      const saved = await saveScan({ ...assessment, imageData: image });
      setResult(saved);
      setPhase('done');
      showToast(saved.unsynced ? 'Your skin report is ready (not saved to your account yet).' : 'Your skin report is ready.', saved.unsynced ? 'warning' : 'success');
    } catch (e) {
      setPhase('idle');
      showToast(e.message || 'Something went wrong. Please try again.', 'error');
    }
  };

  const prev = scans.find(s => s.id !== result?.id);
  const busy = phase === 'analysing';

  return (
    <>
      <PageHeader
        eyebrow="Face scan"
        title="Scan your skin"
        subtitle="Take or upload a clear, front-facing photo. You'll get an AI-assisted report of visible skin concerns in under a minute."
        actions={!busy && phase !== 'done' && (
          <Segmented value={mode} onChange={switchMode}
            options={[{ value: 'upload', label: 'Upload', icon: 'upload' }, { value: 'camera', label: 'Camera', icon: 'camera' }]} />
        )}
      />

      <div className="scan-layout">
        {/* ── Capture ── */}
        <div className="stack">
          {mode === 'camera' && !image ? (
            <div className="scan-stage">
              <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} aria-label="Camera preview" />
              <div className="scan-overlay"><div className="scan-guide" /></div>
              {!camOn && <div className="report-photo-empty" style={{ color: '#fff' }}><span className="spinner" /></div>}
              <div className="scan-cam-bar">
                <button className="btn btn-light btn-lg" onClick={capture} disabled={!camOn}><Icon name="camera" size={18} /> Take photo</button>
              </div>
            </div>
          ) : !image ? (
            <div className={`dropzone${drag ? ' drag' : ''}`} role="button" tabIndex={0} aria-label="Upload a face photo"
              onClick={() => fileRef.current.click()}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileRef.current.click())}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}>
              <span className="dropzone-icon"><Icon name="upload" size={28} /></span>
              <h3>Drop a face photo here</h3>
              <p>or <span className="accent" style={{ fontWeight: 700 }}>choose a file</span> · JPG, PNG or WEBP</p>
              <span className="t-help">A front-facing selfie in daylight works best</span>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { pickFile(e.target.files[0]); e.target.value = ''; }} />
            </div>
          ) : (
            <div className="scan-stage">
              <img src={image} alt="Your photo for analysis" />
              <div className="scan-overlay">
                {busy && <div className="scan-beam" />}
                <span className="scan-tag">
                  {busy ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Analysing…</>
                    : phase === 'done' ? <><Icon name="check" size={13} stroke={2.6} /> Report ready</>
                    : <><Icon name="image" size={13} /> Photo ready</>}
                </span>
                {!busy && (
                  <div className="scan-actions">
                    <button className="icon-btn" onClick={retake} title="Retake photo" aria-label="Retake photo"><Icon name="refresh" size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {image && phase === 'idle' && (
            <div className="card">
              <div className="card-head">
                <div><h3>A few quick questions</h3><p className="card-sub">Optional — they make your report more accurate.</p></div>
              </div>
              <div className="field">
                <span className="label">By midday, your skin usually feels…</span>
                <div className="chip-row" role="radiogroup">
                  {FEEL.map(f => (
                    <button key={f.value} type="button" role="radio" aria-checked={answers.feel === f.value}
                      className={`tag-chip${answers.feel === f.value ? ' active' : ''}`}
                      onClick={() => setAnswers(a => ({ ...a, feel: a.feel === f.value ? '' : f.value }))}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="check"><input type="checkbox" checked={answers.reactive} onChange={e => setAnswers(a => ({ ...a, reactive: e.target.checked }))} /> My skin reacts easily to new products</label>
              </div>
              <div className="field">
                <label className="check"><input type="checkbox" checked={answers.worsening} onChange={e => setAnswers(a => ({ ...a, worsening: e.target.checked }))} /> A concern has been getting worse quickly</label>
              </div>
              <div className="field">
                <label className="check"><input type="checkbox" checked={answers.unusualSpot} onChange={e => setAnswers(a => ({ ...a, unusualSpot: e.target.checked }))} /> I have a spot that is painful, bleeding or changing</label>
              </div>
              <button className="btn btn-primary btn-lg btn-block mt-24" onClick={analyse}><Icon name="scan" size={18} /> Analyse my skin</button>
            </div>
          )}

          <SafetyNotice />
        </div>

        {/* ── Guidance → progress → result ── */}
        <div className="stack" aria-live="polite">
          {busy ? (
            <div className="card">
              <div className="card-head"><div><h3>Analysing your photo</h3><p className="card-sub">This takes a few seconds</p></div></div>
              <Meter value={Math.min(100, ((stepIdx + 1) / STEPS.length) * 100)} />
              <ol className="pipeline mt-16">
                {STEPS.map((s, i) => (
                  <li key={s.label} className={i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}>
                    <span className="pipeline-dot"><Icon name="check" size={12} stroke={2.8} /></span>{s.label}
                  </li>
                ))}
              </ol>
            </div>
          ) : phase === 'retake' && result ? (
            <div className="card">
              <div className="card-head"><h3>Let's try another photo</h3></div>
              <p className="ink2">We couldn't assess this photo reliably, so we haven't saved a report.</p>
              <ul className="guide-list mt-16">
                {result.quality.map(q => <li key={q}><span><Icon name="alert" size={15} /></span><div>{q}</div></li>)}
              </ul>
              <button className="btn btn-primary btn-block mt-24" onClick={retake}><Icon name="refresh" size={17} /> Retake photo</button>
            </div>
          ) : phase === 'done' && result ? (
            <>
              <div className="card">
                <SkinScoreCard score={result.skinScore} delta={prev ? result.skinScore - prev.skinScore : null} />
                <p className="mt-16" style={{ fontSize: 15.5 }}>{result.summary}</p>
                <p className="t-help mt-8">Estimated skin type: <b>{result.skinType}</b> · {Math.round(result.confidence * 100)}% confidence</p>
              </div>
              {result.escalation?.recommended && <EscalationNotice reasons={result.escalation.reasons} onFindDoctor={() => navigate('doctors')} />}
              {result.concerns.length > 0 && (
                <div className="card">
                  <div className="card-head"><h3>Visible skin concerns detected</h3></div>
                  <div className="stack-sm">
                    {result.concerns.slice(0, 3).map((c, i) => <ConcernCard key={c.id} concern={c} primary={i === 0} explain={false} />)}
                  </div>
                </div>
              )}
              <div className="card">
                <div className="card-head"><h3>What would you like to do next?</h3></div>
                <NextActions actions={[
                  { icon: 'file', label: 'View full report', sub: 'Scores, areas, summary', primary: true, onClick: () => openScan(result.id) },
                  { icon: 'list', label: 'View my routine', sub: 'Built from this scan', onClick: () => navigate('my-skin/routine') },
                  { icon: 'bag', label: 'Explore products', sub: 'Optional suggestions', onClick: () => navigate('products') },
                  { icon: 'doctor', label: 'Talk to a dermatologist', sub: 'If you want expert advice', onClick: () => navigate('doctors') },
                  { icon: 'trend', label: 'Track progress', sub: 'Compare over time', onClick: () => navigate('progress') },
                ]} />
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <div className="card-head"><h3>For an accurate scan</h3></div>
                <ul className="guide-list">
                  {GUIDE.map(g => <li key={g.title}><span><Icon name={g.icon} size={16} /></span><div><strong>{g.title}</strong>{g.text}</div></li>)}
                </ul>
              </div>
              <div className="card">
                <div className="card-head"><h3>What we look at</h3></div>
                <div className="chip-row">
                  {['Acne-like spots', 'Pigmentation', 'Dryness', 'Oiliness', 'Redness', 'Texture', 'Dark circles', 'Fine lines'].map(c => <span key={c} className="pill">{c}</span>)}
                </div>
                <div className="privacy-note mt-16">
                  <Icon name="lock" size={16} />
                  <span>Your photo is used only for your analysis. It's stored privately in your account and you can delete it anytime from Settings.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
