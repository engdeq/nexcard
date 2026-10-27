const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('nexacard_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body }),

  getQrStats: () => request('/qr/stats/summary'),
  listQr: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/qr${q ? `?${q}` : ''}`);
  },
  getQr: (id) => request(`/qr/${id}`),
  createQr: (body) => request('/qr', { method: 'POST', body }),
  updateQr: (id, body) => request(`/qr/${id}`, { method: 'PUT', body }),
  deleteQr: (id) => request(`/qr/${id}`, { method: 'DELETE' }),
  previewQr: (body) => request('/qr/preview', { method: 'POST', body }),

  getProfileStats: () => request('/profiles/stats/summary'),
  listProfiles: () => request('/profiles/my'),
  getProfile: (id) => request(`/profiles/${id}`),
  createProfile: (body) => request('/profiles', { method: 'POST', body }),
  updateProfileCard: (id, body) => request(`/profiles/${id}`, { method: 'PUT', body }),
  deleteProfile: (id) => request(`/profiles/${id}`, { method: 'DELETE' }),
  getPublicProfile: (slug) => request(`/public/profiles/${slug}`),

  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/upload', { method: 'POST', body: form });
  },

  listAds: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/ads${q ? `?${q}` : ''}`);
  },
  listActiveAds: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/ads/active${q ? `?${q}` : ''}`);
  },
  createAd: (body) => request('/ads', { method: 'POST', body }),
  updateAd: (id, body) => request(`/ads/${id}`, { method: 'PUT', body }),
  deleteAd: (id) => request(`/ads/${id}`, { method: 'DELETE' }),
};

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
  return `${base}${path}`;
}
