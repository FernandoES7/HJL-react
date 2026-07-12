import { useState } from 'react';
import { CheckCircle, Calendar, Users, Home, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BoletaModal } from '../BoletaModal';

const fmt = (n) => `S/ ${Number(n).toLocaleString('es-PE')}`;

const formatFecha = (f) => {
  if (!f) return '—';
  const s = typeof f === 'string' ? f.slice(0, 10) : f;
  return s;
};

export function Step4Confirmacion({ reserva }) {
  const [verBoleta, setVerBoleta] = useState(false);

  if (!reserva) return null;

  const checkin = formatFecha(reserva.fecha_checkin);
  const checkout = formatFecha(reserva.fecha_checkout);
  const noches = Math.round(
    (new Date(checkout + 'T00:00:00') - new Date(checkin + 'T00:00:00')) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-500" size={42} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#191281] mb-2">¡Reserva confirmada!</h2>
      <p className="text-gray-500 mb-2">
        Hemos registrado tu reserva. Los detalles se enviarán a{' '}
        <strong className="text-gray-700">{reserva.email}</strong>
      </p>

      <div className="inline-block bg-indigo-50 border-2 border-[#191281] rounded-xl px-8 py-4 my-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Código de reserva</p>
        <p className="text-3xl font-bold text-[#191281] tracking-widest font-mono">{reserva.codigo_reserva}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Calendar size={20} className="text-[#191281] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Check-in</p>
          <p className="font-semibold text-sm text-gray-800">{checkin}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Calendar size={20} className="text-[#191281] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Check-out</p>
          <p className="font-semibold text-sm text-gray-800">{checkout}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Users size={20} className="text-[#191281] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Huéspedes</p>
          <p className="font-semibold text-sm text-gray-800">{reserva.num_huespedes}</p>
        </div>
      </div>

      {reserva.habitaciones?.length > 0 && (
        <div className="max-w-xl mx-auto mt-4 text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Home size={13} /> Habitaciones asignadas
          </p>
          <div className="space-y-2">
            {reserva.habitaciones.map((h) => (
              <div key={h.id} className="bg-gray-50 rounded-lg px-4 py-2.5 flex justify-between text-sm">
                <span className="text-gray-700">
                  {h.tipo_nombre} — Hab. <strong>{h.numero}</strong> (Piso {h.piso})
                </span>
                <span className="text-gray-500">{fmt(h.precio_noche)}/noche</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between">
        <div className="text-left">
          <p className="text-sm font-semibold text-[#191281]">Total pagado</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {noches} noche{noches !== 1 ? 's' : ''} · {reserva.habitaciones?.length || 0} habitación
            {(reserva.habitaciones?.length || 0) !== 1 ? 'es' : ''}
          </p>
        </div>
        <p className="text-2xl font-bold text-[#191281]">{fmt(reserva.total)}</p>
      </div>

      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <button
          type="button"
          onClick={() => setVerBoleta(true)}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Download size={15} />
          Descargar comprobante
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 bg-[#191281] hover:bg-[#16304f] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Guarda tu código de reserva. Lo necesitarás para cualquier consulta o modificación.
      </p>

      {verBoleta && (
        <BoletaModal
          reservaInicial={reserva}
          onClose={() => setVerBoleta(false)}
        />
      )}
    </div>
  );
}
