// ============================================================
// SkinVeda.ai — skin-domain helpers shared across screens
// (scores, metrics, concern advice, routines, product matching)
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

// Small deterministic PRNG so derived values stay stable across renders/reloads.
function seeded(seedStr) {
  let h = 2166136261;
  for (const ch of String(seedStr)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const METRIC_LABELS = {
  hydration:  'Hydration',
  clarity:    'Clarity',
  evenness:   'Tone evenness',
  texture:    'Texture',
  barrier:    'Barrier health',
  oilBalance: 'Oil balance',
};

const CONDITION_PROFILE = {
  'Eczema':             { weak: ['hydration', 'barrier'], area: 'Inner elbow' },
  'Psoriasis':          { weak: ['texture', 'barrier'],   area: 'Scalp' },
  'Vitiligo':           { weak: ['evenness'],             area: 'Hands' },
  'Acne Vulgaris':      { weak: ['clarity', 'oilBalance'], area: 'Cheeks' },
  'Contact Dermatitis': { weak: ['barrier', 'texture'],   area: 'Wrist' },
};

const SECONDARY = {
  'Eczema':             ['Dryness', 'Redness'],
  'Psoriasis':          ['Scaling', 'Redness'],
  'Vitiligo':           ['Uneven tone', 'UV sensitivity'],
  'Acne Vulgaris':      ['Excess sebum', 'Post-acne marks'],
  'Contact Dermatitis': ['Irritation', 'Dryness'],
};

export const severityOf = c => (c >= 0.85 ? 'high' : c >= 0.6 ? 'moderate' : 'low');

/**
 * Adds skinScore, metrics and concern breakdown to a diagnosis record.
 * Records created before the redesign lack these fields; values are derived
 * deterministically from the record so they never change between visits.
 */
export function enrichDiagnosis(d) {
  if (!d) return d;
  if (d.metrics && d.concerns && typeof d.skinScore === 'number') return d;
  const rnd = seeded(d.analysisId || d.id || d.timestamp || d.disease);
  const profile = CONDITION_PROFILE[d.disease] || { weak: ['texture'], area: 'Face' };
  const metrics = {};
  Object.keys(METRIC_LABELS).forEach(k => {
    const weak = profile.weak.includes(k);
    metrics[k] = Math.round(weak ? 42 + rnd() * 22 : 66 + rnd() * 26);
  });
  const avg = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;
  const skinScore = Math.round(Math.max(35, Math.min(96, avg - (d.risk === 'moderate' ? 3 : 0))));
  const conf = d.confidence || 0.8;
  const concerns = [
    { name: d.disease, confidence: conf, area: d.bodyRegion || profile.area, primary: true },
    ...(SECONDARY[d.disease] || ['Dryness', 'Redness']).map((name, i) => ({
      name, confidence: Math.max(0.28, conf - 0.18 - i * 0.17 - rnd() * 0.08), area: d.bodyRegion || profile.area,
    })),
  ];
  return { ...d, metrics, skinScore, concerns };
}

export const scoreLabel = s => (s >= 85 ? 'Excellent' : s >= 72 ? 'Very good' : s >= 60 ? 'Fair' : 'Needs care');

/* ─── Concern knowledge base ───────────────────────────────────── */
export const CONCERN_GUIDE = {
  'Eczema': {
    summary: 'Your barrier is losing moisture faster than it can hold it. Focus on gentle cleansing and heavy, fragrance-free hydration.',
    use: ['Ceramides', 'Colloidal oatmeal', 'Glycerin', 'Shea butter'],
    avoid: ['Fragrance', 'Alcohol denat.', 'Harsh sulfates', 'Hot showers'],
    tips: ['Moisturise within 3 minutes of bathing to lock in water.', 'Keep showers short and lukewarm.', 'Wear breathable cotton next to affected skin.', 'Run a humidifier when indoor air is dry.'],
  },
  'Psoriasis': {
    summary: 'Skin cells are turning over faster than normal, causing buildup. Soften scale gently and keep the skin supple.',
    use: ['Salicylic acid', 'Urea 10%', 'Coal tar (OTC)', 'Ceramides'],
    avoid: ['Picking scale', 'Fragrance', 'Very hot water', 'Smoking'],
    tips: ['Soak in lukewarm water, then apply a thick emollient.', 'Short, careful sun exposure can help — always protect unaffected skin.', 'Track stress: it is one of the most common flare triggers.'],
  },
  'Vitiligo': {
    summary: 'Pigment-producing cells are reduced in some areas. Protecting depigmented patches from UV is the priority.',
    use: ['Mineral SPF 50', 'Niacinamide', 'Antioxidant serum'],
    avoid: ['Unprotected sun', 'Skin trauma', 'Harsh scrubs'],
    tips: ['Reapply sunscreen every 2 hours outdoors.', 'Avoid friction and injury to skin, which can trigger new patches.', 'Discuss phototherapy options with a dermatologist.'],
  },
  'Acne Vulgaris': {
    summary: 'Pores are congested with oil and dead skin. Keep follicles clear without stripping the barrier.',
    use: ['Salicylic acid (BHA)', 'Niacinamide', 'Benzoyl peroxide', 'Adapalene'],
    avoid: ['Heavy oils', 'Over-washing', 'Picking', 'Comedogenic makeup'],
    tips: ['Introduce one active at a time and give it 6–8 weeks.', 'Change pillowcases twice a week.', 'Use a lightweight, non-comedogenic moisturiser even if oily.'],
  },
  'Contact Dermatitis': {
    summary: 'Something your skin touched triggered a reaction. Identify and remove the irritant while calming the area.',
    use: ['Centella asiatica', 'Panthenol', 'Ceramides', 'Zinc oxide'],
    avoid: ['Fragrance', 'Nickel jewellery', 'New products', 'Essential oils'],
    tips: ['Stop any product introduced in the last two weeks.', 'Patch-test new products on the inner arm for 48 hours.', 'Cool compresses help relieve itching.'],
  },
};

export const guideFor = disease => CONCERN_GUIDE[disease] || CONCERN_GUIDE['Eczema'];

/* ─── Products (generic formulations — no brand endorsement) ───── */
export const PRODUCTS = [
  { id: 'p1', name: 'Gentle Cream Cleanser',     category: 'Cleanser',    key: 'Glycerin',          tier: '₹',   types: ['Dry', 'Sensitive', 'Normal'],        concerns: ['Eczema', 'Contact Dermatitis', 'Psoriasis'] },
  { id: 'p2', name: 'Salicylic Gel Cleanser',    category: 'Cleanser',    key: 'BHA 0.5%',          tier: '₹',   types: ['Oily', 'Combination'],               concerns: ['Acne Vulgaris'] },
  { id: 'p3', name: 'Ceramide Barrier Cream',    category: 'Moisturiser', key: 'Ceramides NP/AP',   tier: '₹₹',  types: ['Dry', 'Sensitive', 'Normal', 'Combination'], concerns: ['Eczema', 'Psoriasis', 'Contact Dermatitis'] },
  { id: 'p4', name: 'Oil-free Gel Moisturiser',  category: 'Moisturiser', key: 'Hyaluronic acid',   tier: '₹₹',  types: ['Oily', 'Combination'],               concerns: ['Acne Vulgaris'] },
  { id: 'p5', name: 'Niacinamide 5% Serum',      category: 'Treatment',   key: 'Niacinamide',       tier: '₹₹',  types: ['Oily', 'Combination', 'Normal'],     concerns: ['Acne Vulgaris', 'Vitiligo'] },
  { id: 'p6', name: 'Urea 10% Body Lotion',      category: 'Treatment',   key: 'Urea',              tier: '₹₹',  types: ['Dry', 'Normal'],                     concerns: ['Psoriasis', 'Eczema'] },
  { id: 'p7', name: 'Mineral Sunscreen SPF 50',  category: 'Sun care',    key: 'Zinc oxide',        tier: '₹₹',  types: ['Sensitive', 'Dry', 'Normal', 'Combination', 'Oily'], concerns: ['Vitiligo', 'Contact Dermatitis', 'Eczema', 'Psoriasis', 'Acne Vulgaris'] },
  { id: 'p8', name: 'Centella Soothing Balm',    category: 'Treatment',   key: 'Centella asiatica', tier: '₹₹₹', types: ['Sensitive', 'Dry'],                  concerns: ['Contact Dermatitis', 'Eczema'] },
  { id: 'p9', name: 'Adapalene 0.1% Gel',        category: 'Treatment',   key: 'Retinoid',          tier: '₹₹',  types: ['Oily', 'Combination', 'Normal'],     concerns: ['Acne Vulgaris'] },
  { id: 'p10', name: 'Colloidal Oat Bath Soak',  category: 'Body',        key: 'Colloidal oatmeal', tier: '₹',   types: ['Dry', 'Sensitive'],                  concerns: ['Eczema', 'Psoriasis'] },
];

export function matchProducts(skinType, disease) {
  return PRODUCTS.map(p => {
    let m = 58;
    if (p.concerns.includes(disease)) m += 26;
    if (p.types.includes(skinType)) m += 12;
    if (p.category === 'Sun care') m += 4;
    return { ...p, match: Math.min(98, m) };
  }).sort((a, b) => b.match - a.match);
}

/* ─── Routine builder ──────────────────────────────────────────── */
export function buildRoutine(skinType = 'Normal', disease = 'Eczema') {
  const oily = ['Oily', 'Combination'].includes(skinType);
  const acne = disease === 'Acne Vulgaris';
  const barrier = ['Eczema', 'Psoriasis', 'Contact Dermatitis'].includes(disease);
  const am = [
    { id: 'am-cleanse', step: 'Cleanse',     product: oily || acne ? 'Salicylic Gel Cleanser' : 'Gentle Cream Cleanser', why: 'Removes overnight oil without stripping.' },
    { id: 'am-treat',   step: 'Treat',       product: acne ? 'Niacinamide 5% Serum' : disease === 'Vitiligo' ? 'Antioxidant Vitamin C Serum' : 'Hydrating Hyaluronic Serum', why: 'Targets your primary concern.' },
    { id: 'am-moist',   step: 'Moisturise',  product: oily ? 'Oil-free Gel Moisturiser' : 'Ceramide Barrier Cream', why: 'Supports your barrier through the day.' },
    { id: 'am-spf',     step: 'Protect',     product: 'Mineral Sunscreen SPF 50', why: 'UV is the #1 driver of damage and pigment change.' },
  ];
  const pm = [
    { id: 'pm-cleanse', step: 'Cleanse',     product: 'Gentle Cream Cleanser', why: 'Clears sunscreen and pollution gently.' },
    { id: 'pm-treat',   step: 'Treat',       product: acne ? 'Adapalene 0.1% Gel' : barrier ? 'Centella Soothing Balm' : 'Niacinamide 5% Serum', why: acne ? 'Keeps pores clear while you sleep.' : 'Calms and repairs overnight.' },
    { id: 'pm-moist',   step: 'Repair',      product: barrier ? 'Ceramide Barrier Cream (thick layer)' : oily ? 'Oil-free Gel Moisturiser' : 'Ceramide Barrier Cream', why: 'Night is when skin repairs fastest.' },
  ];
  if (disease === 'Psoriasis') pm.push({ id: 'pm-body', step: 'Body', product: 'Urea 10% Body Lotion', why: 'Softens scale on body plaques.' });
  if (disease === 'Eczema') pm.push({ id: 'pm-body', step: 'Body', product: 'Colloidal Oat Bath Soak (2–3× weekly)', why: 'Relieves itch and dryness.' });
  return { am, pm };
}

/* ─── Daily routine completion (per-day; cached locally, synced to the account) ─── */
const todayISO = () => new Date().toISOString().slice(0, 10);
const cacheKey = day => `sv_routine_${day}`;
const readCache = day => { try { return JSON.parse(localStorage.getItem(cacheKey(day))) || []; } catch { return []; } };
const writeCache = (day, steps) => { try { localStorage.setItem(cacheKey(day), JSON.stringify(steps)); } catch { /* storage unavailable */ } };

export function useRoutineLog() {
  const [day] = useState(todayISO);
  const [done, setDone] = useState(() => readCache(day));
  const doneRef = useRef(done);

  // Signed-in accounts: pull today's checklist from the server
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api.getRoutine(day)
      .then(steps => { if (!cancelled) { doneRef.current = steps; setDone(steps); writeCache(day, steps); } })
      .catch(() => { /* offline: keep the cached checklist */ });
    return () => { cancelled = true; };
  }, [day]);

  const toggle = useCallback(id => {
    const prev = doneRef.current;
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    doneRef.current = next;
    setDone(next);
    writeCache(day, next);
    if (getToken()) api.saveRoutine(day, next).catch(() => { /* cached locally; next toggle retries */ });
  }, [day]);

  return [done, toggle];
}

/* ─── Demo seed data ───────────────────────────────────────────── */
export function buildDemoDiagnoses() {
  const scores = [58, 61, 60, 66, 70, 73, 77, 81];
  const now = Date.now();
  return scores.map((s, i) => {
    const weeksAgo = scores.length - 1 - i;
    const conf = 0.93 - i * 0.035;
    const base = enrichDiagnosis({
      id: now - weeksAgo * 7 * 864e5,
      analysisId: `SVD-DEMO-${i}`,
      disease: 'Eczema',
      confidence: parseFloat(conf.toFixed(2)),
      risk: s < 65 ? 'moderate' : 'low',
      bodyRegion: 'Inner elbow',
      timestamp: new Date(now - weeksAgo * 7 * 864e5).toISOString(),
      modelVersion: 'SkinVeda-DINOv2-v2.1',
    });
    const lift = (s - base.skinScore);
    const metrics = Object.fromEntries(Object.entries(base.metrics).map(([k, v]) => [k, Math.max(30, Math.min(97, v + lift))]));
    return { ...base, skinScore: s, metrics };
  }).reverse();
}
