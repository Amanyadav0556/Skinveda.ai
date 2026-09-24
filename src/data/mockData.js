// ============================================================
// SkinVeda.ai — Mock Data & AI Simulation Engine
// ============================================================

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', score: 9, color: '#f59e0b' },
  { id: 'calm', label: 'Calm', emoji: '😌', score: 7, color: '#10b981' },
  { id: 'sad', label: 'Sad', emoji: '😢', score: 3, color: '#3b82f6' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', score: 2, color: '#a78bfa' },
  { id: 'stressed', label: 'Stressed', emoji: '😤', score: 2, color: '#ef4444' },
  { id: 'angry', label: 'Angry', emoji: '😠', score: 1, color: '#f97316' },
];

// General mind–skin guidance (no personal statistics are implied)
export const AI_INSIGHTS = [
  { icon: 'heart', title: 'Stress and skin', message: 'Stress can make skin feel more reactive and breakouts more likely for some people. Short, regular wind-down breaks can help.', type: 'info' },
  { icon: 'moon', title: 'Sleep matters', message: 'Skin does much of its repair overnight. A regular sleep routine supports how your skin looks and feels.', type: 'info' },
  { icon: 'sun', title: 'Weather changes', message: 'Dry air can leave skin feeling tight; heat and humidity can make it shinier. Adjust moisturiser texture with the season.', type: 'info' },
  { icon: 'trend', title: 'Spot your patterns', message: 'Logging mood alongside weekly scans can help you notice what tends to come before good and bad skin days.', type: 'success' },
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

export const SAMPLE_MOODS = [
  { mood: 'calm', score: 7, notes: 'Had a good day', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'stressed', score: 2, notes: 'Work deadlines causing stress', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'happy', score: 9, notes: 'Great skin day!', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'anxious', score: 3, notes: 'Worried about flare-up', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'calm', score: 6, notes: '', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'happy', score: 8, notes: 'Skin improving!', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { mood: 'sad', score: 3, notes: 'Bad flare-up', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

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
