/**
 * SmartCampus UTA — Lógica Principal de la Aplicación
 * Arquitectura: Capa de Presentación
 */

// ── VERIFICAR SESIÓN (solo admin.html usa app.js) ────────
(function checkSession() {
  const sesion = sessionStorage.getItem('smartcampus_session');
  if (!sesion) {
    window.location.href = 'login.html';
    return;
  }
  // Solo verificar rol si estamos en admin.html
  if (window.location.pathname.includes('admin')) {
    const user = JSON.parse(sesion);
    if (user.rol !== 'Administrador') {
      window.location.href = 'login.html';
      return;
    }
  }
})();

/* ═══════════════════════════════════════
   INSTANCIAS DE ESTRUCTURAS DE DATOS
   ═══════════════════════════════════════ */
const colaTurnos    = new Cola();
const pilaHistorial = new Pila();
const listaTramites = new ListaEnlazada();
const listCircVentanillas = new ListaCircular();
const arbolDocs     = new Arbol();
const grafoCampus   = new Grafo();

let turnoCounter = 100;
let ventanillaActualIdx = 0;
let turnosAtendidos = 0;

/* ═══════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════ */
function formatDate(d) {
  return d.toLocaleString('es-EC', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

window.showToast = function(msg, tipo = 'success') {
  const c = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  const icons = { success:'fa-check-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle', error:'fa-times-circle' };
  toast.innerHTML = `<i class="fas ${icons[tipo] || 'fa-info-circle'}"></i> ${msg}`;
  c.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = '.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
};

window.pushHistorial = function(accion, modulo, estado = 'info') {
  const entrada = { accion, modulo, estado, usuario: 'Admin Sistema', ts: new Date() };
  pilaHistorial.apilar(entrada);
  Storage.addHistorial(entrada);
  updateHistorialTable();
  updatePilaCount();
};

/* ═══════════════════════════════════════
   NAVEGACIÓN
   ═══════════════════════════════════════ */
// ══════════════════════════════════════════════
// MÓDULO: REPORTES ADMIN
// ══════════════════════════════════════════════
let _repDatos = { turnos: [], tramites: [], usuarios: [] };

window.cargarReportesAdmin = async function() {
  const tipo    = document.getElementById('rep-filtro-tipo')?.value    || 'todos';
  const rol     = document.getElementById('rep-filtro-rol')?.value     || 'todos';
  const estado  = document.getElementById('rep-filtro-estado')?.value  || 'todos';
  const desde   = document.getElementById('rep-fecha-desde')?.value   || '';
  const hasta   = document.getElementById('rep-fecha-hasta')?.value   || '';
  const usuFilt = (document.getElementById('rep-filtro-usuario')?.value || '').toLowerCase().trim();

  const body   = document.getElementById('rep-tabla-body');
  const head   = document.getElementById('rep-tabla-head');
  const badge  = document.getElementById('rep-total-badge');
  const titulo = document.getElementById('rep-tabla-titulo');
  if (body) body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

  let filas = [];

  if (tipo === 'todos' || tipo === 'tramites') {
    try {
      let q = window.supabase.from('tramite')
        .select('codigo, estado, descripcion, fecha_reg, tipotramite(nombre), usuario:id_solicitante(nombre, rol:id_rol(nombre))')
        .order('fecha_reg', { ascending: false });
      if (estado !== 'todos' && ['Pendiente','En proceso','Completado','Rechazado'].includes(estado)) q = q.eq('estado', estado);
      if (desde) q = q.gte('fecha_reg', desde);
      if (hasta) q = q.lte('fecha_reg', hasta + 'T23:59:59');
      const { data } = await q;
      (data || []).forEach(t => {
        const rolUsuario = t.usuario?.rol?.nombre || '';
        if (rol !== 'todos' && rolUsuario !== rol) return;
        if (usuFilt && !(t.usuario?.nombre||'').toLowerCase().includes(usuFilt)) return;
        filas.push({ _tipo:'tramite', codigo: t.codigo || '-', tipo: t.tipotramite?.nombre || '-',
          usuario: t.usuario?.nombre || '-', rol: rolUsuario,
          estado: t.estado || '-', fecha: (t.fecha_reg||'').split('T')[0], detalle: t.descripcion || '-' });
      });
    } catch(e) { console.warn('Rep tramites:', e); }
  }

  if (tipo === 'todos' || tipo === 'turnos') {
    try {
      let q = window.supabase.from('turno')
        .select('numero, tipo_servicio, estado, fecha_cita, hora_cita, usuario:id_usuario(nombre, rol:id_rol(nombre))')
        .order('fecha_cita', { ascending: false });
      if (estado !== 'todos' && ['Esperando','Atendido','Cancelado','Llamado'].includes(estado)) q = q.eq('estado', estado);
      if (desde) q = q.gte('fecha_cita', desde);
      if (hasta) q = q.lte('fecha_cita', hasta);
      const { data } = await q;
      (data || []).forEach(t => {
        const rolUsuario = t.usuario?.rol?.nombre || '';
        if (rol !== 'todos' && rolUsuario !== rol) return;
        if (usuFilt && !(t.usuario?.nombre||'').toLowerCase().includes(usuFilt)) return;
        filas.push({ _tipo:'turno', codigo: t.numero || '-', tipo: t.tipo_servicio || '-',
          usuario: t.usuario?.nombre || '-', rol: rolUsuario,
          estado: t.estado || '-', fecha: t.fecha_cita || '-', detalle: t.hora_cita || '-' });
      });
    } catch(e) { console.warn('Rep turnos:', e); }
  }

  _repDatos._filas = filas;

  // Actualizar KPIs
  const atendidos = filas.filter(f => f._tipo==='turno'   && f.estado==='Atendido').length
                  + filas.filter(f => f._tipo==='tramite'  && f.estado==='Completado').length;
  const completados= filas.filter(f => f._tipo==='tramite' && f.estado==='Completado').length;
  const rechazados = filas.filter(f => f._tipo==='tramite' && f.estado==='Rechazado').length;
  const pendientes = filas.filter(f => f._tipo==='tramite' && (f.estado==='Pendiente'||f.estado==='En proceso')).length;
  document.getElementById('rep-atendidos')?.setAttribute('textContent', atendidos) ||
    (document.getElementById('rep-atendidos') && (document.getElementById('rep-atendidos').textContent = atendidos));
  document.getElementById('rep-completados') && (document.getElementById('rep-completados').textContent = completados);
  document.getElementById('rep-rechazados')  && (document.getElementById('rep-rechazados').textContent = rechazados);
  document.getElementById('rep-pendientes')  && (document.getElementById('rep-pendientes').textContent = pendientes);

  if (badge) badge.textContent = filas.length + ' registros';
  if (titulo) titulo.innerHTML = '<i class="fas fa-table"></i> ' + (tipo==='turnos'?'Turnos':tipo==='tramites'?'Trámites':'Turnos y Trámites');

  const esTodo = tipo === 'todos';
  if (head) head.innerHTML = '<tr>' +
    (esTodo ? '<th>Tipo</th>' : '') +
    '<th>Código/N°</th><th>Servicio/Tipo</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Fecha</th><th>Detalle</th></tr>';

  const estadoBadge = (e) => {
    const c = { Completado:'#27AE60', Atendido:'#27AE60', Pendiente:'#F39C12', Esperando:'#F39C12',
                Rechazado:'#E74C3C', Cancelado:'#E74C3C', 'En proceso':'#2980B9', Llamado:'#2980B9' };
    return '<span style="background:' + (c[e]||'#aaa') + '22;color:' + (c[e]||'#666') + ';padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">' + e + '</span>';
  };

  if (body) {
    if (!filas.length) {
      body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa">Sin resultados para los filtros seleccionados</td></tr>';
    } else {
      body.innerHTML = filas.map(f =>
        '<tr>' +
        (esTodo ? '<td><span style="font-size:11px;font-weight:600;color:' + (f._tipo==='turno'?'#2980B9':'#8E44AD') + '">' + f._tipo.toUpperCase() + '</span></td>' : '') +
        '<td><strong>' + f.codigo + '</strong></td>' +
        '<td>' + f.tipo + '</td>' +
        '<td>' + f.usuario + '</td>' +
        '<td><span style="font-size:11px;color:#666">' + f.rol + '</span></td>' +
        '<td>' + estadoBadge(f.estado) + '</td>' +
        '<td>' + f.fecha + '</td>' +
        '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + f.detalle + '">' + f.detalle + '</td></tr>'
      ).join('');
    }
  }
};

window.limpiarFiltrosReporte = function() {
  ['rep-filtro-tipo','rep-filtro-rol','rep-filtro-estado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'rep-filtro-tipo' ? 'todos' : id === 'rep-filtro-rol' ? 'todos' : 'todos';
  });
  ['rep-fecha-desde','rep-fecha-hasta','rep-filtro-usuario'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  window.cargarReportesAdmin();
};

window.exportarReporte = function(formato) {
  const filas = _repDatos._filas || [];
  if (!filas.length) { showToast('Selecciona filtros y espera que carguen los datos primero', 'warning'); return; }
  const tipo   = document.getElementById('rep-filtro-tipo')?.value || 'todos';
  const esTodo = tipo === 'todos';
  const headers= (esTodo ? ['Tipo'] : []).concat(['Código','Servicio/Tipo','Usuario','Rol','Estado','Fecha','Detalle']);
  const rows   = filas.map(f => (esTodo ? [f._tipo.toUpperCase()] : []).concat([f.codigo, f.tipo, f.usuario, f.rol, f.estado, f.fecha, f.detalle]));
  const fechaStr = new Date().toISOString().split('T')[0];

  if (formato === 'excel') {
    const BOM = '\uFEFF';
    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v||'').replace(/"/g,'""') + '"').join(','))].join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='reporte_'+fechaStr+'.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Reporte Excel descargado', 'success');
  } else {
    // Generar HTML y mostrarlo en el visor integrado del sistema
    const kpis = [
      { valor: document.getElementById('rep-atendidos')?.textContent||'0',  label: 'Atendidos/Completados' },
      { valor: document.getElementById('rep-completados')?.textContent||'0', label: 'Completados' },
      { valor: document.getElementById('rep-rechazados')?.textContent||'0',  label: 'Rechazados' },
      { valor: filas.length, label: 'Total registros' }
    ];
    const tituloRep = tipo==='turnos'?'Reporte de Turnos':tipo==='tramites'?'Reporte de Trámites':'Reporte General';
    const htmlStr = generarHTMLPDF(tituloRep, 'Turnos y Trámites — SmartCampus UTA', headers, rows, kpis);
    abrirVisorReporte(htmlStr, tituloRep + ' ' + fechaStr);
  }
};

// Abre el HTML del reporte en el visor integrado del sistema
window.abrirVisorReporte = function(htmlStr, nombre) {
  // Convertir HTML a blob URL para cargar en iframe
  const blob = new Blob([htmlStr], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);

  // Usar el visor existente del sistema (abrirVisorDoc)
  // Creamos el overlay si no existe
  let overlay = document.getElementById('docVisorOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'docVisorOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';
    overlay.innerHTML =
      '<div id="docVisorBox" style="background:#fff;border-radius:12px;width:100%;max-width:1050px;height:92vh;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,.4);overflow:hidden">' +
        '<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #F0F0F0;background:#FFF8F8;flex-shrink:0">' +
          '<i id="docVisorIcon" class="fas fa-file-pdf" style="font-size:20px;color:#C0392B"></i>' +
          '<span id="docVisorNombre" style="flex:1;font-weight:600;font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>' +
          '<a id="docVisorDl" href="#" target="_blank" download style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#C0392B;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:5px 12px;text-decoration:none;white-space:nowrap">' +
            '<i class="fas fa-download"></i> Descargar</a>' +
          '<button onclick="cerrarVisorDoc()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#999;padding:4px 6px;border-radius:6px;line-height:1" title="Cerrar">' +
            '<i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div style="flex:1;position:relative;background:#F5F5F5">' +
          '<div id="docVisorLoading" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#aaa;font-size:13px">' +
            '<i class="fas fa-spinner fa-spin" style="font-size:28px;color:#C0392B"></i>' +
            '<span>Cargando reporte...</span></div>' +
          '<iframe id="docVisorFrame" style="width:100%;height:100%;border:none;position:relative;z-index:1"' +
            ' onload="document.getElementById(&quot;docVisorLoading&quot;).style.display=&quot;none&quot;"></iframe>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarVisorDoc(); });
    document.body.appendChild(overlay);
  }

  overlay.style.display = 'flex';
  document.getElementById('docVisorIcon').className = 'fas fa-file-pdf';
  document.getElementById('docVisorIcon').style.color = '#C0392B';
  document.getElementById('docVisorNombre').textContent = nombre;
  // Descargar = blob URL con nombre de archivo
  const dlLink = document.getElementById('docVisorDl');
  dlLink.href = url;
  dlLink.download = nombre.replace(/\s+/g, '_') + '.html';
  document.getElementById('docVisorFrame').src = url;
  document.getElementById('docVisorLoading').style.display = 'flex';
};

function generarHTMLPDF(titulo, subtitulo, headers, rows, kpis) {
  const kpiHTML = (kpis||[]).map(k =>
    '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 20px;text-align:center;min-width:110px">' +
    '<div style="font-size:26px;font-weight:700;color:#991B1B">' + k.valor + '</div>' +
    '<div style="font-size:11px;color:#666;margin-top:4px">' + k.label + '</div></div>'
  ).join('');
  const rowsHTML = rows.map(r =>
    '<tr>' + r.map(c => '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (c||'-') + '</td>').join('') + '</tr>'
  ).join('');
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + titulo + '</title>' +
    '<style>body{font-family:Arial,sans-serif;margin:30px;color:#111}h1{color:#991B1B;font-size:20px;margin-bottom:4px}' +
    'p{color:#666;font-size:12px;margin-bottom:16px}.kpis{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}' +
    'table{width:100%;border-collapse:collapse}th{background:#991B1B;color:#fff;padding:8px 10px;font-size:11px;text-align:left}' +
    'tr:nth-child(even) td{background:#FEF2F2}.footer{margin-top:16px;font-size:10px;color:#999;text-align:right}' +
    '@media print{button{display:none}}</style></head><body>' +
    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">' +
    '<div><h1>🏛 SmartCampus UTA — ' + titulo + '</h1>' +
    '<p>' + subtitulo + ' | Generado: ' + new Date().toLocaleString('es-EC') + '</p></div>' +
    '<button onclick="window.print()" style="background:#991B1B;color:#fff;border:none;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimir / PDF</button></div>' +
    '<div class="kpis">' + kpiHTML + '</div>' +
    '<table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead>' +
    '<tbody>' + rowsHTML + '</tbody></table>' +
    '<div class="footer">Universidad Técnica de Ambato — SmartCampus UTA</div></body></html>';
}

// ══════════════════════════════════════════════
// MÓDULO: FILTROS DE USUARIOS
// ══════════════════════════════════════════════
let _todosUsuarios = [];

const _origRenderUsuarios = window.renderUsuarios;
window.renderUsuarios = async function() {
  await _origRenderUsuarios?.();
  // Cache usuarios for filtering
  const tbody = document.getElementById('usuariosTbody');
  if (tbody) {
    _todosUsuarios = Array.from(tbody.querySelectorAll('tr')).map(tr => ({
      el:    tr,
      texto: tr.textContent.toLowerCase(),
      rol:   tr.cells[3]?.textContent?.trim() || '',
      estado:tr.cells[4]?.textContent?.trim() || ''
    }));
    actualizarBadgeUsuarios(_todosUsuarios.length);
  }
};

function actualizarBadgeUsuarios(n) {
  const b = document.getElementById('usuariosBadge');
  if (b) b.textContent = n + ' usuario' + (n !== 1 ? 's' : '');
}

window.filterUsuarios = function() {
  const texto  = (document.getElementById('searchUsuario')?.value  || '').toLowerCase();
  const rol    = (document.getElementById('filterRolUsuario')?.value || '');
  const estado = (document.getElementById('filterEstadoUsuario')?.value || '');
  let visible  = 0;

  if (!_todosUsuarios.length) {
    // Re-filter from DOM
    const tbody = document.getElementById('usuariosTbody');
    if (tbody) {
      _todosUsuarios = Array.from(tbody.querySelectorAll('tr')).map(tr => ({
        el: tr, texto: tr.textContent.toLowerCase(),
        rol: tr.cells[3]?.textContent?.trim() || '',
        estado: tr.cells[4]?.textContent?.trim() || ''
      }));
    }
  }

  _todosUsuarios.forEach(u => {
    const matchTexto  = !texto  || u.texto.includes(texto);
    const matchRol    = !rol    || u.rol.includes(rol);
    const matchEstado = !estado || u.estado.includes(estado);
    const show = matchTexto && matchRol && matchEstado;
    u.el.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  actualizarBadgeUsuarios(visible);
};

window.exportarUsuarios = function(formato) {
  // Get rows from tbody directly if cache empty
  if (!_todosUsuarios.length) {
    const tbody = document.getElementById('usuariosTbody');
    if (tbody) {
      _todosUsuarios = Array.from(tbody.querySelectorAll('tr')).map(tr => ({
        el: tr, texto: tr.textContent.toLowerCase(),
        rol: tr.cells[3]?.textContent?.trim() || '',
        estado: tr.cells[4]?.textContent?.trim() || ''
      }));
    }
  }
  const filas = _todosUsuarios.filter(u => u.el.style.display !== 'none').map(u => {
    const cells = u.el.cells;
    return [cells[0]?.textContent?.trim()||'', cells[1]?.textContent?.trim()||'',
            cells[2]?.textContent?.trim()||'', cells[3]?.textContent?.trim()||'',
            cells[4]?.textContent?.trim()||''];
  });
  if (!filas.length) { showToast('No hay usuarios para exportar. Carga la lista primero.', 'warning'); return; }
  const headers = ['ID','Nombre','Email','Rol','Estado'];
  const fechaStr = new Date().toISOString().split('T')[0];

  if (formato === 'excel') {
    const BOM = '\uFEFF';
    const csv = [headers.join(','), ...filas.map(r => r.map(v => '"' + (v||'').replace(/"/g,'""') + '"').join(','))].join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='usuarios_'+fechaStr+'.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Lista de usuarios exportada en Excel', 'success');
  } else {
    const rowsH = filas.map(r =>
      '<tr>' + r.map(c => '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (c||'-') + '</td>').join('') + '</tr>'
    ).join('');
    const fechaStr2 = new Date().toISOString().split('T')[0];
    const htmlPDF = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Usuarios SmartCampus</title>' +
      '<style>body{font-family:Arial,sans-serif;margin:30px;color:#111}h1{color:#991B1B;font-size:20px}' +
      'p{color:#666;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse}' +
      'th{background:#991B1B;color:#fff;padding:8px 10px;font-size:11px;text-align:left}' +
      'tr:nth-child(even) td{background:#FEF2F2}@media print{button{display:none}}</style></head><body>' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">' +
      '<div><h1>🏛 SmartCampus UTA — Gestión de Usuarios</h1>' +
      '<p>Total: ' + filas.length + ' usuarios | Generado: ' + new Date().toLocaleString('es-EC') + '</p></div>' +
      '<button onclick="window.print()" style="background:#991B1B;color:#fff;border:none;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimir / PDF</button></div>' +
      '<table><thead><tr>' + headers.map(h=>'<th>'+h+'</th>').join('') + '</tr></thead>' +
      '<tbody>' + rowsH + '</tbody></table>' +
      '<div style="margin-top:16px;font-size:10px;color:#999;text-align:right">Universidad Técnica de Ambato — SmartCampus UTA</div>' +
      '</body></html>';
    if (window.abrirVisorReporte) {
      window.abrirVisorReporte(htmlPDF, 'Usuarios SmartCampus ' + fechaStr2);
    } else {
      const win = window.open('','_blank'); win.document.write(htmlPDF); win.document.close();
    }
    showToast('PDF de usuarios abierto en visor', 'success');
  }
};


let _mapaAdminListo = false;
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-' + page)?.classList.add('active');
    // Guardar página activa para restaurar al recargar
    sessionStorage.setItem('smartcampus_active_page_adm', page);
    // Mapa - lazy init solo al abrir la pestaña
    if (page === 'rutas' && !_mapaAdminListo) {
      _mapaAdminListo = true;
      setTimeout(() => {
        if (typeof initCampusMap !== 'undefined') {
          initCampusMap(grafoCampus);
        }
        if (window._leafletMap) window._leafletMap.invalidateSize();
      }, 250);
    }
    // Usuarios - recargar desde Supabase al abrir
    if (page === 'usuarios') renderUsuarios();
    if (page === 'reportes' && typeof window.cargarReportesAdmin === 'function') window.cargarReportesAdmin();
  });
});

/* ═══════════════════════════════════════
   MODAL
   ═══════════════════════════════════════ */
let modalConfirmCallback = null;

function openModal(titulo, bodyHTML, confirmLabel = 'Guardar', onConfirm = null) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalConfirm').textContent = confirmLabel;
  document.getElementById('modalOverlay').classList.add('open');
  modalConfirmCallback = onConfirm;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  modalConfirmCallback = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
document.getElementById('modalConfirm').addEventListener('click', () => {
  if (modalConfirmCallback) modalConfirmCallback();
  closeModal();
});

/* ═══════════════════════════════════════
   MÓDULO: TURNOS (Cola FIFO)
   ═══════════════════════════════════════ */
function renderCola() {
  const container = document.getElementById('colaContainer');
  const arr = colaTurnos.toArray();
  document.getElementById('colaSize').textContent = arr.length;
  document.getElementById('turnosBadge').textContent = arr.length;
  document.getElementById('colaCount').textContent = `${arr.length} en cola`;
  document.getElementById('kpi-turnos').textContent = arr.length;

  if (arr.length === 0) {
    container.innerHTML = '<div class="cola-empty">La cola está vacía. Agregue turnos con el botón superior.</div>';
    return;
  }
  container.innerHTML = arr.map((t, i) => `
    <div class="cola-item">
      <div class="cola-num">${t.numero}</div>
      <div class="cola-info">
        <strong>${t.nombre}</strong>
        <span>${t.tipo} · ${formatDate(t.ts)}</span>
      </div>
      <span class="cola-pos">${i === 0 ? '▶ Al frente' : `Pos. ${i+1}`}</span>
    </div>
  `).join('');
}

document.getElementById('agregarTurnoBtn').addEventListener('click', () => {
  openModal('Nuevo Turno', `
    <div class="form-group">
      <label>Nombre del solicitante</label>
      <input class="form-control" id="m-nombre" placeholder="Ej: María García" />
    </div>
    <div class="form-group">
      <label>Tipo de servicio</label>
      <select class="form-control" id="m-tipo">
        <option>Secretaría</option><option>Finanzas</option>
        <option>Académico</option><option>Bienestar</option>
      </select>
    </div>
  `, 'Agregar Turno', () => {
    const nombre = document.getElementById('m-nombre').value.trim();
    const tipo   = document.getElementById('m-tipo').value;
    if (!nombre) { showToast('Ingrese el nombre del solicitante', 'warning'); return; }
    const num = Storage.incrementTurnoCounter();
    const turno = { numero: `T-${num}`, nombre, tipo, ts: new Date() };
    colaTurnos.encolar(turno);
    // Persistir cola en localStorage
    Storage.saveTurnos(colaTurnos.toArray());
    renderCola();
    showToast(`Turno ${turno.numero} agregado correctamente`, 'success');
    pushHistorial(`Turno ${turno.numero} registrado para ${nombre}`, 'Turnos', 'info');
    addNotificacion(`Nuevo turno ${turno.numero}`, `${nombre} está esperando en ${tipo}`, 'info');
  });
});

document.getElementById('atenderBtn').addEventListener('click', () => {
  const turno = colaTurnos.desencolar();
  if (!turno) { showToast('No hay turnos en la cola', 'warning'); return; }

  document.getElementById('turnoActualNum').textContent    = turno.numero;
  document.getElementById('turnoActualNombre').textContent = turno.nombre;
  turnosAtendidos++;
  document.getElementById('rep-atendidos').textContent = turnosAtendidos;

  // Persistir
  Storage.saveTurnos(colaTurnos.toArray());
  Storage.updateStats({ turnosAtendidos: turnosAtendidos });

  renderCola();
  rotarVentanilla();
  showToast(`Atendiendo ${turno.numero} — ${turno.nombre}`, 'success');
  pushHistorial(`Turno ${turno.numero} atendido (${turno.nombre})`, 'Turnos', 'success');
});

document.getElementById('llamarBtn').addEventListener('click', () => {
  const t = document.getElementById('turnoActualNum').textContent;
  if (t === '—') { showToast('No hay turno en atención', 'warning'); return; }
  showToast(`Llamando al turno ${t}...`, 'info');
});

/* Ventanillas — Lista Circular */
DB.ventanillas.forEach(v => listCircVentanillas.insertar(v));

function rotarVentanilla() {
  listCircVentanillas.rotar();
  ventanillaActualIdx = (ventanillaActualIdx + 1) % 4;
  renderVentanillas();
}

function renderVentanillas() {
  document.querySelectorAll('.ventanilla').forEach((el, i) => {
    el.classList.toggle('active', i === ventanillaActualIdx);
  });
}

document.getElementById('rotarBtn').addEventListener('click', rotarVentanilla);

/* ═══════════════════════════════════════
   MÓDULO: TRÁMITES (Lista Enlazada)
   ═══════════════════════════════════════ */
DB.tramites.forEach(t => listaTramites.insertarAlFinal(t));

function renderTramites(filtros = {}) {
  let arr = Storage.getTramites();
  if (filtros.estado) arr = arr.filter(t => t.estado === filtros.estado);
  if (filtros.tipo)   arr = arr.filter(t => t.tipo === filtros.tipo);
  if (filtros.q)      arr = arr.filter(t => t.solicitante.toLowerCase().includes(filtros.q.toLowerCase()));

  document.getElementById('kpi-tramites').textContent = Storage.getTramites().length;
  document.getElementById('listaCount').textContent   = `${Storage.getTramites().length} registros`;

  const tbody = document.getElementById('tramitesTbody');
  if (arr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">Sin resultados</td></tr>';
    return;
  }
  tbody.innerHTML = arr.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.solicitante}</td>
      <td>${t.tipo}</td>
      <td>${t.fecha}</td>
      <td><span class="status-badge status-${t.estado.replace(' ','-')}">${t.estado}</span></td>
      <td>
        <button class="btn-icon" title="Ver" onclick="showToast('Viendo ${t.id}','info')"><i class="fas fa-eye"></i></button>
        <button class="btn-icon" title="Editar" onclick="editTramite('${t.id}')"><i class="fas fa-edit"></i></button>
      </td>
    </tr>
  `).join('');
}

window.editTramite = function(id) {
  const tramites = Storage.getTramites();
  const t = tramites.find(t => t.id === id);
  if (!t) return;
  openModal(`Editar Trámite ${id}`, `
    <div class="form-group"><label>Estado</label>
      <select class="form-control" id="m-estado">
        <option ${t.estado==='Pendiente'   ?'selected':''}>Pendiente</option>
        <option ${t.estado==='En proceso'  ?'selected':''}>En proceso</option>
        <option ${t.estado==='Completado'  ?'selected':''}>Completado</option>
        <option ${t.estado==='Rechazado'   ?'selected':''}>Rechazado</option>
      </select></div>
  `, 'Guardar', () => {
    const nuevoEstado = document.getElementById('m-estado').value;
    Storage.updateTramite(id, { estado: nuevoEstado });
    // Sincronizar lista enlazada
    const nodo = listaTramites.buscar(id);
    if (nodo) nodo.estado = nuevoEstado;
    renderTramites();
    showToast(`Trámite ${id} actualizado`, 'success');
    pushHistorial(`Trámite ${id} actualizado a "${nuevoEstado}"`, 'Trámites', 'info');
    if (nuevoEstado === 'Completado') {
      const stats = Storage.getStats();
      Storage.updateStats({ tramitesCompletados: stats.tramitesCompletados + 1 });
      document.getElementById('rep-completados').textContent = stats.tramitesCompletados + 1;
    }
  });
};

document.getElementById('nuevoTramiteBtn').addEventListener('click', () => {
  openModal('Nuevo Trámite', `
    <div class="form-row">
      <div class="form-group"><label>Solicitante</label><input class="form-control" id="m-sol" placeholder="Nombre completo"/></div>
      <div class="form-group"><label>Tipo</label>
        <select class="form-control" id="m-ttipo">
          <option>Certificado</option><option>Beca</option><option>Transferencia</option><option>Matrícula</option>
        </select></div>
    </div>
  `, 'Registrar', () => {
    const sol  = document.getElementById('m-sol').value.trim();
    const tipo = document.getElementById('m-ttipo').value;
    if (!sol) { showToast('Ingrese el solicitante', 'warning'); return; }
    const tramites = Storage.getTramites();
    const id = `T-${String(tramites.length + 100).padStart(3, '0')}`;
    const nuevo = { id, solicitante: sol, tipo, fecha: new Date().toISOString().split('T')[0], estado: 'Pendiente' };
    Storage.addTramite(nuevo);
    listaTramites.insertarAlFinal(nuevo);
    renderTramites();
    showToast(`Trámite ${id} registrado`, 'success');
    pushHistorial(`Trámite ${id} registrado por ${sol}`, 'Trámites', 'info');
    addNotificacion(`Nuevo trámite ${id}`, `${sol} solicitó un ${tipo}`, 'warning');
  });
});

document.getElementById('filterEstado').addEventListener('change', applyTramiteFilters);
document.getElementById('filterTipo').addEventListener('change', applyTramiteFilters);
document.getElementById('searchTramite').addEventListener('input', applyTramiteFilters);
function applyTramiteFilters() {
  renderTramites({
    estado: document.getElementById('filterEstado').value,
    tipo:   document.getElementById('filterTipo').value,
    q:      document.getElementById('searchTramite').value,
  });
}

// ── MÓDULO: DOCUMENTOS ──────────────────────────────────
document.getElementById('nuevoDocBtn').addEventListener('click', () => {
  // Verificar que haya subcarpeta seleccionada
  if (!window._catActivaId) {
    showToast('Selecciona una subcarpeta del árbol primero', 'warning');
    return;
  }
  openModal('Subir Documento', `
    <div class="form-group">
      <label>Nombre del documento</label>
      <input class="form-control" id="d-nombre" placeholder="Ej: Reglamento Académico 2025"/>
      <div style="font-size:11px;color:#aaa;margin-top:4px">Si lo dejas vacío se usará el nombre del archivo</div>
    </div>
    <div class="form-group">
      <label>Subcarpeta destino</label>
      <input class="form-control" id="d-cat-display" disabled style="background:#F5F5F5;color:#555"/>
      <input type="hidden" id="d-cat"/>
    </div>
    <div class="form-group">
      <label>Archivo <span style="color:#aaa;font-size:11px">PDF o DOCX · máx. 10MB</span></label>
      <div id="dropZone"
           style="border:2px dashed #DDD;border-radius:10px;padding:28px;text-align:center;cursor:pointer;background:#FAFAFA;transition:.2s"
           onclick="document.getElementById('d-file').click()"
           ondragover="event.preventDefault();this.style.borderColor='#C0392B';this.style.background='#FEF5F4'"
           ondragleave="this.style.borderColor='#DDD';this.style.background='#FAFAFA'"
           ondrop="handleFileDrop(event)">
        <i class="fas fa-cloud-upload-alt" style="font-size:32px;color:#C0392B;margin-bottom:8px;display:block"></i>
        <strong style="font-size:13px;color:#333">Arrastra el archivo aquí</strong>
        <p style="font-size:12px;color:#aaa;margin-top:4px">o haz clic para seleccionar</p>
        <div id="filePreview" style="margin-top:10px;font-size:12px;color:#27AE60;display:none">
          <i class="fas fa-check-circle"></i> <span id="fileName"></span>
        </div>
      </div>
      <input type="file" id="d-file"
             accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
             style="display:none" onchange="previewFile(this)"/>
    </div>
    <div id="uploadProgress" style="display:none;margin-top:8px">
      <div style="height:4px;background:#EEE;border-radius:4px;overflow:hidden">
        <div id="progressBar" style="height:100%;background:#B91C31;width:0%;transition:width .3s"></div>
      </div>
      <p id="progressText" style="font-size:11px;color:#aaa;text-align:center;margin-top:4px">Subiendo...</p>
    </div>
  `, 'Subir Documento', subirDocumento);
  // Rellenar campos de categoría activa
  setTimeout(() => {
    const disp = document.getElementById('d-cat-display');
    const hid  = document.getElementById('d-cat');
    if (disp) disp.value = window._catActivaNombre || '';
    if (hid)  hid.value  = window._catActivaId    || '';
  }, 50);
});

window.previewFile = function(input) {
  const file = input.files[0];
  if (!file) return;
  const ext    = file.name.split('.').pop().toLowerCase();
  const MAX_MB = 10;
  if (!['pdf','docx'].includes(ext)) {
    showToast('Solo se permiten archivos PDF o DOCX', 'error');
    input.value = ''; return;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast('El archivo supera ' + MAX_MB + 'MB', 'error');
    input.value = ''; return;
  }
  document.getElementById('fileName').textContent =
    file.name + ' (' + (file.size/1024/1024).toFixed(2) + 'MB)';
  document.getElementById('filePreview').style.display = 'block';
  document.getElementById('dropZone').style.borderColor = '#27AE60';
  document.getElementById('dropZone').style.background  = '#F0FBF5';
};

window.handleFileDrop = function(e) {
  e.preventDefault();
  const dz = document.getElementById('dropZone');
  dz.style.borderColor = '#DDD';
  dz.style.background  = '#FAFAFA';
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  document.getElementById('d-file').files = dt.files;
  window.previewFile(document.getElementById('d-file'));
};

async function subirDocumento() {
  const catId = document.getElementById('d-cat').value;
  const inp   = document.getElementById('d-file');
  const file  = inp && inp.files[0];
  if (!file) { showToast('Selecciona un archivo PDF o DOCX', 'warning'); return; }

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf','docx'].includes(ext)) { showToast('Solo PDF o DOCX permitidos', 'error'); return; }
  if (file.size > 10 * 1024 * 1024)  { showToast('Archivo supera 10MB', 'error'); return; }

  const mimeMap   = { pdf:'application/pdf', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  const tipoMap   = { pdf:'PDF', docx:'DOCX' };
  const catIdMap  = { academico:1, reglamentos:2, mallas:3, silabus:4, administrativo:5, formularios:6, actas:7, financiero:8 };
  const session   = JSON.parse(sessionStorage.getItem('smartcampus_session') || '{}');
  const ts        = Date.now();
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path      = 'documentos/' + catId + '/' + ts + '_' + safeName;
  const inputNombre = document.getElementById('d-nombre');
  const nombreDoc = (inputNombre && inputNombre.value.trim())
    ? inputNombre.value.trim()
    : file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');

  const setP = (p, txt) => {
    document.getElementById('uploadProgress').style.display = 'block';
    document.getElementById('progressBar').style.width  = p + '%';
    document.getElementById('progressText').textContent = txt;
    const btn = document.getElementById('modalConfirm');
    if (btn) btn.disabled = p > 0 && p < 100;
  };

  try {
    setP(20, 'Subiendo archivo...');

    const { error: upErr } = await window.supabase.storage
      .from('documentos')
      .upload(path, file, { contentType: mimeMap[ext], upsert: false });

    if (upErr) throw upErr;

    setP(65, 'Obteniendo enlace...');
    const { data: urlData } = window.supabase.storage
      .from('documentos').getPublicUrl(path);
    const url = urlData && urlData.publicUrl ? urlData.publicUrl : '';

    setP(80, 'Guardando referencia...');
    const { error: dbErr } = await window.supabase.from('documento').insert({
      nombre:       nombreDoc,
      id_categoria: catIdMap[catId] || 1,
      id_autor:     session.id || 1,
      tipo_archivo: tipoMap[ext],
      ruta_archivo: url,
      version:      '1.0',
      activo:       true
    });
    if (dbErr) console.warn('DB insert:', dbErr.message);

    setP(100, '¡Subido exitosamente!');

    // Actualizar árbol en memoria
    const nodo = arbolDocs.buscar(catId);
    if (nodo) {
      if (!nodo.dato.docs) nodo.dato.docs = [];
      nodo.dato.docs.push({ nombre: nombreDoc, tipo: tipoMap[ext], fecha: new Date().toISOString().split('T')[0], url });
    }

    // Guardar en localStorage
    const ls = JSON.parse(localStorage.getItem('sc_documentos') || '[]');
    ls.push({ id: ts, nombre: nombreDoc, tipo: tipoMap[ext], categoria: catId, url, fecha: new Date().toISOString().split('T')[0] });
    localStorage.setItem('sc_documentos', JSON.stringify(ls));

    const kEl = document.getElementById('kpi-docs');
    if (kEl) kEl.textContent = parseInt(kEl.textContent || '0') + 1;

    pushHistorial('Documento "' + nombreDoc + '" subido en ' + catId, 'Documentos', 'success');
    showToast(' "' + nombreDoc + '" subido correctamente', 'success');
    closeModal();
    renderTree();
    // Reabrir el panel inline de la subcarpeta activa para mostrar el nuevo archivo
    setTimeout(() => {
      if (window._catActivaId) {
        const labels = document.querySelectorAll('.tree-node-label');
        labels.forEach(l => {
          if (l.dataset.id === window._catActivaId) {
            window.selectCat(window._catActivaId, window._catActivaNombre, true, l);
          }
        });
      }
    }, 150);

  } catch(err) {
    console.error('Upload error:', err);
    setP(0, '');
    document.getElementById('uploadProgress').style.display = 'none';
    const btn = document.getElementById('modalConfirm');
    if (btn) btn.disabled = false;
    showToast('Error al subir: ' + (err.message || 'Verifica el bucket en Supabase'), 'error');
  }
}

// ── NUEVA SUBCARPETA (solo Admin) ──────────────────────────
// ── CREAR CARPETA PADRE (Admin) ──────────────────────────
window.crearCarpetaPadre = function() {
  openModal('Nueva Carpeta Principal', `
    <p style="font-size:13px;color:#666;margin-bottom:16px">
      <i class="fas fa-folder" style="color:#E67E22"></i>
      Crear una nueva categoría principal en el árbol de documentos
    </p>
    <div class="form-group">
      <label>Nombre de la carpeta</label>
      <input class="form-control" id="cp-nombre" placeholder="Ej: Legal, Investigación..." autofocus/>
    </div>
  `, 'Crear', async () => {
    const nombre = document.getElementById('cp-nombre').value.trim();
    if (!nombre) { showToast('Ingresa un nombre', 'warning'); return; }
    const id = nombre.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    if (arbolDocs.buscar(id)) { showToast('Ya existe una carpeta con ese nombre', 'warning'); return; }

    arbolDocs.insertarHijo('root', { id, nombre, icono:'fa-folder', docs:[] });

    try {
      const { error } = await window.supabase.from('categoriadocumento').insert({
        nombre, id_padre: null, nivel: 0, icono:'fa-folder', activo: true
      });
      if (error) console.warn('Cat padre insert:', error.message);
    } catch(e) { console.warn(e); }

    const cats = JSON.parse(localStorage.getItem('sc_categorias') || '[]');
    cats.push({ id, nombre, padreId:'root', nivel: 0 });
    localStorage.setItem('sc_categorias', JSON.stringify(cats));

    renderTree();
    showToast('Carpeta "' + nombre + '" creada', 'success');
    pushHistorial('Carpeta principal "' + nombre + '" creada', 'Documentos', 'success');
  });
};

window.abrirNuevaSubcarpeta = function(padreId, padreNombre) {
  openModal('Nueva Subcarpeta', `
    <p style="font-size:13px;color:#666;margin-bottom:16px">
      <i class="fas fa-folder" style="color:#E67E22"></i>
      Crear subcarpeta dentro de: <strong>${padreNombre}</strong>
    </p>
    <div class="form-group">
      <label>Nombre de la subcarpeta</label>
      <input class="form-control" id="sub-nombre" placeholder="Ej: Actas 2025" autofocus/>
    </div>
  `, 'Crear', async () => {
    const nombre = document.getElementById('sub-nombre').value.trim();
    if (!nombre) { showToast('Ingresa un nombre para la subcarpeta', 'warning'); return; }

    // Crear ID único
    const subId = padreId + '_' + nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Verificar que no exista
    if (arbolDocs.buscar(subId)) {
      showToast('Ya existe una subcarpeta con ese nombre', 'warning'); return;
    }

    // Insertar en árbol en memoria
    arbolDocs.insertarHijo(padreId, {
      id:    subId,
      nombre: nombre,
      icono: 'fa-folder-open',
      docs:  []
    });

    // Persistir en Supabase tabla categoriadocumento
    try {
      const padreNodo  = arbolDocs.buscar(padreId);
      const padreNivel = padreNodo ? (padreNodo.dato.nivel || 0) : 0;
      const catPadreMap = { root:null, academico:1, reglamentos:2, mallas:3, silabus:4, administrativo:5, formularios:6, actas:7, financiero:8 };
      const { error } = await window.supabase.from('categoriadocumento').insert({
        nombre:   nombre,
        id_padre: catPadreMap[padreId] || null,
        nivel:    padreNivel + 1,
        icono:    'fa-folder-open',
        activo:   true
      });
      if (error) console.warn('Cat insert:', error.message);
    } catch(e) { console.warn('Supabase cat:', e); }

    // Guardar en localStorage para persistencia offline
    const cats = JSON.parse(localStorage.getItem('sc_categorias') || '[]');
    cats.push({ id: subId, nombre, padreId, nivel: 1 });
    localStorage.setItem('sc_categorias', JSON.stringify(cats));

    renderTree();
    showToast('Subcarpeta "' + nombre + '" creada en ' + padreNombre, 'success');
    pushHistorial('Subcarpeta "' + nombre + '" creada en ' + padreNombre, 'Documentos', 'success');

    // Seleccionar automáticamente la nueva subcarpeta
    setTimeout(() => {
      const labels = document.querySelectorAll('.tree-node-label');
      labels.forEach(l => {
        if (l.textContent.includes(nombre)) {
          window.selectCat(subId, nombre, true, l);
        }
      });
    }, 200);
  });
};

function buildTreeFromData(data, parentId = null) {
  if (!arbolDocs.raiz) {
    arbolDocs.crearRaiz({ id: data.id, nombre: data.nombre, icono: data.icono, docs: data.docs || [] });
  }
  data.hijos.forEach(h => {
    arbolDocs.insertarHijo(data.id, { id: h.id, nombre: h.nombre, icono: h.icono, docs: h.docs || [] });
    if (h.hijos?.length) buildChildrenTree(h, h.id);
  });
}

function buildChildrenTree(node, parentId) {
  node.hijos.forEach(h => {
    arbolDocs.insertarHijo(parentId, { id: h.id, nombre: h.nombre, icono: h.icono, docs: h.docs || [] });
    if (h.hijos?.length) buildChildrenTree(h, h.id);
  });
}

function renderTree() {
  const container = document.getElementById('treeContainer');
  if (!arbolDocs.raiz) return;

  function nodeHTML(nodo, nivel) {
    var hasHijos = nodo.hijos && nodo.hijos.length > 0;
    var esHoja   = !hasHijos;
    var indent   = nivel * 14;
    var id       = nodo.dato.id;
    var nombre   = nodo.dato.nombre;
    var icono    = hasHijos ? 'fa-folder' : 'fa-folder-open';
    var colorI   = hasHijos ? '#E67E22' : '#C0392B';
    var peso     = hasHijos ? '600' : '400';
    var badge    = hasHijos
      ? '<small style="color:#bbb;font-size:10px">' + nodo.hijos.length + '</small>'
      : '<small style="color:#aaa;font-size:10px">docs</small>';
    var idSafe   = JSON.stringify(id);
    var nomSafe  = JSON.stringify(nombre);

    // Para nodos hoja: contenedor expandible de archivos inline
    var inlineFiles = esHoja
      ? '<div class="inline-file-list" id="files-' + id + '" style="display:none;margin-left:28px;margin-top:2px;border-left:2px solid #F9DADA;padding-left:8px"></div>'
      : '';

    // Chevron para indicar expand/collapse en hojas
    var chevron = esHoja
      ? '<i class="fas fa-chevron-right tree-chevron" style="color:#ccc;font-size:10px;transition:transform .2s"></i>'
      : '';

    var children = hasHijos
      ? '<div style="border-left:2px solid #F0F0F0;margin-left:18px">' +
          nodo.hijos.map(function(h){ return nodeHTML(h, 0); }).join('') + '</div>'
      : '';

    return '<div class="tree-node" style="margin-left:' + indent + 'px">' +
             '<div class="tree-node-label tree-clickable"' +
               ' data-id=' + idSafe +
               ' data-nombre=' + nomSafe +
               ' data-hoja="' + esHoja + '"' +
               ' style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer">' +
               '<i class="fas ' + icono + ' tree-folder-icon" style="color:' + colorI + ';font-size:14px;flex-shrink:0"></i>' +
               '<span style="flex:1;font-size:13.5px;font-weight:' + peso + '">' + nombre + '</span>' +
               badge +
               chevron +
               '<button class="btn-nueva-sub" data-id=' + idSafe + ' data-nombre=' + nomSafe +
                 ' style="background:none;border:none;cursor:pointer;color:#ccc;font-size:12px;padding:2px 5px;border-radius:4px;transition:.2s;margin-left:2px">' +
                 '<i class="fas fa-folder-plus"></i>' +
               '</button>' +
             '</div>' +
             inlineFiles +
             children +
           '</div>';
  }

    container.innerHTML = nodeHTML(arbolDocs.raiz, 0);
  document.getElementById('arbolCount').textContent = arbolDocs.nodos + ' categorías';

  // Event delegation - evita problemas con comillas en atributos
  container.querySelectorAll('.tree-clickable').forEach(function(el) {
    el.addEventListener('mouseover', function() { this.style.background = '#FEF5F4'; });
    el.addEventListener('mouseout',  function() { this.style.background = '';       });
    el.addEventListener('click', function() {
      var id     = this.dataset.id;
      var nombre = this.dataset.nombre;
      var esHoja = this.dataset.hoja === 'true';
      window.selectCat(id, nombre, esHoja, this);
    });
  });
  container.querySelectorAll('.btn-nueva-sub').forEach(function(btn) {
    btn.addEventListener('mouseover', function() { this.style.color = '#C0392B'; this.style.background = '#FCE8E6'; });
    btn.addEventListener('mouseout',  function() { this.style.color = '#ccc';    this.style.background = 'none';    });
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      window.abrirNuevaSubcarpeta(this.dataset.id, this.dataset.nombre);
    });
  });
}

window.selectCat = async function(id, nombre, esHoja, el) {
  document.querySelectorAll('.tree-node-label').forEach(e => e.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const catEl = document.getElementById('catActual');
  if (catEl) catEl.textContent = nombre;

  const docList = document.getElementById('docList');

  // Si es carpeta padre (tiene hijos), solo mostrar mensaje orientativo en docList
  if (!esHoja) {
    const nodoP = arbolDocs.buscar(id);
    const hijos = nodoP ? nodoP.hijos : [];
    if (docList) {
      docList.innerHTML = `
        <div style="padding:8px 0">
          <p style="font-size:13px;color:#888;margin-bottom:14px">
            <i class="fas fa-info-circle" style="color:var(--red-500)"></i>
            Esta es una carpeta principal. Haz clic en una subcarpeta del árbol para ver sus documentos.
          </p>
        </div>`;
    }
    const uploadBtn = document.getElementById('nuevoDocBtn');
    if (uploadBtn) uploadBtn.style.display = 'none';
    return;
  }

  // ── NODO HOJA: expand/collapse inline en el árbol ──
  const inlinePanel = document.getElementById('files-' + id);
  const isOpen = inlinePanel && inlinePanel.style.display !== 'none';

  // Cerrar todos los paneles abiertos (colapsar otros)
  document.querySelectorAll('.inline-file-list').forEach(p => {
    p.style.display = 'none';
  });
  // Resetear todos los chevrones
  document.querySelectorAll('.tree-chevron').forEach(c => {
    c.style.transform = '';
    c.style.color = '#ccc';
  });

  // Si ya estaba abierto, solo lo cerramos (toggle)
  if (isOpen) {
    window._catActivaId = null;
    window._catActivaNombre = null;
    const uploadBtn = document.getElementById('nuevoDocBtn');
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (docList) docList.innerHTML = '<div class="cola-empty" style="color:#aaa">Selecciona una subcarpeta para ver documentos.</div>';
    return;
  }

  // Abrir este panel
  if (!inlinePanel) return;
  inlinePanel.style.display = 'block';

  // Rotar chevron del nodo seleccionado
  if (el) {
    const chevron = el.querySelector('.tree-chevron');
    if (chevron) { chevron.style.transform = 'rotate(90deg)'; chevron.style.color = '#C0392B'; }
    // Cambiar icono carpeta a abierta
    const folderIcon = el.querySelector('.tree-folder-icon');
    if (folderIcon) { folderIcon.className = 'fas fa-folder-open tree-folder-icon'; folderIcon.style.color = '#C0392B'; }
  }

  // Mostrar botón de subir y guardar categoría activa
  const uploadBtn = document.getElementById('nuevoDocBtn');
  if (uploadBtn) uploadBtn.style.display = 'inline-flex';
  window._catActivaId     = id;
  window._catActivaNombre = nombre;

  // Mostrar spinner en el panel inline
  inlinePanel.innerHTML = '<div style="padding:6px 4px;font-size:12px;color:#aaa"><i class="fas fa-spinner fa-spin"></i> Cargando archivos...</div>';

  // También actualizar docList si existe (panel derecho)
  if (docList) {
    docList.innerHTML = '<div class="cola-empty" style="color:#aaa"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
  }

  // Docs del árbol en memoria
  const nodo = arbolDocs.buscar(id);
  let docs   = nodo && nodo.dato && nodo.dato.docs ? [...nodo.dato.docs] : [];

  // Docs subidos en localStorage
  const ls = JSON.parse(localStorage.getItem('sc_documentos') || '[]');
  ls.filter(d => d.categoria === id).forEach(d => {
    if (!docs.some(x => x.nombre === d.nombre)) docs.push(d);
  });

  // Cargar desde Supabase (fuente real)
  try {
    const catIdMap = { root:0, academico:1, reglamentos:2, mallas:3, silabus:4, administrativo:5, formularios:6, actas:7, financiero:8 };
    const { data: sbDocs } = await window.supabase
      .from('documento').select('*')
      .eq('id_categoria', catIdMap[id] || 1)
      .eq('activo', true)
      .order('creado_en', { ascending: false });

    if (sbDocs && sbDocs.length > 0) {
      const mapped = sbDocs.map(d => ({
        nombre: d.nombre,
        tipo:   d.tipo_archivo || 'PDF',
        fecha:  (d.creado_en || '').split('T')[0],
        url:    d.ruta_archivo || ''
      }));
      if (nodo) nodo.dato.docs = mapped;
      docs = mapped;
    }
  } catch(e) { /* usar los que ya están */ }

  const iconMap = { PDF:'fa-file-pdf', DOCX:'fa-file-word', XLSX:'fa-file-excel' };

  // ── Renderizar en panel inline del árbol ──
  if (!docs.length) {
    inlinePanel.innerHTML =
      '<div style="padding:6px 4px;font-size:12px;color:#aaa;font-style:italic">No hay documentos en esta subcarpeta.</div>';
  } else {
    inlinePanel.innerHTML = docs.map(d => {
      const icon = iconMap[d.tipo] || 'fa-file-pdf';
      const colorIcon = d.tipo === 'DOCX' ? '#2B6CB0' : d.tipo === 'XLSX' ? '#276749' : '#C0392B';
      const btn = d.url
        ? '<a href="' + d.url + '" target="_blank" download title="Descargar" style="color:#C0392B;font-size:11px;white-space:nowrap;text-decoration:none;background:#FEF2F2;border:1px solid #FECACA;border-radius:4px;padding:2px 7px">' +
            '<i class="fas fa-download" style="margin-right:3px"></i>Descargar</a>'
        : '<span style="color:#bbb;font-size:11px">Sin enlace</span>';
      return '<div style="display:flex;align-items:center;gap:7px;padding:5px 4px;border-bottom:1px solid #FEF0F0;font-size:12px">' +
        '<i class="fas ' + icon + '" style="color:' + colorIcon + ';font-size:13px;flex-shrink:0"></i>' +
        '<span style="flex:1;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + d.nombre + '">' + d.nombre + '</span>' +
        '<span style="color:#aaa;font-size:10px;white-space:nowrap">' + (d.fecha||'') + '</span>' +
        btn +
        '</div>';
    }).join('');
  }

  // ── También actualizar docList del panel derecho si existe ──
  if (docList) {
    if (!docs.length) {
      docList.innerHTML = '<div class="cola-empty">No hay documentos en esta categoría.</div>';
    } else {
      docList.innerHTML = docs.map((d, i) => {
        const icon = iconMap[d.tipo] || 'fa-file-pdf';
        const urlSafe = encodeURIComponent(d.url || '');
        const nomSafe = (d.nombre || '').replace(/'/g, "\\'");
        const tipoSafe = d.tipo || 'PDF';
        const verBtn = d.url
          ? '<button class="btn-sm btn-ver-doc" onclick="abrirVisorDoc(\'' + urlSafe + '\',\'' + nomSafe + '\',\'' + tipoSafe + '\')" title="Ver documento" style="background:var(--red-600);color:#fff;border:none;cursor:pointer">' +
              '<i class="fas fa-eye"></i> Ver</button>'
          : '';
        const dlBtn  = d.url
          ? '<a href="' + d.url + '" target="_blank" download class="btn-sm" title="Descargar"><i class="fas fa-download"></i> Descargar</a>'
          : '<span class="btn-sm" style="color:#aaa;cursor:default">Sin enlace</span>';
        return '<div class="doc-item" style="cursor:pointer" onclick="abrirVisorDoc(\'' + urlSafe + '\',\'' + nomSafe + '\',\'' + tipoSafe + '\')">' +
          '<i class="fas ' + icon + '" style="color:var(--red-600);font-size:20px;flex-shrink:0"></i>' +
          '<div class="doc-item-info"><strong>' + d.nombre + '</strong><span>' + tipoSafe + ' · ' + (d.fecha||'-') + '</span></div>' +
          '<div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">' + verBtn + dlBtn + '</div>' +
          '</div>';
      }).join('');
    }
  }
};

/* ═══════════════════════════════════════
   MÓDULO: HISTORIAL (Pila)
   ═══════════════════════════════════════ */
function updateHistorialTable() {
  const arr = pilaHistorial.toArray();
  const tbody = document.getElementById('historialTbody');
  if (arr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">Sin acciones registradas</td></tr>';
    return;
  }
  tbody.innerHTML = arr.map((a, i) => `
    <tr>
      <td>${arr.length - i}</td>
      <td>${a.accion}</td>
      <td>${a.usuario}</td>
      <td>${a.modulo}</td>
      <td>${formatDate(a.ts)}</td>
      <td><span class="status-badge status-${
        a.estado === 'success' ? 'Completado' :
        a.estado === 'warning' ? 'Pendiente'  :
        a.estado === 'error'   ? 'Rechazado'  : 'Activo'
      }">${
        a.estado === 'success' ? 'Exitoso'    :
        a.estado === 'warning' ? 'Advertencia':
        a.estado === 'error'   ? 'Error'      : 'Información'
      }</span></td>
    </tr>
  `).join('');
}

function updatePilaCount() {
  document.getElementById('pilaCount').textContent = `${pilaHistorial.getTamaño()} acciones`;
  // Actualizar lista de acciones en dashboard
  const arr = pilaHistorial.toArray().slice(0, 5);
  const colors = { success: 'success', info: 'info', warning: 'warning', error: 'error' };
  const list = document.getElementById('actionList');
  if (arr.length > 0) {
    list.innerHTML = arr.map(a => `
      <div class="action-item">
        <div class="action-dot ${colors[a.estado] || 'info'}"></div>
        <div class="action-text">
          <strong>${a.accion}</strong>
          <span>${formatDate(a.ts)} · ${a.usuario}</span>
        </div>
      </div>`).join('');
  }
}

document.getElementById('undoBtn').addEventListener('click', () => {
  const action = pilaHistorial.desapilar();
  if (!action) { showToast('No hay acciones para deshacer', 'warning'); return; }
  updateHistorialTable();
  updatePilaCount();
  showToast(`Deshecho: ${action.accion}`, 'info');
});

document.getElementById('clearHistorial').addEventListener('click', () => {
  if (!confirm('¿Limpiar todo el historial?')) return;
  while (!pilaHistorial.estaVacia()) pilaHistorial.desapilar();
  Storage.clearHistorial();
  updateHistorialTable();
  updatePilaCount();
  showToast('Historial limpiado', 'info');
});

/* ═══════════════════════════════════════
   MÓDULO: USUARIOS
   ═══════════════════════════════════════ */
async function renderUsuarios() {
  const tbody = document.getElementById('usuariosTbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>';

  let usuarios = [];
  try {
    // Cargar desde Supabase con JOIN a rol
    const { data, error } = await window.supabase
      .from('usuario')
      .select('id_usuario, nombre, email, estado, rol:id_rol(nombre)')
      .order('id_usuario');
    if (!error && data && data.length > 0) {
      usuarios = data.map(u => ({
        id:     u.id_usuario,
        nombre: u.nombre,
        email:  u.email,
        rol:    u.rol?.nombre || 'Sin rol',
        estado: u.estado || 'Activo'
      }));
      // Cache en localStorage
      localStorage.setItem('sc_usuarios', JSON.stringify(usuarios));
    }
  } catch(e) { console.warn('Supabase usuarios:', e); }

  // Fallback localStorage
  if (!usuarios.length)
    usuarios = JSON.parse(localStorage.getItem('sc_usuarios') || '[]');

  if (!usuarios.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">Sin usuarios registrados</td></tr>';
    document.getElementById('kpi-usuarios').textContent = '0';
    return;
  }

  tbody.innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.id || '-'}</td>
      <td><strong>${u.nombre}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge badge-cola">${u.rol}</span></td>
      <td><span class="status-badge status-${u.estado}">${u.estado}</span></td>
      <td>
        <button class="btn-icon" title="Ver actividad" onclick="verDetalleUsuario(${u.id}, '${(u.nombre||'').replace(/'/g,'\\\'')}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" title="Generar reporte de este usuario" onclick="reporteUsuario(${u.id}, '${(u.nombre||'').replace(/'/g,'\\\'')}', '${u.rol||''}')" style="color:#2980B9">
          <i class="fas fa-chart-bar"></i>
        </button>
        <button class="btn-icon" title="${u.estado === 'Activo' ? 'Inactivar' : 'Activar'}" onclick="toggleUser(${u.id})">
          <i class="fas fa-toggle-${u.estado === 'Activo' ? 'on' : 'off'}"></i>
        </button>
      </td>
    </tr>
  `).join('');

  const activos = usuarios.filter(u => u.estado === 'Activo').length;
  document.getElementById('kpi-usuarios').textContent = activos;
}

window.toggleUser = async function(id) {
  const usuarios = JSON.parse(localStorage.getItem('sc_usuarios') || '[]');
  const u = usuarios.find(u => u.id === id);
  if (!u) { showToast('Usuario no encontrado', 'error'); return; }
  const nuevoEstado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
  try {
    await window.supabase.from('usuario').update({ estado: nuevoEstado }).eq('id_usuario', id);
  } catch(e) { console.warn(e); }
  u.estado = nuevoEstado;
  localStorage.setItem('sc_usuarios', JSON.stringify(usuarios));
  renderUsuarios();
  showToast(`Usuario ${u.nombre} → ${nuevoEstado}`, nuevoEstado === 'Activo' ? 'success' : 'warning');
  pushHistorial(`Usuario ${u.nombre} ${nuevoEstado === 'Activo' ? 'activado' : 'inactivado'}`, 'Usuarios', 'warning');
};

window.verDetalleUsuario = async function(idUsuario, nombre) {
  openModal('Actividad de ' + nombre,
    '<div style="text-align:center;padding:24px"><i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--red-600)"></i></div>',
    'Cerrar', null
  );
  let tramites = [], turnos = [];
  try {
    const [tRes, turRes] = await Promise.all([
      window.supabase.from('tramite').select('codigo, estado, fecha_reg, tipotramite(nombre)')
        .eq('id_solicitante', idUsuario).order('fecha_reg', {ascending:false}).limit(8),
      window.supabase.from('turno').select('numero, tipo_servicio, estado, fecha_cita, hora_cita')
        .eq('id_usuario', idUsuario).order('creado_en', {ascending:false}).limit(8)
    ]);
    tramites = tRes.data || [];
    turnos   = turRes.data || [];
  } catch(e) {}
  const badge = e => '<span class="status-badge status-' + (e||'').replace(' ','-') + '">' + (e||'-') + '</span>';
  document.getElementById('modalBody').innerHTML =
    '<h4 style="font-size:13px;font-weight:700;color:var(--red-700);margin-bottom:10px"><i class="fas fa-file-alt"></i> Trámites</h4>' +
    (tramites.length
      ? '<table class="data-table" style="margin-bottom:18px"><thead><tr><th>Código</th><th>Tipo</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>' +
        tramites.map(t => '<tr><td><strong>' + (t.codigo||'-') + '</strong></td><td>' + (t.tipotramite?.nombre||'-') + '</td><td>' + (t.fecha_reg||'').split('T')[0] + '</td><td>' + badge(t.estado) + '</td></tr>').join('') +
        '</tbody></table>'
      : '<p style="color:#aaa;font-size:13px;margin-bottom:18px">Sin trámites</p>') +
    '<h4 style="font-size:13px;font-weight:700;color:var(--red-700);margin-bottom:10px"><i class="fas fa-ticket-alt"></i> Turnos</h4>' +
    (turnos.length
      ? '<table class="data-table"><thead><tr><th>N°</th><th>Servicio</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>' +
        turnos.map(t => '<tr><td><strong>' + (t.numero||'-') + '</strong></td><td>' + (t.tipo_servicio||'-') + '</td><td>' + (t.fecha_cita||'-') + '</td><td>' + badge(t.estado) + '</td></tr>').join('') +
        '</tbody></table>'
      : '<p style="color:#aaa;font-size:13px">Sin turnos</p>');
};

// ── REPORTE INDIVIDUAL POR USUARIO ──────────────────────
window.reporteUsuario = async function(idUsuario, nombre, rol) {
  showToast('Generando reporte de ' + nombre + '...', 'info');

  let turnos   = [];
  let tramites = [];

  try {
    const [tRes, trRes] = await Promise.all([
      window.supabase.from('turno').select('numero, tipo_servicio, estado, fecha_cita, hora_cita, creado_en')
        .eq('id_usuario', idUsuario).order('creado_en', { ascending: false }),
      window.supabase.from('tramite').select('codigo, estado, descripcion, fecha_reg, observaciones, tipotramite(nombre)')
        .eq('id_solicitante', idUsuario).order('fecha_reg', { ascending: false })
    ]);
    turnos   = tRes.data  || [];
    tramites = trRes.data || [];
  } catch(e) { console.warn('reporteUsuario:', e); }

  const fecha = new Date().toLocaleString('es-EC');
  const fechaStr = new Date().toISOString().split('T')[0];

  // Stats del usuario
  const turnosAtend  = turnos.filter(t => t.estado === 'Atendido').length;
  const tramitesComp = tramites.filter(t => t.estado === 'Completado').length;
  const tramitesRech = tramites.filter(t => t.estado === 'Rechazado').length;
  const tramitesPend = tramites.filter(t => t.estado === 'Pendiente' || t.estado === 'En proceso').length;

  const estadoBadge = (e) => {
    const c = {Completado:'#27AE60',Atendido:'#27AE60',Pendiente:'#F39C12',Esperando:'#F39C12',
               Rechazado:'#E74C3C',Cancelado:'#E74C3C','En proceso':'#2980B9',Llamado:'#2980B9'};
    return '<span style="background:' + (c[e]||'#aaa') + '22;color:' + (c[e]||'#666') + ';padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">' + (e||'-') + '</span>';
  };

  const turnosRows = turnos.length
    ? turnos.map(t => '<tr>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px"><strong>' + (t.numero||'-') + '</strong></td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (t.tipo_servicio||'-') + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (t.fecha_cita||'-') + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (t.hora_cita||'-') + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + estadoBadge(t.estado) + '</td>' +
      '</tr>').join('')
    : '<tr><td colspan="5" style="padding:16px;text-align:center;color:#aaa;font-size:12px">Sin turnos registrados</td></tr>';

  const tramitesRows = tramites.length
    ? tramites.map(t => '<tr>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px"><strong>' + (t.codigo||'-') + '</strong></td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (t.tipotramite?.nombre||'-') + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (t.fecha_reg||'').split('T')[0] + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + estadoBadge(t.estado) + '</td>' +
        '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis">' + (t.observaciones||'-') + '</td>' +
      '</tr>').join('')
    : '<tr><td colspan="5" style="padding:16px;text-align:center;color:#aaa;font-size:12px">Sin trámites registrados</td></tr>';

  const htmlStr =
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<title>Reporte — ' + nombre + '</title>' +
    '<style>' +
      'body{font-family:Arial,sans-serif;margin:30px;color:#111;font-size:13px}' +
      'h1{color:#991B1B;font-size:20px;margin:0 0 4px}' +
      'h2{color:#991B1B;font-size:15px;margin:24px 0 10px;padding-bottom:6px;border-bottom:2px solid #FECACA}' +
      'p{color:#666;font-size:12px;margin:0 0 16px}' +
      '.kpis{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}' +
      '.kpi{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 18px;text-align:center;min-width:110px}' +
      '.kpi-v{font-size:26px;font-weight:700;color:#991B1B}' +
      '.kpi-l{font-size:11px;color:#666;margin-top:4px}' +
      '.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;background:#FEF2F2;color:#991B1B}' +
      'table{width:100%;border-collapse:collapse;margin-bottom:8px}' +
      'th{background:#991B1B;color:#fff;padding:8px 10px;font-size:11px;text-align:left}' +
      'tr:nth-child(even) td{background:#FEF9F9}' +
      '.footer{margin-top:24px;font-size:10px;color:#999;text-align:right;border-top:1px solid #eee;padding-top:8px}' +
      '@media print{button{display:none}}' +
    '</style></head><body>' +

    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">' +
      '<div>' +
        '<h1>🏛 SmartCampus UTA</h1>' +
        '<p>Reporte Individual de Usuario | Generado: ' + fecha + '</p>' +
      '</div>' +
      '<button onclick="window.print()" style="background:#991B1B;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap">🖨 Imprimir / PDF</button>' +
    '</div>' +

    '<div style="background:#FFF8F8;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#991B1B;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;flex-shrink:0">' +
        nombre.charAt(0).toUpperCase() +
      '</div>' +
      '<div>' +
        '<div style="font-size:18px;font-weight:700;color:#111">' + nombre + '</div>' +
        '<div style="font-size:13px;color:#666;margin-top:2px"><span class="badge">' + rol + '</span></div>' +
      '</div>' +
    '</div>' +

    '<div class="kpis">' +
      '<div class="kpi"><div class="kpi-v">' + turnos.length + '</div><div class="kpi-l">Total Turnos</div></div>' +
      '<div class="kpi"><div class="kpi-v">' + turnosAtend + '</div><div class="kpi-l">Turnos Atendidos</div></div>' +
      '<div class="kpi"><div class="kpi-v">' + tramites.length + '</div><div class="kpi-l">Total Trámites</div></div>' +
      '<div class="kpi"><div class="kpi-v">' + tramitesComp + '</div><div class="kpi-l">Completados</div></div>' +
      '<div class="kpi"><div class="kpi-v">' + tramitesPend + '</div><div class="kpi-l">Pendientes</div></div>' +
      '<div class="kpi"><div class="kpi-v">' + tramitesRech + '</div><div class="kpi-l">Rechazados</div></div>' +
    '</div>' +

    '<h2>📋 Historial de Turnos</h2>' +
    '<table><thead><tr><th>N° Turno</th><th>Servicio</th><th>Fecha Cita</th><th>Hora</th><th>Estado</th></tr></thead>' +
    '<tbody>' + turnosRows + '</tbody></table>' +

    '<h2>📄 Historial de Trámites</h2>' +
    '<table><thead><tr><th>Código</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Observaciones</th></tr></thead>' +
    '<tbody>' + tramitesRows + '</tbody></table>' +

    '<div class="footer">Universidad Técnica de Ambato — SmartCampus UTA</div>' +
    '</body></html>';

  // Abrir en visor integrado
  window.abrirVisorReporte(htmlStr, 'Reporte_' + nombre.replace(/\s+/g,'_') + '_' + fechaStr);
  showToast('Reporte de ' + nombre + ' generado', 'success');
};

// toggleUser moved above with renderUsuarios

document.getElementById('nuevoUserBtn').addEventListener('click', () => {
  openModal('Nuevo Usuario', `
    <div class="form-row">
      <div class="form-group"><label>Nombre</label><input class="form-control" id="u-nombre" placeholder="Nombre completo"/></div>
      <div class="form-group"><label>Email</label><input class="form-control" id="u-email" placeholder="correo@uta.edu.ec"/></div>
    </div>
    <div class="form-group"><label>Rol</label>
      <select class="form-control" id="u-rol">
        <option>Estudiante</option><option>Docente</option><option>Secretaria</option><option>Administrador</option>
      </select></div>
  `, 'Crear Usuario', () => {
    const nombre = document.getElementById('u-nombre').value.trim();
    const email  = document.getElementById('u-email').value.trim();
    const rol    = document.getElementById('u-rol').value;
    if (!nombre || !email) { showToast('Complete todos los campos', 'warning'); return; }
    const nuevo = Storage.addUsuario({ nombre, email, rol, estado: 'Activo' });
    renderUsuarios();
    showToast(`Usuario ${nombre} creado`, 'success');
    pushHistorial(`Usuario ${nombre} creado con rol ${rol}`, 'Usuarios', 'success');
    const stats = Storage.getStats();
    Storage.updateStats({ usuariosNuevosMes: stats.usuariosNuevosMes + 1 });
    document.getElementById('rep-nuevos').textContent = stats.usuariosNuevosMes + 1;
  });
});

/* ═══════════════════════════════════════
   NAVBAR: FECHA, BÚSQUEDA, LOGOUT
   ═══════════════════════════════════════ */

  // Fecha
  const currentDate = document.getElementById('currentDate');

  if (currentDate) {

    currentDate.textContent = new Date().toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  }

  // Búsqueda
  const globalSearch = document.getElementById('globalSearch');

  if (globalSearch) {

    globalSearch.addEventListener('keydown', e => {

      if (e.key === 'Enter') {

        const q = e.target.value.trim();

        if (q) {
          showToast(`Buscando: "${q}"`, 'info');
        }
      }
    });

  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {

    logoutBtn.addEventListener('click', async () => {

      try {

        showToast('Cerrando sesión...', 'warning');

        // cerrar sesión Supabase
        await window.supabase.auth.signOut();

        // limpiar sesión local
        sessionStorage.removeItem('smartcampus_session');

        // redirigir
        window.location.href = '../index.html';

      } catch (error) {

        console.error('Error cerrando sesión:', error);

        showToast('Error al cerrar sesión', 'error');
      }
    });

  }

// ── PANEL DE NOTIFICACIONES ──────────────────────────────
const notifBtn   = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
const notifCount = document.getElementById('notifCount');

function closeNotifPanel() {
  notifPanel.classList.remove('open');
}
window.closeNotifPanel = closeNotifPanel;

notifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  notifPanel.classList.toggle('open');
});

// Cerrar al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
    closeNotifPanel();
  }
});

