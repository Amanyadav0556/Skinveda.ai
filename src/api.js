const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Turn any FastAPI error body into a readable message.
async function errorMessage(res, fallback) {
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON body, e.g. "Internal Server Error" */ }
    const detail = body?.detail;
    if (Array.isArray(detail)) {
        // Pydantic validation errors: [{ loc: ['body', 'email'], msg: '...' }]
        return detail.map(d => {
            const field = d.loc?.[d.loc.length - 1];
            const msg = (d.msg || '').replace(/^Value error, /, '');
            return field ? `${field}: ${msg}` : msg;
        }).join(' · ');
    }
    if (typeof detail === 'string') return detail;
    if (res.status >= 500) return `Server error (${res.status}). Check the backend terminal for details.`;
    return fallback;
}

export const getToken = () => {
    try { return localStorage.getItem('sv_token'); } catch { return null; }
};

// Fired when the server rejects our token, so the app can sign the user out.
export const UNAUTHORIZED_EVENT = 'sv:unauthorized';

async function request(method, path, payload, fallback = 'Request failed') {
    const token = getToken();
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: payload !== undefined ? JSON.stringify(payload) : undefined,
        });
    } catch {
        throw new Error('Cannot reach the SkinVeda server. Is the backend running on port 8000?');
    }
    if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    if (!res.ok) throw new Error(await errorMessage(res, fallback));
    return res.status === 204 ? null : res.json();
}

const post = (path, payload, fallback) => request('POST', path, payload, fallback);

// Backend returns snake_case; the app uses camelCase.
export function toAppUser(u = {}) {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        age: u.age ?? '',
        gender: u.gender ?? '',
        location: u.location ?? '',
        skinCondition: u.skin_condition ?? u.skinCondition ?? '',
        skinType: u.skin_type ?? u.skinType ?? '',
        role: u.role || 'user',
        streak: u.streak || 1,
        joinedAt: u.joined_at ?? u.joinedAt,
    };
}

export function toAppDiagnosis(d = {}) {
    return {
        id: d.id,
        disease: d.disease,
        confidence: d.confidence,
        risk: d.risk_level,
        description: d.description,
        recommendations: d.recommendations || [],
        symptoms: d.symptoms || [],
        triggers: d.triggers || [],
        bodyRegion: d.body_region,
        notes: d.notes,
        skinScore: d.skin_score ?? undefined,
        metrics: d.metrics && Object.keys(d.metrics).length ? d.metrics : undefined,
        concerns: d.concerns?.length ? d.concerns : undefined,
        imageData: d.image_data || d.image_url || null,
        modelVersion: d.ai_model_version,
        analysisId: d.analysis_id,
        timestamp: d.timestamp,
    };
}

const toApiDiagnosis = (d) => ({
    disease: d.disease,
    confidence: d.confidence,
    risk_level: d.risk || null,
    description: d.description || null,
    recommendations: d.recommendations || [],
    symptoms: d.symptoms || [],
    triggers: d.triggers || [],
    body_region: d.bodyRegion || null,
    notes: d.notes || null,
    skin_score: d.skinScore ?? null,
    metrics: d.metrics || {},
    concerns: d.concerns || [],
    image_data: d.imageData || null,
    model_version: d.modelVersion || null,
    analysis_id: d.analysisId || null,
});

function saveToken(data) {
    try { if (data?.access_token) localStorage.setItem('sv_token', data.access_token); } catch { /* storage unavailable */ }
}

export const api = {
    login: async (credentials) => {
        const data = await post('/auth/login', credentials, 'Login failed');
        saveToken(data);
        return { ...data, user: toAppUser(data.user) };
    },

    register: async (userData) => {
        const data = await post('/auth/register', userData, 'Registration failed');
        saveToken(data);
        return { ...data, user: toAppUser(data.user) };
    },

    // ── Mood ───────────────────────────────────────────────────────
    listMoods: async () => (await request('GET', '/mood/', undefined, 'Could not load mood history')).moods,
    addMood: (log) => request('POST', '/mood/', {
        mood: log.mood, score: log.score, notes: log.notes || null, tags: log.tags || [],
    }, 'Could not save mood'),
    clearMoods: () => request('DELETE', '/mood/', undefined, 'Could not clear mood history'),

    // ── Skin analyses ──────────────────────────────────────────────
    listDiagnoses: async () =>
        (await request('GET', '/diagnosis/history?limit=100', undefined, 'Could not load analyses')).diagnoses.map(toAppDiagnosis),
    saveDiagnosis: async (d) =>
        toAppDiagnosis(await request('POST', '/diagnosis/records', toApiDiagnosis(d), 'Could not save analysis')),
    clearDiagnoses: () => request('DELETE', '/diagnosis/', undefined, 'Could not clear analyses'),
};
