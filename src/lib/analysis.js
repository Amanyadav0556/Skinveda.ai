// ============================================================
// SkinVeda.ai — skin assessment engine (preview)
//
// This is NOT a medical model. It measures simple, explainable properties
// of the photo (colour, brightness, local contrast) per face zone and turns
// them into visible-concern estimates. Results are deterministic for a
// given photo. Replace `extractFeatures` with a trained model's output
// later; `interpret` stays the same.
// ============================================================
import { CONCERNS } from '../data/skincare.js';

export const MODEL_VERSION = 'SkinVeda Vision preview (image heuristics)';

const clamp01 = v => Math.max(0, Math.min(1, v));
const round = v => Math.round(v);

// Face zones as fractions of the (centre-cropped) photo
const ZONES = {
  'Forehead':         [0.25, 0.08, 0.75, 0.28],
  'Under eyes':       [0.20, 0.38, 0.80, 0.47],
  'Nose':             [0.43, 0.40, 0.57, 0.62],
  'Cheeks':           [[0.12, 0.45, 0.38, 0.70], [0.62, 0.45, 0.88, 0.70]],
  'Around the mouth': [0.30, 0.68, 0.70, 0.80],
  'Chin':             [0.35, 0.80, 0.65, 0.95],
};

const inRect = (x, y, r) => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const zoneOf = (x, y) => {
  for (const [name, rect] of Object.entries(ZONES)) {
    const rects = Array.isArray(rect[0]) ? rect : [rect];
    if (rects.some(r => inRect(x, y, r))) return name;
  }
  return null;
};

// YCbCr skin rule — works across light and deep skin tones
const isSkin = (r, g, b) => {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
};

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not read this photo'));
  img.src = src;
});

/** Measure the photo. Returns plain numbers so `interpret` can be tested without a browser. */
export async function extractFeatures(src) {
  const img = await loadImage(src);
  const N = 160;
  // Centre square crop — faces are usually centred in selfies
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = N; canvas.height = N;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, sx, sy, side, side, 0, 0, N, N);
  const { data } = ctx.getImageData(0, 0, N, N);

  const L = new Float32Array(N * N), skin = new Uint8Array(N * N), red = new Float32Array(N * N), sat = new Float32Array(N * N);
  let skinCount = 0, sumL = 0, sumL2 = 0, sumRed = 0;
  for (let i = 0; i < N * N; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    L[i] = l; red[i] = r / (g + 1); sat[i] = mx ? (mx - mn) / mx : 0;
    if (isSkin(r, g, b)) { skin[i] = 1; skinCount++; sumL += l; sumL2 += l * l; sumRed += red[i]; }
  }
  const skinFrac = skinCount / (N * N);
  const n = Math.max(1, skinCount);
  const meanL = sumL / n, stdL = Math.sqrt(Math.max(0, sumL2 / n - meanL * meanL)), meanRed = sumRed / n;

  // Per-pixel flags on skin, tallied per zone
  const zones = {};
  let contrastSum = 0, contrastN = 0, hi = 0, dark = 0, redSpot = 0, satSum = 0;
  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) {
      const i = y * N + x;
      if (!skin[i]) continue;
      const lc = (Math.abs(L[i] - L[i - 1]) + Math.abs(L[i] - L[i + 1]) + Math.abs(L[i] - L[i - N]) + Math.abs(L[i] - L[i + N])) / 4;
      contrastSum += lc; contrastN++; satSum += sat[i];
      const isHi = L[i] > meanL + 1.8 * stdL && sat[i] < 0.25;   // specular shine
      const isDark = L[i] < meanL - 1.6 * stdL;                    // darker patches
      const isRed = red[i] > meanRed * 1.12;                        // redder than the person's own average
      hi += isHi; dark += isDark; redSpot += isRed;
      const z = zoneOf(x / N, y / N);
      if (z) {
        const zs = (zones[z] ||= { n: 0, hi: 0, dark: 0, red: 0, L: 0 });
        zs.n++; zs.hi += isHi; zs.dark += isDark; zs.red += isRed; zs.L += L[i];
      }
    }
  }
  const m = Math.max(1, contrastN);
  for (const z of Object.values(zones)) { z.hi /= z.n; z.dark /= z.n; z.red /= z.n; z.L /= z.n; }

  return {
    size: Math.min(img.naturalWidth, img.naturalHeight),
    skinFrac, meanL, stdL, meanRed,
    contrast: contrastSum / m, meanSat: satSum / m,
    hiFrac: hi / m, darkFrac: dark / m, redFrac: redSpot / m,
    zones,
  };
}

