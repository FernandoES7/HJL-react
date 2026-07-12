import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsAPI, reservasAPI, hotelAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';
import { printResumenGeneralReport, printIndicadoresKpiReport } from '../../utils/boletaPrint';

const STATUS = {
  confirmada: { bg:'#dcfce7', color:'#16a34a' },
  completada: { bg:'#f3f4f6', color:'#6b7280' },
  cancelada:  { bg:'#fee2e2', color:'#dc2626' },
  pendiente:  { bg:'#fef9c3', color:'#ca8a04' },
};

const FALLBACK_HOTEL = {
  nombre: 'Hostal Boutique José Luis',
  direccion: 'Miraflores, Lima — Perú',
  telefono: '—',
  email: '—',
  categoria: '',
};

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatFecha = (f) => {
  if (!f) return '—';
  const s = typeof f === 'string' ? f.slice(0, 10) : f;
  const [y, m, d] = String(s).split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const formatFechaHora = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function ReporteModalShell({ title, onClose, onPrint, loadingHotel, children }) {
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
          <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">{title}</h3>
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
              <div className="shrink-0 w-11 sm:w-12 bg-[#1e3a5f] flex items-center justify-center" aria-hidden>
                <span
                  className="text-white font-black tracking-[0.35em] text-sm select-none"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  REPORTE
                </span>
              </div>
              <div className="flex-1 p-5 sm:p-8 flex flex-col">{children}</div>
            </div>
          )}
        </div>

        {!loadingHotel && (
          <div className="border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onPrint}
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

function useReporteHotel() {
  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  useEffect(() => {
    hotelAPI.getPublic()
      .then(res => setHotel(res.data || FALLBACK_HOTEL))
      .catch(() => setHotel(FALLBACK_HOTEL))
      .finally(() => setLoadingHotel(false));
  }, []);

  return { hotel, loadingHotel };
}

function ResumenGeneralReporteModal({ stats, kpi, onClose }) {
  const { hotel, loadingHotel } = useReporteHotel();
  const hoy = stats.resumenHoy || {};
  const mes = stats.resumenMes || {};

  const handlePrint = () => {
    if (!hotel) return;
    printResumenGeneralReport({ hotel, stats, kpi });
  };

  const resumenHoyItems = [
    { icon: 'today', label: 'Fecha', value: formatFecha(hoy.fecha) },
    { icon: 'event_available', label: 'Reservas creadas', value: hoy.totalReservas ?? '—' },
    { icon: 'check_circle', label: 'Sin cancelar', value: hoy.reservasEfectivas ?? '—' },
    { icon: 'groups', label: 'Huéspedes', value: hoy.huespedes ?? '—' },
    {
      icon: 'payments',
      label: 'Ingresos',
      value: hoy.ingresos != null ? `S/ ${Number(hoy.ingresos).toLocaleString('es-PE')}` : '—',
    },
    { icon: 'cancel', label: 'Canceladas', value: hoy.canceladas ?? '—' },
  ];

  const resumenMesItems = [
    { icon: 'event_available', label: 'Total reservas', value: mes.totalReservas ?? stats.totalReservas ?? '—' },
    { icon: 'check_circle', label: 'Reservas activas', value: mes.reservasActivas ?? '—' },
    { icon: 'hotel', label: 'Habitaciones activas', value: stats.habitacionesActivas ?? '—' },
    { icon: 'groups', label: 'Huéspedes', value: mes.huespedes ?? stats.huespedesMes ?? '—' },
    {
      icon: 'payments',
      label: 'Ingresos',
      value: mes.ingresos != null
        ? `S/ ${Number(mes.ingresos).toLocaleString('es-PE')}`
        : stats.ingresosMes != null
          ? `S/ ${Number(stats.ingresosMes).toLocaleString('es-PE')}`
          : '—',
    },
    { icon: 'cancel', label: 'Canceladas', value: mes.canceladas ?? '—' },
  ];

  const maxDensidad = Math.max(...(kpi.densidadDemanda || []).map(d => d.pct), 1);

  return (
    <ReporteModalShell
      title="Reporte resumen general"
      onClose={onClose}
      onPrint={handlePrint}
      loadingHotel={loadingHotel}
    >
      <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
        <HotelInfo hotel={hotel} />
      </header>

      <section className="mb-6">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
          Resumen del día actual · reservas creadas hoy ({formatFecha(hoy.fecha)})
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {resumenHoyItems.map(item => (
            <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons text-[#1e3a5f] text-base">{item.icon}</span>
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="font-black text-[#1e3a5f] text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
          Resumen del mes · {kpi.mesReferencia || 'mes actual'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {resumenMesItems.map(item => (
            <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons text-[#1e3a5f] text-base">{item.icon}</span>
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="font-black text-[#1e3a5f] text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {kpi.densidadDemanda?.length > 0 && (
        <section className="mb-6">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            Densidad de reserva por día
          </h4>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Día</th>
                  <th className="px-4 py-2.5 text-center">Reservas</th>
                  <th className="px-4 py-2.5 text-right">% del mes</th>
                </tr>
              </thead>
              <tbody>
                {kpi.densidadDemanda.map(d => (
                  <tr key={d.dia} className="border-t border-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{d.dia}</td>
                    <td className="px-4 py-2.5 text-center text-gray-600">{d.total}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#7c3aed]"
                            style={{ width: `${Math.max(4, (d.pct / maxDensidad) * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#1e3a5f] w-10 text-right">{d.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-auto pt-5 border-t border-gray-100 text-center">
        <HotelInfo hotel={hotel} compact />
        <p className="text-xs text-gray-400 mt-3">
          Documento generado el {formatFechaHora(new Date())} · Gracias por su preferencia
        </p>
      </footer>
    </ReporteModalShell>
  );
}

function IndicadoresKpiReporteModal({ kpi, onClose }) {
  const { hotel, loadingHotel } = useReporteHotel();

  const handlePrint = () => {
    if (!hotel) return;
    printIndicadoresKpiReport({ hotel, kpi });
  };

  const indicadoresDetalle = [
    {
      titulo: 'RevPAR',
      subtitulo: 'Ingreso por habitación disponible',
      valor: kpi.revpar != null ? `S/ ${fmt(kpi.revpar)}` : '—',
      detalle: `${kpi.nochesVendidasMes ?? 0} noches vendidas en el mes`,
    },
    {
      titulo: 'ADR',
      subtitulo: 'Tarifa media diaria',
      valor: kpi.adr != null ? `S/ ${fmt(kpi.adr)}` : '—',
      detalle: `S/ ${fmt(kpi.ingresoHabitacionesMes)} ingreso por noches vendidas`,
    },
    {
      titulo: 'Pico de demanda',
      subtitulo: 'Densidad por día de la semana',
      valor: kpi.picoDemanda?.dia ? `${kpi.picoDemanda.dia} · ${kpi.picoDemanda.pct}%` : '—',
      detalle: `${kpi.reservasMes ?? 0} reservas registradas en el mes`,
    },
    {
      titulo: 'Tasa de cancelación',
      subtitulo: 'Canceladas sobre total de reservas del mes',
      valor: kpi.tasaCancelacion != null ? `${fmt(kpi.tasaCancelacion)}%` : '—',
      detalle: `${kpi.totalCanceladasMes ?? 0} cancelada(s) de ${kpi.totalReservasMes ?? 0} reservas`,
    },
    {
      titulo: 'TMCR',
      subtitulo: 'Tiempo medio para concretar una reserva',
      valor: kpi.tmcrEtiqueta || '—',
      detalle: `${kpi.reservasConTmcr ?? 0} reserva(s) con tiempo registrado`,
    },
  ];

  return (
    <ReporteModalShell
      title="Reporte de indicadores"
      onClose={onClose}
      onPrint={handlePrint}
      loadingHotel={loadingHotel}
    >
      <header className="border-b-2 border-[#1e3a5f] pb-5 mb-6">
        <HotelInfo hotel={hotel} />
      </header>

      <p className="text-sm font-bold text-[#1e3a5f] mb-6">
        Indicadores de gestión · {kpi.mesReferencia || 'Mes actual'}
      </p>

      <section className="mb-6">
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2.5">Indicador</th>
                <th className="px-4 py-2.5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {indicadoresDetalle.map(ind => (
                <tr key={ind.titulo} className="border-t border-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{ind.titulo}</p>
                    <p className="text-xs text-gray-400">{ind.subtitulo}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{ind.detalle}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-[#1e3a5f] whitespace-nowrap">
                    {ind.valor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-auto pt-5 border-t border-gray-100 text-center">
        <HotelInfo hotel={hotel} compact />
        <p className="text-xs text-gray-400 mt-3">
          Documento generado el {formatFechaHora(new Date())} · Gracias por su preferencia
        </p>
      </footer>
    </ReporteModalShell>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({});
  const [recientes, setRecientes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showReporteGeneral, setShowReporteGeneral] = useState(false);
  const [showReporteIndicadores, setShowReporteIndicadores] = useState(false);

  useEffect(() => {
    Promise.all([
      statsAPI.getDashboard().catch(() => ({})),
      reservasAPI.getAll().catch(() => ({ reservations: [] })),
    ]).then(([s, r]) => {
      setStats(s.stats || s);
      setRecientes((r.reservations || []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const kpi = stats.indicadores || {};

  const tarjetas = [
    { label:'Total Reservas',      value: stats.totalReservas    ?? '—', icon:'event_available', bg:'#eff6ff', color:'#1e3a5f', change:'+12%' },
    { label:'Habitaciones Activas', value: stats.habitacionesActivas ?? '—', icon:'hotel', bg:'#f0fdf4', color:'#16a34a', change:'100%' },
    { label:'Huéspedes este mes',   value: stats.huespedesMes    ?? '—', icon:'groups', bg:'#faf5ff', color:'#7c3aed', change:'+8%' },
    { label:'Ingresos del mes',     value: stats.ingresosMes ? `S/ ${Number(stats.ingresosMes).toLocaleString()}` : '—', icon:'payments', bg:'#fffbeb', color:'#d97706', change:'+15%' },
  ];

  const indicadores = [
    {
      label: 'RevPAR',
      sublabel: `Ingreso por hab. disponible · ${kpi.mesReferencia || 'mes actual'}`,
      value: kpi.revpar != null ? `S/ ${fmt(kpi.revpar)}` : '—',
      icon: 'insights',
      bg: '#eff6ff',
      color: '#1e3a5f',
      detail: kpi.nochesVendidasMes != null
        ? `${kpi.nochesVendidasMes} noches vendidas`
        : null,
    },
    {
      label: 'ADR',
      sublabel: 'Tarifa media diaria · habitaciones ocupadas',
      value: kpi.adr != null ? `S/ ${fmt(kpi.adr)}` : '—',
      icon: 'sell',
      bg: '#f0fdf4',
      color: '#16a34a',
      detail: kpi.ingresoHabitacionesMes != null
        ? `S/ ${fmt(kpi.ingresoHabitacionesMes)} ingreso por noches`
        : null,
    },
    {
      label: 'Pico de demanda',
      sublabel: `Densidad por día de semana · ${kpi.reservasMes ?? 0} reservas`,
      value: kpi.picoDemanda?.dia ? `${kpi.picoDemanda.dia} · ${kpi.picoDemanda.pct}%` : '—',
      icon: 'calendar_view_week',
      bg: '#faf5ff',
      color: '#7c3aed',
      chart: kpi.densidadDemanda,
    },
    {
      label: 'Tasa de cancelación',
      sublabel: 'Canceladas sobre total de reservas del mes',
      value: kpi.tasaCancelacion != null ? `${fmt(kpi.tasaCancelacion)}%` : '—',
      icon: 'cancel',
      bg: kpi.tasaCancelacion > 0 ? '#fef2f2' : '#fffbeb',
      color: kpi.tasaCancelacion > 0 ? '#dc2626' : '#d97706',
      detail: kpi.totalCanceladasMes != null
        ? `${kpi.totalCanceladasMes} cancelada(s) de ${kpi.totalReservasMes ?? 0} reservas`
        : null,
    },
    {
      label: 'TMCR',
      sublabel: 'Consulta de disponibilidad → comprobante pagado',
      value: kpi.tmcrEtiqueta || '—',
      icon: 'timer',
      bg: '#ecfeff',
      color: '#0891b2',
      detail: kpi.reservasConTmcr != null
        ? `${kpi.reservasConTmcr} reserva(s) medidas en ${kpi.mesReferencia || 'el mes'}`
        : null,
    },
  ];

  const mensual = stats.mensual || [
    { mes:'Ene', pct:65 },{ mes:'Feb', pct:70 },{ mes:'Mar', pct:80 },
    { mes:'Abr', pct:75 },{ mes:'May', pct:85 },{ mes:'Jun', pct:90 },
  ];

  const maxDensidad = Math.max(...(kpi.densidadDemanda || []).map(d => d.pct), 1);

  return (
    <AdminPage loading={loading}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">Resumen general del hostal</p>
        </div>
        <button
          type="button"
          onClick={() => setShowReporteGeneral(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors px-5 py-3 shrink-0"
        >
          <span className="material-icons text-base">summarize</span>
          Generar reporte
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {tarjetas.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.bg }}>
                  <span className="material-icons text-[22px]" style={{ color: t.color }}>{t.icon}</span>
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                  <span className="material-icons text-sm">trending_up</span>{t.change}
                </span>
              </div>
              <p className="text-xl sm:text-[26px] font-black text-[#1e3a5f] tracking-wide mb-1">{t.value}</p>
              <p className="text-gray-400 text-xs">{t.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
            Indicadores de gestión · {kpi.mesReferencia || 'mes actual'}
          </h2>
          <button
            type="button"
            onClick={() => setShowReporteIndicadores(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors px-5 py-2.5 shrink-0"
          >
            <span className="material-icons text-base">summarize</span>
            Generar reporte
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {indicadores.map((ind, i) => (
            <motion.div
              key={ind.label}
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.32 + i * 0.08 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: ind.bg }}>
                    <span className="material-icons text-[22px]" style={{ color: ind.color }}>{ind.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{ind.label}</p>
                    <p className="text-[11px] text-gray-300 leading-snug mt-0.5">{ind.sublabel}</p>
                  </div>
                </div>

                <p className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-wide mb-2">{ind.value}</p>

                {ind.chart && ind.chart.length > 0 && (
                  <div className="mt-auto pt-3">
                    <div className="flex items-end justify-between gap-1 h-14">
                      {ind.chart.map((d) => (
                        <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center h-10">
                            <div
                              className="w-full max-w-[22px] rounded-t-md transition-all"
                              style={{
                                height: `${Math.max(8, (d.pct / maxDensidad) * 100)}%`,
                                background: d.pct === kpi.picoDemanda?.pct ? '#7c3aed' : '#ddd6fe',
                              }}
                              title={`${d.dia}: ${d.pct}% (${d.total})`}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400">{d.dia}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ind.detail && !ind.chart && (
                  <p className="text-xs text-gray-400 mt-auto pt-1">{ind.detail}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-6 sm:mb-7">
            <span className="material-icons text-[#1e3a5f] text-xl">bar_chart</span>
            <h2 className="font-black text-[#1e3a5f] tracking-wide text-lg sm:text-xl">Ocupación mensual</h2>
          </div>
          <div className="flex flex-col gap-4">
            {mensual.map(s => (
              <div key={s.mes}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-600">{s.mes}</span>
                  <span className="font-black text-[#1e3a5f]">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all bg-[#1e3a5f]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-7">
            <div className="flex items-center gap-2">
              <span className="material-icons text-[#1e3a5f] text-xl">receipt_long</span>
              <h2 className="font-black text-[#1e3a5f] tracking-wide text-lg sm:text-xl">Reservas recientes</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/reservas')}
              className="text-xs font-bold text-[#1e3a5f] hover:underline text-left sm:text-right"
            >
              Ver todas
            </button>
          </div>
          {recientes.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-icons text-gray-200 text-5xl">event_busy</span>
              <p className="text-gray-300 text-sm mt-3">No hay reservas aún</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recientes.map((r, i) => {
                const st = STATUS[r.estado || r.status] || STATUS.pendiente;
                return (
                  <div
                    key={r.id || i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#1e3a5f] text-sm truncate">{r.nombre_cliente || r.customerName || 'Cliente'}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.habitacion_nombre || r.roomName || r.codigo || '—'}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
                      <p className="font-black text-[#1e3a5f] text-sm">
                        S/ {Number(r.total ?? r.totalPrice ?? 0).toLocaleString('es-PE')}
                      </p>
                      <span className="text-xs font-bold rounded-full px-2.5 py-0.5 capitalize" style={{ background: st.bg, color: st.color }}>
                        {r.estado || r.status || 'pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showReporteGeneral && (
        <ResumenGeneralReporteModal
          stats={stats}
          kpi={kpi}
          onClose={() => setShowReporteGeneral(false)}
        />
      )}

      {showReporteIndicadores && (
        <IndicadoresKpiReporteModal
          kpi={kpi}
          onClose={() => setShowReporteIndicadores(false)}
        />
      )}
    </AdminPage>
  );
}
