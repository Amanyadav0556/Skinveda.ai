// ============================================================
// SkinVeda.ai — Mock Data & AI Simulation Engine
// ============================================================

export const DISEASES = [
  {
    id: 'eczema',
    name: 'Eczema',
    subtitle: 'Atopic Dermatitis',
    emoji: '🔴',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    description: 'Eczema (atopic dermatitis) is a chronic inflammatory skin condition causing itchy, inflamed, and cracked skin. It often appears in childhood and can persist into adulthood.',
    triggers: ['Stress', 'Dry weather', 'Allergens', 'Irritants', 'Sweat'],
    symptoms: ['Intense itching', 'Dry, scaly skin', 'Red or brownish-gray patches', 'Small, raised bumps', 'Thickened, cracked skin'],
    treatments: ['Moisturize regularly with fragrance-free creams', 'Use mild, unscented soaps', 'Apply prescribed corticosteroid creams', 'Avoid known triggers', 'Take antihistamines for itching'],
    prevalence: '31.6M people in the US',
    severeRisk: 'moderate',
  },
  {
    id: 'psoriasis',
    name: 'Psoriasis',
    subtitle: 'Chronic Autoimmune',
    emoji: '🟠',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #eab308)',
    description: 'Psoriasis is a chronic autoimmune condition causing rapid skin cell buildup, forming scales and red patches that can be itchy and sometimes painful.',
    triggers: ['Stress', 'Cold weather', 'Infections', 'Certain medications', 'Smoking'],
    symptoms: ['Red patches covered with silvery scales', 'Dry, cracked skin', 'Burning or soreness', 'Thickened, pitted nails', 'Swollen, stiff joints'],
    treatments: ['Topical corticosteroids', 'Vitamin D analogues', 'Light therapy (phototherapy)', 'Biologic medications', 'Retinoids'],
    prevalence: '8M people in the US',
    severeRisk: 'moderate',
  },
  {
    id: 'vitiligo',
    name: 'Vitiligo',
    subtitle: 'Depigmentation Disorder',
    emoji: '⚪',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    description: 'Vitiligo is a condition where skin loses its pigment cells (melanocytes), causing discolored patches in different areas of the body.',
    triggers: ['UV exposure', 'Stress', 'Skin trauma', 'Autoimmune factors'],
    symptoms: ['Patchy loss of skin color', 'Premature whitening of hair', 'Loss of color inside the mouth', 'Loss of or change in color of the retina'],
    treatments: ['Topical corticosteroids', 'Calcineurin inhibitors', 'Light therapy', 'Skin grafting', 'Depigmentation therapy'],
    prevalence: '2-3M people in the US',
    severeRisk: 'low',
  },
  {
    id: 'acne',
    name: 'Acne Vulgaris',
    subtitle: 'Common Skin Condition',
    emoji: '🟡',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #10b981)',
    description: 'Acne vulgaris is a common skin condition that occurs when hair follicles become plugged with oil and dead skin cells, causing pimples, blackheads, or whiteheads.',
    triggers: ['Hormonal changes', 'Certain medications', 'Diet (dairy, high glycemic)', 'Stress', 'Oily/comedogenic products'],
    symptoms: ['Whiteheads', 'Blackheads', 'Pimples', 'Large solid lumps (nodules)', 'Painful, pus-filled lumps (cysts)'],
    treatments: ['Topical retinoids (tretinoin)', 'Benzoyl peroxide', 'Salicylic acid', 'Antibiotics', 'Isotretinoin for severe cases'],
    prevalence: '50M people in the US',
    severeRisk: 'low',
  },
  {
    id: 'dermatitis',
    name: 'Contact Dermatitis',
    subtitle: 'Allergic Skin Reaction',
    emoji: '🟤',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    description: 'Contact dermatitis is a red, itchy rash caused by direct contact with a substance that triggers an allergic reaction or irritates the skin.',
    triggers: ['Detergents', 'Jewelry', 'Cosmetics', 'Plants (poison ivy)', 'Medications'],
    symptoms: ['Red rash', 'Itching, burning sensation', 'Dry, cracked skin', 'Blisters', 'Swelling'],
    treatments: ['Avoid contact with irritants', 'Topical corticosteroids', 'Cool compresses', 'Oral antihistamines', 'Calamine lotion'],
    prevalence: '15M people per year in the US',
    severeRisk: 'low',
  },
];

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', score: 9, color: '#f59e0b' },
  { id: 'calm', label: 'Calm', emoji: '😌', score: 7, color: '#10b981' },
  { id: 'sad', label: 'Sad', emoji: '😢', score: 3, color: '#3b82f6' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', score: 2, color: '#a78bfa' },
  { id: 'stressed', label: 'Stressed', emoji: '😤', score: 2, color: '#ef4444' },
  { id: 'angry', label: 'Angry', emoji: '😠', score: 1, color: '#f97316' },
];

