// Theme preference: 'system' | 'light' | 'dark', stored per browser.
import { useCallback, useEffect, useState } from 'react';

const KEY = 'sv_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

const readPref = () => {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
};

const resolve = pref => (pref === 'dark' || (pref === 'system' && media().matches) ? 'dark' : 'light');

const apply = pref => document.documentElement.setAttribute('data-theme', resolve(pref));

export function useTheme() {
  const [pref, setPrefState] = useState(readPref);
  const [resolved, setResolved] = useState(() => resolve(readPref()));

  // Follow the OS setting live while the preference is "system"
  useEffect(() => {
    apply(pref);
    if (pref !== 'system') return;
    const mq = media();
    const onChange = () => { apply('system'); setResolved(resolve('system')); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const setPref = useCallback(next => {
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
    setPrefState(next);
    setResolved(resolve(next));
  }, []);

  const toggle = useCallback(() => setPref(resolve(readPref()) === 'dark' ? 'light' : 'dark'), [setPref]);

  return { pref, resolved, setPref, toggle };
}
