import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, reservasAPI } from '../services/api';
import { StepIndicator } from '../components/reservar/StepIndicator';
import { Step1Fechas } from '../components/reservar/Step1Fechas';
import { Step2DatosPersonales } from '../components/reservar/Step2DatosPersonales';
import { Step3Pago } from '../components/reservar/Step3Pago';
import { Step4Confirmacion } from '../components/reservar/Step4Confirmacion';

const TMCR_SESSION_KEY = 'hostal_inicio_consulta';

function buildEstadoInicial(user) {
  const partes = (user?.name || '').trim().split(/\s+/);
  return {
    checkin: null,
    checkout: null,
    huespedes: 1,
    seleccion: {},
    tiposInfo: [],
    cliente: {
      nombre: partes[0] || '',
      apellido: partes.slice(1).join(' ') || '',
      email: user?.email || '',
      telefono: '',
      dni: user?.documento || '',
    },
  };
}

export function Reservar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [datos, setDatos] = useState(() => buildEstadoInicial(user));
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [inicioConsulta, setInicioConsulta] = useState(() => {
    const stored = sessionStorage.getItem(TMCR_SESSION_KEY);
    return stored || null;
  });

  const registrarInicioConsulta = () => {
    if (inicioConsulta) return inicioConsulta;
    const ts = new Date().toISOString();
    sessionStorage.setItem(TMCR_SESSION_KEY, ts);
    setInicioConsulta(ts);
    return ts;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const syncPerfil = async () => {
      try {
        const res = await authAPI.me();
        const perfil = res.data;
        if (!perfil) return;

        const partes = (perfil.nombre || '').trim().split(/\s+/);
        setDatos((d) => ({
          ...d,
          cliente: {
            ...d.cliente,
            nombre: partes[0] || d.cliente.nombre,
            apellido: partes.slice(1).join(' ') || d.cliente.apellido,
            email: perfil.email || d.cliente.email,
            dni: perfil.documento || d.cliente.dni,
            telefono: perfil.telefono || d.cliente.telefono,
          },
        }));
      } catch {
        // perfil opcional si falla la petición
      }
    };

    syncPerfil();
  }, [isAuthenticated]);

  const actualizar = (parcial) => setDatos((d) => ({ ...d, ...parcial }));

  const noches = useMemo(() => {
    if (!datos.checkin || !datos.checkout) return 0;
    return Math.round(
      (new Date(datos.checkout + 'T00:00:00') - new Date(datos.checkin + 'T00:00:00')) /
        (1000 * 60 * 60 * 24)
    );
  }, [datos.checkin, datos.checkout]);

  const totalPagar = useMemo(
    () =>
      (datos.tiposInfo || []).reduce((acc, tipo) => {
        const id = tipo.id ?? tipo.id_tipo;
        const precio = tipo.precio_noche ?? tipo.precio_base;
        return acc + (datos.seleccion[id] || 0) * precio * noches;
      }, 0),
    [datos.tiposInfo, datos.seleccion, noches]
  );

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      const seleccionArray = Object.entries(datos.seleccion)
        .filter(([, cant]) => cant > 0)
        .map(([tipoId, cantidad]) => {
          const tipo = datos.tiposInfo.find((t) => (t.id ?? t.id_tipo) === Number(tipoId));
          return {
            tipoId: Number(tipoId),
            cantidad,
            precioNoche: tipo?.precio_noche ?? tipo?.precio_base,
          };
        });

      const res = await reservasAPI.create({
        cliente: datos.cliente,
        checkin: datos.checkin,
        checkout: datos.checkout,
        numHuespedes: datos.huespedes,
        seleccion: seleccionArray,
        inicioConsulta: inicioConsulta || undefined,
      });

      setReserva(res.data);
      sessionStorage.removeItem(TMCR_SESSION_KEY);
      setInicioConsulta(null);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.message || 'Error al crear la reserva. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6">
        <StepIndicator currentStep={step} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {step === 1 && (
            <Step1Fechas
              datos={datos}
              onDatosChange={actualizar}
              onInicioConsulta={registrarInicioConsulta}
              onSiguiente={() => setStep(2)}
              onCancelar={() => navigate('/')}
            />
          )}

          {step === 2 && (
            <Step2DatosPersonales
              datos={datos}
              logueado={isAuthenticated}
              onDatosChange={actualizar}
              onSiguiente={() => setStep(3)}
              onAnterior={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Pago
              datos={datos}
              totalPagar={totalPagar}
              onConfirmar={handleConfirmar}
              onAnterior={() => setStep(2)}
              cargando={cargando}
            />
          )}

          {step === 4 && <Step4Confirmacion reserva={reserva} />}
        </div>
      </div>
    </div>
  );
}
