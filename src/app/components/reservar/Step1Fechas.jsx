import { useState, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { CalendarioRango } from './CalendarioRango';
import { ListaHabitaciones } from './ListaHabitaciones';
import { habitacionesAPI } from '../../services/api';

const fmt = (n) => `S/ ${Number(n).toLocaleString('es-PE')}`;
const tipoId = (tipo) => tipo.id ?? tipo.id_tipo;
const normalizarTipo = (t) => ({
  ...t,
  id: t.id ?? t.id_tipo,
  precio_base: t.precio_base ?? t.precio_noche,
  precio_noche: t.precio_noche ?? t.precio_base,
});

const diffDias = (a, b) => {
  if (!a || !b) return 0;
  return Math.round(
    (new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / (1000 * 60 * 60 * 24)
  );
};

export function Step1Fechas({ datos, onDatosChange, onInicioConsulta, onSiguiente, onCancelar }) {
  const { checkin, checkout, huespedes, seleccion } = datos;
  const [cargandoRooms, setCargandoRooms] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const noches = diffDias(checkin, checkout);
  const tiposDisponibles = datos.tiposInfo || [];

  const buscar = useCallback(async () => {
    if (!checkin || !checkout || noches <= 0) return;
    onInicioConsulta?.();
    setCargandoRooms(true);
    setError(null);
    try {
      const res = await habitacionesAPI.getDisponibles(checkin, checkout);
      const tipos = (res.data || []).map(normalizarTipo);
      const nuevaSeleccion = { ...seleccion };
      for (const tipo of tipos) {
        const id = tipoId(tipo);
        if ((nuevaSeleccion[id] || 0) > tipo.disponibles) {
          nuevaSeleccion[id] = tipo.disponibles;
        }
      }
      onDatosChange({ seleccion: nuevaSeleccion, tiposInfo: tipos });
      setBuscado(true);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las habitaciones. Intenta de nuevo.');
      setBuscado(false);
    } finally {
      setCargandoRooms(false);
    }
  }, [checkin, checkout, noches, seleccion, onDatosChange, onInicioConsulta]);

  const totalHabitaciones = Object.values(seleccion).reduce((a, b) => a + b, 0);
  const totalPagar = tiposDisponibles.reduce(
    (acc, tipo) => acc + (seleccion[tipoId(tipo)] || 0) * tipo.precio_base * noches,
    0
  );
  const puedeAvanzar = buscado && totalHabitaciones > 0;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#191281]">Selecciona tus fechas y habitación</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Check-in</label>
              <input
                type="date"
                value={checkin || ''}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  onDatosChange({ checkin: e.target.value, checkout: null, tiposInfo: [], seleccion: {} });
                  setBuscado(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Check-out</label>
              <input
                type="date"
                value={checkout || ''}
                min={checkin || new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  onDatosChange({ checkout: e.target.value, tiposInfo: [], seleccion: {} });
                  setBuscado(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#191281]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Número de huéspedes</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onDatosChange({ huespedes: Math.max(1, huespedes - 1) })}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-semibold text-lg w-6 text-center">{huespedes}</span>
              <button
                type="button"
                onClick={() => onDatosChange({ huespedes: huespedes + 1 })}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={buscar}
            disabled={!checkin || !checkout || noches <= 0 || cargandoRooms}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-gray-300 disabled:cursor-not-allowed
              text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {cargandoRooms ? 'Buscando...' : 'Buscar habitaciones disponibles'}
          </button>

          <CalendarioRango
            checkin={checkin}
            checkout={checkout}
            onChange={({ checkin: ci, checkout: co }) => {
              onDatosChange({
                checkin: ci ?? checkin,
                checkout: co ?? checkout,
                tiposInfo: [],
                seleccion: {},
              });
              setBuscado(false);
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Habitaciones disponibles</h3>

          {!buscado && !cargandoRooms && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-xl">
              <span className="text-3xl">🗓️</span>
              <p className="text-sm text-center">
                Selecciona las fechas y pulsa<br />&quot;Buscar habitaciones disponibles&quot;
              </p>
            </div>
          )}

          {cargandoRooms && (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#191281] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm">Consultando disponibilidad...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>
          )}

          {buscado && !cargandoRooms && (
            <ListaHabitaciones
              tipos={tiposDisponibles}
              seleccion={seleccion}
              noches={noches}
              onCambiar={(nueva) => onDatosChange({ seleccion: nueva })}
            />
          )}

          {buscado && totalHabitaciones > 0 && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#191281]">Total a pagar:</span>
                <span className="text-xl font-bold text-[#191281]">{fmt(totalPagar)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {noches} noche{noches !== 1 ? 's' : ''} · {totalHabitaciones} habitación
                {totalHabitaciones !== 1 ? 'es' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancelar}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ‹ Cancelar
        </button>
        <button
          type="button"
          onClick={onSiguiente}
          disabled={!puedeAvanzar}
          className="flex items-center gap-2 bg-[#191281] hover:bg-[#16304f] disabled:bg-gray-300 disabled:cursor-not-allowed
            text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
}
