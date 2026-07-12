import React, { useState, useEffect, useMemo } from 'react';
import { hotelAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

const mapHotel = (h) => ({
  id: h.id_hotel,
  nombre: h.nombre || '',
  direccion: h.direccion || '',
  telefono: h.telefono || '',
  email: h.email || '',
  categoria: h.categoria || '',
  activo: h.activo === undefined ? true : !!h.activo,
});

const inputClass =
  'w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3';

export function AdminConfiguracion() {
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    hotelAPI
      .get()
      .then((res) => {
        const data = mapHotel(res.data);
        setForm(data);
        setOriginal(data);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la configuración'))
      .finally(() => setLoading(false));
  }, []);

  const hayCambios = useMemo(() => {
    if (!form || !original) return false;
    return JSON.stringify(form) !== JSON.stringify(original);
  }, [form, original]);

  const update = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setError('');
  };

  const toggleActivo = () => {
    setForm((f) => ({ ...f, activo: !f.activo }));
    setError('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form || !hayCambios) return;

    try {
      setSaving(true);
      setError('');
      const res = await hotelAPI.update({
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
        email: form.email,
        categoria: form.categoria,
        activo: form.activo,
      });
      const actualizado = mapHotel(res.data);
      setForm(actualizado);
      setOriginal(actualizado);
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !form && error) {
    return (
      <AdminPage loading={false}>
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">{error}</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Configuración</h1>
        <p className="text-gray-400 text-sm">Datos generales del establecimiento</p>
      </div>

      {form && (
        <form onSubmit={guardar} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8 max-w-2xl">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>
          )}

          <div className="flex flex-col gap-5">
            {[
              { label: 'Nombre *', field: 'nombre', type: 'text', placeholder: 'Hostal José Luis' },
              { label: 'Dirección *', field: 'direccion', type: 'text', placeholder: 'Av. Principal 123, Lima' },
              { label: 'Teléfono', field: 'telefono', type: 'tel', placeholder: '+51 999 000 000' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'contacto@hostal.com' },
              { label: 'Categoría', field: 'categoria', type: 'text', placeholder: 'Boutique' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                  required={field === 'nombre' || field === 'direccion'}
                />
              </div>
            ))}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estado del hotel</p>
                <p className="text-sm text-gray-600">
                  Actualmente:{' '}
                  <span className={`font-bold ${form.activo ? 'text-green-600' : 'text-red-500'}`}>
                    {form.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={toggleActivo}
                className={`inline-flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-colors px-5 py-3 whitespace-nowrap ${
                  form.activo
                    ? 'border border-red-100 text-red-500 hover:bg-red-50'
                    : 'border border-green-100 text-green-600 hover:bg-green-50'
                }`}
              >
                <span className="material-icons text-lg">{form.activo ? 'toggle_on' : 'toggle_off'}</span>
                {form.activo ? 'Marcar como inactivo' : 'Marcar como activo'}
              </button>
            </div>
          </div>

          {hayCambios && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors px-6 py-3"
              >
                <span className="material-icons text-lg">save</span>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </form>
      )}
    </AdminPage>
  );
}
