import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #16304f 50%, #0f2240 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center" style={{ maxWidth: '480px' }}>
        <p className="font-black text-white/10 select-none" style={{ fontSize: '160px', lineHeight: 1 }}>404</p>
        <div style={{ marginTop: '-20px', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '4px', background: '#f59e0b', borderRadius: '2px', margin: '0 auto 28px' }} />
          <h2 className="text-3xl font-black text-white tracking-wide" style={{ marginBottom: '12px' }}>Página no encontrada</h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
            Lo sentimos, la página que buscas no existe o fue movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/"
            className="flex items-center justify-center gap-2 bg-white text-[#1e3a5f] font-bold rounded-xl transition-colors shadow-lg hover:bg-blue-50"
            style={{ padding: '14px 32px' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>home</span> Volver al inicio
          </Link>
          <Link to="/habitaciones"
            className="flex items-center justify-center gap-2 font-bold rounded-xl transition-colors"
            style={{ padding: '14px 32px', border: '2px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>hotel</span> Ver habitaciones
          </Link>
        </div>
      </motion.div>
    </div>
  );
}