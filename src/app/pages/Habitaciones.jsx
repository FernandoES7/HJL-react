import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HabitacionCard } from '../components/HabitacionCard';
import { habitacionesAPI } from '../services/api';
import { mapTiposHabitacion } from '../utils/mapTipoHabitacion';

const FALLBACK = [
  { id:1, nombre:'Habitación Simple',   tipo:'simple',   precio:120, capacidad:1, disponible:true, descripcion:'Habitación acogedora perfecta para viajeros solitarios.',    imagen:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', servicios:['WiFi','TV Cable','Baño privado'] },
  { id:2, nombre:'Habitación Doble',    tipo:'doble',    precio:180, capacidad:2, disponible:true, descripcion:'Espaciosa habitación con cama matrimonial, ideal para parejas.',  imagen:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80', servicios:['WiFi','TV Cable','Minibar'] },
  { id:3, nombre:'Habitación Familiar', tipo:'familiar', precio:250, capacidad:4, disponible:true, descripcion:'Amplia habitación con dos camas. Perfecta para familias.',          imagen:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80', servicios:['WiFi','TV Cable','Sofá'] },
  { id:4, nombre:'Suite Ejecutiva',     tipo:'suite',    precio:350, capacidad:2, disponible:true, descripcion:'Suite de lujo con sala de estar y vista panorámica al mar.',       imagen:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', servicios:['WiFi','Jacuzzi','Vista al mar'] },
  { id:5, nombre:'Habitación Triple',   tipo:'triple',   precio:220, capacidad:3, disponible:true, descripcion:'Tres camas individuales. Ideal para grupos de amigos.',            imagen:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80', servicios:['WiFi','TV Cable','Escritorio'] },
  { id:6, nombre:'Suite Deluxe',        tipo:'suite',    precio:450, capacidad:3, disponible:true, descripcion:'La suite más exclusiva con terraza privada y servicios premium.', imagen:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80', servicios:['WiFi','Jacuzzi','Terraza'] },
];

export function Habitaciones() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tipo: '', capacidad: '', precioMax: 1000 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    habitacionesAPI
      .getTipos()
      .then((d) => {
        const tipos = mapTiposHabitacion(d.data);
        setRooms(tipos.length ? tipos : FALLBACK);
      })
      .catch(() => setRooms(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(r => {
    if (filters.tipo && r.tipo !== filters.tipo) return false;
    if (filters.capacidad && r.capacidad < parseInt(filters.capacidad)) return false;
    if (r.precio > filters.precioMax) return false;
    return true;
  });

  const resetFilters = () => setFilters({ tipo: '', capacidad: '', precioMax: 1000 });
  const hasFilters = filters.tipo || filters.capacidad || filters.precioMax < 1000;

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>

        <div className=" text-center border-b border-gray-100" style={{ padding: '50px 24px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-[#191281] tracking-tight" style={{ marginBottom: '16px' }}>
            Nuestras Habitaciones
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium">
            Encuentra el espacio perfecto para tu estadía
            </p>
        </motion.div>
        </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '64px 24px' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '36px', marginBottom: '40px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#191281]" style={{ fontSize: '22px' }}>tune</span>
                <h3 className="text-[#191281] tracking-wide">Filtrar habitaciones</h3>
              </div>
              {hasFilters && (
                <button onClick={resetFilters}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm font-semibold transition-colors">
                  <span className="material-icons" style={{ fontSize: '16px' }}>close</span> Limpiar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                  <span className="material-icons" style={{ fontSize: '14px' }}>hotel</span> Tipo
                </label>
                <select value={filters.tipo} onChange={e => setFilters({ ...filters, tipo: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] text-gray-700"
                  style={{ padding: '14px 16px' }}>
                  <option value="">Todos los tipos</option>
                  {['simple','doble','triple','familiar','suite'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                  <span className="material-icons" style={{ fontSize: '14px' }}>groups</span> Capacidad mínima
                </label>
                <select value={filters.capacidad} onChange={e => setFilters({ ...filters, capacidad: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] text-gray-700"
                  style={{ padding: '14px 16px' }}>
                  <option value="">Cualquier capacidad</option>
                  {[1,2,3,4].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                  <span className="material-icons" style={{ fontSize: '14px' }}>payments</span>
                  Precio máximo: <span className="text-[#191281]">S/ {filters.precioMax}</span>
                </label>
                <input type="range" min="100" max="1000" step="50" value={filters.precioMax}
                  onChange={e => setFilters({ ...filters, precioMax: parseInt(e.target.value) })}
                  className="w-full accent-[#191281]" style={{ marginTop: '8px' }} />
                <div className="flex justify-between text-xs text-gray-300" style={{ marginTop: '6px' }}>
                  <span>S/ 100</span><span>S/ 1000</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <p className="text-gray-400 text-sm">
            Mostrando <span className="text-[#191281]">{filtered.length}</span> habitaciones
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '80px 0' }}>
            <div className="w-10 h-10 border-4 border-[#191281] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center" style={{ padding: '80px 24px' }}>
            <span className="material-icons text-gray-200" style={{ fontSize: '64px' }}>search_off</span>
            <p className="text-xl text-gray-400 tracking-wide" style={{ marginTop: '16px', marginBottom: '8px' }}>Sin resultados</p>
            <p className="text-gray-300 text-sm" style={{ marginBottom: '24px' }}>Prueba con otros filtros</p>
            <button onClick={resetFilters}
              className="bg-[#191281] text-white font-bold rounded-xl transition-colors"
              style={{ padding: '12px 28px' }}>Ver todas</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((room, i) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <HabitacionCard room={room} onVerDetalle={setSelected} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="relative" style={{ height: '260px' }}>
              <img src={selected.imagen} alt={selected.nombre} className="w-full h-full object-cover" />
              <button onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <span className="material-icons text-gray-600" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div style={{ padding: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 className="text-[#191281] tracking-wide" style={{ fontSize: '24px', marginBottom: '6px' }}>{selected.nombre}</h2>
                <p className="text-xs font-bold text-gray-400 tracking-widest capitalize">{selected.tipo}</p>
              </div>
              <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
                {[
                  { icon: 'groups',    label: 'Capacidad',    value: `${selected.capacidad} personas` },
                  { icon: 'payments', label: 'Precio/noche', value: `S/ ${selected.precio}`, highlight: true },
                  { icon: 'check_circle', label: 'Estado',   value: 'Disponible', green: true },
                ].map(({ icon, label, value, highlight, green }) => (
                  <div key={label} className="bg-gray-50 rounded-xl text-center" style={{ padding: '16px' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: green ? '#16a34a' : '#191281', display: 'block', marginBottom: '6px' }}>{icon}</span>
                    <p className="text-xs text-gray-400" style={{ marginBottom: '4px' }}>{label}</p>
                    <p className="text-sm" style={{ color: green ? '#16a34a' : highlight ? '#f59e0b' : '#191281' }}>{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm" style={{ lineHeight: '1.7', marginBottom: '24px' }}>{selected.descripcion}</p>
              {selected.servicios?.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <p className=" text-[#191281] text-sm uppercase tracking-widest" style={{ marginBottom: '14px' }}>Servicios incluidos</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.servicios.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="material-icons text-[#191281]" style={{ fontSize: '16px' }}>check_circle</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setSelected(null)}
                  className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl transition-colors"
                  style={{ padding: '14px' }}>Cerrar</button>
                <a href="/reservar"
                  className="flex-1 bg-[#191281] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{ padding: '14px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>event_available</span> Reservar ahora
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}