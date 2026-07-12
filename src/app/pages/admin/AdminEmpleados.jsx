import React, { useState, useEffect, useCallback } from 'react';
import { empleadosAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

const ROL_LABEL = {
  admin: 'Admin',
  gerente: 'Gerente',
  recepcion: 'Recepción',
  limpieza: 'Limpieza',
};

const mapEmpleado = (e) => ({
  id: e.id_empleado,
  nombre: e.nombre,
  email: e.email,
  telefono: e.telefono,
  rol: e.rol,
  estado: e.estado,
  createdAt: e.created_at,
});

export function AdminEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actualizando, setActualizando] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await empleadosAPI.getAll();
      setEmpleados((res.data || []).map(mapEmpleado));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggleEstado = async (empleado) => {
    const nuevoEstado = empleado.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'inactivo' ? 'desactivar' : 'activar';

    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${empleado.nombre}?`)) {
      return;
    }

    try {
      setActualizando(empleado.id);
      await empleadosAPI.updateEstado(empleado.id, nuevoEstado);
      setEmpleados((prev) =>
        prev.map((e) => (e.id === empleado.id ? { ...e, estado: nuevoEstado } : e))
      );
    } catch (err) {
      alert(err.message || 'No se pudo actualizar el estado');
    } finally {
      setActualizando(null);
    }
  };

  const filtered = empleados.filter(
    (e) =>
      (e.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Empleados</h1>
        <p className="text-gray-400 text-sm">{empleados.length} empleados registrados</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="relative">
          <span className="material-icons absolute text-gray-300 text-xl left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 pl-11 pr-3.5 py-3"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Empleado', 'Email', 'Teléfono', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h) => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const activo = e.estado === 'activo';
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                    <td className="px-3 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm bg-blue-50 text-[#1e3a5f] shrink-0">
                          {(e.nombre || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm max-w-[180px]">
                      <span className="break-all">{e.email}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{e.telefono || '—'}</td>
                    <td className="px-3 sm:px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 bg-blue-50 text-[#1e3a5f] capitalize">
                        {ROL_LABEL[e.rol] || e.rol}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 ${
                          activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      <button
                        type="button"
                        disabled={actualizando === e.id}
                        onClick={() => toggleEstado(e)}
                        className={`inline-flex items-center gap-1 text-xs font-bold rounded-xl transition-colors px-3 py-2 whitespace-nowrap disabled:opacity-60 ${
                          activo
                            ? 'border border-red-100 text-red-500 hover:bg-red-50'
                            : 'border border-green-100 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <span className="material-icons text-sm">
                          {activo ? 'person_off' : 'person_add'}
                        </span>
                        {actualizando === e.id ? '...' : activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <span className="material-icons text-gray-200 text-5xl">badge</span>
              <p className="text-gray-300 text-sm mt-3">No se encontraron empleados</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
