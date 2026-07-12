import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin',              icon: 'dashboard',       label: 'Dashboard' },
  { to: '/admin/habitaciones', icon: 'hotel',           label: 'Habitaciones' },
  { to: '/admin/reservas',     icon: 'event_available', label: 'Reservas' },
  { to: '/admin/usuarios',     icon: 'group',           label: 'Clientes' },
  { to: '/admin/empleados',    icon: 'badge',           label: 'Empleados' },
  { to: '/admin/configuracion', icon: 'settings',       label: 'Configuración' },
];

function SidebarContent({ pathname, user, onNavigate, onLogout }) {
  return (
    <>
      <div className="p-6 sm:p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <span className="text-[#191281] font-bold">JL</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm tracking-wide">Panel Admin</p>
            <p className="text-xs text-white/40 truncate">Hostal José Luis</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-3 mb-3">Menú</p>
        {NAV.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl transition-all duration-200 font-semibold text-sm px-4 py-3 mb-1 ${
              pathname === to
                ? 'bg-white/12 text-white'
                : 'text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="material-icons text-[20px]">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-white/10">
        <div className="flex items-center gap-3 rounded-xl p-3 mb-3 bg-white/5">
          <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center font-bold text-[#191281] text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrador'}</p>
            <p className="text-xs text-white/35 mt-0.5">Admin activo</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-xs rounded-xl font-bold transition-all bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent active:scale-[0.98] py-3"
        >
          <span className="material-icons text-base">logout</span>
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export function AdminHeader() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const close = () => setOpen(false);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#191281] text-white flex items-center justify-between px-4 shadow-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          <span className="material-icons">menu</span>
        </button>
        <span className="font-bold text-sm tracking-wide">Panel Admin</span>
        <div className="w-10" aria-hidden="true" />
      </header>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 max-w-[85vw] flex-col bg-[#191281] text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          onNavigate={close}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
