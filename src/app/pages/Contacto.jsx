import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { resolveApiUrl } from '../services/api';

export function Contacto() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    try {
      setLoading(true);
      await fetch(resolveApiUrl('/contact'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch { console.error('Error al enviar'); }
    finally { setLoading(false); }
  };

  const info = [
    { icon: 'location_on', title: 'Dirección',          text: 'Av. José Larco 1234, Miraflores, Lima, Perú' },
    { icon: 'phone',       title: 'Teléfono',           text: '+51 1 234-5678' },
    { icon: 'email',       title: 'Email',              text: 'info@hostaljl.com' },
    { icon: 'schedule',    title: 'Horario de Atención',text: '24 horas, 7 días a la semana' },
  ];

  const faqs = [
    ['¿Cuál es el horario de check-in y check-out?', 'Check-in: 14:00 hrs. Check-out: 12:00 hrs.'],
    ['¿Incluyen desayuno?', 'No, todas las habitaciones no incluyen desayuno.'],
    ['¿Tienen estacionamiento?', 'Sí, estacionamiento privado gratuito para huéspedes.'],
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>

      <div className="bg-gray-50 text-center" style={{ padding: '80px 24px 30px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#191281] tracking-wide" style={{ marginBottom: '16px' }}>Contáctanos</h1>
          <p className="text-[#191281]" style={{ fontSize: '16px' }}>Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '48px' }}>
              <h2 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '22px', marginBottom: '32px' }}>Envíanos un mensaje</h2>

              {sent && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold rounded-xl" style={{ padding: '16px', marginBottom: '24px' }}>
                  <span className="material-icons" style={{ fontSize: '20px' }}>check_circle</span>
                  Mensaje enviado. Te contactaremos pronto.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  { id: 'name',    label: 'Nombre completo *',    icon: 'person',  type: 'text',  placeholder: 'Juan Pérez' },
                  { id: 'email',   label: 'Correo electrónico *', icon: 'email',   type: 'email', placeholder: 'juan@ejemplo.com' },
                  { id: 'phone',   label: 'Teléfono',             icon: 'phone',   type: 'tel',   placeholder: '+51 999 999 999' },
                ].map(({ id, label, icon, type, placeholder }) => (
                  <div key={id}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>{icon}</span> {label}
                    </label>
                    <input id={id} type={type} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700"
                      style={{ padding: '14px 16px' }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>chat</span> Mensaje *
                  </label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Cuéntanos cómo podemos ayudarte..." rows={5}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700 resize-none"
                    style={{ padding: '14px 16px' }} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  style={{ padding: '16px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div className="grid grid-cols-2 gap-4">
              {info.map((item) => (
                <div key={item.icon} className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '28px' }}>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center" style={{ marginBottom: '16px' }}>
                    <span className="material-icons text-[#191281]" style={{ fontSize: '24px' }}>{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-[#191281] text-sm tracking-wide" style={{ marginBottom: '8px' }}>{item.title}</h3>
                  <p className="text-gray-400 text-sm" style={{ lineHeight: '1.5' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative" style={{ height: '200px' }}>
                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
                  alt="Miraflores" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(30,58,95,0.35)' }}>
                  <div className="bg-white rounded-2xl text-center shadow-xl" style={{ padding: '16px 24px' }}>
                    <span className="material-icons text-[#191281]" style={{ fontSize: '28px' }}>location_on</span>
                    <p className="font-bold text-[#191281] text-sm">Miraflores, Lima</p>
                    <p className="text-gray-400 text-xs">Av. José Larco 1234</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '32px' }}>
              <h3 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '16px', marginBottom: '24px' }}>
                Preguntas frecuentes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {faqs.map(([q, a], i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0" style={{ paddingBottom: '20px', marginBottom: '20px' }}>
                    <p className="font-bold text-[#191281] text-sm" style={{ marginBottom: '6px' }}>{q}</p>
                    <p className="text-gray-400 text-sm" style={{ lineHeight: '1.5' }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}