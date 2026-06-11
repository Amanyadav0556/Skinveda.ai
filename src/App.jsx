import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import MoodTracker from './pages/MoodTracker';
import SolaceChat from './pages/SolaceChat';
import Environment from './pages/Environment';
import Progress from './pages/Progress';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// ── Context ──────────────────────────────────────────────────────────
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── Helpers ───────────────────────────────────────────────────────────
const readLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(() => readLS('sv_user', null));
  const [toasts, setToasts] = useState([]);

  // Persistent data stores
  const [moodLogs, setMoodLogs] = useState(() => readLS('sv_moods', []));
  const [diagnoses, setDiagnoses] = useState(() => readLS('sv_diagnoses', []));
  const [progressPhotos, setProgressPhotos] = useState(() => readLS('sv_progress', []));

  // Toast system
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  }, []);

  // Navigation
  const navigate = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auth
  const login = useCallback((userData) => {
    const enriched = { ...userData, joinedAt: userData.joinedAt || new Date().toISOString(), streak: userData.streak || 1, role: userData.role || 'user' };
    setUser(enriched);
    writeLS('sv_user', enriched);
    setPage('dashboard');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sv_user');
    setPage('landing');
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
  }, []);

  // Progress
  const addProgressPhoto = useCallback((p) => {
    const entry = { ...p, id: Date.now(), timestamp: new Date().toISOString() };
    setProgressPhotos(prev => { const n = [entry, ...prev]; writeLS('sv_progress', n); return n; });
  }, []);

  // Auth guard
  const PUBLIC_PAGES = ['landing', 'login', 'signup'];
  useEffect(() => {
    if (!user && !PUBLIC_PAGES.includes(page)) setPage('login');
  }, [user, page]);

  // Context value
  const ctx = {
    page, navigate, user, login, logout, updateUser,
    showToast, moodLogs, addMoodLog,
    diagnoses, addDiagnosis,
    progressPhotos, addProgressPhoto,
  };

  // Page renderer
  const renderPage = () => {
    switch (page) {
      case 'landing':     return <Landing />;
      case 'login':       return <Login />;
      case 'signup':      return <Signup />;
      case 'dashboard':   return <Dashboard />;
      case 'diagnosis':   return <Diagnosis />;
      case 'mood':        return <MoodTracker />;
      case 'solace':      return <SolaceChat />;
      case 'environment': return <Environment />;
      case 'progress':    return <Progress />;
      case 'reports':     return <Reports />;
      case 'profile':     return <Profile />;
      case 'settings':    return <Settings />;
      default:            return <Landing />;
    }
  };

  const isAuthenticated = !!user;
  const isPublicPage = PUBLIC_PAGES.includes(page);

  return (
    <AppContext.Provider value={ctx}>
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* Layout */}
      {isAuthenticated && !isPublicPage ? (
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <TopBar />
            <div className="page-container">
              {renderPage()}
            </div>
          </div>
        </div>
      ) : (
        renderPage()
      )}
    </AppContext.Provider>
  );
}
