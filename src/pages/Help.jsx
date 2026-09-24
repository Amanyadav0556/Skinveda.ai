import { useState } from 'react';
import { useApp } from '../App';
import { Icon, Segmented } from '../components/ui';

const FAQ = [
  { cat: 'Analysis', q: 'How does the skin analysis work?', a: 'The scan measures visible properties of your photo — colour, brightness and fine texture across areas of your face — and estimates concerns such as acne-like spots, pigmentation, dryness, oiliness and redness. The current version is a preview model based on explainable image measurements, not a medical device. Every report shows a confidence level, and unclear photos are flagged so you can retake them.' },
  { cat: 'Analysis', q: 'Is SkinVeda a replacement for a dermatologist?', a: 'No. SkinVeda provides AI-assisted skincare guidance and does not replace professional medical diagnosis. If a concern looks extensive, is changing quickly, or our assessment is uncertain, we will suggest speaking with a qualified dermatologist.' },
  { cat: 'Analysis', q: 'How should I take a photo for the best result?', a: 'Face a window in daylight, keep your face centred in the oval, remove makeup and glasses, and avoid filters. Scanning at the same time and angle each week makes your progress comparisons much more reliable.' },
  { cat: 'Analysis', q: 'Why do you sometimes suggest seeing a dermatologist?', a: 'We suggest it when a concern looks extensive, when you tell us something is worsening quickly or a spot is painful, bleeding or changing, or when our assessment is uncertain. It is a suggestion, never a diagnosis — the choice is always yours.' },
  { cat: 'Privacy', q: 'Who can see my skin photos?', a: 'Only you. Photos are stored privately in your account and are never sold. You can delete your scans, photos and history at any time from Settings → Privacy & data.' },
  { cat: 'Privacy', q: 'Can I delete my data?', a: 'Yes. Settings → Privacy & data lets you clear scans, mood logs or photos instantly. To delete your whole account, contact support.' },
  { cat: 'Products', q: 'Do I have to buy products?', a: 'No. Buying products is always optional. Your routine lists the ingredient to look for in each step, so you can use products you already own or choose any brand.' },
  { cat: 'Products', q: 'Are product suggestions sponsored?', a: 'SkinVeda’s suggestions are ranked only by how well a product matches your skin, and each one explains why. If a brand pays for a placement, it is shown separately with a clear “Sponsored” label and is never ranked by our recommendations.' },
  { cat: 'Products', q: 'Are the products and doctors real?', a: 'In this version, the product catalogue and dermatologist profiles are clearly labelled sample data so you can try the experience. Consultation requests are demo requests. They are built to be replaced by a verified catalogue and doctor directory.' },
  { cat: 'Billing', q: 'Can I cancel a paid plan anytime?', a: 'Yes — cancel anytime from Settings → Account. You keep your plan until the end of the billing period.' },
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
            <Segmented size="sm" value={cat} onChange={v => { setCat(v); setOpen(-1); }} options={['All', 'Analysis', 'Privacy', 'Products', 'Billing']} />
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
          <span className="mono" style={{ color: 'var(--inverse-accent)' }}>About SkinVeda</span>
          <h2 style={{ marginTop: 10 }}>Ancient care, <em>modern intelligence.</em></h2>
          <p>“Veda” means knowledge. SkinVeda began as a hackathon project with one goal: help people stop guessing about their skin. We combine AI-assisted skin analysis, ingredient education and access to dermatologists so anyone can build a routine that suits them.</p>
        </div>
        <div className="about-values">
          <div><b>You decide</b><small>Products and consultations are always optional</small></div>
          <div><b>Explained</b><small>Every suggestion says why</small></div>
          <div><b>Labelled</b><small>Sponsored content is always marked</small></div>
          <div><b>Private</b><small>Your photos are never sold</small></div>
        </div>
      </section>
    </>
  );
}
