import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

const fmt = (n) => `S/ ${Number(n).toLocaleString('es-PE')}`;

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExp = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export function Step3Pago({ datos, totalPagar, onConfirmar, onAnterior, cargando }) {
  const [pago, setPago] = useState({ titular: '', numero: '', expiracion: '', cvv: '' });
  const [errores, setErrores] = useState({});

  const update = (campo, valor) => {
    setPago((p) => ({ ...p, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (!pago.titular.trim()) e.titular = 'Nombre del titular requerido';
    if (pago.numero.replace(/\s/g, '').length < 16) e.numero = 'Número de tarjeta inválido';
    if (!/^\d{2}\/\d{2}$/.test(pago.expiracion)) e.expiracion = 'Formato MM/AA inválido';
    if (pago.cvv.length < 3) e.cvv = 'CVV inválido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#191281] mb-1">Información de pago</h2>
      <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
        <Lock size={13} />
        Transacción simulada (sin cargo real)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre en la tarjeta *</label>
            <input
              type="text"
              placeholder="JUAN PÉREZ"
              value={pago.titular}
              onChange={(e) => update('titular', e.target.value.toUpperCase())}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] ${
                errores.titular ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errores.titular && <p className="text-xs text-red-500 mt-0.5">{errores.titular}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Número de tarjeta *</label>
            <div className="relative">
              <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={pago.numero}
                onChange={(e) => update('numero', formatCard(e.target.value))}
                className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] font-mono ${
                  errores.numero ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            {errores.numero && <p className="text-xs text-red-500 mt-0.5">{errores.numero}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Expiración *</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={pago.expiracion}
                onChange={(e) => update('expiracion', formatExp(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] font-mono ${
                  errores.expiracion ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errores.expiracion && <p className="text-xs text-red-500 mt-0.5">{errores.expiracion}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">CVV *</label>
              <input
                type="password"
                placeholder="•••"
                maxLength={4}
                value={pago.cvv}
                onChange={(e) => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] font-mono ${
                  errores.cvv ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errores.cvv && <p className="text-xs text-red-500 mt-0.5">{errores.cvv}</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-[#191281] text-sm">Resumen de reserva</p>
            <hr className="border-indigo-100" />
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Check-in</span>
                <span className="font-medium text-gray-800">{datos.checkin}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Check-out</span>
                <span className="font-medium text-gray-800">{datos.checkout}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Huéspedes</span>
                <span className="font-medium text-gray-800">{datos.huespedes}</span>
              </div>
            </div>
            <hr className="border-indigo-100" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[#191281]">Total</span>
              <span className="text-xl font-bold text-[#191281]">{fmt(totalPagar)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onAnterior}
          disabled={cargando}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ‹ Anterior
        </button>
        <button
          type="button"
          onClick={() => validar() && onConfirmar()}
          disabled={cargando}
          className="flex items-center gap-2 bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {cargando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            `Confirmar y pagar ${fmt(totalPagar)}`
          )}
        </button>
      </div>
    </div>
  );
}