// Descartar notificación individual
window.dismissNotif = function(btn) {
  const item = btn.closest('.notif-item');
  item.style.transition = 'all .25s ease';
  item.style.opacity = '0';
  item.style.maxHeight = item.offsetHeight + 'px';
  setTimeout(() => {
    item.style.maxHeight = '0';
    item.style.padding = '0';
    item.style.overflow = 'hidden';
  }, 50);
  setTimeout(() => {
    item.remove();
    updateNotifCount();
    checkNotifEmpty();
  }, 300);
};

function updateNotifCount() {
  const unread = document.querySelectorAll('.notif-item.unread').length;
  if (unread > 0) {
    notifCount.textContent = unread;
    notifCount.style.display = 'flex';
  } else {
    notifCount.style.display = 'none';
  }
}

function checkNotifEmpty() {
  const list = document.getElementById('notifList');
  if (list.children.length === 0) {
    list.innerHTML = `
      <div class="notif-empty">
        <i class="fas fa-bell-slash"></i>
        No hay notificaciones pendientes
      </div>`;
  }
}

// Marcar todas como leídas
document.getElementById('markAllBtn').addEventListener('click', () => {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
  });
  updateNotifCount();
  showToast('Todas las notificaciones marcadas como leídas', 'success');
});

// Agregar notificación desde el sistema (usado por otros módulos)
window.addNotificacion = function(texto, descripcion, tipo = 'info') {
  // Usar NotifManager si está disponible (tiempo real)
  if (window.NotifManager) {
    NotifManager.add({ titulo: texto, desc: descripcion, tipo, page: '', tiempo: 'Ahora' });
    return;
  }
  // Fallback manual
  const list = document.getElementById('notifList');
  const empty = list.querySelector('.notif-empty');
  if (empty) empty.remove();

  const item = document.createElement('div');
  item.className = 'notif-item unread';
  item.innerHTML = `
    <div class="notif-dot ${tipo}"></div>
    <div class="notif-content">
      <strong>${texto}</strong>
      <p>${descripcion}</p>
      <span class="notif-time"><i class="fas fa-clock"></i> Ahora</span>
    </div>
    <button class="notif-close-item" onclick="dismissNotif(this)"><i class="fas fa-times"></i></button>`;
  list.insertBefore(item, list.firstChild);
  updateNotifCount();
};

