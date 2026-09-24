// ============================================================
// SkinVeda.ai — catalogue service (products & dermatologists)
// Async on purpose: swap the sample arrays for API / Supabase
// calls here without touching any screen.
// ============================================================
import { PRODUCTS } from '../data/products.js';
import { DOCTORS, upcomingSlots } from '../data/doctors.js';
import { INGREDIENTS, CONCERNS } from '../data/skincare.js';

export const IS_SAMPLE_CATALOGUE = true;

const byText = (q, ...fields) => !q || fields.some(f => String(f).toLowerCase().includes(q.toLowerCase()));

// ── Products ─────────────────────────────────────────────────
export async function listProducts(f = {}) {
  return PRODUCTS.filter(p =>
    (!f.skinType || p.skinTypes.includes(f.skinType)) &&
    (!f.concern || p.concerns.includes(f.concern)) &&
    (!f.category || p.category === f.category) &&
    (!f.ingredient || p.keyIngredients.includes(f.ingredient)) &&
    (!f.brand || p.brand === f.brand) &&
    (!f.maxPrice || p.price <= f.maxPrice) &&
    byText(f.query, p.name, p.brand, p.category, ...p.keyIngredients.map(i => INGREDIENTS[i]?.name)));
}

export async function getProduct(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

export const brandsOf = () => [...new Set(PRODUCTS.map(p => p.brand))].sort();

/**
 * Why this product may suit this person — plain language, no efficacy claims.
 * Returns null when there is no meaningful match.
 */
export function explainMatch(product, skinType, concernIds = []) {
  const matched = concernIds.filter(c => product.concerns.includes(c)).slice(0, 2);
  const typeOk = skinType && product.skinTypes.includes(skinType);
  if (!matched.length && !typeOk) return null;
  const concernText = listJoin(matched.map(c => CONCERNS[c].label.toLowerCase()));
  const why = matched.length
    ? `your scan shows ${typeOk ? `${skinType.toLowerCase()} skin with ` : ''}visible ${concernText}`
    : `it is formulated for ${skinType.toLowerCase()} skin`;
  // Explain the ingredient most relevant to the matched concern
  const leadId = product.keyIngredients.find(i => matched.some(c => CONCERNS[c].ingredients.includes(i))) || product.keyIngredients[0];
  const lead = INGREDIENTS[leadId];
  return `Suggested because ${why}. It contains ${lead.short}, which ${lead.reason}.`;
}

const listJoin = xs => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/**
 * Rank products for a person. Sponsored products are NEVER ranked by
 * SkinVeda's recommendation logic; they are returned separately and labelled.
 */
export async function recommendProducts({ skinType, concerns = [], budget, limit = 6 } = {}) {
  const scored = PRODUCTS.filter(p => !p.sponsored && (!budget || p.price <= budget)).map(p => {
    let score = 0;
    concerns.forEach((c, i) => { if (p.concerns.includes(c)) score += Math.max(1, 4 - i) * 10; });
    if (skinType && p.skinTypes.includes(skinType)) score += 12;
    if (skinType && !p.skinTypes.includes(skinType)) score -= 20;
    if (p.category === 'Sunscreen') score += 8; // everyone benefits
    return { product: p, score, reason: explainMatch(p, skinType, concerns) };
  }).filter(r => r.score > 0 && r.reason).sort((a, b) => b.score - a.score);

  // One per category first, so suggestions cover a routine rather than 4 serums
  const seen = new Set(), picked = [];
  for (const r of scored) { if (!seen.has(r.product.category)) { seen.add(r.product.category); picked.push(r); } }
  for (const r of scored) { if (picked.length >= limit) break; if (!picked.includes(r)) picked.push(r); }
  return picked.slice(0, limit);
}

export async function sponsoredProducts({ skinType, concerns = [] } = {}) {
  return PRODUCTS.filter(p => p.sponsored && (
    !skinType || p.skinTypes.includes(skinType) || concerns.some(c => p.concerns.includes(c))));
}

export async function alternativesFor(product, limit = 3) {
  return PRODUCTS.filter(p => p.id !== product.id && !p.sponsored &&
    (p.category === product.category || p.keyIngredients.some(i => product.keyIngredients.includes(i))))
    .slice(0, limit);
}

// ── Dermatologists ───────────────────────────────────────────
export async function listDoctors(f = {}) {
  const now = new Date();
  return DOCTORS.filter(d =>
    (!f.expertise || d.expertise.includes(f.expertise)) &&
    (!f.mode || d.modes.includes(f.mode)) &&
    (!f.minExperience || d.experience >= f.minExperience) &&
    (!f.language || d.languages.includes(f.language)) &&
    (!f.city || d.city === f.city || (f.city === 'Online' && d.modes.some(m => m !== 'clinic'))) &&
    (!f.availableSoon || upcomingSlots(d, 1, now)[0]?.getTime() - now.getTime() < 3 * 864e5) &&
    byText(f.query, d.name, d.specialization, d.city, ...d.expertise));
}

export async function getDoctor(id) {
  return DOCTORS.find(d => d.id === id) || null;
}

export const doctorFilterOptions = () => ({
  languages: [...new Set(DOCTORS.flatMap(d => d.languages))].sort(),
  cities: [...new Set(DOCTORS.map(d => d.city))].sort(),
});

/** Map visible concerns to the most relevant dermatologist expertise. */
export const expertiseFor = concernId => ({
  acne: 'Acne & acne scars', pigmentation: 'Pigmentation', redness: 'Sensitive skin & rosacea',
  dryness: 'Eczema & dermatitis', texture: 'Acne & acne scars', fineLines: 'Cosmetic dermatology',
  darkCircles: 'Cosmetic dermatology', oiliness: 'Acne & acne scars',
}[concernId] || null);
