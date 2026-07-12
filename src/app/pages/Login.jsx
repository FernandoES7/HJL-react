import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Al menos una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Al menos una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Al menos un número', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Al menos un carácter especial', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const isPasswordValid = (password) => PASSWORD_RULES.every((r) => r.test(password));

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', email: '', documento: '', password: '', confirm: '' });
  const [pwFocus, setPwFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.email || !loginData.password) { setError('Completa todos los campos'); return; }
    try {
      setLoading(true);
      const user = await login(loginData.email, loginData.password);
      navigate(user.role === 'admin' ? '/admin' : '/mis-reservas');
    } catch (err) { setError(err.message || 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regData.name || !regData.email || !regData.documento || !regData.password) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    if (!isPasswordValid(regData.password)) {
      setError('La contraseña no cumple los requisitos de seguridad');
      return;
    }
    if (regData.password !== regData.confirm) { setError('Las contraseñas no coinciden'); return; }
    try {
      setLoading(true);
      await register(regData.name, regData.email, regData.password, regData.documento.trim());
      navigate('/mis-reservas');
    } catch (err) { setError(err.message || 'Error al registrar'); }
    finally { setLoading(false); }
  };

  const inputClass =
    'w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700';

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #191281 0%, #16304f 50%, #0f2240 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}>

        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', marginBottom: '20px' }}>
            <span className="text-[#f59e0b] font-bold" style={{ fontSize: '36px' }}>JL</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide" style={{ marginBottom: '8px' }}>Hostal Boutique</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>José Luis · Miraflores, Lima</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-100">
            {[['login', 'Iniciar Sesión'], ['register', 'Registrarse']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className="flex-1 text-sm font-bold tracking-wide transition-all"
                style={{
                  padding: '18px',
                  background: tab === t ? '#191281' : 'transparent',
                  color: tab === t ? '#ffffff' : '#9ca3af',
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '40px' }}>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl"
                style={{ padding: '14px 16px', marginBottom: '24px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Correo electrónico', icon: 'email', type: 'email', field: 'email', placeholder: 'tu@email.com' },
                  { label: 'Contraseña', icon: 'lock', type: 'password', field: 'password', placeholder: '••••••••' },
                ].map(({ label, icon, type, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>{icon}</span> {label}
                    </label>
                    <input
                      type={type}
                      value={loginData[field]}
                      onChange={(e) => setLoginData({ ...loginData, [field]: e.target.value })}
                      placeholder={placeholder}
                      className={inputClass}
                      style={{ padding: '14px 16px' }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  style={{ padding: '16px', marginTop: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>login</span>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>person</span> Nombre completo
                  </label>
                  <input
                    type="text"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className={inputClass}
                    style={{ padding: '14px 16px' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>email</span> Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className={inputClass}
                    style={{ padding: '14px 16px' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>badge</span> DNI / Pasaporte *
                  </label>
                  <input
                    type="text"
                    value={regData.documento}
                    onChange={(e) => setRegData({ ...regData, documento: e.target.value })}
                    placeholder="12345678"
                    className={inputClass}
                    style={{ padding: '14px 16px' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>lock</span> Contraseña
                  </label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                    placeholder="Mínimo 8 caracteres"
                    className={inputClass}
                    style={{ padding: '14px 16px' }}
                  />
                  {(pwFocus || regData.password) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl space-y-1.5" style={{ marginTop: '10px', padding: '12px 14px' }}>
                      {PASSWORD_RULES.map(({ id, label, test }) => {
                        const ok = test(regData.password);
                        return (
                          <div key={id} className="flex items-center gap-2">
                            <span
                              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                ok ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            >
                              <span className="material-icons text-white" style={{ fontSize: ok ? '12px' : '11px', color: ok ? '#fff' : '#9ca3af' }}>
                                {ok ? 'check' : 'close'}
                              </span>
                            </span>
                            <span className={`text-xs transition-colors ${ok ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>lock</span> Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={regData.confirm}
                    onChange={(e) => setRegData({ ...regData, confirm: e.target.value })}
                    placeholder="Repite tu contraseña"
                    className={inputClass}
                    style={{ padding: '14px 16px' }}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  style={{ padding: '16px', marginTop: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '24px' }}>
          <button onClick={() => navigate('/')}
            className="text-sm flex items-center gap-1.5 mx-auto transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span> Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
