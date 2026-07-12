const fmt = (n) =>
  `S/ ${Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (f) => {
  if (!f) return '—';
  const s = typeof f === 'string' ? f.slice(0, 10) : f;
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const formatFechaHora = (f) => {
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return formatFecha(f);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function hotelBlock(hotel, compact = false) {
  const size = compact ? '12px' : '14px';
  const nameSize = compact ? '13px' : '16px';
  return `
    <div style="font-size:${size};color:#4b5563;line-height:1.5;">
      <p style="margin:0;font-size:${nameSize};font-weight:800;color:#1e3a5f;">${esc(hotel.nombre)}</p>
      ${hotel.categoria ? `<p style="margin:2px 0 0;color:#9ca3af;font-size:11px;text-transform:capitalize;">${esc(hotel.categoria)}</p>` : ''}
      <p style="margin:${compact ? '4px' : '8px'} 0 0;">${esc(hotel.direccion)}</p>
      <p style="margin:0;">Tel: ${esc(hotel.telefono || '—')} · ${esc(hotel.email || '—')}</p>
    </div>
  `;
}

export function buildBoletaPrintHtml({ reserva, hotel, noches, totalBoleta, checkin, checkout }) {
  const habitacionesRows = (reserva.habitaciones || [])
    .map((h) => {
      const subtotal = Number(h.precio_noche) * noches;
      return `
        <tr>
          <td>${esc(h.tipo_nombre || h.tipo_habitacion)}</td>
          <td>Hab. <strong>${esc(h.numero)}</strong> · Piso ${esc(h.piso)}</td>
          <td style="text-align:right;">${fmt(h.precio_noche)}</td>
          <td style="text-align:right;font-weight:600;color:#1e3a5f;">${fmt(subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  const habitacionesSection =
    reserva.habitaciones?.length > 0
      ? `
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>N° / Piso</th>
              <th style="text-align:right;">Precio/noche</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${habitacionesRows}</tbody>
        </table>
      `
      : '<p class="muted">Sin detalle de habitaciones asignadas.</p>';

  const titulo = `Comprobante ${reserva.codigo_reserva}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(titulo)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #374151;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { display: flex; min-height: 0; }
    .sidebar {
      width: 36px;
      background: #1e3a5f;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar span {
      color: #fff;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.35em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
    .content { flex: 1; padding: 20px 24px; }
    header { border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
    footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px; text-align: center; }
    h2 {
      margin: 0 0 12px;
      font-size: 10px;
      font-weight: 800;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
    dl { margin: 0; }
    .row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; }
    .row dt { color: #9ca3af; flex-shrink: 0; }
    .row dd { margin: 0; color: #374151; }
    .row dd strong, .mono { font-family: ui-monospace, monospace; font-weight: 700; color: #1e3a5f; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    th, td { padding: 8px 12px; text-align: left; font-size: 12px; }
    thead tr { background: #f9fafb; }
    th { font-size: 10px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr { border-top: 1px solid #f9fafb; }
    .total-box {
      background: rgba(30, 58, 95, 0.05);
      border: 1px solid rgba(30, 58, 95, 0.1);
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
    }
    .total-box .amount { font-size: 28px; font-weight: 800; color: #f59e0b; }
    .muted { color: #9ca3af; font-size: 13px; background: #f9fafb; padding: 12px 16px; border-radius: 8px; }
    .foot-note { font-size: 11px; color: #9ca3af; margin-top: 10px; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>BOLETA</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>

      <div class="grid">
        <section>
          <h2>Datos del huésped</h2>
          <dl>
            <div class="row"><dt>Nombre:</dt><dd><strong>${esc(reserva.cliente_nombre || '—')}</strong></dd></div>
            <div class="row"><dt>Documento:</dt><dd>${esc(reserva.documento || '—')}</dd></div>
            <div class="row"><dt>Email:</dt><dd>${esc(reserva.email || '—')}</dd></div>
            <div class="row"><dt>Teléfono:</dt><dd>${esc(reserva.telefono || '—')}</dd></div>
          </dl>
        </section>
        <section>
          <h2>Detalle de la reserva</h2>
          <dl>
            <div class="row"><dt>Código:</dt><dd class="mono">${esc(reserva.codigo_reserva)}</dd></div>
            ${reserva.factura?.numero_factura ? `<div class="row"><dt>N° boleta:</dt><dd class="mono">${esc(reserva.factura.numero_factura)}</dd></div>` : ''}
            <div class="row"><dt>Estado:</dt><dd>${esc(ESTADO_LABEL[reserva.estado] || reserva.estado)}</dd></div>
            <div class="row"><dt>Fecha reserva:</dt><dd>${formatFecha(reserva.fecha_reserva || reserva.created_at)}</dd></div>
            <div class="row"><dt>Check-in:</dt><dd>${checkin}</dd></div>
            <div class="row"><dt>Check-out:</dt><dd>${checkout}</dd></div>
            <div class="row"><dt>Huéspedes:</dt><dd>${esc(reserva.num_huespedes)}</dd></div>
            <div class="row"><dt>Noches:</dt><dd>${noches}</dd></div>
          </dl>
        </section>
      </div>

      <section>
        <h2>Habitaciones reservadas</h2>
        ${habitacionesSection}
      </section>

      <div class="total-box">
        <div>
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Total de la boleta</p>
          ${
            reserva.factura
              ? `<p style="margin:0;font-size:11px;color:#6b7280;">Subtotal ${fmt(reserva.factura.subtotal)}${
                  Number(reserva.factura.impuestos) > 0 ? ` · IGV ${fmt(reserva.factura.impuestos)}` : ''
                }</p>`
              : ''
          }
        </div>
        <p class="amount">${fmt(totalBoleta)}</p>
      </div>

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printBoleta(data) {
  const html = buildBoletaPrintHtml(data);
  printHtmlDocument(html);
}

const ESTADO_REPORTE = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

export function buildReservasReportHtml({ hotel, reservas, periodo, estadoLabel, totalMonto }) {
  const rows = reservas.map((r) => {
    const checkIn = formatFecha(r.check_in || r.checkIn);
    const checkOut = formatFecha(r.check_out || r.checkOut);
    const estado = ESTADO_REPORTE[r.estado || r.status] || r.estado || r.status || '—';
    return `
      <tr>
        <td class="mono">${esc(r.codigo || r.id)}</td>
        <td>
          <strong>${esc(r.nombre_cliente || r.customerName)}</strong><br />
          <span class="muted">${esc(r.email_cliente || r.customerEmail)}</span>
        </td>
        <td>${esc(r.habitacion_nombre || r.roomName || '—')}</td>
        <td>${esc(checkIn)}<br />${esc(checkOut)}</td>
        <td style="text-align:right;font-weight:700;color:#1e3a5f;">S/ ${Number(r.total || r.totalPrice || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${esc(estado)}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de reservas</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #374151;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { display: flex; min-height: 0; }
    .sidebar {
      width: 36px;
      background: #1e3a5f;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar span {
      color: #fff;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.35em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
    .content { flex: 1; padding: 20px 24px; }
    header { border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
    footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px; text-align: center; }
    h2 {
      margin: 0 0 12px;
      font-size: 10px;
      font-weight: 800;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .params { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; font-size: 13px; }
    .params dt { color: #9ca3af; display: inline; }
    .params dd { display: inline; margin: 0 0 0 4px; font-weight: 600; color: #1e3a5f; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #f3f4f6; margin-bottom: 20px; }
    th, td { padding: 8px 10px; text-align: left; font-size: 11px; vertical-align: top; }
    thead tr { background: #f9fafb; }
    th { font-size: 9px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr { border-top: 1px solid #f9fafb; }
    .mono { font-family: ui-monospace, monospace; font-weight: 700; color: #6b7280; font-size: 10px; }
    .muted { color: #9ca3af; font-size: 10px; }
    .foot-note { font-size: 11px; color: #9ca3af; margin-top: 12px; }
    .amount { color: #f59e0b; font-weight: 800; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>

      <h2>Parámetros del reporte</h2>
      <dl class="params">
        <div><dt>Período:</dt><dd>${esc(periodo)}</dd></div>
        <div><dt>Estado:</dt><dd>${esc(estadoLabel)}</dd></div>
        <div><dt>Total reservas:</dt><dd>${reservas.length}</dd></div>
        <div><dt>Monto total:</dt><dd class="amount">S/ ${Number(totalMonto).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>
      </dl>

      <h2>Listado de reservas</h2>
      ${
        reservas.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Habitación</th>
                  <th>Fechas</th>
                  <th style="text-align:right;">Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`
          : '<p class="muted">No hay reservas que coincidan con los filtros seleccionados.</p>'
      }

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printReservasReport(data) {
  printHtmlDocument(buildReservasReportHtml(data));
}

export function buildResumenGeneralReportHtml({ hotel, stats, kpi }) {
  const hoy = stats.resumenHoy || {};
  const mes = stats.resumenMes || {};

  const densidadRows = (kpi.densidadDemanda || [])
    .map((d) => `
      <tr>
        <td>${esc(d.dia)}</td>
        <td style="text-align:center;">${d.total}</td>
        <td style="text-align:right;font-weight:700;color:#1e3a5f;">${d.pct}%</td>
      </tr>
    `)
    .join('');

  const resumenHoyRows = [
    ['Fecha', formatFecha(hoy.fecha)],
    ['Reservas creadas', hoy.totalReservas ?? '—'],
    ['Sin cancelar', hoy.reservasEfectivas ?? '—'],
    ['Huéspedes', hoy.huespedes ?? '—'],
    ['Ingresos', hoy.ingresos != null ? `S/ ${Number(hoy.ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'],
    ['Canceladas', hoy.canceladas ?? '—'],
  ]
    .map(([label, value]) => `
      <div class="row"><dt>${esc(label)}:</dt><dd><strong>${esc(value)}</strong></dd></div>
    `)
    .join('');

  const resumenMesRows = [
    ['Total reservas', mes.totalReservas ?? stats.totalReservas ?? '—'],
    ['Reservas activas', mes.reservasActivas ?? '—'],
    ['Habitaciones activas', stats.habitacionesActivas ?? '—'],
    ['Huéspedes', mes.huespedes ?? stats.huespedesMes ?? '—'],
    ['Ingresos', mes.ingresos != null ? `S/ ${Number(mes.ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : stats.ingresosMes != null ? `S/ ${Number(stats.ingresosMes).toLocaleString('es-PE')}` : '—'],
    ['Canceladas', mes.canceladas ?? '—'],
  ]
    .map(([label, value]) => `
      <div class="row"><dt>${esc(label)}:</dt><dd><strong>${esc(value)}</strong></dd></div>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte resumen general</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#374151; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .wrap { display:flex; min-height:0; }
    .sidebar { width:36px; background:#1e3a5f; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar span { color:#fff; font-weight:800; font-size:12px; letter-spacing:0.35em; writing-mode:vertical-rl; transform:rotate(180deg); }
    .content { flex:1; padding:20px 24px; }
    header { border-bottom:2px solid #1e3a5f; padding-bottom:16px; margin-bottom:20px; }
    footer { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:20px; text-align:center; }
    h2 { margin:0 0 12px; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.12em; }
    .row { display:flex; gap:8px; margin-bottom:6px; font-size:13px; }
    .row dt { color:#9ca3af; flex-shrink:0; }
    .row dd { margin:0; color:#374151; }
    .grid-resumen { display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; margin-bottom:20px; }
    table { width:100%; border-collapse:collapse; border:1px solid #f3f4f6; margin-bottom:20px; }
    th, td { padding:8px 12px; text-align:left; font-size:12px; vertical-align:top; }
    thead tr { background:#f9fafb; }
    th { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
    tbody tr { border-top:1px solid #f9fafb; }
    .muted { color:#9ca3af; font-size:10px; }
    .foot-note { font-size:11px; color:#9ca3af; margin-top:12px; }
    .periodo { font-size:14px; font-weight:700; color:#1e3a5f; margin-bottom:20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>
      <p class="periodo">Resumen general · reservas creadas hoy (${esc(formatFecha(hoy.fecha))})</p>

      <h2>Resumen del día actual (reservas creadas hoy)</h2>
      <dl class="grid-resumen">${resumenHoyRows}</dl>

      <h2>Resumen del mes · ${esc(kpi.mesReferencia || 'Mes actual')}</h2>
      <dl class="grid-resumen">${resumenMesRows}</dl>

      <h2>Densidad de reserva por día de la semana</h2>
      ${
        densidadRows
          ? `<table>
              <thead><tr><th>Día</th><th style="text-align:center;">Reservas</th><th style="text-align:right;">% del mes</th></tr></thead>
              <tbody>${densidadRows}</tbody>
            </table>`
          : '<p class="muted">Sin datos de densidad para el período.</p>'
      }

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function buildIndicadoresKpiReportHtml({ hotel, kpi }) {
  const indicadorRows = [
    ['RevPAR', kpi.revpar != null ? `S/ ${Number(kpi.revpar).toFixed(2)}` : '—', `${kpi.nochesVendidasMes ?? 0} noches vendidas`],
    ['ADR', kpi.adr != null ? `S/ ${Number(kpi.adr).toFixed(2)}` : '—', `S/ ${Number(kpi.ingresoHabitacionesMes ?? 0).toFixed(2)} ingreso por noches`],
    ['Pico de demanda', kpi.picoDemanda?.dia ? `${kpi.picoDemanda.dia} · ${kpi.picoDemanda.pct}%` : '—', `${kpi.reservasMes ?? 0} reservas en el mes`],
    ['Tasa de cancelación', kpi.tasaCancelacion != null ? `${Number(kpi.tasaCancelacion).toFixed(2)}%` : '—', `${kpi.totalCanceladasMes ?? 0} cancelada(s) de ${kpi.totalReservasMes ?? 0} reservas`],
    ['TMCR', kpi.tmcrEtiqueta || '—', `${kpi.reservasConTmcr ?? 0} reserva(s) medidas`],
  ]
    .map(([nombre, valor, detalle]) => `
      <tr>
        <td><strong>${esc(nombre)}</strong><br /><span class="muted">${esc(detalle)}</span></td>
        <td style="text-align:right;font-weight:800;color:#1e3a5f;font-size:15px;">${esc(valor)}</td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de indicadores</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#374151; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .wrap { display:flex; min-height:0; }
    .sidebar { width:36px; background:#1e3a5f; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar span { color:#fff; font-weight:800; font-size:12px; letter-spacing:0.35em; writing-mode:vertical-rl; transform:rotate(180deg); }
    .content { flex:1; padding:20px 24px; }
    header { border-bottom:2px solid #1e3a5f; padding-bottom:16px; margin-bottom:20px; }
    footer { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:20px; text-align:center; }
    h2 { margin:0 0 12px; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.12em; }
    table { width:100%; border-collapse:collapse; border:1px solid #f3f4f6; margin-bottom:20px; }
    th, td { padding:8px 12px; text-align:left; font-size:12px; vertical-align:top; }
    thead tr { background:#f9fafb; }
    th { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
    tbody tr { border-top:1px solid #f9fafb; }
    .muted { color:#9ca3af; font-size:10px; }
    .foot-note { font-size:11px; color:#9ca3af; margin-top:12px; }
    .periodo { font-size:14px; font-weight:700; color:#1e3a5f; margin-bottom:20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>
      <p class="periodo">Indicadores de gestión · ${esc(kpi.mesReferencia || 'Mes actual')}</p>

      <h2>Indicadores hoteleros</h2>
      <table>
        <thead><tr><th>Indicador</th><th style="text-align:right;">Valor</th></tr></thead>
        <tbody>${indicadorRows}</tbody>
      </table>

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printResumenGeneralReport(data) {
  printHtmlDocument(buildResumenGeneralReportHtml(data));
}

export function printIndicadoresKpiReport(data) {
  printHtmlDocument(buildIndicadoresKpiReportHtml(data));
}

/** @deprecated Use printResumenGeneralReport or printIndicadoresKpiReport */
export function buildIndicadoresReportHtml({ hotel, stats, kpi }) {
  const densidadRows = (kpi.densidadDemanda || [])
    .map((d) => `
      <tr>
        <td>${esc(d.dia)}</td>
        <td style="text-align:center;">${d.total}</td>
        <td style="text-align:right;font-weight:700;color:#1e3a5f;">${d.pct}%</td>
      </tr>
    `)
    .join('');

  const resumenRows = [
    ['Total reservas', stats.totalReservas ?? '—'],
    ['Habitaciones activas', stats.habitacionesActivas ?? '—'],
    ['Huéspedes del mes', stats.huespedesMes ?? '—'],
    ['Ingresos del mes', stats.ingresosMes != null ? `S/ ${Number(stats.ingresosMes).toLocaleString('es-PE')}` : '—'],
  ]
    .map(([label, value]) => `
      <div class="row"><dt>${esc(label)}:</dt><dd><strong>${esc(value)}</strong></dd></div>
    `)
    .join('');

  const indicadorRows = [
    ['RevPAR', kpi.revpar != null ? `S/ ${Number(kpi.revpar).toFixed(2)}` : '—', `${kpi.nochesVendidasMes ?? 0} noches vendidas`],
    ['ADR', kpi.adr != null ? `S/ ${Number(kpi.adr).toFixed(2)}` : '—', `S/ ${Number(kpi.ingresoHabitacionesMes ?? 0).toFixed(2)} ingreso por noches`],
    ['Pico de demanda', kpi.picoDemanda?.dia ? `${kpi.picoDemanda.dia} · ${kpi.picoDemanda.pct}%` : '—', `${kpi.reservasMes ?? 0} reservas en el mes`],
    ['Tasa de cancelación', kpi.tasaCancelacion != null ? `${Number(kpi.tasaCancelacion).toFixed(2)}%` : '—', `${kpi.totalCanceladasMes ?? 0} cancelada(s) de ${kpi.totalReservasMes ?? 0} reservas`],
    ['TMCR', kpi.tmcrEtiqueta || '—', `${kpi.reservasConTmcr ?? 0} reserva(s) medidas`],
  ]
    .map(([nombre, valor, detalle]) => `
      <tr>
        <td><strong>${esc(nombre)}</strong><br /><span class="muted">${esc(detalle)}</span></td>
        <td style="text-align:right;font-weight:800;color:#1e3a5f;font-size:15px;">${esc(valor)}</td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de indicadores</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#374151; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .wrap { display:flex; min-height:0; }
    .sidebar { width:36px; background:#1e3a5f; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar span { color:#fff; font-weight:800; font-size:12px; letter-spacing:0.35em; writing-mode:vertical-rl; transform:rotate(180deg); }
    .content { flex:1; padding:20px 24px; }
    header { border-bottom:2px solid #1e3a5f; padding-bottom:16px; margin-bottom:20px; }
    footer { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:20px; text-align:center; }
    h2 { margin:0 0 12px; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.12em; }
    .row { display:flex; gap:8px; margin-bottom:6px; font-size:13px; }
    .row dt { color:#9ca3af; flex-shrink:0; }
    .row dd { margin:0; color:#374151; }
    .grid-resumen { display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; margin-bottom:20px; }
    table { width:100%; border-collapse:collapse; border:1px solid #f3f4f6; margin-bottom:20px; }
    th, td { padding:8px 12px; text-align:left; font-size:12px; vertical-align:top; }
    thead tr { background:#f9fafb; }
    th { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
    tbody tr { border-top:1px solid #f9fafb; }
    .muted { color:#9ca3af; font-size:10px; }
    .foot-note { font-size:11px; color:#9ca3af; margin-top:12px; }
    .periodo { font-size:14px; font-weight:700; color:#1e3a5f; margin-bottom:20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>
      <p class="periodo">Indicadores de gestión · ${esc(kpi.mesReferencia || 'Mes actual')}</p>

      <h2>Resumen general</h2>
      <dl class="grid-resumen">${resumenRows}</dl>

      <h2>Indicadores hoteleros</h2>
      <table>
        <thead><tr><th>Indicador</th><th style="text-align:right;">Valor</th></tr></thead>
        <tbody>${indicadorRows}</tbody>
      </table>

      <h2>Densidad de reserva por día de la semana</h2>
      ${
        densidadRows
          ? `<table>
              <thead><tr><th>Día</th><th style="text-align:center;">Reservas</th><th style="text-align:right;">% del mes</th></tr></thead>
              <tbody>${densidadRows}</tbody>
            </table>`
          : '<p class="muted">Sin datos de densidad para el período.</p>'
      }

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printIndicadoresReport(data) {
  printHtmlDocument(buildIndicadoresReportHtml(data));
}

export function buildEstadisticasIngresosHtml({ hotel, data, periodo }) {
  const fmtMonto = (n) =>
    `S/ ${Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const top3Rows = (data.top3Dias || [])
    .map((d, i) => `
      <tr>
        <td style="text-align:center;font-weight:800;color:#1e3a5f;">${i + 1}</td>
        <td>${esc(formatFecha(d.fecha))}</td>
        <td style="text-align:center;">${d.cantidad}</td>
        <td style="text-align:right;font-weight:700;color:#f59e0b;">${fmtMonto(d.total)}</td>
      </tr>
    `)
    .join('');

  const reservaRows = (data.reservas || [])
    .map((r) => `
      <tr>
        <td style="font-family:monospace;font-size:11px;font-weight:700;color:#6b7280;">${esc(r.codigo || r.id)}</td>
        <td><strong>${esc(r.nombre_cliente)}</strong></td>
        <td>${esc(r.habitacion_nombre || '—')}</td>
        <td style="text-align:right;font-weight:800;color:#1e3a5f;">${fmtMonto(r.total)}</td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de ingresos</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#374151; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .wrap { display:flex; min-height:0; }
    .sidebar { width:36px; background:#1e3a5f; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar span { color:#fff; font-weight:800; font-size:12px; letter-spacing:0.35em; writing-mode:vertical-rl; transform:rotate(180deg); }
    .content { flex:1; padding:20px 24px; }
    header { border-bottom:2px solid #1e3a5f; padding-bottom:16px; margin-bottom:20px; }
    footer { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:20px; text-align:center; }
    h2 { margin:0 0 12px; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.12em; }
    .periodo { font-size:14px; font-weight:700; color:#1e3a5f; margin-bottom:20px; }
    .kpi-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px; }
    .kpi { background:rgba(30,58,95,0.05); border:1px solid rgba(30,58,95,0.1); border-radius:10px; padding:14px; text-align:center; }
    .kpi p { margin:0; font-size:10px; color:#9ca3af; text-transform:uppercase; font-weight:800; letter-spacing:0.05em; }
    .kpi strong { display:block; margin-top:6px; font-size:18px; color:#1e3a5f; }
    .kpi strong.highlight { color:#f59e0b; }
    table { width:100%; border-collapse:collapse; border:1px solid #f3f4f6; margin-bottom:20px; }
    th, td { padding:8px 12px; text-align:left; font-size:12px; }
    thead tr { background:#f9fafb; }
    th { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
    tbody tr { border-top:1px solid #f9fafb; }
    .foot-note { font-size:11px; color:#9ca3af; margin-top:12px; }
    .resumen { font-size:13px; color:#6b7280; margin-bottom:16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>
      <p class="periodo">Estadísticas de ingresos · ${esc(periodo)}</p>
      <p class="resumen">
        ${data.totalReservas ?? 0} reservas · ${data.diasConIngreso ?? 0} día(s) con ingresos
        · ${data.diasEnRango ?? 0} días en el rango
      </p>

      <h2>Resumen del período</h2>
      <div class="kpi-grid">
        <div class="kpi"><p>Monto máximo</p><strong class="highlight">${fmtMonto(data.ingresoMaximo)}</strong></div>
        <div class="kpi"><p>Monto mínimo</p><strong>${fmtMonto(data.ingresoMinimo)}</strong></div>
        <div class="kpi"><p>Ingreso promedio diario</p><strong>${fmtMonto(data.ingresoPromedio)}</strong></div>
      </div>
      <p class="resumen"><strong>Ingreso total del período:</strong> ${fmtMonto(data.ingresoTotal)}</p>

      <h2>Top 3 días con mayores ingresos</h2>
      ${
        top3Rows
          ? `<table>
              <thead>
                <tr>
                  <th style="text-align:center;">#</th>
                  <th>Fecha</th>
                  <th style="text-align:center;">Reservas</th>
                  <th style="text-align:right;">Ingreso</th>
                </tr>
              </thead>
              <tbody>${top3Rows}</tbody>
            </table>`
          : '<p style="color:#9ca3af;">No hay ingresos registrados en el período seleccionado.</p>'
      }

      <h2>Reservas del período</h2>
      ${
        reservaRows
          ? `<table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Habitación</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${reservaRows}</tbody>
            </table>`
          : '<p style="color:#9ca3af;">No hay reservas en el período seleccionado.</p>'
      }

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printEstadisticasIngresos(data) {
  printHtmlDocument(buildEstadisticasIngresosHtml(data));
}

export function buildCancelacionesReportHtml({ hotel, data, periodo }) {
  const fmtMonto = (n) =>
    `S/ ${Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const reservaRows = (data.reservasCanceladas || [])
    .map((r) => `
      <tr>
        <td class="mono">${esc(r.codigo || r.id)}</td>
        <td>${esc(r.nombre_cliente)}</td>
        <td>${esc(formatFecha(r.fecha_reserva))}</td>
        <td>${esc(r.motivo || '—')}</td>
        <td style="text-align:right;font-weight:700;color:#dc2626;">${fmtMonto(r.total)}</td>
      </tr>
    `)
    .join('');

  const motivoRows = (data.top3Motivos || [])
    .map((m, i) => `
      <tr>
        <td style="text-align:center;font-weight:800;color:#1e3a5f;">${i + 1}</td>
        <td>${esc(m.motivo)}</td>
        <td style="text-align:center;">${m.total}</td>
        <td style="text-align:right;">${m.pct}%</td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de cancelaciones</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#374151; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .wrap { display:flex; min-height:0; }
    .sidebar { width:36px; background:#1e3a5f; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar span { color:#fff; font-weight:800; font-size:12px; letter-spacing:0.35em; writing-mode:vertical-rl; transform:rotate(180deg); }
    .content { flex:1; padding:20px 24px; }
    header { border-bottom:2px solid #1e3a5f; padding-bottom:16px; margin-bottom:20px; }
    footer { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:20px; text-align:center; }
    h2 { margin:0 0 12px; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.12em; }
    .periodo { font-size:14px; font-weight:700; color:#1e3a5f; margin-bottom:20px; }
    .kpi-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px; }
    .kpi { background:rgba(30,58,95,0.05); border:1px solid rgba(30,58,95,0.1); border-radius:10px; padding:14px; text-align:center; }
    .kpi p { margin:0; font-size:10px; color:#9ca3af; text-transform:uppercase; font-weight:800; letter-spacing:0.05em; }
    .kpi strong { display:block; margin-top:6px; font-size:18px; color:#1e3a5f; }
    .kpi strong.danger { color:#dc2626; }
    table { width:100%; border-collapse:collapse; border:1px solid #f3f4f6; margin-bottom:20px; }
    th, td { padding:8px 12px; text-align:left; font-size:12px; vertical-align:top; }
    thead tr { background:#f9fafb; }
    th { font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
    tbody tr { border-top:1px solid #f9fafb; }
    .mono { font-family:ui-monospace,monospace; font-size:10px; color:#6b7280; }
    .foot-note { font-size:11px; color:#9ca3af; margin-top:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sidebar"><span>REPORTE</span></div>
    <div class="content">
      <header>${hotelBlock(hotel)}</header>
      <p class="periodo">Reporte de cancelaciones · ${esc(periodo)}</p>

      <h2>Resumen del período</h2>
      <div class="kpi-grid">
        <div class="kpi"><p>Total canceladas</p><strong>${data.totalCanceladas ?? 0}</strong></div>
        <div class="kpi"><p>Monto no cobrado</p><strong class="danger">${fmtMonto(data.montoNoCobrado)}</strong></div>
        <div class="kpi"><p>Tasa de cancelación</p><strong>${Number(data.tasaCancelacion ?? 0).toFixed(2)}%</strong></div>
      </div>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px;">
        ${data.totalCanceladas ?? 0} cancelada(s) de ${data.totalReservas ?? 0} reserva(s) en el período
      </p>

      <h2>Top 3 motivos más frecuentes</h2>
      ${
        motivoRows
          ? `<table>
              <thead><tr><th style="text-align:center;">#</th><th>Motivo</th><th style="text-align:center;">Cantidad</th><th style="text-align:right;">%</th></tr></thead>
              <tbody>${motivoRows}</tbody>
            </table>`
          : '<p style="color:#9ca3af;">No hay motivos registrados.</p>'
      }

      <h2>Reservas canceladas</h2>
      ${
        reservaRows
          ? `<table>
              <thead>
                <tr>
                  <th>Código</th><th>Cliente</th><th>Fecha reserva</th><th>Motivo</th>
                  <th style="text-align:right;">Monto</th>
                </tr>
              </thead>
              <tbody>${reservaRows}</tbody>
            </table>`
          : '<p style="color:#9ca3af;">No hay cancelaciones en el período.</p>'
      }

      <footer>
        ${hotelBlock(hotel, true)}
        <p class="foot-note">Documento generado el ${formatFechaHora(new Date())} · Gracias por su preferencia</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function printCancelacionesReport(data) {
  printHtmlDocument(buildCancelacionesReportHtml(data));
}

function printHtmlDocument(html) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();

  window.setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 500);
    }
  }, 300);
}
