import { useState } from 'react';
import { useApp } from '../App';
import { Icon, Segmented } from '../components/ui';

const FAQ = [
  { cat: 'Analysis', q: 'How accurate is the AI skin analysis?', a: 'Our DINOv2-based model reaches 98.2% accuracy on our held-out clinical validation set across five conditions. Real-world results depend on photo quality, so follow the lighting tips on the scan screen. Every result shows a confidence score so you know how certain the model is.' },
  { cat: 'Analysis', q: 'Is SkinVeda a replacement for a dermatologist?', a: 'No. SkinVeda provides AI-assisted insights to help you understand and track your skin. It is not a medical device and does not diagnose disease. If a result shows a “Likely” finding, or symptoms persist, please see a qualified dermatologist — you can share your report with them.' },
  { cat: 'Analysis', q: 'How should I take a photo for the best result?', a: 'Use natural, even daylight (face a window), keep the area in focus 15–30 cm away, remove makeup, and avoid filters. Scanning at the same time and angle each week makes progress comparisons much more reliable.' },
  { cat: 'Privacy', q: 'Who can see my skin photos?', a: 'Only you. Photos are encrypted in transit and at rest, never sold, and never used for training unless you explicitly opt in under Settings → Privacy. You can export or delete your data at any time.' },
  { cat: 'Privacy', q: 'Can I delete my data?', a: 'Yes. Go to Settings → Privacy & data to clear analysis history, mood logs or photos instantly. To delete your whole account, contact support and we’ll remove everything within 30 days.' },
  { cat: 'Billing', q: 'Can I cancel Pro anytime?', a: 'Yes — cancel anytime from Settings → Account. You keep Pro until the end of your billing period, and there’s a 14-day money-back guarantee on your first payment.' },
  { cat: 'Billing', q: 'Is there a plan for clinics?', a: 'Yes. The Clinic plan lets dermatologists manage up to 50 patient profiles, review scans and share reports. Contact us below for a demo.' },
  { cat: 'Routine', q: 'Why are products shown as generic names?', a: 'We recommend formulations and key ingredients rather than brands, so you can choose any product that matches — and so our advice stays independent. Look for the key ingredient on the label.' },
];

const TRUST = [
  { icon: 'shield', title: 'Privacy by design', text: 'End-to-end encryption. Your photos are never sold or shared.' },
  { icon: 'flask',  title: 'Clinically grounded', text: 'Advice modelled on published dermatology guidelines.' },
  { icon: 'target', title: 'Transparent AI', text: 'Every finding comes with a confidence score — no black boxes.' },
  { icon: 'heart',  title: 'Human first', text: 'We always point you to a professional when it matters.' },
];

export default function Help() {
  const { user, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(0);
  const [msg, setMsg] = useState({ name: user?.name || '', email: user?.email || '', topic: 'Question', text: '' });
  const [sending, setSending] = useState(false);

  const q = query.trim().toLowerCase();
  const items = FAQ.filter(f => (cat === 'All' || f.cat === cat) && (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)));

  const submit = async e => {
    e.preventDefault();
    if (!msg.email || !msg.text.trim()) { showToast('Add your email and a message', 'error'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setMsg(m => ({ ...m, text: '' }));
    showToast('Thanks — we’ll reply within 24 hours', 'success');
  };

  return (
    <>
      <section className="help-hero">
        <span className="ui-eyebrow">Help &amp; support</span>
        <h1>How can we <em>help?</em></h1>
        <p>Answers about analysis, privacy and billing — or reach a real person below.</p>
        <div className="help-search input-wrap">
          <Icon name="help" size={18} />
          <input className="input" placeholder="Search questions…" value={query} onChange={e => { setQuery(e.target.value); setOpen(-1); }} aria-label="Search help" />
        </div>
      </section>

      <div className="grid g-main" style={{ marginTop: 40 }}>
        <div>
          <div className="row-between wrap" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, letterSpacing: '-.03em', fontWeight: 800 }}>Frequently asked</h2>
            <Segmented size="sm" value={cat} onChange={v => { setCat(v); setOpen(-1); }} options={['All', 'Analysis', 'Privacy', 'Billing', 'Routine']} />
          </div>
          <div className="faq">
            {items.length === 0 && <div className="card"><p className="muted" style={{ textAlign: 'center' }}>No questions match “{query}”. Try another word or message us.</p></div>}
            {items.map((f, i) => (
              <div key={f.q} className={`faq-item${open === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                  {f.q}<Icon name="chevDown" size={18} />
                </button>
                <div className="faq-a"><div><p>{f.a}</p></div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <form className="card" onSubmit={submit}>
            <div className="card-head"><div><h3>Contact us</h3><p className="card-sub">We reply within 24 hours</p></div></div>
            <div className="field">
              <label className="label" htmlFor="hc-name">Name</label>
              <input id="hc-name" className="input" value={msg.name} onChange={e => setMsg(m => ({ ...m, name: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label" htmlFor="hc-email">Email</label>
              <input id="hc-email" type="email" className="input" value={msg.email} onChange={e => setMsg(m => ({ ...m, email: e.target.value }))} />
            </div>
            <div className="field">
              <span className="label">Topic</span>
              <div className="chip-row">
                {['Question', 'Bug', 'Billing', 'Clinic plan'].map(t => (
                  <button type="button" key={t} className={`tag-chip${msg.topic === t ? ' active' : ''}`} onClick={() => setMsg(m => ({ ...m, topic: t }))}>{t}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="hc-msg">Message</label>
              <textarea id="hc-msg" className="textarea" rows={4} placeholder="How can we help?" value={msg.text} onChange={e => setMsg(m => ({ ...m, text: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-dark btn-block mt-16" disabled={sending}>
              {sending ? <><span className="spinner" /> Sending…</> : <><Icon name="send" size={16} /> Send message</>}
            </button>
          </form>
          <div className="card">
            <ul className="rows soft">
              <li><span className="row" style={{ gap: 8 }}><Icon name="mail" size={16} /> Email</span><b>support@skinveda.ai</b></li>
              <li><span className="row" style={{ gap: 8 }}><Icon name="clock" size={16} /> Hours</span><b>Mon–Sat · 9–7 IST</b></li>
            </ul>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 56 }}>
        <span className="ui-eyebrow">Trust &amp; safety</span>
        <h2 style={{ fontSize: 26, letterSpacing: '-.035em', fontWeight: 800, marginBottom: 20 }}>Built to be trusted with something personal</h2>
        <div className="trust-grid">
          {TRUST.map(t => (
            <div key={t.title} className="trust-item">
              <span><Icon name={t.icon} size={19} /></span>
              <strong>{t.title}</strong>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-dark about-band" style={{ marginTop: 18, padding: 'clamp(24px, 4vw, 44px)', borderRadius: 28 }}>
        <div>
          <span className="mono" style={{ color: '#F0A58C' }}>About SkinVeda</span>
          <h2 style={{ marginTop: 10 }}>Ancient care, <em>modern intelligence.</em></h2>
          <p>“Veda” means knowledge. SkinVeda began as a hackathon project with one goal: help people living with chronic skin conditions stop guessing. We combine computer vision, dermatology research and mental-wellbeing support so anyone can understand their skin — and feel good in it.</p>
        </div>
        <div className="about-values">
          <div><b>98.2%</b><small>Model accuracy on validation set</small></div>
          <div><b>10K+</b><small>People tracking their skin</small></div>
          <div><b>5</b><small>Conditions screened today</small></div>
          <div><b>0</b><small>Photos ever sold</small></div>
        </div>
      </section>
    </>
  );
}
