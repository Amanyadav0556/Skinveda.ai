// ============================================================
// SkinVeda.ai — small shared helpers: names, stable "now",
// and the daily routine checklist hook
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getToken } from '../api';

export const initialsOf = name =>
  name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

/** Timestamp captured once per mount — keeps render pure. */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}

export const firstName = user => user?.name?.split(' ')[0] || 'there';

/* ─── Daily routine completion (per-day; cached locally, synced to the account) ─── */
// Local calendar day (toISOString() is UTC, which is still "yesterday" in India until 05:30)
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const cacheKey = day => `sv_routine_${day}`;
const readCache = day => { try { return JSON.parse(localStorage.getItem(cacheKey(day))) || []; } catch { return []; } };
const writeCache = (day, steps) => { try { localStorage.setItem(cacheKey(day), JSON.stringify(steps)); } catch { /* storage unavailable */ } };

export function useRoutineLog() {
  const [day] = useState(todayISO);
  const [done, setDone] = useState(() => readCache(day));
  const doneRef = useRef(done);
  const touched = useRef(false);  // user toggled before the server answered

  // Signed-in accounts: pull today's checklist from the server
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api.getRoutine(day)
      .then(steps => {
        // A late response must not wipe out a tick the user just made
        if (cancelled || touched.current) return;
        doneRef.current = steps; setDone(steps); writeCache(day, steps);
      })
      .catch(() => { /* offline: keep the cached checklist */ });
    return () => { cancelled = true; };
  }, [day]);

  const toggle = useCallback(id => {
    touched.current = true;
    const prev = doneRef.current;
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    doneRef.current = next;
    setDone(next);
    writeCache(day, next);
    if (getToken()) api.saveRoutine(day, next).catch(() => { /* cached locally; next toggle retries */ });
  }, [day]);

  return [done, toggle];
}
