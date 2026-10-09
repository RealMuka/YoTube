const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'youtube_jwt';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({})) as { error?: string; message?: string } & T;
  if (!response.ok) throw new ApiError(payload.error || payload.message || `Ошибка запроса (${response.status})`, response.status);
  return payload;
}

export const api = {
  auth: {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    clear: () => localStorage.removeItem(TOKEN_KEY),
    async login(email: string, password: string) {
      const result = await request<{ token: string; user: ApiUser }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password })
      });
      localStorage.setItem(TOKEN_KEY, result.token);
      return result.user;
    },
    async register(name: string, email: string, password: string) {
      const result = await request<{ token: string; user: ApiUser }>('/auth/register', {
        method: 'POST', body: JSON.stringify({ name, email, password })
      });
      localStorage.setItem(TOKEN_KEY, result.token);
      return result.user;
    },
    async me() {
      const result = await request<{ user: ApiUser }>('/auth/me');
      return result.user;
    }
  },
  materials: {
    async list(params: { status?: string; platform?: string; q?: string } = {}) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
      const suffix = query.toString() ? `?${query.toString()}` : '';
      return request<{ items: ApiMaterial[]; count: number }>(`/materials${suffix}`);
    },
    async create(data: MaterialPayload) {
      return request<{ item: ApiMaterial; hasConflict: boolean; conflicts: ApiConflict[] }>('/materials', {
        method: 'POST', body: JSON.stringify(data)
      });
    },
    async update(id: string, data: MaterialPayload) {
      return request<{ item: ApiMaterial; hasConflict: boolean; conflicts: ApiConflict[] }>(`/materials/${encodeURIComponent(id)}`, {
        method: 'PUT', body: JSON.stringify(data)
      });
    },
    remove(id: string) {
      return request<void>(`/materials/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  },
  conflicts: {
    async list(status: 'pending' | 'resolved' | 'all' = 'pending') {
      return request<{ items: ApiConflict[]; count: number }>(`/conflicts?status=${status}`);
    },
    resolve(id: string) {
      return request<{ item: ApiConflict }>(`/conflicts/${encodeURIComponent(id)}/resolve`, { method: 'PATCH' });
    },
    reschedule(id: string, materialId: string, scheduledAt: string) {
      return request<{ item: ApiConflict }>(`/conflicts/${encodeURIComponent(id)}/reschedule`, {
        method: 'PATCH', body: JSON.stringify({ materialId, scheduledAt })
      });
    }
  },
  media: {
    async list() { return request<{ items: ApiMedia[]; count: number }>('/media'); },
    async upload(file: File) {
      const form = new FormData(); form.append('file', file);
      return request<{ item: ApiMedia }>('/media', { method: 'POST', body: form });
    },
    remove(id: string) { return request<void>(`/media/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  }
};

export interface ApiUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  createdAt: string;
}

export interface ApiMaterial {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published';
  uiStatus?: string;
  scheduledAt?: string | null;
  media?: Array<string | ApiMedia>;
  author: ApiUser | string;
  createdAt: string;
  updatedAt: string;
  channelId?: string;
  workspaceId?: string;
  category?: string;
  coverImage?: string;
  tags?: string[];
}

export interface ApiConflict {
  id?: string;
  _id?: string;
  materials: ApiMaterial[];
  reason: string;
  status: 'pending' | 'resolved';
  detectedAt: string;
}

export interface ApiMedia {
  id?: string;
  _id?: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  author: ApiUser | string;
  createdAt: string;
  usedIn?: string[];
}

export type MaterialPayload = {
  title: string;
  description?: string;
  platform: string;
  status: string;
  uiStatus?: string;
  scheduledAt?: string | null;
  channelId?: string;
  workspaceId?: string;
  category?: string;
  coverImage?: string;
  tags?: string[];
  media?: string[];
};

export function assetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  const configuredBase = import.meta.env.VITE_ASSET_BASE_URL as string | undefined;
  if (configuredBase) return `${configuredBase.replace(/\/$/, '')}${path}`;
  // In development Vite proxies uploads to the API; in production use the same origin by default.
  return import.meta.env.DEV ? `http://localhost:5000${path}` : path;
}
