import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { reservasAPI, hotelAPI, statsAPI } from '../../services/api';
import { printReservasReport, printEstadisticasIngresos, printCancelacionesReport } from '../../utils/boletaPrint';
import { AdminPage } from '../../components/admin/AdminPage';

const STATUS = {
  confirmada: { label:'Confirmada', bg:'#dcfce7', color:'#16a34a', icon:'check_circle' },
  completada: { label:'Completada', bg:'#f3f4f6', color:'#6b7280', icon:'task_alt' },
  cancelada:  { label:'Cancelada',  bg:'#fee2e2', color:'#dc2626', icon:'cancel' },
  pendiente:  { label:'Pendiente',  bg:'#fef9c3', color:'#ca8a04', icon:'hourglass_top' },
};

const FALLBACK_HOTEL = {
  nombre: 'Hostal Boutique José Luis',
  direccion: 'Miraflores, Lima — Perú',
  telefono: '—',
  email: '—',
  categoria: '',
};

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

const toDateStr = (f) => {
  if (!f) return null;
  if (typeof f === 'string') return f.slice(0, 10);
  if (f instanceof Date) return f.toISOString().slice(0, 10);
  return String(f).slice(0, 10);
};

const getReservaDate = (r) =>
  toDateStr(r.fecha_reserva) || toDateStr(r.check_in || r.checkIn);

const matchesDateFilter = (r, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return true;
  const d = getReservaDate(r);
  if (!d) return false;
  const from = dateFrom || dateTo;
  const to = dateTo || dateFrom;
  return d >= from && d <= to;
};

const dateFilterLabel = (dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return 'Todas las fechas';
  if (dateFrom && dateTo && dateFrom === dateTo) return formatFecha(dateFrom);
  if (dateFrom && dateTo) return `${formatFecha(dateFrom)} — ${formatFecha(dateTo)}`;
  return formatFecha(dateFrom || dateTo);
};

const fmtMonto = (n) =>
  Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getRangoEfectivo = (dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return null;
  const from = dateFrom || dateTo;
  const to = dateTo || dateFrom;
  return from <= to ? { from, to } : { from: to, to: from };
};

const VIEW_TITLES = {
  reservas: 'Reservas',
  estadisticas: 'Estadísticas',
  cancelaciones: 'Cancelaciones',
};

const statsPeriodoLabel = (dateFrom, dateTo, data) => {
  if (!dateFrom && !dateTo) {
    if (data?.sinFiltroFecha && data?.desde && data?.hasta) {
      return `Todas las fechas (${formatFecha(data.desde)} — ${formatFecha(data.hasta)})`;
    }
    return 'Todas las fechas';
  }
  return dateFilterLabel(dateFrom, dateTo);
};

const isStatsView = (mode) => mode === 'estadisticas' || mode === 'cancelaciones';

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

