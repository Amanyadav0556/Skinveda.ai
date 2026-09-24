// ============================================================
// SkinVeda.ai — personalised routine builder
// Input: skin type + visible concerns (from a scan or profile).
// Output: AM/PM steps that explain why, what to look for, how often and precautions.
// ============================================================
import { INGREDIENTS } from '../data/skincare.js';

const step = (id, stepName, title, ingredient, why, frequency, precaution) => ({
  id, step: stepName, title, ingredient, lookFor: INGREDIENTS[ingredient]?.name, why, frequency,
  precaution: precaution ?? INGREDIENTS[ingredient]?.precautions,
});

/**
 * @param {string} skinType  'Oily' | 'Combination' | 'Normal' | 'Dry' | 'Sensitive'
 * @param {string[]} concerns concern ids ordered by priority (most visible first)
 */
export function buildRoutine(skinType = 'Normal', concerns = []) {
  const has = id => concerns.includes(id);
  const oily = skinType === 'Oily' || skinType === 'Combination';
  const sensitive = skinType === 'Sensitive' || has('redness');
  const dry = skinType === 'Dry' || has('dryness');
  const primary = concerns.find(c => c !== 'oiliness' && c !== 'dryness') || concerns[0];

  // ── Morning ────────────────────────────────────────────────
  const am = [];
  am.push(oily && !sensitive
    ? step('am-cleanse', 'Cleanse', 'Gentle gel cleanser', 'salicylic',
        'Lifts overnight oil so pores stay clearer through the day.',
        'Every morning', 'Choose a low-strength (0.5–1%) salicylic cleanser, or a plain gentle gel if your skin feels tight.')
    : step('am-cleanse', 'Cleanse', 'Gentle, non-foaming cleanser', 'ceramides',
        'Cleans without stripping moisture from dry or sensitive skin.',
        'Every morning (a splash of water is fine for very dry skin)', 'Avoid harsh foaming cleansers and hot water.'));

  if (has('pigmentation') && !sensitive) {
    am.push(step('am-treat', 'Treat', 'Antioxidant serum', 'vitaminC',
      'May help brighten dullness and the look of dark spots, and pairs well with sunscreen.', 'Every morning'));
  } else if (oily || has('acne') || has('redness')) {
    am.push(step('am-treat', 'Treat', 'Niacinamide serum', 'niacinamide',
      'May help support oil control and improve the look of uneven tone.', 'Every morning'));
  } else {
    am.push(step('am-treat', 'Hydrate', 'Hydrating serum', 'hyaluronic',
      'Draws water into the skin so it feels more comfortable.', 'Every morning'));
  }

  am.push(oily && !dry
    ? step('am-moist', 'Moisturise', 'Lightweight gel moisturiser', 'hyaluronic',
        'Oily skin still needs hydration — a light gel avoids a heavy feel.', 'Every morning', 'Look for "non-comedogenic" on the label.')
    : step('am-moist', 'Moisturise', 'Barrier cream', 'ceramides',
        'Helps the skin hold on to moisture through the day.', 'Every morning'));

  am.push(step('am-spf', 'Protect', 'Broad-spectrum sunscreen, SPF 30+', 'sunscreen',
    'UV makes dark spots, redness and fine lines more visible — this is the most important step.',
    'Every morning, reapply every 2–3 hours outdoors'));

  // ── Night ──────────────────────────────────────────────────
  const pm = [];
  pm.push(step('pm-cleanse', 'Cleanse', 'Gentle cleanser', 'ceramides',
    'Removes sunscreen, sweat and pollution from the day.', 'Every night',
    'If you wear heavy makeup or water-resistant sunscreen, cleanse twice.'));

  const treat = {
    acne: sensitive
      ? step('pm-treat', 'Treat', 'Azelaic acid', 'azelaic', 'A gentler option for acne-like spots on reactive skin.', 'Every other night to start, then nightly if comfortable')
      : step('pm-treat', 'Treat', 'Salicylic acid (BHA) serum', 'salicylic', 'Commonly used for clogged pores and acne-like spots.', '2–3 nights a week to start'),
    pigmentation: step('pm-treat', 'Treat', 'Azelaic acid or alpha arbutin', 'azelaic', 'May help fade the look of dark spots gradually.', 'Nightly, building up slowly'),
    redness: step('pm-treat', 'Soothe', 'Centella or panthenol serum', 'centella', 'Soothing ingredients that may calm the look of redness.', 'Nightly'),
    texture: sensitive || dry
      ? step('pm-treat', 'Treat', 'Gentle lactic acid (AHA)', 'lactic', 'May smooth rough texture with a gentle exfoliant.', '1 night a week to start')
      : step('pm-treat', 'Treat', 'Lactic acid (AHA)', 'lactic', 'May smooth rough texture and dullness.', '1–2 nights a week'),
    fineLines: sensitive
      ? step('pm-treat', 'Treat', 'Peptide serum', 'peptides', 'A gentle option that supports firmer-looking skin.', 'Nightly')
      : step('pm-treat', 'Treat', 'Retinol (start low)', 'retinoid', 'Commonly used to soften the look of fine lines over time.', '2 nights a week to start'),
    darkCircles: step('pm-treat', 'Treat', 'Caffeine eye serum', 'caffeine', 'May reduce the look of puffiness and shadows.', 'Nightly (and mornings if you like)'),
    dryness: step('pm-treat', 'Hydrate', 'Hydrating serum', 'hyaluronic', 'Adds water back into dry-looking skin.', 'Nightly'),
    oiliness: step('pm-treat', 'Balance', 'Niacinamide serum', 'niacinamide', 'May help balance oil over time.', 'Nightly'),
  }[primary];
  if (treat) pm.push(treat);

  pm.push(step('pm-moist', 'Repair', dry || sensitive ? 'Rich barrier cream' : 'Moisturiser', 'ceramides',
    'Night is when skin repairs fastest — seal in the treatment step.', 'Every night'));

  const tips = [
    'Introduce one new product at a time and give it 4–6 weeks.',
    'Patch-test new products on your inner arm or jawline for 48 hours.',
    'Avoid using exfoliating acids and retinoids on the same night.',
  ];
  if (has('acne')) tips.push('Try not to pick or squeeze spots — it can leave marks that last longer than the spot.');

  return { am, pm, tips };
}

