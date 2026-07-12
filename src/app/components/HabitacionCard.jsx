import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HabitacionCard({ room, onVerDetalle }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        <img src={room.imagen} alt={room.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-5 right-5 bg-[#f59e0b] text-white rounded-xl text-xs font-bold shadow-md tracking-wider"
          style={{ padding: '6px 14px' }}>
          S/ {room.precio}/noche
        </div>
        {room.disponible && (
          <div className="absolute top-5 left-5 bg-green-500 text-white rounded-full text-xs font-bold"
            style={{ padding: '4px 12px' }}>
            Disponible
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1" style={{ padding: '28px' }}>
        <div className="flex-1">
          <h3 className="font-black text-[#191281] tracking-wide" style={{ fontSize: '18px', marginBottom: '8px' }}>{room.nombre}</h3>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest capitalize" style={{ marginBottom: '16px' }}>{room.tipo}</p>
          <p className="text-gray-400 text-sm line-clamp-2" style={{ marginBottom: '20px', lineHeight: '1.65' }}>{room.descripcion}</p>
          <div className="flex items-center gap-2 text-gray-400 text-xs" style={{ marginBottom: '16px' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>groups</span>
            Hasta {room.capacidad} {room.capacidad === 1 ? 'persona' : 'personas'}
          </div>
          {room.servicios?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.servicios.slice(0, 3).map((s, i) => (
                <span key={i} className="bg-blue-50 text-[#191281] text-xs font-semibold rounded-full"
                  style={{ padding: '4px 12px' }}>✓ {s}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-gray-100" style={{ marginTop: '24px', paddingTop: '24px' }}>
          <button onClick={() => onVerDetalle?.(room)}
            className="flex-1 border border-[#191281] text-[#191281] hover:bg-[#191281] hover:text-white text-sm font-bold rounded-xl transition-all duration-200"
            style={{ padding: '10px' }}>Ver detalles</button>
          <button onClick={() => navigate('/reservar')}
            className="flex-1 bg-[#191281] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors shadow-md"
            style={{ padding: '10px' }}>Reservar</button>
        </div>
      </div>
    </div>
  );
}