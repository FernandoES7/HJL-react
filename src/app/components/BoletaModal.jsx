import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { reservasAPI, hotelAPI } from '../services/api';
import { printBoleta } from '../utils/boletaPrint';

const fmt = (n) => `S/ ${Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (f) => {
  if (!f) return '—';
  const s = typeof f === 'string' ? f.slice(0, 10) : f;
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const formatFechaHora = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return formatFecha(f);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

const FALLBACK_HOTEL = {
  nombre: 'Hostal Boutique José Luis',
  direccion: 'Miraflores, Lima — Perú',
  telefono: '—',
  email: '—',
  categoria: '',
};

function HotelInfo({ hotel, compact = false }) {
  if (!hotel) return null;
  const cls = compact ? 'text-xs text-gray-500' : 'text-sm text-gray-600';
  return (
    <div className={cls}>
      <p className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize: compact ? '13px' : '16px' }}>
        {hotel.nombre}
      </p>
      {hotel.categoria && (
        <p className="text-gray-400 capitalize" style={{ fontSize: compact ? '11px' : '12px' }}>
          {hotel.categoria}
        </p>
      )}
      <p style={{ marginTop: compact ? '4px' : '8px' }}>{hotel.direccion}</p>
      <p>Tel: {hotel.telefono || '—'} · {hotel.email || '—'}</p>
    </div>
  );
}

export function BoletaModal({ reservaId, reservaInicial, onClose }) {
  const [reserva, setReserva] = useState(reservaInicial ?? null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const loadHotel = hotelAPI.getPublic().catch(() => ({ data: FALLBACK_HOTEL }));

    if (reservaInicial) {
      setReserva(reservaInicial);
      loadHotel
        .then((resHotel) => setHotel(resHotel.data || FALLBACK_HOTEL))
        .catch((err) => setError(err.message || 'No se pudo cargar el comprobante'))
        .finally(() => setLoading(false));
      return;
    }

    if (!reservaId) {
      setLoading(false);
      return;
    }

    Promise.all([reservasAPI.getById(reservaId), loadHotel])
      .then(([resReserva, resHotel]) => {
        setReserva(resReserva.data);
        setHotel(resHotel.data || FALLBACK_HOTEL);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar el comprobante'))
      .finally(() => setLoading(false));
  }, [reservaId, reservaInicial]);

  const checkin = formatFecha(reserva?.fecha_checkin);
  const checkout = formatFecha(reserva?.fecha_checkout);
  const noches = reserva
    ? Math.max(
        1,
        Math.round(
          (new Date(String(reserva.fecha_checkout).slice(0, 10) + 'T00:00:00')
            - new Date(String(reserva.fecha_checkin).slice(0, 10) + 'T00:00:00'))
            / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const totalBoleta = reserva?.factura?.total ?? reserva?.total ?? 0;

  const handlePrint = () => {
    if (!reserva || !hotel) return;
    printBoleta({ reserva, hotel, noches, totalBoleta, checkin, checkout });
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4 bg-black/50 backdrop-blur-sm print:hidden"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Comprobante de reserva</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-gray-400 text-lg">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : reserva && (
            <div className="relative flex min-h-full">
              <div
                className="shrink-0 w-11 sm:w-12 bg-[#1e3a5f] flex items-center justify-center"
                aria-hidden
              >
                <span
                  className="text-white font-black tracking-[0.35em] text-sm select-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  BOLETA
                </span>
              </div>

              <div className="flex-1 p-5 sm:p-8 flex flex-col">
                <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
                  <HotelInfo hotel={hotel} />
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <section>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Datos del huésped
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Nombre:</dt>
                        <dd className="font-semibold text-[#1e3a5f]">{reserva.cliente_nombre || '—'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Documento:</dt>
                        <dd className="text-gray-700">{reserva.documento || '—'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Email:</dt>
                        <dd className="text-gray-700 break-all">{reserva.email || '—'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Teléfono:</dt>
                        <dd className="text-gray-700">{reserva.telefono || '—'}</dd>
                      </div>
                    </dl>
                  </section>

                  <section>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Detalle de la reserva
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Código:</dt>
                        <dd className="font-mono font-bold text-[#1e3a5f]">{reserva.codigo_reserva}</dd>
                      </div>
                      {reserva.factura?.numero_factura && (
                        <div className="flex gap-2">
                          <dt className="text-gray-400 shrink-0">N° boleta:</dt>
                          <dd className="font-mono text-gray-700">{reserva.factura.numero_factura}</dd>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Estado:</dt>
                        <dd className="font-semibold capitalize text-gray-700">
                          {ESTADO_LABEL[reserva.estado] || reserva.estado}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Fecha reserva:</dt>
                        <dd className="text-gray-700">{formatFecha(reserva.fecha_reserva || reserva.created_at)}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Check-in:</dt>
                        <dd className="text-gray-700">{checkin}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Check-out:</dt>
                        <dd className="text-gray-700">{checkout}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Huéspedes:</dt>
                        <dd className="text-gray-700">{reserva.num_huespedes}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">Noches:</dt>
                        <dd className="text-gray-700">{noches}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Habitaciones reservadas
                  </h4>
                  {reserva.habitaciones?.length > 0 ? (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-2.5">Tipo</th>
                            <th className="px-4 py-2.5">N° / Piso</th>
                            <th className="px-4 py-2.5 text-right">Precio/noche</th>
                            <th className="px-4 py-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reserva.habitaciones.map((h) => {
                            const subtotal = Number(h.precio_noche) * noches;
                            return (
                              <tr key={h.id || h.id_habitacion || h.id_detalle} className="border-t border-gray-50">
                                <td className="px-4 py-3 text-gray-700">{h.tipo_nombre || h.tipo_habitacion}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  Hab. <strong>{h.numero}</strong> · Piso {h.piso}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">{fmt(h.precio_noche)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#1e3a5f]">{fmt(subtotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                      Sin detalle de habitaciones asignadas.
                    </p>
                  )}
                </section>

                <section className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-xl p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total de la boleta</p>
                      {reserva.factura && (
                        <p className="text-xs text-gray-500">
                          Subtotal {fmt(reserva.factura.subtotal)}
                          {Number(reserva.factura.impuestos) > 0 && ` · IGV ${fmt(reserva.factura.impuestos)}`}
                        </p>
                      )}
                    </div>
                    <p className="text-3xl font-black text-[#f59e0b]">{fmt(totalBoleta)}</p>
                  </div>
                </section>

                <footer className="mt-auto pt-5 border-t border-gray-100 text-center">
                  <HotelInfo hotel={hotel} compact />
                  <p className="text-xs text-gray-400 mt-3">
                    Documento generado el {formatFechaHora(new Date())} · Gracias por su preferencia
                  </p>
                </footer>
              </div>
            </div>
          )}
        </div>

        {!loading && !error && reserva && (
          <div className="border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors py-3"
            >
              <span className="material-icons text-base">print</span>
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors py-3"
            >
              Cerrar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
