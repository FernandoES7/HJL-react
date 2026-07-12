import React, { useState, useEffect, useCallback } from 'react';
import { clientesAPI, empleadosAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

const mapCliente = (c, emailsEmpleado) => ({
  id: c.id_cliente,
  name: c.nombre,
  email: c.email,
  telefono: c.telefono,
  documento: c.documento,
  reservas: Number(c.total_reservas ?? 0),
  createdAt: c.fecha_registro || c.created_at,
  esEmpleado: emailsEmpleado.has(c.email),
});

export function AdminUsuarios() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [promoviendo, setPromoviendo] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [resClientes, resEmpleados] = await Promise.all([
        clientesAPI.getAll(),
        empleadosAPI.getAll(),
      ]);
      const emailsEmpleado = new Set((resEmpleados.data || []).map((e) => e.email));
      setClientes((resClientes.data || []).map((c) => mapCliente(c, emailsEmpleado)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleRolChange = async (cliente, nuevoRol) => {
    if (nuevoRol === 'cliente' || cliente.esEmpleado) return;

    if (!window.confirm(`¿Convertir a ${cliente.name} en administrador? Podrá acceder al panel admin con su email y contraseña actual.`)) {
      return;
    }

    try {
      setPromoviendo(cliente.id);
      await empleadosAPI.promover(cliente.id, 'admin');
      await cargar();
    } catch (err) {
      alert(err.message || 'No se pudo promover al cliente');
    } finally {
      setPromoviendo(null);
    }
  };

  const filtered = clientes.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Clientes</h1>
        <p className="text-gray-400 text-sm">{clientes.length} clientes registrados</p>
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
                {['Cliente', 'Email', 'Teléfono', 'Documento', 'Reservas', 'Registro', 'Acciones'].map((h) => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <td className="px-3 sm:px-5 py-4 min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm bg-gray-100 text-gray-500 shrink-0">
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm max-w-[180px]">
                    <span className="break-all">{c.email}</span>
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{c.telefono || '—'}</td>
                  <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{c.documento || '—'}</td>
                  <td className="px-3 sm:px-5 py-4 text-center text-gray-500 font-bold">{c.reservas}</td>
                  <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <select
                      value={c.esEmpleado ? 'admin' : 'cliente'}
                      disabled={c.esEmpleado || promoviendo === c.id}
                      onChange={(e) => handleRolChange(c, e.target.value)}
                      className="border border-gray-200 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] px-3 py-2 min-w-[120px] disabled:opacity-60"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <span className="material-icons text-gray-200 text-5xl">person_off</span>
              <p className="text-gray-300 text-sm mt-3">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
