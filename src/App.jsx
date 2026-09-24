import { useState, createContext, useContext, useCallback, useEffect } from 'react';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import Results from './pages/Results';
import Recommendations from './pages/Recommendations';
import MoodTracker from './pages/MoodTracker';
import SolaceChat from './pages/SolaceChat';
import Environment from './pages/Environment';
import Progress from './pages/Progress';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Help from './pages/Help';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PublicHeader from './components/PublicHeader';
import { Icon } from './components/ui';
import { buildDemoDiagnoses } from './lib/skin';
import { SAMPLE_MOODS } from './data/mockData';

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

const ALL_PAGES = [...PUBLIC_PAGES, 'dashboard', 'diagnosis', 'results', 'recommendations', 'mood', 'solace', 'environment', 'progress', 'reports', 'profile', 'settings'];

// Hash routing (#/dashboard) so refresh, back/forward and deep links work
const pageFromHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return ALL_PAGES.includes(h) ? h : 'landing';
};
const pushHash = p => {
  const target = p === 'landing' ? window.location.pathname : `#/${p}`;
  if (pageFromHash() !== p) window.history.pushState(null, '', target);
};

const TOAST_ICON = { success: 'check', error: 'x', warning: 'alert', info: 'info' };

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [user, setUser] = useState(() => readLS('sv_user', null));
  const [toasts, setToasts] = useState([]);
  const [navOpen, setNavOpen] = useState(false);

  // Persistent data stores
  const [moodLogs, setMoodLogs] = useState(() => readLS('sv_moods', []));
  const [diagnoses, setDiagnoses] = useState(() => readLS('sv_diagnoses', []));
  const [progressPhotos, setProgressPhotos] = useState(() => readLS('sv_progress', []));
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);

  useEffect(() => {
    const sync = () => { setPage(pageFromHash()); setNavOpen(false); };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  // Toast system
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  }, []);

  // Navigation
  const navigate = useCallback((p) => {
    setPage(p);
    pushHash(p);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openResult = useCallback((id) => {
    setSelectedDiagnosisId(id);
    navigate('results');
  }, [navigate]);

  // Auth
  const login = useCallback((userData) => {
    const enriched = { ...userData, joinedAt: userData.joinedAt || new Date().toISOString(), streak: userData.streak || 1, role: userData.role || 'user' };
    setUser(enriched);
    writeLS('sv_user', enriched);
    setPage('dashboard');
    pushHash('dashboard');
  }, []);

  // Demo: sign in and pre-fill history so every screen has something to show
  const loginDemo = useCallback((userData) => {
    setDiagnoses(prev => {
      if (prev.length) return prev;
      const seeded = buildDemoDiagnoses();
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

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sv_user');
    localStorage.removeItem('sv_token');
    setPage('landing');
    pushHash('landing');
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const updateUser = useCallback((updates) => {
    setUser(prev => { const u = { ...prev, ...updates }; writeLS('sv_user', u); return u; });
  }, []);

  // Mood
  const addMoodLog = useCallback((log) => {
    const entry = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
    setMoodLogs(prev => { const n = [entry, ...prev]; writeLS('sv_moods', n); return n; });
  }, []);

  // Diagnosis
  const addDiagnosis = useCallback((d) => {
    const entry = { ...d, id: Date.now(), timestamp: new Date().toISOString() };
    setDiagnoses(prev => { const n = [entry, ...prev]; writeLS('sv_diagnoses', n); return n; });
    return entry;
  }, []);

  // Progress
  const addProgressPhoto = useCallback((p) => {
    const entry = { ...p, id: Date.now() + Math.random(), timestamp: new Date().toISOString() };
    setProgressPhotos(prev => { const n = [entry, ...prev]; writeLS('sv_progress', n); return n; });
  }, []);

  // Data management
  const clearData = useCallback((kind) => {
    if (kind === 'diagnoses') { setDiagnoses([]); localStorage.removeItem('sv_diagnoses'); }
    if (kind === 'moods')     { setMoodLogs([]); localStorage.removeItem('sv_moods'); }
    if (kind === 'progress')  { setProgressPhotos([]); localStorage.removeItem('sv_progress'); }
  }, []);


  // Context value
  const ctx = {
    page, navigate, user, login, loginDemo, logout, updateUser,
    showToast, moodLogs, addMoodLog,
    diagnoses, addDiagnosis, selectedDiagnosisId, openResult,
    progressPhotos, addProgressPhoto, clearData,
    navOpen, setNavOpen,
  };

  // Auth guard — signed-out users only reach public pages
  const current = !user && !PUBLIC_PAGES.includes(page) ? 'login' : page;

  // Page renderer
  const renderPage = () => {
    switch (current) {
      case 'landing':         return <Landing />;
      case 'login':           return <Login />;
      case 'signup':          return <Signup />;
      case 'forgot':          return <ForgotPassword />;
      case 'dashboard':       return <Dashboard />;
      case 'diagnosis':       return <Diagnosis />;
      case 'results':         return <Results />;
      case 'recommendations': return <Recommendations />;
      case 'mood':            return <MoodTracker />;
      case 'solace':          return <SolaceChat />;
      case 'environment':     return <Environment />;
      case 'progress':        return <Progress />;
      case 'reports':         return <Reports />;
      case 'profile':         return <Profile />;
      case 'settings':        return <Settings />;
      case 'pricing':         return <Pricing />;
      case 'help':            return <Help />;
      default:                return <Landing />;
    }
  };

  const isBare = BARE_PAGES.includes(current);

  let content;
  if (isBare) content = renderPage();
  else if (user) content = (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <Sidebar />
      <div className="app-scrim" onClick={() => setNavOpen(false)} />
      <div className="app-main">
        <TopBar />
        <main className="app-page" key={current}>{renderPage()}</main>
      </div>
    </div>
  );
  else content = (
    <div className="public-shell">
      <PublicHeader />
      <main className="public-page" key={current}>{renderPage()}</main>
    </div>
  );

  return (
    <AppContext.Provider value={ctx}>
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
