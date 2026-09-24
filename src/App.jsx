import { useState, createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import MySkin from './pages/MySkin';
import Products from './pages/Products';
import Doctors from './pages/Doctors';
import Progress from './pages/Progress';
import MoodTracker from './pages/MoodTracker';
import SolaceChat from './pages/SolaceChat';
import Environment from './pages/Environment';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Help from './pages/Help';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import PublicHeader from './components/PublicHeader';
import { Icon } from './components/ui';
import { normalizeRecord, buildDemoAssessments } from './lib/records';
import { useTheme } from './lib/theme';
import { SAMPLE_MOODS } from './data/mockData';
import { api, getToken, UNAUTHORIZED_EVENT } from './api';

// ── Context ──────────────────────────────────────────────────────────
/* eslint-disable react-refresh/only-export-components */
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
/* eslint-enable react-refresh/only-export-components */

// ── Helpers ───────────────────────────────────────────────────────────
const readLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
};

// Full-screen pages without app chrome
const BARE_PAGES = ['landing', 'login', 'signup', 'forgot'];
// Reachable without signing in
const PUBLIC_PAGES = [...BARE_PAGES, 'pricing', 'help'];
const APP_PAGES = ['dashboard', 'scan', 'my-skin', 'products', 'doctors', 'progress', 'mood', 'solace', 'environment', 'reports', 'profile', 'settings'];
const ALL_PAGES = [...PUBLIC_PAGES, ...APP_PAGES];
// Old links keep working
const ALIASES = { diagnosis: 'scan', results: 'my-skin', recommendations: 'my-skin/routine' };