/* ═══════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════ */
(function init() {
  // Cargar historial desde localStorage en la pila
  const historialGuardado = Storage.getHistorial();
  [...historialGuardado].reverse().forEach(h => pilaHistorial.apilar(h));

  // Restaurar cola de turnos desde localStorage
  const turnosGuardados = Storage.getTurnos();
  turnosGuardados.forEach(t => colaTurnos.encolar({ ...t, ts: new Date(t.ts) }));

  // Cargar trámites en lista enlazada
  Storage.getTramites().forEach(t => listaTramites.insertarAlFinal(t));

  // Árbol de documentos
  buildTreeFromData(DB.documentosTree);
  // Restaurar subcarpetas creadas previamente
  const _cats = JSON.parse(localStorage.getItem('sc_categorias') || '[]');
  _cats.forEach(c => {
    if (!arbolDocs.buscar(c.id)) {
      arbolDocs.insertarHijo(c.padreId, { id: c.id, nombre: c.nombre, icono: 'fa-folder-open', docs: [] });
    }
  });
  renderTree();
  // Ocultar botón subir hasta que se seleccione subcarpeta
  const _upBtn = document.getElementById('nuevoDocBtn');
  if (_upBtn) _upBtn.style.display = 'none';

  // Renderizar módulos
  renderCola();
  renderTramites();
  renderUsuarios();
  updateHistorialTable();
  updatePilaCount();

  // KPIs del dashboard principal (no la página de reportes)
  document.getElementById('kpi-docs') && (document.getElementById('kpi-docs').textContent = '0');

  // Mapa del campus - inicializar solo al abrir la pestaña

  // Animación KPIs
  // KPIs se actualizan desde renderUsuarios() y renderTramites() que usan Supabase
  animateCount('kpi-tramites', listaTramites.getTamaño());

  showToast('SmartCampus UTA cargado correctamente', 'success');
  pushHistorial('Sesión iniciada', 'Sistema', 'success');

  // ── NOTIFICACIONES - inicializar badge correctamente ──────
  // El panel HTML puede tener items .unread pre-existentes — sincronizar badge
  setTimeout(() => updateNotifCount(), 100);

  // ── NOTIFICACIONES EN TIEMPO REAL ──────────────────────
  const _adminSession = JSON.parse(sessionStorage.getItem('smartcampus_session') || '{}');
  if (_adminSession.id && window.RealtimeNotif) {
    RealtimeNotif.init(_adminSession.id, 'Admin');
  }
})();

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 20);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 50);
}
/* ═══════════════════════════════════════
   MÓDULO: VISOR DE DOCUMENTOS
   ═══════════════════════════════════════ */