export const AI_INSIGHTS = [
  { icon: '🔬', title: 'Pattern Detected', message: 'Your skin flare-ups increase by 42% during high-stress periods. Consider stress-reduction techniques.', type: 'warning' },
  { icon: '🌤️', title: 'Environmental Alert', message: 'Dry air (humidity < 40%) correlates with increased eczema severity in your history. Use a humidifier.', type: 'info' },
  { icon: '📈', title: 'Progress Update', message: 'Skin condition improved by 18% this month based on AI analysis of your weekly photos.', type: 'success' },
  { icon: '💡', title: 'UV Risk', message: 'High UV index forecasted this week. Apply SPF 50+ sunscreen, especially if you have vitiligo.', type: 'warning' },
  { icon: '🧘', title: 'Wellness Tip', message: 'Your mood scores are highest on days you report exercise. Physical activity correlates with better skin outcomes.', type: 'success' },
  { icon: '🌙', title: 'Sleep Correlation', message: 'On nights with < 6 hours sleep, your next-day stress score increases by 60%, which may worsen skin symptoms.', type: 'warning' },
];

export const SOLACE_RESPONSES = {
  stressed: [
    "I can hear that you're feeling stressed. Stress is a known trigger for many skin conditions. Let's try a quick 4-7-8 breathing exercise: breathe in for 4 counts, hold for 7, exhale for 8. Shall we try it together?",
    "Stress and skin are deeply connected. When cortisol spikes, it can trigger inflammation that worsens conditions like eczema and psoriasis. You're not alone in this. What's been causing your stress lately?",
  ],
  sad: [
    "I'm really sorry you're feeling sad. Living with a chronic skin condition can be emotionally exhausting, and it's completely valid to feel down sometimes. Would you like to talk about what you're experiencing?",
    "Sadness is a natural response to dealing with something as challenging as a chronic skin condition. Remember that your skin doesn't define your worth. Have you been able to connect with anyone who understands what you're going through?",
  ],
  anxious: [
    "Anxiety about your skin is so understandable. Many people with chronic skin conditions experience health anxiety. Let's ground ourselves — name 5 things you can see around you right now.",
    "I hear your anxiety. Remember that managing a skin condition is a marathon, not a sprint. Small, consistent steps lead to progress. What one small thing can you do today for your skin health?",
  ],
  flare: [
    "Flare-ups are frustrating, but they're a normal part of managing chronic skin conditions. Let's identify possible triggers: Have there been changes in your stress levels, diet, or weather exposure recently?",
    "I understand how discouraging a flare-up can be. Let's document this in your tracker so we can identify patterns. In the meantime, avoid scratching, keep the area moisturized, and consider a cool compress for relief.",
  ],
  good: [
    "It's wonderful to hear you're feeling good! Positive emotional states have actually been shown to support skin healing. Keep track of what you did today — it might reveal helpful patterns for your skin health.",
    "That's great! Your mood and skin health are interconnected. Days like today are worth documenting. What contributed to feeling good today?",
  ],
  default: [
    "I'm Solace, your AI mental health companion. I'm here to support you through your skin health journey. Managing a chronic skin condition affects your whole wellbeing — physical, emotional, and social. How are you feeling today?",
    "Thank you for sharing that with me. Your experiences matter, and so does your emotional wellbeing. Skin conditions like eczema, psoriasis, and vitiligo can take a real toll. I'm here to listen and help.",
    "Living with a chronic skin condition is a complex journey. Research shows that mental health care is just as important as dermatological treatment. I'm here to support both. What's on your mind?",
  ],
};