/** Ingredients to recommend and to use carefully, for this skin. */
export function ingredientPlan(skinType, concerns = []) {
  const counts = {};
  concerns.forEach((c, i) => {
    const weight = Math.max(1, 4 - i); // earlier (more visible) concerns count more
    (INGREDIENT_MAP[c] || []).forEach(ing => { counts[ing] = (counts[ing] || 0) + weight; });
  });
  counts.sunscreen = (counts.sunscreen || 0) + 5; // everyone
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const careful = ranked.filter(id => INGREDIENTS[id]?.careful?.includes(skinType));
  const recommended = ranked.filter(id => !careful.includes(id)).slice(0, 6);
  return { recommended, careful };
}

// Mirrors CONCERNS[x].ingredients, kept here to avoid a circular import
const INGREDIENT_MAP = {
  acne: ['salicylic', 'niacinamide', 'azelaic', 'benzoyl', 'retinoid'],
  pigmentation: ['sunscreen', 'vitaminC', 'niacinamide', 'azelaic', 'arbutin'],
  dryness: ['ceramides', 'hyaluronic', 'panthenol'],
  oiliness: ['niacinamide', 'salicylic'],
  redness: ['centella', 'azelaic', 'panthenol', 'niacinamide'],
  texture: ['lactic', 'salicylic', 'retinoid'],
  darkCircles: ['caffeine', 'vitaminC', 'sunscreen'],
  fineLines: ['sunscreen', 'retinoid', 'peptides', 'hyaluronic'],
};
