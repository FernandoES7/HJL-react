const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80';

const slugTipo = (nombre = '') => {
  const lower = nombre.toLowerCase();
  if (lower.includes('simple')) return 'simple';
  if (lower.includes('doble')) return 'doble';
  if (lower.includes('triple')) return 'triple';
  if (lower.includes('familiar')) return 'familiar';
  if (lower.includes('suite')) return 'suite';
  return 'otro';
};

export function mapTipoHabitacion(tipo) {
  const activo = tipo.activo === undefined ? true : !!tipo.activo;
  return {
    id: tipo.id_tipo ?? tipo.id,
    nombre: tipo.nombre,
    tipo: slugTipo(tipo.nombre),
    precio: Number(tipo.precio_base ?? tipo.precio ?? 0),
    capacidad: tipo.capacidad ?? 1,
    cantidad_total: tipo.cantidad_total ?? 1,
    disponible: activo,
    activo,
    descripcion: tipo.descripcion || '',
    imagen: tipo.imagen_url || tipo.imagen || FALLBACK_IMG,
    servicios: tipo.servicios || [],
  };
}

export function mapFormToTipo(form) {
  return {
    nombre: form.nombre?.trim(),
    descripcion: form.descripcion?.trim() || null,
    capacidad: Number(form.capacidad) || 1,
    precio_base: Number(form.precio),
    imagen_url: form.imagen?.trim() || null,
    cantidad_total: Number(form.cantidad_total) || 1,
    activo: form.disponible !== false,
  };
}

export function mapTiposHabitacion(tipos = []) {
  return tipos.map(mapTipoHabitacion);
}