export const ENV_DATA = {
  current: {
    city: 'New Delhi',
    country: 'IN',
    temperature: 34,
    humidity: 52,
    aqi: 87,
    uvIndex: 8.2,
    weather: 'Partly Cloudy',
    weatherIcon: '⛅',
    windSpeed: 14,
    feelsLike: 38,
    visibility: 7,
    pressure: 1008,
  },
  alerts: [
    { type: 'warning', icon: '☀️', title: 'High UV Index (8.2)', message: 'Extreme UV exposure today. Apply SPF 50+ every 2 hours. Vitiligo patients: avoid peak sun 10AM-4PM.' },
    { type: 'info', icon: '💧', title: 'Low Humidity', message: 'Humidity at 52% — borderline for eczema/psoriasis patients. Apply moisturizer frequently.' },
    { type: 'error', icon: '🌫️', title: 'Air Quality: Moderate (87 AQI)', message: 'Moderate air pollution detected. Outdoor exercise may worsen dermatitis symptoms. Consider wearing a mask.' },
  ],
  forecast: [
    { day: 'Mon', icon: '☀️', high: 36, low: 26, uv: 9, humidity: 48 },
    { day: 'Tue', icon: '⛅', high: 34, low: 25, uv: 7, humidity: 55 },
    { day: 'Wed', icon: '🌧️', high: 28, low: 22, uv: 3, humidity: 80 },
    { day: 'Thu', icon: '🌧️', high: 26, low: 21, uv: 2, humidity: 85 },
    { day: 'Fri', icon: '⛅', high: 30, low: 23, uv: 5, humidity: 65 },
    { day: 'Sat', icon: '☀️', high: 33, low: 25, uv: 8, humidity: 50 },
    { day: 'Sun', icon: '☀️', high: 35, low: 27, uv: 9, humidity: 46 },
  ],
};

export const SAMPLE_DIAGNOSES = [
  { disease: 'Eczema', confidence: 0.89, risk: 'moderate', bodyRegion: 'Inner elbow', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { disease: 'Psoriasis', confidence: 0.76, risk: 'moderate', bodyRegion: 'Scalp', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

export const SAMPLE_MOODS = [
  { mood: 'calm', score: 7, notes: 'Had a good day', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'stressed', score: 2, notes: 'Work deadlines causing stress', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'happy', score: 9, notes: 'Great skin day!', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'anxious', score: 3, notes: 'Worried about flare-up', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'calm', score: 6, notes: '', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'happy', score: 8, notes: 'Skin improving!', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'sad', score: 3, notes: 'Bad flare-up', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// AI Diagnosis simulation
export async function simulateAIDiagnosis(imageData) {
  await new Promise(r => setTimeout(r, 3500));
  const diseases = ['Eczema', 'Psoriasis', 'Acne Vulgaris', 'Contact Dermatitis', 'Vitiligo'];
  const disease = diseases[Math.floor(Math.random() * diseases.length)];
  const confidence = 0.72 + Math.random() * 0.24;
  const risks = { 'Eczema': 'moderate', 'Psoriasis': 'moderate', 'Acne Vulgaris': 'low', 'Contact Dermatitis': 'low', 'Vitiligo': 'low' };
  const diseaseFull = DISEASES.find(d => d.name === disease || d.name.includes(disease.split(' ')[0]));
  const bodyRegions = ['Forearm', 'Inner elbow', 'Back of knee', 'Neck', 'Cheek', 'Chin', 'Scalp', 'Wrist', 'Ankle', 'Chest'];

  return {
    disease,
    confidence: parseFloat(confidence.toFixed(2)),
    risk: risks[disease] || 'moderate',
    description: diseaseFull?.description || 'AI has detected signs consistent with this skin condition.',
    recommendations: diseaseFull?.treatments?.slice(0, 4) || [],
    symptoms: diseaseFull?.symptoms?.slice(0, 4) || [],
    triggers: diseaseFull?.triggers?.slice(0, 3) || [],
    bodyRegion: bodyRegions[Math.floor(Math.random() * bodyRegions.length)],
    modelVersion: 'SkinVeda-DINOv2-v2.1',
    analysisId: 'SVD-' + Date.now().toString(36).toUpperCase(),
  };
}

// Solace AI response
export function getSolaceResponse(message) {
  const lower = message.toLowerCase();
  if (/stress|overwhelm|pressure|burnout/.test(lower)) return SOLACE_RESPONSES.stressed[Math.floor(Math.random() * SOLACE_RESPONSES.stressed.length)];
  if (/sad|depress|unhappy|down|crying|cry/.test(lower)) return SOLACE_RESPONSES.sad[Math.floor(Math.random() * SOLACE_RESPONSES.sad.length)];
  if (/anxious|anxiety|worry|worried|panic|fear/.test(lower)) return SOLACE_RESPONSES.anxious[Math.floor(Math.random() * SOLACE_RESPONSES.anxious.length)];
  if (/flare|worse|bad|itching|itch|pain|hurt/.test(lower)) return SOLACE_RESPONSES.flare[Math.floor(Math.random() * SOLACE_RESPONSES.flare.length)];
  if (/good|great|better|happy|fine|improve|well/.test(lower)) return SOLACE_RESPONSES.good[Math.floor(Math.random() * SOLACE_RESPONSES.good.length)];
  return SOLACE_RESPONSES.default[Math.floor(Math.random() * SOLACE_RESPONSES.default.length)];
}

export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(iso);
}
