const DEFAULT_BASE = '/api';

function normalizePath(path) {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
}

/** Une base + path sin duplicar segmentos (p. ej. /api + /api/foo → /api/foo). */
export function resolveApiUrl(path) {
  const rawBase = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;
  const normalizedPath = normalizePath(path);

  if (/^https?:\/\//i.test(rawBase)) {
    const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
    return new URL(normalizedPath.replace(/^\//, ''), base).toString();
  }

  const base = rawBase.replace(/\/+$/, '') || DEFAULT_BASE;
  if (normalizedPath === base || normalizedPath.startsWith(`${base}/`)) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;

function authHeaders() {
  const token = localStorage.getItem('hostal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(resolveApiUrl(path), {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...extraHeaders,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
  return data;
}

export const authAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (nombre, email, password, documento) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password, documento }),
    }),
  me: () => request('/auth/me'),
};

export const habitacionesAPI = {
  getDisponibles: (checkin, checkout) => {
    const params = new URLSearchParams({ checkin, checkout });
    return request(`/habitaciones/disponibles?${params}`);
  },
  getTipos: () => request('/habitaciones/tipos'),
  getTiposAdmin: () => request('/habitaciones/tipos/admin'),
  createTipo: (data) =>
    request('/habitaciones/tipos', { method: 'POST', body: JSON.stringify(data) }),
  updateTipo: (id, data) =>
    request(`/habitaciones/tipos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTipo: (id) => request(`/habitaciones/tipos/${id}`, { method: 'DELETE' }),
  getUnidades: (tipoId) => request(`/habitaciones/tipos/${tipoId}/unidades`),
  createUnidad: (tipoId, data) =>
    request(`/habitaciones/tipos/${tipoId}/unidades`, { method: 'POST', body: JSON.stringify(data) }),
  updateUnidad: (id, data) =>
    request(`/habitaciones/unidades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUnidad: (id) => request(`/habitaciones/unidades/${id}`, { method: 'DELETE' }),
};

export const reservasAPI = {
  create: (payload) =>
    request('/reservas', { method: 'POST', body: JSON.stringify(payload) }),
  getByCodigo: (codigo) => request(`/reservas/${codigo}`),
  getAll: () => request('/reservas'),
  getMias: () => request('/reservas/mis'),
  getById: (id) => request(`/reservas/${id}`),
  cancel: (id, motivo) =>
    request(`/reservas/${id}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ motivo }),
    }),
  updateStatus: (id, status) =>
    request(`/reservas/${id}/estado`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const clientesAPI = {
  getAll: () => request('/clientes'),
};

export const empleadosAPI = {
  getAll: () => request('/empleados'),
  promover: (clienteId, rol = 'admin') =>
    request(`/empleados/promover/${clienteId}`, {
      method: 'POST',
      body: JSON.stringify({ rol }),
    }),
  updateEstado: (id, estado) =>
    request(`/empleados/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),
};

export const statsAPI = {
  getDashboard: () => request('/stats/dashboard'),
  getIngresos: (desde, hasta) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const qs = params.toString();
    return request(`/stats/ingresos${qs ? `?${qs}` : ''}`);
  },
  getCancelaciones: (desde, hasta) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const qs = params.toString();
    return request(`/stats/cancelaciones${qs ? `?${qs}` : ''}`);
  },
};

export const hotelAPI = {
  get: () => request('/hotel'),
  getPublic: () => request('/hotel/public'),
  update: (data) => request('/hotel', { method: 'PUT', body: JSON.stringify(data) }),
};