window.abrirVisorDoc = function(urlEncoded, nombre, tipo) {
  const url = decodeURIComponent(urlEncoded);
  if (!url) { showToast('Este documento no tiene enlace disponible', 'warning'); return; }

  // Determinar src del iframe según tipo
  let iframeSrc;
  if (tipo === 'DOCX') {
    // Google Docs Viewer para DOCX
    iframeSrc = 'https://docs.google.com/gview?url=' + encodeURIComponent(url) + '&embedded=true';
  } else {
    // PDF directo en iframe
    iframeSrc = url;
  }

  // Crear overlay visor si no existe
  let overlay = document.getElementById('docVisorOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'docVisorOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';
    overlay.innerHTML = `
      <div id="docVisorBox" style="background:#fff;border-radius:12px;width:100%;max-width:900px;height:90vh;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.4);overflow:hidden">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #F0F0F0;background:#FFF8F8;flex-shrink:0">
          <i id="docVisorIcon" class="fas fa-file-pdf" style="font-size:20px;color:#C0392B"></i>
          <span id="docVisorNombre" style="flex:1;font-weight:600;font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>
          <a id="docVisorDl" href="#" target="_blank" download
             style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#C0392B;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:5px 12px;text-decoration:none;white-space:nowrap">
            <i class="fas fa-download"></i> Descargar
          </a>
          <button onclick="cerrarVisorDoc()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#999;padding:4px 6px;border-radius:6px;line-height:1" title="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div style="flex:1;position:relative;background:#F5F5F5">
          <div id="docVisorLoading" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#aaa;font-size:13px">
            <i class="fas fa-spinner fa-spin" style="font-size:28px;color:#C0392B"></i>
            <span>Cargando documento...</span>
          </div>
          <iframe id="docVisorFrame"
            style="width:100%;height:100%;border:none;position:relative;z-index:1"
            onload="document.getElementById('docVisorLoading').style.display='none'"
            onerror="document.getElementById('docVisorLoading').innerHTML='<i class=\'fas fa-exclamation-circle\' style=\'font-size:28px;color:#C0392B\'></i><span>No se pudo cargar el documento.<br>Usa el botón Descargar.</span>'"
          ></iframe>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarVisorDoc(); });
    document.body.appendChild(overlay);
  }

  // Actualizar contenido del visor
  const iconMap2 = { PDF:'fa-file-pdf', DOCX:'fa-file-word', XLSX:'fa-file-excel' };
  const colorMap = { PDF:'#C0392B', DOCX:'#2B6CB0', XLSX:'#276749' };
  document.getElementById('docVisorNombre').textContent = nombre;
  document.getElementById('docVisorIcon').className = 'fas ' + (iconMap2[tipo] || 'fa-file') ;
  document.getElementById('docVisorIcon').style.color = colorMap[tipo] || '#C0392B';
  document.getElementById('docVisorDl').href = url;
  document.getElementById('docVisorLoading').style.display = 'flex';
  document.getElementById('docVisorFrame').src = '';

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Pequeño delay para que el spinner aparezca antes del iframe
  setTimeout(() => {
    document.getElementById('docVisorFrame').src = iframeSrc;
  }, 80);
};

window.cerrarVisorDoc = function() {
  const overlay = document.getElementById('docVisorOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.getElementById('docVisorFrame').src = '';
  }
  document.body.style.overflow = '';
};

// Cerrar visor con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarVisorDoc();
});

// ── AUTO-REFRESH: actualizar cola y KPIs cada 30s ─────────
(function startAutoRefresh() {
  function refreshDashboard() {
    // Solo si el dashboard está activo (página visible)
    if (document.hidden) return;
    // Recargar cola desde Supabase
    window.supabase.from('turno').select('*, usuario:id_usuario(nombre)')
      .eq('estado','Esperando').order('creado_en',{ascending:true})
      .then(({ data }) => {
        if (!data) return;
        // Sincronizar cola
        while (!colaTurnos.estaVacia()) colaTurnos.desencolar();
        data.forEach(t => colaTurnos.encolar({
          numero:     t.numero || '#'+t.id_turno,
          nombre:     t.usuario?.nombre || 'Estudiante',
          tipo:       t.tipo_servicio || 'General',
          id_turno:   t.id_turno,
          id_usuario: t.id_usuario,
          fecha_cita: t.fecha_cita,
          hora_cita:  t.hora_cita,
          ts:         new Date(t.creado_en)
        }));
        renderCola();
        // Actualizar KPI
        const kpiTurnos = document.getElementById('kpi-turnos');
        if (kpiTurnos) kpiTurnos.textContent = data.length;
      }).catch(() => {});
    // Recargar trámites
    renderTramites();
  }
  const _autoRefreshAdmin = setInterval(refreshDashboard, 30000);
  // También refrescar cuando la ventana recupera el foco
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDashboard(); });
  window.addEventListener('focus', refreshDashboard);
})();
