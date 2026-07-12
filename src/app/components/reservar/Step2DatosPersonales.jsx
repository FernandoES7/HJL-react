import { useState } from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';

const Field = ({ label, icon: Icon, error, ...props }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={15} />
        </div>
      )}
      <input
        className={`w-full border rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] transition-colors ${
          Icon ? 'pl-9 pr-3' : 'px-3'
        } ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ReadOnlyField = ({ label, icon: Icon, value }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={15} />
        </div>
      )}
      <div
        className={`w-full border border-gray-200 bg-gray-50 rounded-lg py-2.5 text-sm text-gray-700 ${
          Icon ? 'pl-9 pr-3' : 'px-3'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  </div>
);

export function Step2DatosPersonales({ datos, logueado, onDatosChange, onSiguiente, onAnterior }) {
  const { cliente } = datos;
  const [errores, setErrores] = useState({});
  const nombreCompleto = [cliente.nombre, cliente.apellido].filter(Boolean).join(' ').trim();

  const update = (campo, valor) => {
    onDatosChange({ cliente: { ...cliente, [campo]: valor } });
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (logueado) {
      if (!nombreCompleto) e.nombre = 'Nombre no disponible en tu perfil';
      if (!cliente.email?.trim()) e.email = 'Email no disponible en tu perfil';
      if (!cliente.dni?.trim()) e.dni = 'Documento no disponible en tu perfil';
    } else {
      if (!cliente.nombre?.trim()) e.nombre = 'El nombre es requerido';
      if (!cliente.apellido?.trim()) e.apellido = 'El apellido es requerido';
      if (!cliente.email?.trim()) e.email = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(cliente.email)) e.email = 'Email inválido';
      if (!cliente.dni?.trim()) e.dni = 'El DNI es requerido';
    }
    if (!cliente.telefono?.trim()) e.telefono = 'El teléfono es requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#191281] mb-1">Datos personales</h2>
      <p className="text-sm text-gray-500 mb-6">
        {logueado
          ? 'Confirma tus datos de contacto para procesar la reserva'
          : 'Completa tus datos para procesar la reserva'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {logueado ? (
          <>
            <div className="md:col-span-2">
              <ReadOnlyField label="Nombre completo" icon={User} value={nombreCompleto} />
            </div>
            <div className="md:col-span-2">
              <ReadOnlyField label="Correo electrónico" icon={Mail} value={cliente.email} />
            </div>
            <ReadOnlyField label="DNI / Pasaporte" icon={CreditCard} value={cliente.dni} />
            <Field
              label="Teléfono *"
              icon={Phone}
              type="tel"
              placeholder="+51 999 888 777"
              value={cliente.telefono || ''}
              onChange={(e) => update('telefono', e.target.value)}
              error={errores.telefono}
            />
          </>
        ) : (
          <>
            <Field
              label="Nombre *"
              icon={User}
              placeholder="Juan"
              value={cliente.nombre || ''}
              onChange={(e) => update('nombre', e.target.value)}
              error={errores.nombre}
            />
            <Field
              label="Apellido *"
              icon={User}
              placeholder="Pérez"
              value={cliente.apellido || ''}
              onChange={(e) => update('apellido', e.target.value)}
              error={errores.apellido}
            />
            <div className="md:col-span-2">
              <Field
                label="Correo electrónico *"
                icon={Mail}
                type="email"
                placeholder="juan@correo.com"
                value={cliente.email || ''}
                onChange={(e) => update('email', e.target.value)}
                error={errores.email}
              />
            </div>
            <Field
              label="Teléfono *"
              icon={Phone}
              type="tel"
              placeholder="+51 999 888 777"
              value={cliente.telefono || ''}
              onChange={(e) => update('telefono', e.target.value)}
              error={errores.telefono}
            />
            <Field
              label="DNI / Pasaporte *"
              icon={CreditCard}
              placeholder="12345678"
              value={cliente.dni || ''}
              onChange={(e) => update('dni', e.target.value)}
              error={errores.dni}
            />
          </>
        )}
      </div>

      {(errores.nombre || errores.email || errores.dni) && (
        <p className="text-xs text-red-500 mt-2 max-w-2xl">
          {errores.nombre || errores.email || errores.dni}
        </p>
      )}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-2xl">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu reserva</p>
        <div className="text-sm text-gray-700 space-y-1">
          <p>📅 {datos.checkin} → {datos.checkout}</p>
          <p>👤 {datos.huespedes} huésped{datos.huespedes > 1 ? 'es' : ''}</p>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onAnterior}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ‹ Anterior
        </button>
        <button
          type="button"
          onClick={() => validar() && onSiguiente()}
          className="flex items-center gap-2 bg-[#191281] hover:bg-[#16304f] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
}