// Hash routing: #/page or #/page/param (e.g. #/products/p-id, #/my-skin/routine)
const parseRoute = hash => {
  let path = hash.replace(/^#\/?/, '');
  const [head] = path.split('/');
  if (ALIASES[head]) path = ALIASES[head];
  const [page, ...rest] = path.split('/');
  return ALL_PAGES.includes(page) ? { page, param: rest.join('/') || null } : { page: 'landing', param: null };
};
const routeFromHash = () => parseRoute(window.location.hash);
const pushHash = path => {
  const target = path === 'landing' ? window.location.pathname : `#/${path}`;
  if (window.location.hash !== `#/${path}`) window.history.pushState(null, '', target);
};

// Profile fields the server stores; others (plan, goals, sensitivities) stay local for now
const SERVER_PROFILE_FIELDS = ['name', 'age', 'gender', 'location', 'skinCondition', 'skinType'];

const TOAST_ICON = { success: 'check', error: 'x', warning: 'alert', info: 'info' };

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [user, setUser] = useState(() => readLS('sv_user', null));
  const [toasts, setToasts] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const theme = useTheme();

  // Persistent data stores
  const [moodLogs, setMoodLogs] = useState(() => readLS('sv_moods', []));
  const [diagnoses, setDiagnoses] = useState(() => readLS('sv_diagnoses', []));
  const [progressPhotos, setProgressPhotos] = useState(() => readLS('sv_progress', []));
  const [appointments, setAppointments] = useState(() => readLS('sv_appointments', []));
  const [selectedScanId, setSelectedScanId] = useState(null);

  // Every scan in the v2 "visible concerns" shape, newest first
  const scans = useMemo(() => diagnoses.map(normalizeRecord), [diagnoses]);

  // Signed in with a real account (demo mode has no token and stays in the browser)
  const isRemote = !!user && !!getToken();

  // Load the account's history from the server after sign-in / on reload
  useEffect(() => {
    if (!user?.email || !getToken()) return;
    let cancelled = false;
    Promise.all([api.listMoods(), api.listDiagnoses(), api.listPhotos(), api.listAppointments()])
      .then(([moods, diags, photos, appts]) => {
        if (cancelled) return;
        setMoodLogs(moods); writeLS('sv_moods', moods);
        setDiagnoses(diags); writeLS('sv_diagnoses', diags);
        setProgressPhotos(photos); writeLS('sv_progress', photos);
        setAppointments(appts); writeLS('sv_appointments', appts);
      })
      .catch(err => { if (!cancelled) console.warn('Could not load history from server:', err.message); });
    return () => { cancelled = true; };
  }, [user?.email]);

  useEffect(() => {
    const sync = () => { setRoute(routeFromHash()); setNavOpen(false); };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  // Toast system
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
  }, []);

  // Navigation: accepts 'page' or 'page/param'
  const navigate = useCallback((path) => {
    const next = parseRoute(`#/${path}`);
    setRoute(next);
    pushHash(next.param ? `${next.page}/${next.param}` : next.page);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openScan = useCallback((id) => {
    setSelectedScanId(id);
    navigate('my-skin');
  }, [navigate]);

  // Auth
  const login = useCallback((userData) => {
    const enriched = { ...userData, joinedAt: userData.joinedAt || new Date().toISOString(), streak: userData.streak || 1, role: userData.role || 'user' };
    setUser(enriched);
    writeLS('sv_user', enriched);
    setRoute({ page: 'dashboard', param: null });
    pushHash('dashboard');
  }, []);

  // Demo: sign in and pre-fill history so every screen has something to show
  const loginDemo = useCallback((userData) => {
    setDiagnoses(prev => {
      if (prev.length) return prev;
      const seeded = buildDemoAssessments();
      writeLS('sv_diagnoses', seeded);
      return seeded;
    });
    setMoodLogs(prev => {
      if (prev.length) return prev;
      const seeded = SAMPLE_MOODS.map((m, i) => ({ ...m, id: Date.now() - i }));
      writeLS('sv_moods', seeded);
      return seeded;
    });
    login(userData);
  }, [login]);

  const logout = useCallback((reason) => {
    setUser(null);
    // Clear cached history too, so the next person on this browser starts clean
    ['sv_user', 'sv_token', 'sv_moods', 'sv_diagnoses', 'sv_progress', 'sv_appointments'].forEach(k => localStorage.removeItem(k));
    setMoodLogs([]); setDiagnoses([]); setProgressPhotos([]); setAppointments([]); setSelectedScanId(null);
    const expired = reason === 'expired';
    setRoute({ page: expired ? 'login' : 'landing', param: null });
    pushHash(expired ? 'login' : 'landing');
    showToast(expired ? 'Your session expired — please sign in again' : "You've been signed out", expired ? 'warning' : 'info');
  }, [showToast]);

  // Server rejected our token (expired / deleted account) -> sign out
  useEffect(() => {
    const onUnauthorized = () => logout('expired');
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  // On app start, confirm the saved session is still valid and refresh the profile
  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then(fresh => setUser(prev => { if (!prev) return prev; const u = { ...prev, ...fresh }; writeLS('sv_user', u); return u; }))
      .catch(() => { /* 401 is handled by the event above; offline keeps the cached session */ });
  }, []);

  const updateUser = useCallback(async (updates) => {
    let merged = updates;
    const serverPart = Object.fromEntries(Object.entries(updates).filter(([k]) => SERVER_PROFILE_FIELDS.includes(k)));
    if (getToken() && Object.keys(serverPart).length) {
      const saved = await api.updateProfile(serverPart);  // throws on failure; nothing changes locally
      merged = { ...updates, ...saved, streak: undefined, joinedAt: undefined };
      Object.keys(merged).forEach(k => merged[k] === undefined && delete merged[k]);
    }
    setUser(prev => { const u = { ...prev, ...merged }; writeLS('sv_user', u); return u; });
  }, []);

  // Mood
  const addMoodLog = useCallback(async (log) => {
    const entry = { ...log, id: `tmp-${Date.now()}`, timestamp: new Date().toISOString() };
    setMoodLogs(prev => { const n = [entry, ...prev]; writeLS('sv_moods', n); return n; });
    if (!getToken()) return entry;
    try {
      const saved = await api.addMood(log);
      setMoodLogs(prev => { const n = prev.map(m => (m.id === entry.id ? saved : m)); writeLS('sv_moods', n); return n; });
      return saved;
    } catch (err) {
      setMoodLogs(prev => { const n = prev.filter(m => m.id !== entry.id); writeLS('sv_moods', n); return n; });
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  // Scans
  const saveScan = useCallback(async (assessment) => {
    const record = { ...assessment, disease: assessment.concerns?.[0]?.name || 'No strong concerns' };
    let entry = { ...record, id: Date.now(), timestamp: new Date().toISOString() };
    if (getToken()) {
      try {
        entry = { ...record, ...(await api.saveDiagnosis(record)) };
      } catch (err) {
        entry.unsynced = true;  // keep the report on screen even if saving failed
        showToast(err.message, 'error');
      }
    }
    setDiagnoses(prev => { const n = [entry, ...prev]; writeLS('sv_diagnoses', n); return n; });
    setSelectedScanId(entry.id);
    return normalizeRecord(entry);
  }, [showToast]);

  const updateScanNote = useCallback(async (id, notes) => {
    if (getToken() && typeof id === 'string' && id.length === 36) {
      try { await api.saveScanNote(id, notes); } catch (err) { showToast(err.message, 'error'); throw err; }
    }
    setDiagnoses(prev => { const n = prev.map(d => (d.id === id ? { ...d, notes } : d)); writeLS('sv_diagnoses', n); return n; });
    showToast('Note saved', 'success');
  }, [showToast]);

  // Progress photos
  const addProgressPhoto = useCallback(async (p) => {
    const entry = getToken()
      ? await api.addPhoto(p)  // throws on failure; caller reports it
      : { ...p, id: Date.now() + Math.random(), timestamp: new Date().toISOString() };
    setProgressPhotos(prev => { const n = [entry, ...prev]; writeLS('sv_progress', n); return n; });
    return entry;
  }, []);

  // Dermatologist consultations
  const bookAppointment = useCallback(async (a) => {
    try {
      const entry = getToken()
        ? await api.bookAppointment(a)
        : { ...a, id: `local-${Date.now()}`, status: 'requested', createdAt: new Date().toISOString() };
      setAppointments(prev => { const n = [entry, ...prev]; writeLS('sv_appointments', n); return n; });
      return entry;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const cancelAppointment = useCallback(async (id) => {
    try {
      const updated = getToken() && !String(id).startsWith('local-') ? await api.cancelAppointment(id) : { status: 'cancelled' };
      setAppointments(prev => { const n = prev.map(a => (a.id === id ? { ...a, ...updated, status: 'cancelled' } : a)); writeLS('sv_appointments', n); return n; });
      showToast('Consultation request cancelled', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  // Data management
  const clearData = useCallback(async (kind) => {
    if (getToken()) {
      const call = { diagnoses: api.clearDiagnoses, moods: api.clearMoods, progress: api.clearPhotos }[kind];
      await call();  // throws on failure so local data is kept
    }
    if (kind === 'diagnoses') { setDiagnoses([]); localStorage.removeItem('sv_diagnoses'); }
    if (kind === 'moods')     { setMoodLogs([]); localStorage.removeItem('sv_moods'); }
    if (kind === 'progress')  { setProgressPhotos([]); localStorage.removeItem('sv_progress'); }
  }, []);

  // Auth guard — signed-out users only reach public pages
  const current = !user && !PUBLIC_PAGES.includes(route.page) ? 'login' : route.page;

  const ctx = {
    page: current, routeParam: route.param, navigate, user, login, loginDemo, logout, updateUser,
    showToast, theme, isRemote, navOpen, setNavOpen,
    moodLogs, addMoodLog,
    scans, saveScan, openScan, selectedScanId, updateScanNote,
    // legacy names still used by Mood/Reports/Profile/Settings
    diagnoses: scans, progressPhotos, addProgressPhoto, clearData,
    appointments, bookAppointment, cancelAppointment,
  };

  const renderPage = () => {
    switch (current) {
      case 'landing':     return <Landing />;
      case 'login':       return <Login />;
      case 'signup':      return <Signup />;
      case 'forgot':      return <ForgotPassword />;
      case 'dashboard':   return <Dashboard />;
      case 'scan':        return <Scan />;
      case 'my-skin':     return <MySkin />;
      case 'products':    return <Products />;
      case 'doctors':     return <Doctors />;
      case 'progress':    return <Progress />;
      case 'mood':        return <MoodTracker />;
      case 'solace':      return <SolaceChat />;
      case 'environment': return <Environment />;
      case 'reports':     return <Reports />;
      case 'profile':     return <Profile />;
      case 'settings':    return <Settings />;
      case 'pricing':     return <Pricing />;
      case 'help':        return <Help />;
      default:            return <Landing />;
    }
  };

  const pageKey = `${current}/${route.param || ''}`;
  let content;
  if (BARE_PAGES.includes(current)) content = <div id="main">{renderPage()}</div>;
  else if (user) content = (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <Sidebar />
      <div className="app-scrim" onClick={() => setNavOpen(false)} />
      <div className="app-main">
        <TopBar />
        <main id="main" className="app-page" key={pageKey} tabIndex={-1}>{renderPage()}</main>
      </div>
      <BottomNav />
    </div>
  );
  else content = (
    <div className="public-shell">
      <PublicHeader />
      <main id="main" className="public-page" key={pageKey} tabIndex={-1}>{renderPage()}</main>
    </div>
  );

  return (
    <AppContext.Provider value={ctx}>
      <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon"><Icon name={TOAST_ICON[t.type] || 'info'} size={14} stroke={2.4} /></span>
            {t.message}
          </div>
        ))}
      </div>
      {content}
    </AppContext.Provider>
  );
}
