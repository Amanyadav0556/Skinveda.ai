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

async function post(path, payload, fallback) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error('Cannot reach the SkinVeda server. Is the backend running on port 8000?');
    }
    if (!res.ok) throw new Error(await errorMessage(res, fallback));
    return res.json();
}

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
};
