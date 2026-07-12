import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const handleLogout = async () => { await logout(); window.location.href = '/'; };

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/habitaciones', label: 'Habitaciones' },
    { to: '/reservar', label: 'Reservar' },
    { to: '/contacto', label: 'Contacto' },
  ];

  return (
 <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100" style={{ height: '80px' }}>      <div className="h-full flex items-center justify-between px-4 md:px-8" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#191281] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-[#f59e0b] text-lg font-black">JL</span>
          </div>
          <div>
            <p className="font-bold text-[#191281] text-base leading-tight tracking-wide">Hostal Boutique</p>
            <p className="text-gray-400 text-xs leading-tight">José Luis</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className="text-sm font-semibold tracking-wide transition-colors"
              style={{ color: pathname === l.to ? '#1e3a5f' : '#9ca3af',
                       borderBottom: pathname === l.to ? '2px solid #f59e0b' : '2px solid transparent',
                       paddingBottom: '2px' }}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/mis-reservas'}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1e3a5f] transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a5f] font-black text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                {user?.name}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:text-[#1e3a5f] hover:border-[#1e3a5f] text-sm font-semibold rounded-xl transition-colors"
                style={{ padding: '8px 18px' }}>
                <span className="material-icons" style={{ fontSize: '16px' }}>logout</span> Salir
              </button>
            </>
          ) : (
            <Link to="/login"
              className="flex items-center gap-1.5 bg-[#191281] hover:bg-[#16304f] text-white text-sm font-bold rounded-xl transition-colors shadow-md "
              style={{ padding: '10px 24px' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>login</span> Iniciar sesión
            </Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <span className="material-icons text-gray-600">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 shadow-lg items-center text-center">
           {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="text-sm font-bold tracking-wide"
              style={{ color: pathname === l.to ? '#1e3a5f' : '#6b7280' }}>
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/mis-reservas'} onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-600">
                👤 {user?.name}
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }}
                className="border border-gray-200 text-sm font-bold rounded-xl text-left text-gray-600"
                style={{ padding: '10px 16px' }}>Cerrar sesión</button>
            </>
          ) : (
           <div style={{ padding: '5px 20px' }}>
            <Link to="/login" onClick={() => setOpen(false)}
                className="bg-[#191281] text-white text-sm font-bold rounded-xl text-center block"
                style={{ padding: '12px 24px' }}>Iniciar sesión</Link>
            </div>
           )}
        </div>
      )}
    </nav>
  );
} 