const severityFor = s => (s >= 70 ? 'noticeable' : s >= 45 ? 'moderate' : 'mild');
export const SEVERITY_LABEL = { mild: 'Mild', moderate: 'Moderate', noticeable: 'Noticeable' };

function topZones(zones, key, allowed, count = 2) {
  return Object.entries(zones)
    .filter(([name, z]) => allowed.includes(name) && z.n > 20)
    .sort((a, b) => b[1][key] - a[1][key])
    .slice(0, count)
    .map(([name]) => name);
}

/**
 * Turn measurements (+ optional self-reported answers) into an assessment.
 * answers: { feel: 'tight'|'comfortable'|'tzone'|'oily', reactive: bool, worsening: bool, unusualSpot: bool }
 */
export function interpret(f, answers = {}) {
  const quality = [];
  if (f.skinFrac < 0.22) quality.push('We could not see much skin in this photo. Try a closer, front-facing photo.');
  if (f.meanL < 70) quality.push('The photo looks quite dark. Face a window or a soft light.');
  if (f.meanL > 215) quality.push('The photo looks over-exposed. Avoid direct flash or harsh light.');
  if (f.contrast < 1.6) quality.push('The photo may be blurry. Hold the camera steady and tap to focus.');
  if (f.size < 320) quality.push('The photo is small. A higher-resolution photo gives better results.');

  // Normalised concern signals, 0..1
  const fTex = clamp01((f.contrast - 2.5) / 9);
  const fOil = clamp01(f.hiFrac / 0.05);
  const fRed = clamp01((f.redFrac - 0.08) / 0.22);
  const fPig = clamp01(f.darkFrac / 0.07);
  const fDull = clamp01((0.30 - f.meanSat) / 0.2) * 0.5 + clamp01((140 - f.meanL) / 90) * 0.5;
  const fDry = clamp01(0.6 * fDull + 0.4 * fTex * (1 - fOil));
  const eye = f.zones['Under eyes'], cheek = f.zones['Cheeks'];
  // The under-eye area is naturally a little shadowed, so ignore the first ~12 levels of difference
  const fDark = eye && cheek ? clamp01((cheek.L - eye.L - 12) / 30) : 0;
  const fAcne = clamp01(fRed * 0.6 + fTex * 0.4 - 0.15);
  const fLines = clamp01(fTex * 0.55 - 0.1);

  // Self-reported feel nudges the estimates (people know their skin)
  const oilBias = { tight: -0.25, comfortable: -0.05, tzone: 0.15, oily: 0.3 }[answers.feel] || 0;
  const dryBias = { tight: 0.3, comfortable: -0.05, tzone: 0, oily: -0.2 }[answers.feel] || 0;
  const oil = clamp01(fOil + oilBias), dry = clamp01(fDry + dryBias);

  const signals = {
    acne: fAcne, pigmentation: fPig, dryness: dry, oiliness: oil,
    redness: clamp01(fRed + (answers.reactive ? 0.1 : 0)), texture: fTex, darkCircles: fDark, fineLines: fLines,
  };

  const zoneKey = { acne: 'red', pigmentation: 'dark', oiliness: 'hi', redness: 'red', texture: 'red', dryness: 'dark', darkCircles: 'dark', fineLines: 'dark' };
  const confidenceBase = clamp01(0.86 - quality.length * 0.12 - (f.skinFrac < 0.22 ? 0.2 : 0));

  const concerns = Object.entries(signals)
    .map(([id, s]) => {
      const score = round(s * 100);
      return {
        id, name: CONCERNS[id].label, score, severity: severityFor(score),
        confidence: Number((confidenceBase * (0.75 + 0.25 * s)).toFixed(2)),
        areas: topZones(f.zones, zoneKey[id], CONCERNS[id].zones),
      };
    })
    .filter(c => c.score >= 25)
    .sort((a, b) => b.score - a.score);

  const metrics = {
    hydration: round(92 - dry * 50),
    oiliness: round(15 + oil * 75),
    texture: round(94 - fTex * 50),
    pigmentation: round(8 + fPig * 72),
    redness: round(8 + signals.redness * 72),
  };

  // Skin type: combine measured oil/dryness with what the user told us
  let skinType = 'Normal';
  if (answers.reactive) skinType = 'Sensitive';  // only when the user says so; redness alone is not a skin type
  else if (metrics.oiliness >= 62) skinType = 'Oily';
  else if (metrics.oiliness >= 45 && metrics.hydration < 75) skinType = 'Combination';
  else if (metrics.oiliness >= 45) skinType = 'Combination';
  else if (metrics.hydration < 58) skinType = 'Dry';
  if (answers.feel === 'tzone' && skinType === 'Normal') skinType = 'Combination';
  if (answers.feel === 'tight' && skinType === 'Normal') skinType = 'Dry';

  const burden = 0.25 * fAcne + 0.2 * fPig + 0.15 * signals.redness + 0.15 * dry + 0.1 * fTex + 0.1 * Math.abs(oil - 0.35) + 0.05 * fDark;
  const skinScore = Math.max(35, Math.min(97, round(97 - burden * 85)));
  const confidence = Number(confidenceBase.toFixed(2));

  // When to suggest a dermatologist — never a diagnosis
  const reasons = [];
  const strongInflammation = concerns.find(c => (c.id === 'acne' || c.id === 'redness') && c.score >= 80);
  if (strongInflammation) reasons.push(`${strongInflammation.name} looks extensive in this photo.`);
  if (answers.worsening) reasons.push('You mentioned this has been getting worse quickly.');
  if (answers.unusualSpot) reasons.push('You mentioned a spot that is painful, bleeding or changing.');
  if (confidence < 0.55) reasons.push('Our AI assessment is uncertain for this photo.');

  return {
    version: 2,
    skinType,
    skinScore,
    confidence,
    metrics,
    concerns,
    mainConcern: concerns[0]?.id || null,
    summary: confidence < 0.4
      ? 'We could not assess this photo reliably. A clearer, well-lit photo will give you a better report.'
      : summarise(skinType, concerns),
    reliable: confidence >= 0.4,
    escalation: { recommended: reasons.length > 0, reasons },
    quality,
    modelVersion: MODEL_VERSION,
  };
}

const areaPhrase = a => ({ 'Under eyes': 'under the eyes', 'Around the mouth': 'around the mouth' }[a] || `on the ${a.toLowerCase()}`);

function summarise(skinType, concerns) {
  const type = skinType === 'Combination' ? 'combination' : skinType.toLowerCase();
  if (!concerns.length) return `Your skin appears ${type} and balanced, with no strong visible concerns in this photo.`;
  const describe = c => {
    const where = c.areas.length ? ` ${c.areas.map(areaPhrase).join(' and ')}` : '';
    return `${c.severity === 'noticeable' ? '' : c.severity + ' '}${c.name.toLowerCase()}${where}`;
  };
  const parts = concerns.slice(0, 2).map(describe);
  return `Your skin appears ${type} with ${parts.join(', and ')}.`;
}

/** Full pipeline used by the Scan page. */
export async function analyzeSkin(imageDataUrl, answers) {
  const features = await extractFeatures(imageDataUrl);
  return {
    ...interpret(features, answers),
    analysisId: `SVA-${Date.now().toString(36).toUpperCase()}`,
    bodyRegion: 'Face',
  };
}
