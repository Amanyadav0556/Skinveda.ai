import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../App';
import { Icon, PageHeader, EmptyState, Toggle } from '../components/ui';
import { SampleBanner, SkeletonCard, Dialog } from '../components/skin';
import { DoctorCard, DoctorAvatar, AppointmentCard } from '../components/commerce';
import { listDoctors, getDoctor, doctorFilterOptions, expertiseFor } from '../lib/catalog';
import { CONSULT_MODES, EXPERTISE, upcomingSlots } from '../data/doctors';

const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;
const slotLabel = d => ({
  day: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
  time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
});

function BookingDialog({ doctor, open, onClose }) {
  const { bookAppointment, scans, showToast } = useApp();
  const slots = useMemo(() => upcomingSlots(doctor, 12), [doctor]);
  const [mode, setMode] = useState(doctor.modes[0]);
  const [slot, setSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [share, setShare] = useState(!!scans[0]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const confirm = async () => {
    if (!slot) { showToast('Choose a time first', 'error'); return; }
    setSaving(true);
    try {
      const appt = await bookAppointment({
        doctorId: doctor.id, doctorName: doctor.name, mode, slot: slot.toISOString(),
        fee: doctor.fees[mode], notes, scanId: share ? scans[0]?.id : null,
      });
      setDone(appt);
    } catch { /* toast already shown */ }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} title={done ? 'Request sent' : `Book with ${doctor.name}`}>
      {done ? (
        <div className="stack-sm">
          <div className="success-mark"><Icon name="check" size={28} stroke={2.4} /></div>
          <p>Your {CONSULT_MODES[done.mode].label.toLowerCase()} request for <b>{slotLabel(new Date(done.slot)).day}, {slotLabel(new Date(done.slot)).time}</b> has been sent.</p>
          <SampleBanner>This is a demo booking with a sample profile. No real appointment has been made and nothing has been charged.</SampleBanner>
          <button className="btn btn-primary btn-block mt-16" onClick={onClose}>Done</button>
        </div>
      ) : (
        <div className="stack-sm">
          <div className="field">
            <span className="label">Consultation type</span>
            <div className="option-grid">
              {doctor.modes.map(m => (
                <button key={m} type="button" className={`option${mode === m ? ' active' : ''}`} onClick={() => setMode(m)} aria-pressed={mode === m}>
                  <span className="dot">{mode === m && <Icon name="check" size={10} stroke={3} />}</span>
                  <span>{CONSULT_MODES[m].short}<small className="muted" style={{ display: 'block', fontWeight: 500 }}>{inr(doctor.fees[m])}</small></span>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Choose a time</span>
            {slots.length ? (
              <div className="slot-grid">
                {slots.map(s => {
                  const { day, time } = slotLabel(s);
                  const on = slot?.getTime() === s.getTime();
                  return <button key={s.toISOString()} type="button" className={`slot${on ? ' active' : ''}`} onClick={() => setSlot(s)} aria-pressed={on}>{time}<small>{day}</small></button>;
                })}
              </div>
            ) : <p className="t-small muted">No open times in the next three weeks.</p>}
          </div>
          <div className="field">
            <label className="label" htmlFor="bk-notes">What would you like help with? <small>optional</small></label>
            <textarea id="bk-notes" className="textarea" rows={3} placeholder="e.g. spots on my chin that keep coming back" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {scans[0] && (
            <label className="check"><input type="checkbox" checked={share} onChange={e => setShare(e.target.checked)} /> Share my latest skin report with the dermatologist</label>
          )}
          <div className="row-between mt-16">
            <span className="ink2">Fee <b>{inr(doctor.fees[mode])}</b></span>
            <button className="btn btn-primary" onClick={confirm} disabled={saving || !slot}>
              {saving ? <><span className="spinner" /> Sending…</> : 'Request consultation'}
            </button>
          </div>
          <p className="t-help">You'll pay the clinic directly. You can cancel a request from the Doctors page.</p>
        </div>
      )}
    </Dialog>
  );
}

function DoctorList() {
  const { navigate, scans, appointments, cancelAppointment } = useApp();
  const suggested = expertiseFor(scans[0]?.mainConcern || scans[0]?.concerns?.[0]?.id);
  const opts = doctorFilterOptions();
  const [f, setF] = useState({ query: '', expertise: '', mode: '', minExperience: '', language: '', city: '', availableSoon: false });
  const [items, setItems] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let live = true;
    listDoctors({ ...f, minExperience: Number(f.minExperience) || undefined }).then(r => live && setItems(r));
    return () => { live = false; };
  }, [f]);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.slot) > new Date(Date.parse(new Date().toISOString())));

  return (
    <div className="stack">
      <SampleBanner>Sample profiles for this demo — these are not real doctors, and bookings are demo requests. A verified directory can be connected later.</SampleBanner>

      {upcoming.length > 0 && (
        <section className="card" aria-labelledby="appt-h">
          <div className="card-head"><h3 id="appt-h">Your consultations</h3></div>
          <div className="stack-sm">{upcoming.map(a => <AppointmentCard key={a.id} appt={a} onCancel={cancelAppointment} />)}</div>
        </section>
      )}

      {suggested && !f.expertise && (
        <div className="callout callout-info">
          <Icon name="spark" size={18} />
          <div>
            <strong>Suggested for your latest scan</strong>
            Dermatologists with experience in {suggested.toLowerCase()}.
            <div className="mt-8"><button className="btn btn-sm btn-ghost" onClick={() => set('expertise', suggested)}>Show these first</button></div>
          </div>
        </div>
      )}

      <section className="card" aria-labelledby="dir-h">
        <div className="card-head"><h2 className="h-section" id="dir-h">Dermatologists</h2><span className="t-small muted">{items ? `${items.length} found` : 'Loading…'}</span></div>
        <div className="filters" role="search">
          <div className="input-wrap">
            <Icon name="filter" size={16} />
            <input className="input" placeholder="Search by name, city or concern" value={f.query} onChange={e => set('query', e.target.value)} aria-label="Search dermatologists" />
          </div>
          <select className="select select-sm" value={f.expertise} onChange={e => set('expertise', e.target.value)} aria-label="Specialty">
            <option value="">Any specialty</option>{EXPERTISE.map(x => <option key={x}>{x}</option>)}
          </select>
          <select className="select select-sm" value={f.mode} onChange={e => set('mode', e.target.value)} aria-label="Consultation type">
            <option value="">Any consultation</option>{Object.entries(CONSULT_MODES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
          <select className="select select-sm" value={f.minExperience} onChange={e => set('minExperience', e.target.value)} aria-label="Experience">
            <option value="">Any experience</option><option value="5">5+ years</option><option value="10">10+ years</option>
          </select>
          <select className="select select-sm" value={f.language} onChange={e => set('language', e.target.value)} aria-label="Language">
            <option value="">Any language</option>{opts.languages.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="select select-sm" value={f.city} onChange={e => set('city', e.target.value)} aria-label="Location">
            <option value="">Any location</option><option value="Online">Online</option>{opts.cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="row t-small" style={{ gap: 8 }}>
            <Toggle checked={f.availableSoon} onChange={v => set('availableSoon', v)} label="Available within 3 days" /> Available soon
          </label>
        </div>
        <div className="mt-24">
          {!items ? <div className="doctor-grid">{[0, 1].map(i => <SkeletonCard key={i} lines={5} />)}</div>
            : items.length === 0 ? <EmptyState icon="doctor" title="No dermatologists match" text="Try a different language, location or consultation type." />
            : <div className="doctor-grid">{items.map(d => (
                <DoctorCard key={d.id} doctor={d} nextSlot={upcomingSlots(d, 1)[0]} onOpen={id => navigate(`doctors/${id}`)} onBook={id => setBooking(items.find(x => x.id === id))} />
              ))}</div>}
        </div>
      </section>
      {booking && <BookingDialog doctor={booking} open onClose={() => setBooking(null)} />}
    </div>
  );
}

function DoctorDetail({ id }) {
  const { navigate } = useApp();
  const [doctor, setDoctor] = useState(undefined);
  const [booking, setBooking] = useState(false);
  useEffect(() => { getDoctor(id).then(setDoctor); }, [id]);

  if (doctor === undefined) return <SkeletonCard lines={6} />;
  if (!doctor) return <div className="card"><EmptyState icon="doctor" title="Profile not found" action={<button className="btn btn-ghost" onClick={() => navigate('doctors')}>Back to doctors</button>} /></div>;
  const slots = upcomingSlots(doctor, 8);

  return (
    <div className="stack">
      <button className="btn-text row" style={{ gap: 6 }} onClick={() => navigate('doctors')}><Icon name="back" size={16} /> All dermatologists</button>
      <section className="card">
        <div className="doctor-head">
          <DoctorAvatar doctor={doctor} size="xl" />
          <div style={{ flex: 1 }}>
            <div className="row wrap" style={{ gap: 8 }}><h1 className="h-page">{doctor.name}</h1><span className="pill pill-info">Sample profile</span></div>
            <p className="ink2 mt-8">{doctor.qualification} · {doctor.specialization}</p>
            <p className="t-small muted">{doctor.experience} years of experience · {doctor.area === 'Online only' ? 'Online only' : `${doctor.area}, ${doctor.city}`} · {doctor.languages.join(', ')}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setBooking(true)}><Icon name="calendar" size={16} /> Book consultation</button>
        </div>
        <p className="mt-16 ink2">{doctor.about}</p>
        <div className="chip-row mt-16">{doctor.expertise.map(e => <span key={e} className="pill pill-primary">{e}</span>)}</div>
      </section>

      <div className="grid g-2">
        <section className="card">
          <div className="card-head"><h3>Consultation options</h3></div>
          <ul className="rows soft">
            {doctor.modes.map(m => <li key={m}><span className="row" style={{ gap: 8 }}><Icon name={CONSULT_MODES[m].icon} size={16} /> {CONSULT_MODES[m].label}</span><b>{inr(doctor.fees[m])}</b></li>)}
          </ul>
        </section>
        <section className="card">
          <div className="card-head"><h3>Next available</h3></div>
          <div className="slot-grid">
            {slots.map(s => { const { day, time } = slotLabel(s); return <button key={s.toISOString()} className="slot" onClick={() => setBooking(true)}>{time}<small>{day}</small></button>; })}
          </div>
        </section>
      </div>
      <SampleBanner>This profile is sample data for the demo. Qualifications and availability are placeholders, not a real doctor's details.</SampleBanner>
      {booking && <BookingDialog doctor={doctor} open onClose={() => setBooking(false)} />}
    </div>
  );
}

export default function Doctors() {
  const { routeParam } = useApp();
  return (
    <>
      {!routeParam && (
        <PageHeader eyebrow="Doctors" title="Consult a dermatologist"
          subtitle="Consult a dermatologist if you would like professional guidance. It's always your choice — video, chat or clinic." />
      )}
      {routeParam ? <DoctorDetail id={routeParam} /> : <DoctorList />}
    </>
  );
}
