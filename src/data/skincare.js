// ============================================================
// SkinVeda.ai — skincare knowledge base
// Educational, non-medical language only ("may help", never "cures").
// ============================================================

export const SKIN_TYPES = ['Oily', 'Combination', 'Normal', 'Dry', 'Sensitive'];

// Visible concerns the scan can estimate. `zones` are the face areas shown on the map.
export const CONCERNS = {
  acne: {
    label: 'Acne-like spots',
    short: 'Small raised or inflamed spots, often where pores get congested.',
    ingredients: ['salicylic', 'niacinamide', 'azelaic', 'benzoyl', 'retinoid'],
    zones: ['Forehead', 'Cheeks', 'Chin'],
  },
  pigmentation: {
    label: 'Pigmentation & dark spots',
    short: 'Areas that look darker than the surrounding skin, such as marks left after spots or sun exposure.',
    ingredients: ['sunscreen', 'vitaminC', 'niacinamide', 'azelaic', 'arbutin'],
    zones: ['Cheeks', 'Forehead', 'Upper lip'],
  },
  dryness: {
    label: 'Dryness',
    short: 'Skin that looks dull, flaky or tight, often from a weakened moisture barrier.',
    ingredients: ['ceramides', 'hyaluronic', 'panthenol'],
    zones: ['Cheeks', 'Around the mouth'],
  },
  oiliness: {
    label: 'Excess oiliness',
    short: 'A visible shine, usually strongest across the T-zone.',
    ingredients: ['niacinamide', 'salicylic'],
    zones: ['Forehead', 'Nose', 'Chin'],
  },
  redness: {
    label: 'Redness',
    short: 'Pink or red areas that can come from irritation, sensitivity or inflammation.',
    ingredients: ['centella', 'azelaic', 'panthenol', 'niacinamide'],
    zones: ['Cheeks', 'Nose'],
  },
  texture: {
    label: 'Uneven texture',
    short: 'Visible roughness, bumps or enlarged-looking pores.',
    ingredients: ['lactic', 'salicylic', 'retinoid'],
    zones: ['Cheeks', 'Nose', 'Forehead'],
  },
  darkCircles: {
    label: 'Dark circles',
    short: 'Darker or shadowed skin under the eyes; sleep, genetics and pigmentation all play a part.',
    ingredients: ['caffeine', 'vitaminC', 'sunscreen'],
    zones: ['Under eyes'],
  },
  fineLines: {
    label: 'Fine lines',
    short: 'Shallow lines that become more visible with dryness and sun exposure over time.',
    ingredients: ['sunscreen', 'retinoid', 'peptides', 'hyaluronic'],
    zones: ['Forehead', 'Around the eyes'],
  },
};