function EstadisticasReservasTable({ rows }) {
  return (
    <table className="w-full min-w-[520px] border-collapse text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {['Código', 'Cliente', 'Habitación', 'Total'].map(h => (
            <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td className="px-3 sm:px-5 py-4">
              <span className="font-mono text-xs font-bold text-gray-500">{r.codigo || r.id}</span>
            </td>
            <td className="px-3 sm:px-5 py-4 min-w-[140px]">
              <p className="font-bold text-gray-800">{r.nombre_cliente}</p>
            </td>
            <td className="px-3 sm:px-5 py-4 text-gray-500 max-w-[200px]">
              <span className="line-clamp-2">{r.habitacion_nombre || '—'}</span>
            </td>
            <td className="px-3 sm:px-5 py-4 whitespace-nowrap">
              <span className="font-black text-[#1e3a5f]">S/ {fmtMonto(r.total)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReservasTable({ rows, showActions, onVer, onCancelar }) {
  const headers = showActions
    ? ['Código','Cliente','Habitación','Fechas','Total','Estado','Acciones']
    : ['Código','Cliente','Habitación','Fechas','Total','Estado'];

  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {headers.map(h => (
            <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const st = STATUS[r.estado||r.status] || STATUS.pendiente;
          return (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
              <td className="px-3 sm:px-5 py-4">
                <span className="font-mono text-xs font-bold text-gray-500">{r.codigo||r.id}</span>
              </td>
              <td className="px-3 sm:px-5 py-4 min-w-[140px]">
                <p className="font-bold text-gray-800">{r.nombre_cliente||r.customerName}</p>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.email_cliente||r.customerEmail}</p>
              </td>
              <td className="px-3 sm:px-5 py-4 text-gray-500 max-w-[160px]">
                <span className="line-clamp-2">{r.habitacion_nombre||r.roomName}</span>
              </td>
              <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                {formatFecha(r.check_in||r.checkIn)}<br />{formatFecha(r.check_out||r.checkOut)}
              </td>
              <td className="px-3 sm:px-5 py-4 whitespace-nowrap">
                <span className="font-black text-[#1e3a5f]">S/ {r.total||r.totalPrice}</span>
              </td>
              <td className="px-3 sm:px-5 py-4">
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 whitespace-nowrap"
                  style={{ background: st.bg, color: st.color }}
                >
                  <span className="material-icons text-[13px]">{st.icon}</span>
                  {st.label}
                </span>
              </td>
              {showActions && (
                <td className="px-3 sm:px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onVer(r)}
                      className="inline-flex items-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2"
                    >
                      <span className="material-icons text-sm">visibility</span>
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    {(r.estado||r.status) === 'confirmada' && (
                      <button
                        type="button"
                        onClick={() => onCancelar(r.id)}
                        className="inline-flex items-center gap-1 border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2"
                      >
                        <span className="material-icons text-sm">cancel</span>
                        <span className="hidden sm:inline">Cancelar</span>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ReporteModal({ reservas, dateFrom, dateTo, statusFilter, onClose }) {
  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  useEffect(() => {
    hotelAPI.getPublic()
      .then(res => setHotel(res.data || FALLBACK_HOTEL))
      .catch(() => setHotel(FALLBACK_HOTEL))
      .finally(() => setLoadingHotel(false));
  }, []);

  const totalMonto = useMemo(
    () => reservas.reduce((sum, r) => sum + Number(r.total || r.totalPrice || 0), 0),
    [reservas]
  );

  const statusLabel = statusFilter === 'all'
    ? 'Todos los estados'
    : (STATUS[statusFilter]?.label || statusFilter);

  const handlePrint = () => {
    if (!hotel) return;
    printReservasReport({
      hotel,
      reservas,
      periodo: dateFilterLabel(dateFrom, dateTo),
      estadoLabel: statusLabel,
      totalMonto,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        id="reporte-reservas-modal"
        className="bg-white w-full sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Reporte de reservas</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-gray-400 text-lg">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loadingHotel ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative flex min-h-full">
              <div
                className="shrink-0 w-11 sm:w-12 bg-[#1e3a5f] flex items-center justify-center"
                aria-hidden
              >
                <span
                  className="text-white font-black tracking-[0.35em] text-sm select-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  REPORTE
                </span>
              </div>

              <div className="flex-1 p-5 sm:p-8 flex flex-col">
                <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
                  <HotelInfo hotel={hotel} />
                </header>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Parámetros del reporte
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">Período:</dt>
                      <dd className="font-semibold text-[#1e3a5f]">{dateFilterLabel(dateFrom, dateTo)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">Estado:</dt>
                      <dd className="text-gray-700">{statusLabel}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">Total reservas:</dt>
                      <dd className="font-semibold text-gray-700">{reservas.length}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400 shrink-0">Monto total:</dt>
                      <dd className="font-black text-[#f59e0b]">
                        S/ {totalMonto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Listado de reservas
                  </h4>
                  {reservas.length > 0 ? (
                    <div className="border border-gray-100 rounded-xl overflow-x-auto">
                      <ReservasTable rows={reservas} showActions={false} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                      No hay reservas que coincidan con los filtros seleccionados.
                    </p>
                  )}
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

        {!loadingHotel && (
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

function EstadisticasReporteModal({ data, dateFrom, dateTo, onClose }) {
  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  useEffect(() => {
    hotelAPI.getPublic()
      .then(res => setHotel(res.data || FALLBACK_HOTEL))
      .catch(() => setHotel(FALLBACK_HOTEL))
      .finally(() => setLoadingHotel(false));
  }, []);

  const handlePrint = () => {
    if (!hotel || !data) return;
    printEstadisticasIngresos({
      hotel,
      data,
      periodo: statsPeriodoLabel(dateFrom, dateTo, data),
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:max-w-3xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Reporte de ingresos</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-icons text-gray-400 text-lg">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loadingHotel || !data ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative flex min-h-full">
              <div className="shrink-0 w-11 sm:w-12 bg-[#1e3a5f] flex items-center justify-center" aria-hidden>
                <span
                  className="text-white font-black tracking-[0.35em] text-sm select-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  REPORTE
                </span>
              </div>

              <div className="flex-1 p-5 sm:p-8 flex flex-col">
                <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
                  <HotelInfo hotel={hotel} />
                </header>

                <p className="text-sm font-bold text-[#1e3a5f] mb-2">
                  Período: {statsPeriodoLabel(dateFrom, dateTo, data)}
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  {data.totalReservas} reservas · {data.diasConIngreso} día(s) con ingresos · {data.diasEnRango} días en el rango
                </p>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Resumen del período
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Monto máximo', value: data.ingresoMaximo, highlight: true },
                      { label: 'Monto mínimo', value: data.ingresoMinimo },
                      { label: 'Ingreso promedio diario', value: data.ingresoPromedio },
                    ].map(item => (
                      <div key={item.label} className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className={`text-xl font-black ${item.highlight ? 'text-[#f59e0b]' : 'text-[#1e3a5f]'}`}>
                          S/ {fmtMonto(item.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Ingreso total del período:{' '}
                    <span className="font-black text-[#1e3a5f]">S/ {fmtMonto(data.ingresoTotal)}</span>
                  </p>
                </section>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Top 3 días con mayores ingresos
                  </h4>
                  {data.top3Dias?.length > 0 ? (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-2.5 w-12 text-center">#</th>
                            <th className="px-4 py-2.5">Fecha</th>
                            <th className="px-4 py-2.5 text-center">Reservas</th>
                            <th className="px-4 py-2.5 text-right">Ingreso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.top3Dias.map((d, i) => (
                            <tr key={d.fecha} className="border-t border-gray-50">
                              <td className="px-4 py-3 text-center font-black text-[#1e3a5f]">{i + 1}</td>
                              <td className="px-4 py-3 font-semibold text-gray-700">{formatFecha(d.fecha)}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{d.cantidad}</td>
                              <td className="px-4 py-3 text-right font-black text-[#f59e0b]">S/ {fmtMonto(d.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                      No hay ingresos registrados en el período seleccionado.
                    </p>
                  )}
                </section>

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Reservas del período
                  </h4>
                  {data.reservas?.length > 0 ? (
                    <div className="border border-gray-100 rounded-xl overflow-x-auto">
                      <EstadisticasReservasTable rows={data.reservas} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                      No hay reservas en el período seleccionado.
                    </p>
                  )}
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

        {!loadingHotel && data && (
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

function VistaEstadisticas({ data, loading, error, dateFrom, dateTo }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <span className="material-icons text-red-200 text-5xl">error_outline</span>
        <p className="text-red-400 text-sm mt-3">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-5 sm:p-8 flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">
          {data.totalReservas} reservas · {data.diasConIngreso} día(s) con ingresos · {data.diasEnRango} días en el rango
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Monto máximo', value: data.ingresoMaximo, icon: 'trending_up', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Monto mínimo', value: data.ingresoMinimo, icon: 'trending_down', color: '#1e3a5f', bg: '#eff6ff' },
          { label: 'Promedio diario', value: data.ingresoPromedio, icon: 'functions', color: '#16a34a', bg: '#f0fdf4' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                <span className="material-icons text-xl" style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
            </div>
            <p className="text-2xl font-black text-[#1e3a5f]">S/ {fmtMonto(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-2xl p-5">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ingreso total del período</p>
        <p className="text-3xl font-black text-[#f59e0b]">S/ {fmtMonto(data.ingresoTotal)}</p>
      </div>

      <div>
        <h3 className="text-sm font-black text-[#1e3a5f] tracking-wide mb-4 flex items-center gap-2">
          <span className="material-icons text-base">emoji_events</span>
          Top 3 días con mayores ingresos
        </h3>
        {data.top3Dias?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.top3Dias.map((d, i) => (
              <div
                key={d.fecha}
                className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden"
              >
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1e3a5f] text-white text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
                <p className="font-black text-[#1e3a5f] text-lg mb-3">{formatFecha(d.fecha)}</p>
                <p className="text-xs text-gray-400">{d.cantidad} reserva{d.cantidad !== 1 ? 's' : ''}</p>
                <p className="text-xl font-black text-[#f59e0b] mt-1">S/ {fmtMonto(d.total)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No hay ingresos en {statsPeriodoLabel(dateFrom, dateTo, data)}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#1e3a5f] tracking-wide mb-4 flex items-center gap-2">
          <span className="material-icons text-base">receipt_long</span>
          Reservas del período
        </h3>
        {data.reservas?.length > 0 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <EstadisticasReservasTable rows={data.reservas} />
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No hay reservas en {statsPeriodoLabel(dateFrom, dateTo, data)}
          </p>
        )}
      </div>
    </div>
  );
}

function CancelacionesTable({ rows }) {
  return (
    <table className="w-full min-w-[800px] border-collapse text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {['Código', 'Cliente', 'Fechas', 'Motivo', 'Total'].map(h => (
            <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td className="px-3 sm:px-5 py-4">
              <span className="font-mono text-xs font-bold text-gray-500">{r.codigo || r.id}</span>
            </td>
            <td className="px-3 sm:px-5 py-4 min-w-[140px]">
              <p className="font-bold text-gray-800">{r.nombre_cliente}</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.email_cliente}</p>
            </td>
            <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
              {formatFecha(r.check_in)}<br />{formatFecha(r.check_out)}
              <span className="block text-gray-300 mt-0.5">Reserva: {formatFecha(r.fecha_reserva)}</span>
            </td>
            <td className="px-3 sm:px-5 py-4 text-gray-600 max-w-[200px]">
              <span className="line-clamp-2">{r.motivo || 'Sin motivo registrado'}</span>
            </td>
            <td className="px-3 sm:px-5 py-4 whitespace-nowrap">
              <span className="font-black text-red-500">S/ {fmtMonto(r.total)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CancelacionesReporteModal({ data, dateFrom, dateTo, onClose }) {
  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  useEffect(() => {
    hotelAPI.getPublic()
      .then(res => setHotel(res.data || FALLBACK_HOTEL))
      .catch(() => setHotel(FALLBACK_HOTEL))
      .finally(() => setLoadingHotel(false));
  }, []);

  const handlePrint = () => {
    if (!hotel || !data) return;
    printCancelacionesReport({
      hotel,
      data,
      periodo: statsPeriodoLabel(dateFrom, dateTo, data),
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Reporte de cancelaciones</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <span className="material-icons text-gray-400 text-lg">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loadingHotel || !data ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative flex min-h-full">
              <div className="shrink-0 w-11 sm:w-12 bg-[#1e3a5f] flex items-center justify-center" aria-hidden>
                <span className="text-white font-black tracking-[0.35em] text-sm select-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  REPORTE
                </span>
              </div>
              <div className="flex-1 p-5 sm:p-8 flex flex-col">
                <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
                  <HotelInfo hotel={hotel} />
                </header>

                <p className="text-sm font-bold text-[#1e3a5f] mb-6">Período: {statsPeriodoLabel(dateFrom, dateTo, data)}</p>

                <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Total canceladas', value: data.totalCanceladas, color: '#1e3a5f' },
                    { label: 'Monto no cobrado', value: `S/ ${fmtMonto(data.montoNoCobrado)}`, color: '#dc2626' },
                    { label: 'Tasa de cancelación', value: `${fmtMonto(data.tasaCancelacion)}%`, color: '#1e3a5f' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </section>

                {data.top3Motivos?.length > 0 && (
                  <section className="mb-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Top 3 motivos</h4>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-2.5 w-12 text-center">#</th>
                            <th className="px-4 py-2.5">Motivo</th>
                            <th className="px-4 py-2.5 text-center">Cantidad</th>
                            <th className="px-4 py-2.5 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.top3Motivos.map((m, i) => (
                            <tr key={m.motivo} className="border-t border-gray-50">
                              <td className="px-4 py-3 text-center font-black text-[#1e3a5f]">{i + 1}</td>
                              <td className="px-4 py-3 text-gray-700">{m.motivo}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{m.total}</td>
                              <td className="px-4 py-3 text-right font-bold text-[#1e3a5f]">{m.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                <section className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reservas canceladas</h4>
                  {data.reservasCanceladas?.length > 0 ? (
                    <div className="border border-gray-100 rounded-xl overflow-x-auto">
                      <CancelacionesTable rows={data.reservasCanceladas} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">No hay cancelaciones en el período.</p>
                  )}
                </section>

                <footer className="mt-auto pt-5 border-t border-gray-100 text-center">
                  <HotelInfo hotel={hotel} compact />
                  <p className="text-xs text-gray-400 mt-3">Documento generado el {formatFechaHora(new Date())}</p>
                </footer>
              </div>
            </div>
          )}
        </div>

        {!loadingHotel && data && (
          <div className="border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0">
            <button type="button" onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors py-3">
              <span className="material-icons text-base">print</span>
              Imprimir
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors py-3">
              Cerrar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function VistaCancelaciones({ data, loading, error, dateFrom, dateTo }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <span className="material-icons text-red-200 text-5xl">error_outline</span>
        <p className="text-red-400 text-sm mt-3">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-5 sm:p-8 flex flex-col gap-6">
      <p className="text-sm text-gray-500">
        {data.totalCanceladas} cancelada(s) de {data.totalReservas} reserva(s) · {statsPeriodoLabel(dateFrom, dateTo, data)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total canceladas', value: data.totalCanceladas, icon: 'cancel', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Monto no cobrado', value: `S/ ${fmtMonto(data.montoNoCobrado)}`, icon: 'money_off', color: '#dc2626', bg: '#fff1f2' },
          { label: 'Tasa de cancelación', value: `${fmtMonto(data.tasaCancelacion)}%`, icon: 'percent', color: '#1e3a5f', bg: '#eff6ff' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                <span className="material-icons text-xl" style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
            </div>
            <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#1e3a5f] tracking-wide mb-4 flex items-center gap-2">
          <span className="material-icons text-base">format_quote</span>
          Top 3 motivos más frecuentes
        </h3>
        {data.top3Motivos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.top3Motivos.map((m, i) => (
              <div key={m.motivo} className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Motivo</p>
                <p className="font-bold text-gray-800 text-sm leading-snug mb-3 pr-8">{m.motivo}</p>
                <p className="text-xs text-gray-400">{m.total} vez{m.total !== 1 ? 'es' : ''} · {m.pct}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No hay motivos registrados en el período
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#1e3a5f] tracking-wide mb-4 flex items-center gap-2">
          <span className="material-icons text-base">list_alt</span>
          Reservas canceladas
        </h3>
        {data.reservasCanceladas?.length > 0 ? (
          <div className="border border-gray-100 rounded-2xl overflow-x-auto">
            <CancelacionesTable rows={data.reservasCanceladas} />
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No hay cancelaciones en {statsPeriodoLabel(dateFrom, dateTo, data)}
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminReservas() {
  const [reservas,     setReservas]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [viewMode,     setViewMode]     = useState('reservas');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [detalle,      setDetalle]      = useState(null);
  const [showReporte,  setShowReporte]  = useState(false);
  const [statsData,    setStatsData]    = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError,   setStatsError]   = useState(null);

  useEffect(() => {
    reservasAPI.getAll().then(d => setReservas(d.reservations || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isStatsView(viewMode)) return undefined;

    setLoadingStats(true);
    setStatsError(null);

    const rango = getRangoEfectivo(dateFrom, dateTo);
    const fetcher = viewMode === 'estadisticas'
      ? statsAPI.getIngresos(rango?.from, rango?.to)
      : statsAPI.getCancelaciones(rango?.from, rango?.to);

    fetcher
      .then(res => setStatsData(res.data || res))
      .catch(err => {
        setStatsData(null);
        setStatsError(err.message || 'No se pudieron cargar los datos');
      })
      .finally(() => setLoadingStats(false));
  }, [viewMode, dateFrom, dateTo]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleGenerarReporte = () => {
    if (isStatsView(viewMode) && !statsData) return;
    setShowReporte(true);
  };

  const canGenerarReporte = viewMode === 'reservas'
    || (isStatsView(viewMode) && statsData && !loadingStats);

  const handleStatus = async (id, status) => {
    try {
      if (status === 'cancelada') {
        await reservasAPI.cancel(id, 'Cancelada por el administrador');
      } else {
        await reservasAPI.updateStatus(id, status);
      }
      setReservas(prev => prev.map(r => r.id === id ? {...r, estado: status} : r));
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => reservas.filter(r => {
    const txt = search.toLowerCase();
    const match = (r.nombre_cliente||r.customerName||'').toLowerCase().includes(txt)
      || String(r.codigo||r.id).toLowerCase().includes(txt)
      || (r.habitacion_nombre||r.roomName||'').toLowerCase().includes(txt);
    return match
      && (statusFilter === 'all' || (r.estado||r.status) === statusFilter)
      && matchesDateFilter(r, dateFrom, dateTo);
  }), [reservas, search, statusFilter, dateFrom, dateTo]);

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <AdminPage loading={loading}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide">
              {VIEW_TITLES[viewMode] || 'Reservas'}
            </h1>
            <select
              value={viewMode}
              onChange={e => handleViewChange(e.target.value)}
              className="w-full sm:w-auto border border-gray-200 bg-white rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-[#1e3a5f] px-3.5 py-2"
            >
              <option value="reservas">Reservas</option>
              <option value="estadisticas">Estadísticas</option>
              <option value="cancelaciones">Cancelaciones</option>
            </select>
          </div>
          <p className="text-gray-400 text-sm">
            {viewMode === 'reservas' && (
              <>
                {filtered.length} de {reservas.length} reservas
                {hasDateFilter && ` · ${dateFilterLabel(dateFrom, dateTo)}`}
              </>
            )}
            {viewMode === 'estadisticas' && (
              <>Ingresos por fecha de reserva · {statsPeriodoLabel(dateFrom, dateTo, statsData)}</>
            )}
            {viewMode === 'cancelaciones' && (
              <>Cancelaciones por fecha de reserva · {statsPeriodoLabel(dateFrom, dateTo, statsData)}</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerarReporte}
          disabled={!canGenerarReporte}
          className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors px-5 py-3 shrink-0"
        >
          <span className="material-icons text-base">summarize</span>
          Generar reporte
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {viewMode === 'reservas' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative min-w-0">
                <span className="material-icons absolute text-gray-300 text-xl left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente, habitación o código..."
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 pl-11 pr-3.5 py-3"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[180px] border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`flex flex-col sm:flex-row sm:items-end gap-3 ${viewMode === 'reservas' ? 'pt-1 border-t border-gray-50' : ''}`}>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isStatsView(viewMode) ? 'Desde' : 'Fecha de reserva — desde'}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Hasta {viewMode === 'reservas' && (
                  <span className="normal-case font-normal text-gray-300">(opcional, día único si se deja vacío)</span>
                )}
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => setDateTo(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
              />
            </div>
            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDates}
                className="inline-flex items-center justify-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors px-4 py-3 shrink-0"
              >
                <span className="material-icons text-base">clear</span>
                Limpiar fechas
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'reservas' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
          <div className="overflow-x-auto">
            <ReservasTable
              rows={filtered}
              showActions
              onVer={setDetalle}
              onCancelar={id => handleStatus(id, 'cancelada')}
            />
            {filtered.length === 0 && (
              <div className="text-center py-12 sm:py-16 px-4">
                <span className="material-icons text-gray-200 text-5xl">search_off</span>
                <p className="text-gray-300 text-sm mt-3">No se encontraron reservas</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'estadisticas' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
          <VistaEstadisticas
            data={statsData}
            loading={loadingStats}
            error={statsError}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
          <VistaCancelaciones
            data={statsData}
            loading={loadingStats}
            error={statsError}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Detalle de Reserva</h3>
              <button
                type="button"
                onClick={() => setDetalle(null)}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <span className="material-icons text-gray-400 text-lg">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ['confirmation_number','Código',     detalle.codigo||detalle.id],
                ['person',            'Cliente',    detalle.nombre_cliente||detalle.customerName],
                ['email',             'Email',      detalle.email_cliente||detalle.customerEmail],
                ['hotel',             'Habitación', detalle.habitacion_nombre||detalle.roomName],
                ['event',             'Fecha reserva', formatFecha(detalle.fecha_reserva || getReservaDate(detalle))],
                ['login',             'Check-in',   formatFecha(detalle.check_in||detalle.checkIn)],
                ['logout',            'Check-out',  formatFecha(detalle.check_out||detalle.checkOut)],
                ['groups',            'Huéspedes',  detalle.huespedes||detalle.guests],
                ['payments',          'Total',      `S/ ${detalle.total||detalle.totalPrice}`],
              ].map(([icon, label, value]) => (
                <div key={icon} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-gray-50 pb-3">
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="material-icons text-[#1e3a5f] text-base">{icon}</span>
                    {label}
                  </span>
                  <span className="font-bold text-sm text-gray-700 sm:text-right break-all">{value}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDetalle(null)}
              className="w-full bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#16304f] transition-colors py-3.5 mt-6"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showReporte && viewMode === 'reservas' && (
        <ReporteModal
          reservas={filtered}
          dateFrom={dateFrom}
          dateTo={dateTo}
          statusFilter={statusFilter}
          onClose={() => setShowReporte(false)}
        />
      )}

      {showReporte && viewMode === 'estadisticas' && statsData && (
        <EstadisticasReporteModal
          data={statsData}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onClose={() => setShowReporte(false)}
        />
      )}

      {showReporte && viewMode === 'cancelaciones' && statsData && (
        <CancelacionesReporteModal
          data={statsData}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onClose={() => setShowReporte(false)}
        />
      )}
    </AdminPage>
  );
}
