// api/client.js  -- PRESENTATION: thin fetch wrapper, attaches JWT
const BASE = 'http://localhost:3000/api';

function token() { return localStorage.getItem('token'); }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || JSON.stringify(err.errors) || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
};