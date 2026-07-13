import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { habitacionesAPI } from '../services/api';
import { mapTiposHabitacion } from '../utils/mapTipoHabitacion';

const BENEFICIOS = [
  { icon: 'wifi',       title: 'WiFi Gratuito',      desc: 'Internet de alta velocidad en todas las áreas' },
  { icon: 'place',      title: 'Ubicación Premium',   desc: 'En el corazón de Miraflores' },
  { icon: 'schedule',   title: 'Atención 24/7',       desc: 'Recepción disponible las 24 horas' },
  { icon: 'local_mall', title: 'Cerca de Larcomar',   desc: 'A 5 minutos del centro comercial' },
  { icon: 'gpp_good',   title: 'Seguridad Total',     desc: 'Cámaras y vigilancia permanente' },
  { icon: 'coffee',     title: 'Desayuno Incluido',   desc: 'Desayuno continental gratuito' },
];

const TESTIMONIOS = [
  { nombre: 'María González', pais: 'Argentina', nota: 5, texto: 'Excelente ubicación y atención. El personal es muy amable y las habitaciones están impecables.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { nombre: 'John Smith',    pais: 'EE.UU.',    nota: 5, texto: 'Perfect location in Miraflores! Close to everything. The room was clean and comfortable.',      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { nombre: 'Carlos Ruiz',    pais: 'Perú',      nota: 5, texto: 'Un lugar acogedor en pleno Miraflores. La atención 24/7 es un plus. Muy recomendable.',          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { nombre: 'Sophie Martin',  pais: 'Francia',   nota: 5, texto: "Magnifique! L'hôtel est très bien situé et le personnel est adorable.",                            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
];

const ROOMS_FALLBACK = [
  { id:1, nombre:'Habitación Simple',   precio:120, capacidad:1, descripcion:'Habitación acogedora perfecta para viajeros solitarios.',   imagen:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80' },
  { id:2, nombre:'Habitación Doble',    precio:180, capacidad:2, descripcion:'Espaciosa habitación con cama matrimonial, ideal para parejas.', imagen:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
  { id:3, nombre:'Suite Ejecutiva',     precio:350, capacidad:2, descripcion:'Suite de lujo con sala de estar separada y vista panorámica.',   imagen:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' },
];

export function Home() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState({ checkIn: '', checkOut: '', guests: 1 });

  useEffect(() => {
    habitacionesAPI
      .getTipos()
      .then((d) => {
        const tipos = mapTiposHabitacion(d.data);
        setRooms(tipos.length ? tipos : ROOMS_FALLBACK);
      })
      .catch(() => setRooms(ROOMS_FALLBACK));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams({ checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests }).toString();
    window.location.href = `/reservar?${p}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[620px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80" alt="Hotel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1e3a5f]/70" />
        <div className="relative h-full flex items-center justify-center md:justify-start px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} 
            className="text-white max-w-2xl text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide" style={{ marginBottom: '24px', lineHeight: '1.2' }}>
              Tu Hogar en el Corazón de Miraflores!!!
            </h1>
            <p className="text-lg text-gray-200" style={{ marginBottom: '48px', lineHeight: '1.6' }}>
              Confort, elegancia y atención personalizada para viajeros exigentes.
            </p>
            <Link to="/reservar" className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition-colors shadow-lg tracking-wide"
              style={{ padding: '16px 40px', fontSize: '16px' }}>
              Reserva Ahora
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative z-20 px-6" style={{ maxWidth: '1140px', margin: '-90px auto 0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100" style={{ padding: '40px' }}>
            <h2 className="text-2xl font-bold text-[#1e3a5f] tracking-wide text-center md:text-left" style={{ marginBottom: '32px' }}>Busca tu estadía ideal</h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {[
                { label: 'Check-in',   icon: 'calendar_today', field: 'checkIn',  type: 'date' },
                { label: 'Check-out',  icon: 'calendar_today', field: 'checkOut', type: 'date' },
                { label: 'Huéspedes', icon: 'group',           field: 'guests',   type: 'number' },
              ].map(({ label, icon, field, type }) => (
                <div key={field}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '12px' }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>{icon}</span> {label}
                  </label>
                  <input type={type} min={type === 'number' ? 1 : undefined} value={search[field]} onChange={e => setSearch({ ...search, [field]: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
                    style={{ padding: '14px 16px' }} />
                </div>
              ))}
              <div>
                <button type="submit" className="w-full bg-[#191281] hover:bg-[#17005b] text-white font-semibold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  style={{ padding: '14px 16px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>search</span> Buscar
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </section>

      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '120px 24px' }}>
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-[#191281] tracking-wide" style={{ marginBottom: '16px' }}>¿Por qué elegirnos?</h2>
          <p className="text-gray-400 text-base">Beneficios que hacen de tu estadía una experiencia única</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFICIOS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
              <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-center"
                style={{ padding: '44px 32px' }}>
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#191281]" style={{ marginBottom: '24px' }}>
                  <span className="material-icons" style={{ fontSize: '32px' }}>{b.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#191281]" style={{ marginBottom: '14px' }}>{b.title}</h3>
                <p className="text-gray-400 text-sm" style={{ lineHeight: '1.6', maxWidth: '260px' }}>{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50/50" style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191281] tracking-wide" style={{ marginBottom: '16px' }}>Nuestras Habitaciones</h2>
            <p className="text-gray-400 text-base">Espacios diseñados para tu comodidad</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rooms.slice(0, 3).map((room, i) => (
              <motion.div key={room.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                  <div className="relative h-56 overflow-hidden">
                    <img src={room.imagen} alt={room.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-5 right-5 bg-[#f59e0b] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-md tracking-wider">S/ {room.precio}/noche</div>
                  </div>
                  <div style={{ padding: '32px' }}>
                    <h3 className="text-xl font-bold text-[#191281]" style={{ marginBottom: '16px' }}>{room.nombre}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2" style={{ marginBottom: '32px', lineHeight: '1.6' }}>{room.descripcion}</p>
                    <div className="flex items-center justify-between border-t border-gray-100" style={{ paddingTop: '24px' }}>
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                        <span className="material-icons" style={{ fontSize: '16px' }}>groups</span> Hasta {room.capacidad} personas
                      </span>
                      <Link to="/habitaciones" className="border border-[#191281] text-[#191281] hover:bg-[#191281] hover:text-white text-xs font-bold rounded-xl transition-all duration-200 tracking-wide"
                        style={{ padding: '10px 20px' }}>Ver más</Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '64px' }}>
            <Link to="/habitaciones" className="inline-block bg-[#191281] hover:bg-[#191281] text-white font-semibold rounded-xl transition-colors shadow-md tracking-wide"
              style={{ padding: '16px 40px' }}>Ver todas las habitaciones</Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '120px 24px' }}>
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-[#191281] tracking-wide" style={{ marginBottom: '16px' }}>Lo que dicen nuestros huéspedes</h2>
          <p className="text-gray-400 text-base">Experiencias reales de viajeros satisfechos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TESTIMONIOS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
              <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full flex flex-col" style={{ padding: '32px', minHeight: '250px' }}>
                <div className="flex items-center gap-3.5" style={{ marginBottom: '20px' }}>
                  <img src={t.avatar} alt={t.nombre} className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" />
                  <div>
                    <p className="font-bold text-[#191281] text-sm tracking-wide">{t.nombre}</p>
                    <p className="text-xs text-gray-400">{t.pais}</p>
                  </div>
                </div>
                <div className="flex text-amber-400 gap-0.5" style={{ marginBottom: '16px' }}>
                  {[...Array(t.nota)].map((_, idx) => (
                    <span key={idx} className="material-icons" style={{ fontSize: '14px' }}>star</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs italic" style={{ lineHeight: '1.6' }}>"{t.texto}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}