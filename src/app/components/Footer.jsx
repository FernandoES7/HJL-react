import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white" style={{ marginTop: '120px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '72px 24px 40px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
              <div className="w-11 h-11 bg-[#191281] rounded-xl flex items-center justify-center">
                <span className="text-[#f59e0b] font-bold">JL</span>
              </div>
              <div>
                <p className="font-bold text-white tracking-wide">Hostal Boutique</p>
                <p className="text-xs text-gray-500">José Luis</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm" style={{ lineHeight: '1.7' }}>
              Tu hogar lejos de casa en el corazón de Miraflores, Lima.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white tracking-wide" style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Navegación
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['/', 'Inicio'], ['/habitaciones', 'Habitaciones'], ['/reservar', 'Reservar'], ['/contacto', 'Contacto']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white tracking-wide" style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Contacto
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: 'location_on', text: 'Av. José Larco 1234, Miraflores, Lima' },
                { icon: 'phone',       text: '+51 1 234-5678' },
                { icon: 'email',       text: 'info@hostaljl.com' },
              ].map(({ icon, text }) => (
                <li key={icon} className="flex items-start gap-3">
                  <span className="material-icons text-[#f59e0b]" style={{ fontSize: '18px', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
                  <span className="text-gray-400 text-sm" style={{ lineHeight: '1.5' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white tracking-wide" style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Síguenos
            </h3>
            <div className="flex gap-3">
              {[
                { icon: 'facebook',  label: 'Facebook' },
                { icon: 'photo_camera', label: 'Instagram' },
                { icon: 'alternate_email', label: 'Twitter' },
              ].map(({ icon, label }) => (
                <a key={label} href="#" title={label}
                  className="w-10 h-10 bg-gray-800 hover:bg-[#1e3a5f] rounded-full flex items-center justify-center transition-colors">
                  <span className="material-icons text-gray-400 hover:text-white" style={{ fontSize: '18px' }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 text-center" style={{ marginTop: '56px', paddingTop: '32px' }}>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Hostal Boutique José Luis. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}