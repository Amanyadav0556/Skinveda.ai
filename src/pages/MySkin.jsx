import { useApp } from '../App';
import { Icon, PageHeader, EmptyState } from '../components/ui';
import { SKIN_TYPES } from '../data/skincare';
import ReportView from './myskin/ReportView';
import RoutineView from './myskin/RoutineView';
import IngredientsView from './myskin/IngredientsView';

const TABS = [
  { id: 'report', label: 'Skin report' },
  { id: 'routine', label: 'My routine' },
  { id: 'ingredients', label: 'Ingredients' },
];

export default function MySkin() {
  const { routeParam, navigate, scans, selectedScanId, user } = useApp();
  const tab = TABS.some(t => t.id === routeParam) ? routeParam : 'report';

  const idx = Math.max(0, scans.findIndex(s => s.id === selectedScanId));
  const scan = scans[idx];
  const prev = scans[idx + 1];

  // Routine & ingredients follow the latest scan, or the profile if there is none yet
  const latest = scans[0];
  const skinType = latest?.skinType || (SKIN_TYPES.includes(user?.skinType) ? user.skinType : 'Normal');
  const concerns = latest ? latest.concerns.map(c => c.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="My skin"
        title={tab === 'report' ? 'Your skin report' : tab === 'routine' ? 'Your personalised routine' : 'Ingredients for your skin'}
        subtitle={latest ? 'Based on your latest scan. Rescan every 1–2 weeks to keep this up to date.' : "Scan your face to personalise this page. Until then, it's based on your profile."}
        actions={<button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> New scan</button>}
      />

      <nav className="tabs-line" aria-label="My skin sections">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => navigate(t.id === 'report' ? 'my-skin' : `my-skin/${t.id}`)}>{t.label}</button>
        ))}
      </nav>

      {tab === 'report' && (scan
        ? <ReportView scan={scan} prev={prev} />
        : <div className="card"><EmptyState icon="face" title="No skin report yet"
            text="A quick face scan gives you a summary of visible concerns, a wellness score and a routine built for you."
            action={<button className="btn btn-primary" onClick={() => navigate('scan')}><Icon name="scan" size={17} /> Scan my skin</button>} /></div>)}
      {tab === 'routine' && <RoutineView skinType={skinType} concerns={concerns} />}
      {tab === 'ingredients' && <IngredientsView skinType={skinType} concerns={concerns} />}
    </>
  );
}
