// ============================================================
// SkinVeda.ai — scan records
// Normalises every stored scan to the v2 "visible concerns" shape,
// including records saved before the redesign (which used condition
// names like "Eczema"). Also builds the demo history.
// ============================================================
import { CONCERNS } from '../data/skincare.js';
import { MODEL_VERSION } from './analysis.js';

export const METRICS = [
  { key: 'hydration',    label: 'Hydration',    better: 'high', hint: 'How hydrated the skin looks' },
  { key: 'oiliness',     label: 'Oiliness',     better: 'mid',  hint: 'Visible shine; 30–55 is balanced' },
  { key: 'texture',      label: 'Texture',      better: 'high', hint: 'Smoothness; higher is smoother' },
  { key: 'pigmentation', label: 'Pigmentation', better: 'low',  hint: 'Visible dark spots; lower is more even' },
  { key: 'redness',      label: 'Redness',      better: 'low',  hint: 'Visible redness; lower is calmer' },
];

/** Plain-language reading of a metric value, plus whether it needs attention. */
export function readMetric(key, v) {
  const m = METRICS.find(x => x.key === key);
  if (!m) return { text: '', attention: false };
  if (m.better === 'mid') {
    if (v < 30) return { text: 'Low', attention: false };
    if (v <= 55) return { text: 'Balanced', attention: false };
    return { text: v >= 70 ? 'High' : 'Slightly high', attention: true };
  }
  const good = m.better === 'high' ? v : 100 - v;
  if (good >= 75) return { text: m.better === 'high' ? 'Good' : 'Low', attention: false };
  if (good >= 55) return { text: 'Fair', attention: false };
  return { text: m.better === 'high' ? 'Needs care' : 'Elevated', attention: true };
}

// Old condition-based records → visible concerns
const LEGACY_CONCERNS = {
  'Eczema': ['dryness', 'redness'],
  'Psoriasis': ['texture', 'redness'],
  'Vitiligo': ['pigmentation'],
  'Acne Vulgaris': ['acne', 'oiliness'],
  'Contact Dermatitis': ['redness', 'dryness'],
};

const severity = s => (s >= 70 ? 'noticeable' : s >= 45 ? 'moderate' : 'mild');

export function normalizeRecord(d) {
  if (!d) return d;
  if (d.version === 2 || (Array.isArray(d.concerns) && d.concerns[0]?.id && d.metrics && 'oiliness' in d.metrics)) {
    return { version: 2, escalation: { recommended: false, reasons: [] }, quality: [], ...d };
  }
  const old = d.metrics || {};
  const metrics = {
    hydration: old.hydration ?? 70,
    oiliness: old.oilBalance != null ? Math.max(10, 100 - old.oilBalance) : 40,
    texture: old.texture ?? 75,
    pigmentation: old.evenness != null ? Math.max(8, 100 - old.evenness) : 25,
    redness: old.barrier != null ? Math.max(8, 100 - old.barrier) : 25,
  };
  const ids = LEGACY_CONCERNS[d.disease] || ['dryness'];
  const base = Math.round((d.confidence || 0.7) * 80);
  const concerns = ids.map((id, i) => {
    const score = Math.max(25, base - i * 18);
    return { id, name: CONCERNS[id].label, score, severity: severity(score), confidence: d.confidence || 0.7, areas: CONCERNS[id].zones.slice(0, 1) };
  });
  return {
    ...d,
    version: 2,
    skinType: d.skinType || (metrics.oiliness > 55 ? 'Oily' : metrics.hydration < 58 ? 'Dry' : 'Combination'),
    skinScore: d.skinScore ?? 70,
    metrics,
    concerns,
    mainConcern: concerns[0].id,
    disease: concerns[0].name,
    summary: d.summary || `Your skin showed ${concerns.map(c => c.name.toLowerCase()).join(' and ')} in this earlier scan.`,
    escalation: { recommended: false, reasons: [] },
    quality: [],
  };
}

export const mainConcernOf = d => d?.concerns?.[0] || null;

/** Eight weekly demo scans showing gradual, realistic improvement. */
export function buildDemoAssessments(now = Date.now()) {
  const weeks = [
    { score: 58, acne: 72, oil: 76, pig: 48, red: 44, hyd: 62, tex: 58 },
    { score: 61, acne: 68, oil: 72, pig: 47, red: 40, hyd: 64, tex: 60 },
    { score: 60, acne: 70, oil: 70, pig: 46, red: 42, hyd: 63, tex: 61 },
    { score: 66, acne: 60, oil: 64, pig: 44, red: 36, hyd: 68, tex: 65 },
    { score: 70, acne: 54, oil: 60, pig: 41, red: 32, hyd: 71, tex: 68 },
    { score: 73, acne: 48, oil: 57, pig: 38, red: 28, hyd: 73, tex: 71 },
    { score: 77, acne: 41, oil: 54, pig: 35, red: 25, hyd: 76, tex: 74 },
    { score: 81, acne: 34, oil: 50, pig: 31, red: 22, hyd: 79, tex: 77 },
  ];
  return weeks.map((w, i) => {
    const weeksAgo = weeks.length - 1 - i;
    const ts = now - weeksAgo * 7 * 864e5;
    const concerns = [
      { id: 'acne', score: w.acne, areas: ['Chin', 'Forehead'] },
      { id: 'oiliness', score: w.oil, areas: ['Forehead', 'Nose'] },
      { id: 'pigmentation', score: w.pig, areas: ['Cheeks'] },
      { id: 'redness', score: w.red, areas: ['Cheeks'] },
    ].filter(c => c.score >= 25)
      .sort((a, b) => b.score - a.score)
      .map(c => ({ ...c, name: CONCERNS[c.id].label, severity: severity(c.score), confidence: 0.82 }));
    return {
      id: `demo-${i}`,
      version: 2,
      analysisId: `SVA-DEMO-${i}`,
      timestamp: new Date(ts).toISOString(),
      skinType: 'Combination',
      skinScore: w.score,
      confidence: 0.82,
      metrics: { hydration: w.hyd, oiliness: w.oil, texture: w.tex, pigmentation: w.pig, redness: w.red },
      concerns,
      mainConcern: concerns[0].id,
      disease: concerns[0].name,
      summary: `Your skin appears combination with ${concerns[0].severity} ${concerns[0].name.toLowerCase()} on the chin and forehead, and ${concerns[1] ? concerns[1].severity + ' ' + concerns[1].name.toLowerCase() : 'no other strong concerns'}.`,
      escalation: { recommended: false, reasons: [] },
      quality: [],
      modelVersion: MODEL_VERSION,
      bodyRegion: 'Face',
    };
  }).reverse();
}
