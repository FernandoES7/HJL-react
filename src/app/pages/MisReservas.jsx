import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { reservasAPI } from '../services/api';
import { BoletaModal } from '../components/BoletaModal';

const STATUS = {
  confirmada: { label: 'Confirmada', bg: '#dcfce7', color: '#16a34a', icon: 'check_circle' },
  completada: { label: 'Completada', bg: '#f3f4f6', color: '#6b7280', icon: 'task_alt' },
  cancelada:  { label: 'Cancelada',  bg: '#fee2e2', color: '#dc2626', icon: 'cancel' },
  pendiente:  { label: 'Pendiente',  bg: '#fef9c3', color: '#ca8a04', icon: 'hourglass_top' },
};

export function MisReservas() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [comprobanteId, setComprobanteId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    reservasAPI.getMias()
      .then(d => setReservas(d.reservations || []))
      .catch(() => console.error('Error al cargar reservas'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async () => {
    try {
      await reservasAPI.cancel(cancelId, 'Cancelada por el cliente');
      setReservas(prev => prev.map(r => r.id === cancelId ? { ...r, estado: 'cancelada' } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setCancelId(null);
    }
  };

  const activas   = reservas.filter(r => r.estado === 'confirmada');
  const historial = reservas.filter(r => r.estado !== 'confirmada');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }}>
      <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const ReservaCard = ({ res, showCancel }) => {
    const st = STATUS[res.estado] || STATUS.pendiente;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300" style={{ padding: '32px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '20px' }}>
          <div>
            <h3 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize: '18px', marginBottom: '4px' }}>
              {res.habitacion_nombre || res.roomName}
            </h3>
            <p className="text-xs font-mono text-gray-400">{res.codigo || res.id}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full text-xs font-bold"
            style={{ padding: '6px 14px', background: st.bg, color: st.color }}>
            <span className="material-icons" style={{ fontSize: '14px' }}>{st.icon}</span>
            {st.label}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: 'login',       label: 'Check-in',   value: res.check_in  || res.checkIn  },
            { icon: 'logout',      label: 'Check-out',  value: res.check_out || res.checkOut },
            { icon: 'groups',      label: 'Huéspedes',  value: `${res.huespedes || res.guests} ${(res.huespedes || res.guests) === 1 ? 'huésped' : 'huéspedes'}` },
            { icon: 'payments',    label: 'Total',      value: `S/ ${res.total || res.totalPrice}`, highlight: true },
          ].map(({ icon, label, value, highlight }) => (
            <div key={icon} className="flex items-center gap-3">
              <span className="material-icons text-[#1e3a5f]" style={{ fontSize: '18px' }}>{icon}</span>
              <span className="text-gray-400 text-sm">{label}:</span>
              <span className="font-bold text-sm" style={{ color: highlight ? '#f59e0b' : '#1e3a5f' }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 border-t border-gray-100" style={{ paddingTop: '24px' }}>
          <button onClick={() => setComprobanteId(res.id)}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors"
            style={{ padding: '12px' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>receipt_long</span> Comprobante
          </button>
          {showCancel && (
            <button onClick={() => setCancelId(res.id)}
              className="flex-1 flex items-center justify-center gap-2 border border-red-100 text-red-500 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors"
              style={{ padding: '12px' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>cancel</span> Cancelar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>

      <div className="bg-[#1e3a5f]" style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-white tracking-wide" style={{ marginBottom: '8px' }}>Mis Reservas</h1>
            <p className="text-gray-300">Bienvenido de vuelta, <span className="font-bold text-white">{user?.name}</span></p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>

        <section style={{ marginBottom: '64px' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
            <span className="material-icons text-[#1e3a5f]" style={{ fontSize: '24px' }}>event_available</span>
            <h2 className="text-2xl font-black text-[#1e3a5f] tracking-wide">Reservas Activas</h2>
            {activas.length > 0 && (
              <span className="bg-[#1e3a5f] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{activas.length}</span>
            )}
          </div>

          {activas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 text-center" style={{ padding: '80px 24px' }}>
              <span className="material-icons text-gray-200" style={{ fontSize: '64px' }}>event_busy</span>
              <h3 className="text-xl font-black text-gray-400 tracking-wide" style={{ marginTop: '16px', marginBottom: '8px' }}>No tienes reservas activas</h3>
              <p className="text-gray-300 text-sm" style={{ marginBottom: '28px' }}>¡Es hora de planear tu próxima estadía!</p>
              <button onClick={() => navigate('/reservar')}
                className="bg-[#1e3a5f] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                style={{ padding: '14px 32px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>add_circle</span> Hacer una reserva
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activas.map((res, i) => (
                <motion.div key={res.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ReservaCard res={res} showCancel={true} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {historial.length > 0 && (
          <section>
            <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
              <span className="material-icons text-gray-400" style={{ fontSize: '24px' }}>history</span>
              <h2 className="text-2xl font-black text-gray-500 tracking-wide">Historial</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ opacity: 0.75 }}>
              {historial.map((res, i) => (
                <motion.div key={res.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ReservaCard res={res} showCancel={false} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {comprobanteId && (
        <BoletaModal
          reservaId={comprobanteId}
          onClose={() => setComprobanteId(null)}
        />
      )}

      {cancelId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl" style={{ maxWidth: '420px', width: '100%', padding: '40px' }}>
            <div className="text-center" style={{ marginBottom: '28px' }}>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto" style={{ marginBottom: '16px' }}>
                <span className="material-icons text-red-400" style={{ fontSize: '32px' }}>warning</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 tracking-wide" style={{ marginBottom: '8px' }}>¿Cancelar reserva?</h3>
              <p className="text-gray-400 text-sm">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors"
                style={{ padding: '14px' }}>No, mantener</button>
              <button onClick={handleCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                style={{ padding: '14px' }}>Sí, cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}