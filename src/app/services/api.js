//export const API_BASE = `${import.meta.env.VITE_API_PROXY_TARGET}/api`;
export const API_BASE = `https://hjl-nodejs.onrender.com/api`;

function authHeaders() {
  const token = localStorage.getItem('hostal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  console.log(API_BASE);
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
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