export const INGREDIENTS = {
  niacinamide: {
    name: 'Niacinamide',
    mayHelp: 'May help support oil control and improve the look of uneven tone and enlarged-looking pores.',
    skinTypes: ['Oily', 'Combination', 'Normal', 'Dry'],
    usage: 'Morning and/or night after cleansing. 2–5% is usually enough; higher strengths are not always better.',
    precautions: 'Occasionally causes flushing or stinging at high strengths — start low if your skin is reactive.',
  },
  salicylic: {
    name: 'Salicylic acid (BHA)',
    mayHelp: 'Oil-soluble exfoliant commonly used for clogged pores and acne-prone skin.',
    skinTypes: ['Oily', 'Combination'],
    usage: '0.5–2%, as a cleanser daily or a leave-on 2–3 nights a week to start.',
    precautions: 'Can be drying. Avoid layering with other strong exfoliants the same night. Ask a doctor before use if pregnant.',
    careful: ['Dry', 'Sensitive'],
  },
  ceramides: {
    name: 'Ceramides',
    mayHelp: 'Support the skin barrier, helping it hold on to moisture.',
    skinTypes: ['Dry', 'Sensitive', 'Normal', 'Combination', 'Oily'],
    usage: 'In a moisturiser, morning and night.',
    precautions: 'Generally well tolerated.',
  },
  hyaluronic: {
    name: 'Hyaluronic acid',
    mayHelp: 'A humectant that draws water into the skin, helping it look plumper and less tight.',
    skinTypes: ['Dry', 'Normal', 'Combination', 'Oily', 'Sensitive'],
    usage: 'Apply to slightly damp skin, then seal with a moisturiser.',
    precautions: 'In very dry air, always follow with a moisturiser.',
  },
  vitaminC: {
    name: 'Vitamin C',
    mayHelp: 'An antioxidant that may help brighten dullness and the look of dark spots over time.',
    skinTypes: ['Normal', 'Combination', 'Oily', 'Dry'],
    usage: 'Mornings, under sunscreen. Start with a lower strength (around 10%).',
    precautions: 'Pure L-ascorbic acid can sting sensitive skin; gentler derivatives exist. Store away from light.',
    careful: ['Sensitive'],
  },
  azelaic: {
    name: 'Azelaic acid',
    mayHelp: 'May help with the look of redness, spots and uneven tone; often suits sensitive skin.',
    skinTypes: ['Sensitive', 'Combination', 'Oily', 'Normal', 'Dry'],
    usage: '10% over-the-counter, once daily; build up slowly.',
    precautions: 'Can tingle for the first couple of weeks.',
  },
  sunscreen: {
    name: 'Broad-spectrum sunscreen (SPF 30+)',
    mayHelp: 'Protects against UV, which worsens dark spots, redness and signs of ageing.',
    skinTypes: ['Oily', 'Combination', 'Normal', 'Dry', 'Sensitive'],
    usage: 'Every morning as the last step; reapply every 2–3 hours outdoors.',
    precautions: 'Mineral (zinc oxide) formulas are often better tolerated by sensitive skin.',
  },
  centella: {
    name: 'Centella asiatica',
    mayHelp: 'A soothing plant extract often used to calm the look of irritated skin.',
    skinTypes: ['Sensitive', 'Dry', 'Normal', 'Combination', 'Oily'],
    usage: 'In a serum or moisturiser, morning or night.',
    precautions: 'Patch-test first if you react to plant extracts.',
  },
  lactic: {
    name: 'Lactic acid (AHA)',
    mayHelp: 'A gentle exfoliant that may smooth rough texture and dullness.',
    skinTypes: ['Normal', 'Dry', 'Combination'],
    usage: '5–10%, 1–2 nights a week to start.',
    precautions: 'Increases sun sensitivity — use sunscreen daily. Do not combine with retinoids on the same night.',
    careful: ['Sensitive'],
  },
  retinoid: {
    name: 'Retinoids (retinol / adapalene)',
    mayHelp: 'Commonly used for acne-prone skin, texture and fine lines by encouraging cell turnover.',
    skinTypes: ['Oily', 'Combination', 'Normal'],
    usage: 'Pea-sized amount, 2–3 nights a week at first, building up slowly.',
    precautions: 'Avoid during pregnancy or breastfeeding unless a doctor advises. Expect some dryness at first; always wear sunscreen.',
    careful: ['Sensitive', 'Dry'],
  },
  benzoyl: {
    name: 'Benzoyl peroxide',
    mayHelp: 'Commonly used as a spot treatment for inflamed, acne-like spots.',
    skinTypes: ['Oily', 'Combination'],
    usage: '2.5% is often as effective as higher strengths; apply thinly to spots.',
    precautions: 'Can bleach fabrics and dry the skin.',
    careful: ['Sensitive', 'Dry'],
  },
  caffeine: {
    name: 'Caffeine (eye products)',
    mayHelp: 'May temporarily reduce the look of puffiness and shadows under the eyes.',
    skinTypes: ['Oily', 'Combination', 'Normal', 'Dry', 'Sensitive'],
    usage: 'Tap a small amount under the eyes, morning and night.',
    precautions: 'Keep away from the eye itself.',
  },
  peptides: {
    name: 'Peptides',
    mayHelp: 'Support skin that looks firmer and smoother; generally gentle.',
    skinTypes: ['Normal', 'Dry', 'Combination', 'Sensitive', 'Oily'],
    usage: 'In a serum or moisturiser, morning or night.',
    precautions: 'Generally well tolerated.',
  },
  panthenol: {
    name: 'Panthenol (vitamin B5)',
    mayHelp: 'Hydrating and soothing; helps the skin feel comfortable.',
    skinTypes: ['Dry', 'Sensitive', 'Normal', 'Combination', 'Oily'],
    usage: 'Morning and night in serums or moisturisers.',
    precautions: 'Generally well tolerated.',
  },
  arbutin: {
    name: 'Alpha arbutin',
    mayHelp: 'May help fade the look of dark spots gradually.',
    skinTypes: ['Normal', 'Combination', 'Oily', 'Dry'],
    usage: '1–2%, once or twice daily, with daily sunscreen.',
    precautions: 'Results take 8–12 weeks; patch-test first.',
  },
};

export const concernLabel = id => CONCERNS[id]?.label || id;
