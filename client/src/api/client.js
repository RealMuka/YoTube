const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'youtube_jwt';
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
async function request(path, options = {}) {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token)
        headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (response.status === 204)
        return undefined;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok)
        throw new ApiError(payload.error || payload.message || `Ошибка запроса (${response.status})`, response.status);
    return payload;
}
export const api = {
    auth: {
        getToken: () => localStorage.getItem(TOKEN_KEY),
        clear: () => localStorage.removeItem(TOKEN_KEY),
        async login(email, password) {
            const result = await request('/auth/login', {
                method: 'POST', body: JSON.stringify({ email, password })
            });
            localStorage.setItem(TOKEN_KEY, result.token);
            return result.user;
        },
        async register(name, email, password) {
            const result = await request('/auth/register', {
                method: 'POST', body: JSON.stringify({ name, email, password })
            });
            localStorage.setItem(TOKEN_KEY, result.token);
            return result.user;
        },
        async me() {
            const result = await request('/auth/me');
            return result.user;
        }
    },
    workspaces: {
        async list() { return request('/workspaces'); },
        async create(name) { return request('/workspaces', { method: 'POST', body: JSON.stringify({ name }) }); },
        remove(id) { return request(`/workspaces/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
    },
    materials: {
        async list(params = {}) {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => { if (value)
                query.set(key, value); });
            const suffix = query.toString() ? `?${query.toString()}` : '';
            return request(`/materials${suffix}`);
        },
        async create(data) {
            return request('/materials', {
                method: 'POST', body: JSON.stringify(data)
            });
        },
        async update(id, data) {
            return request(`/materials/${encodeURIComponent(id)}`, {
                method: 'PUT', body: JSON.stringify(data)
            });
        },
        remove(id) {
            return request(`/materials/${encodeURIComponent(id)}`, { method: 'DELETE' });
        }
    },
    conflicts: {
        async list(status = 'pending', workspaceId) {
            const query = new URLSearchParams({ status });
            if (workspaceId)
                query.set('workspaceId', workspaceId);
            return request(`/conflicts?${query.toString()}`);
        },
        resolve(id) {
            return request(`/conflicts/${encodeURIComponent(id)}/resolve`, { method: 'PATCH' });
        },
        reschedule(id, materialId, scheduledAt) {
            return request(`/conflicts/${encodeURIComponent(id)}/reschedule`, {
                method: 'PATCH', body: JSON.stringify({ materialId, scheduledAt })
            });
        }
    },
    media: {
        async list() { return request('/media'); },
        async upload(file) {
            const form = new FormData();
            form.append('file', file);
            return request('/media', { method: 'POST', body: form });
        },
        remove(id) { return request(`/media/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
    }
};
export function assetUrl(url) {
    if (/^https?:\/\//i.test(url))
        return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    const configuredBase = import.meta.env.VITE_ASSET_BASE_URL;
    if (configuredBase)
        return `${configuredBase.replace(/\/$/, '')}${path}`;
    // In development Vite proxies uploads to the API; in production use the same origin by default.
    return import.meta.env.DEV ? `http://localhost:5000${path}` : path;
}
