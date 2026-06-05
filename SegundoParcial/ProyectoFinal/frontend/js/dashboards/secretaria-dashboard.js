/**
 * SmartCampus UTA — Dashboard Secretaria
 * Rol: Secretaria | Permisos: Turnos, Trámites, Documentos, Historial, Reportes
 */

// ── SESIÓN ───────────────────────────────────────────────
const _session = sessionStorage.getItem('smartcampus_session');
if (!_session) window.location.replace('login.html');
const currentUser = _session ? JSON.parse(_session) : null;
if (currentUser && currentUser.rol !== 'Secretaria') window.location.replace('login.html');

// ── UI INICIAL ───────────────────────────────────────────
if (currentUser) {
  const ini = currentUser.nombre.charAt(0).toUpperCase();
  document.getElementById('userName').textContent    = currentUser.nombre;
  document.getElementById('userRole').textContent    = currentUser.rol;
  document.getElementById('userAvatar').textContent  = ini;
  document.getElementById('welcomeName').textContent = `¡Bienvenida, ${currentUser.nombre}!`;
}

// ── FECHA ───────────────────────────────────────────────
if (typeof initFecha !== 'undefined') initFecha();

// ── NOTIFICACIONES ───────────────────────────────────────
NotifManager.init([
  { titulo: 'Sesión iniciada', desc: `Bienvenida, ${currentUser?.nombre}`, tipo: 'success', leida: false, tiempo: 'Ahora', page: '' },
]);

// ── NOTIFICACIONES EN TIEMPO REAL ────────────────────────
if (currentUser) RealtimeNotif.init(currentUser.id, 'Secretaria');

// ── PERFIL ───────────────────────────────────────────────
initPerfil(currentUser);

// ── COLA DE TURNOS ───────────────────────────────────────
let colaTurnos = new Cola();

async function verificarTurnosExpirados() {

  const { data: turnos } = await window.supabase
    .from('turno')
    .select('*')
    .eq('estado', 'Esperando');

  const ahora = new Date();

  for (const turno of (turnos || [])) {

    if (!turno.fecha_cita || !turno.hora_cita) continue;

    const fechaTurno = new Date(
      turno.fecha_cita + 'T' + turno.hora_cita + ':00'
    );

    const diferenciaMin =
      (ahora.getTime() - fechaTurno.getTime()) / 60000;

    if (diferenciaMin > 15) {

      await window.supabase
        .from('turno')
        .update({ estado: 'Expirado' })
        .eq('id_turno', turno.id_turno);

      console.log('Turno expirado:', turno.id_turno);
    }
  }
}

async function cargarTurnos() {
     await verificarTurnosExpirados();
  let pendientes = [];
  try {
    const { data } = await window.supabase
      .from('turno')
      .select('*, usuario:id_usuario(nombre, email)')
      .eq('estado','Esperando')
      .order('creado_en',{ascending:true});
    pendientes = (data || []).map(t => ({
      ...t,
      nombre: t.usuario?.nombre || t.nombre || 'Estudiante',
    }));
  } catch(e) {
    pendientes = (JSON.parse(localStorage.getItem('sc_turnos')||'[]')).filter(t=>t.estado==='Esperando');
  }

  // Reconstruir cola
  colaTurnos = new Cola();
  pendientes.forEach(t => colaTurnos.encolar(t));

  const count = pendientes.length;
  const badge = document.getElementById('turnosPendientes');
  if(badge) badge.textContent = count;
  const stat = document.getElementById('statsTurnos');
  if(stat) stat.textContent = count;

  const container = document.getElementById('colaTurnos');
  if(container) {
    container.innerHTML = count === 0
      ? '<div class="cola-empty">No hay turnos en espera</div>'
      : pendientes.map((t,i) => `
          <div class="cola-item" style="border-left:4px solid ${
            {'Secretaría':'#C0392B','Finanzas':'#27AE60','Académico':'#2980B9','Bienestar':'#8E44AD'}[t.tipo_servicio||t.tipo] || '#aaa'
          }">
            <div class="cola-num">${t.numero||'#'+t.id_turno}</div>
            <div class="cola-info">
              <strong>${t.nombre||'Estudiante'}</strong>
              <span style="display:flex;align-items:center;gap:6px">
                <span style="background:${{
                  'Secretaría':'#FEE2E2','Finanzas':'#DCFCE7','Académico':'#DBEAFE','Bienestar':'#F3E8FF'
                }[t.tipo_servicio||t.tipo]||'#F5F5F5'};color:${{
                  'Secretaría':'#C0392B','Finanzas':'#27AE60','Académico':'#2980B9','Bienestar':'#8E44AD'
                }[t.tipo_servicio||t.tipo]||'#666'};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">
                  ${t.tipo_servicio||t.tipo||'General'}
                </span>
              </span>
            </div>
            <span class="cola-pos">${i===0?'▶ Siguiente':'Pos. '+(i+1)}</span>
          </div>`).join('');
  }

  const containerCompleta = document.getElementById('colaCompleta');
  if(containerCompleta) containerCompleta.innerHTML = container?.innerHTML || '';
}

async function atenderTurno() {
  // Peek sin desencolar — verificar hora primero
  const turno = colaTurnos.verFrente ? colaTurnos.verFrente() : colaTurnos.toArray()[0];
  if (!turno) { showToast('No hay turnos en cola', 'warning'); return; }

  // Validar que la hora del turno ya llegó (margen de -5 min para flexibilidad)
  if (turno.hora_cita && turno.fecha_cita) {
    const ahora   = new Date();
    const citaMs  = new Date(turno.fecha_cita + 'T' + turno.hora_cita + ':00').getTime();
    const diffMin = Math.round((citaMs - ahora.getTime()) / 60000);
  if (diffMin < -15) {
    showToast(
        'Este turno ya expiró y no puede ser atendido',
        'error'
    );
    return;
  }
  }

  // Ahora sí desencolar
  colaTurnos.desencolar();

  const numTurno   = turno.numero   || '#' + turno.id_turno;
  const nombreUser = turno.nombre   || 'Estudiante';
  const idTurno    = turno.id_turno || turno.id;
  const idUsuarioEstudiante = turno.id_usuario || null;

  document.getElementById('turnoActualNum').textContent    = numTurno;
  document.getElementById('turnoActualNombre').textContent = nombreUser;

  try {
    const ahora = new Date().toISOString();
    await window.supabase.from('turno')
      .update({ estado: 'Atendido', atendido_en: ahora })
      .eq('id_turno', idTurno);

    // Historial secretaria
    await window.supabase.from('historialaccion').insert({
      id_usuario: currentUser.id,
      accion: 'Turno ' + numTurno + ' atendido (' + nombreUser + ')',
      modulo: 'Turnos', estado: 'success', usuario_nombre: currentUser.nombre
    });

    // Historial estudiante
    if (idUsuarioEstudiante) {
      await window.supabase.from('historialaccion').insert({
        id_usuario: idUsuarioEstudiante,
        accion: 'Tu turno ' + numTurno + ' fue atendido por Secretaría',
        modulo: 'Turnos', estado: 'success', usuario_nombre: currentUser.nombre
      });
    }
  } catch(e) {
    console.warn('Supabase atender:', e);
    const turnos = JSON.parse(localStorage.getItem('sc_turnos') || '[]');
    const idx = turnos.findIndex(t => t.numero === turno.numero);
    if (idx !== -1) { turnos[idx].estado = 'Atendido'; localStorage.setItem('sc_turnos', JSON.stringify(turnos)); }
  }

  cargarTurnos();
  showToast('Turno ' + numTurno + ' atendido correctamente', 'success');
  NotifManager.add({ titulo: 'Turno atendido', desc: numTurno + ' — ' + nombreUser, tipo: 'success', page: 'turnos' });
}

function llamarTurno() {
  const num = document.getElementById('turnoActualNum').textContent;
  if (num === '—' || !num) { showToast('No hay turno en atención', 'warning'); return; }
  showToast(`Llamando al turno ${num}...`, 'info');
}

document.getElementById('atenderBtn')?.addEventListener('click', atenderTurno);
document.getElementById('llamarBtn')?.addEventListener('click', llamarTurno);

// ── TRÁMITES ─────────────────────────────────────────────
async function cargarTramites() {
  let tramites = [];
  try {
    const filtroEstado = document.getElementById('filterEstado')?.value;
    let q = window.supabase.from('tramite').select(`*, tipotramite(nombre), usuario(nombre)`).order('fecha_reg',{ascending:false});
    if(filtroEstado) q = q.eq('estado', filtroEstado);
    const { data } = await q;
    tramites = (data||[]).map(t=>({
      id:     t.codigo || `T-${t.id_tramite}`,
      id_raw: t.id_tramite,
      solicitante: t.usuario?.nombre || 'Usuario',
      tipo:   t.tipotramite?.nombre || 'Trámite',
      fecha:  t.fecha_reg?.split('T')[0] || '-',
      estado: t.estado,
      descripcion: t.descripcion||'-'
    }));
  } catch(e) {
    tramites = JSON.parse(localStorage.getItem('sc_tramites')||'[]');
  }

  const busqueda = document.getElementById('searchTramite')?.value.toLowerCase() || '';
  if(busqueda) tramites = tramites.filter(t=>t.solicitante.toLowerCase().includes(busqueda));

  const pend = tramites.filter(t=>t.estado==='Pendiente').length;
  const statEl = document.getElementById('statsTramites');
  if(statEl) statEl.textContent = pend;
  const totalEl = document.getElementById('totalTramites');
  if(totalEl) totalEl.textContent = tramites.length;

  const tbody = document.getElementById('tramitesTbody');
  if(tbody) {
    tbody.innerHTML = tramites.length
      ? tramites.map(t=>`
          <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.solicitante}</td>
            <td>${t.tipo}</td>
            <td><span class="status-badge status-${t.estado.replace(' ','-')}">${t.estado}</span></td>
            <td><button class="btn-sm" onclick="actualizarEstado('${t.id}','${t.id_raw||t.id}','${t.estado}')"><i class="fas fa-edit"></i> Actualizar</button></td>
          </tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">Sin trámites</td></tr>';
  }
}

window.actualizarEstado = function(id, idRaw, estadoActual) {
  const estados = ['Pendiente','En proceso','Completado','Rechazado'];
  openModal(`Actualizar Trámite ${id}`, `
    <div class="form-group">
      <label>Estado actual: <strong>${estadoActual}</strong></label>
      <select class="form-control" id="nuevoEstado">
        ${estados.map(e=>`<option ${e===estadoActual?'selected':''}>${e}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Observaciones</label>
      <textarea class="form-control" id="observaciones" rows="2" placeholder="Comentario opcional..."></textarea>
    </div>
  `, 'Guardar', async () => {
    const nuevoEstado  = document.getElementById('nuevoEstado').value;
    const observacion  = document.getElementById('observaciones')?.value?.trim() || '';
    let idSolicitante  = null;

    try {
      // Obtener id_solicitante antes de actualizar (para notificar)
      const { data: tramiteData } = await window.supabase
        .from('tramite').select('id_solicitante, codigo').eq('id_tramite', parseInt(idRaw)||idRaw).single();
      idSolicitante = tramiteData?.id_solicitante;

      // Actualizar tramite
      await window.supabase.from('tramite').update({
        estado: nuevoEstado,
        observaciones: observacion || null
      }).eq('id_tramite', parseInt(idRaw)||idRaw);

      // Guardar en historial del SOLICITANTE (docente/estudiante)
      if (idSolicitante) {
        await window.supabase.from('historialaccion').insert({
          id_usuario: idSolicitante,
          accion: `Tu trámite ${tramiteData?.codigo || id} fue actualizado a: ${nuevoEstado}` +
                  (observacion ? ` — ${observacion}` : ''),
          modulo: 'Trámites',
          estado: nuevoEstado === 'Completado' ? 'success' : nuevoEstado === 'Rechazado' ? 'error' : 'info',
          usuario_nombre: currentUser?.nombre || 'Secretaría'
        });
      }

      // Guardar en historial de la secretaria
      await window.supabase.from('historialaccion').insert({
        id_usuario: currentUser.id,
        accion: `Trámite ${id} actualizado a "${nuevoEstado}"` + (observacion ? `: ${observacion}` : ''),
        modulo: 'Trámites',
        estado: 'info',
        usuario_nombre: currentUser?.nombre || 'Secretaría'
      });

    } catch(e) {
      console.warn('Update tramite error:', e);
      const ts = JSON.parse(localStorage.getItem('sc_tramites')||'[]');
      const idx = ts.findIndex(t=>t.id===id);
      if(idx!==-1){ ts[idx].estado=nuevoEstado; localStorage.setItem('sc_tramites',JSON.stringify(ts)); }
    }

    cargarTramites();
    showToast(`Trámite ${id} → "${nuevoEstado}"`, 'success');
    NotifManager.add({
      titulo: `Trámite ${id} actualizado`,
      desc: `Estado: ${nuevoEstado}` + (observacion ? ` — ${observacion}` : ''),
      tipo: 'info', page: 'tramites'
    });
  });
};

function abrirNuevoTramite() {
  openModal('Nuevo Trámite', `
    <div class="form-group"><label>Solicitante</label><input class="form-control" id="m-sol" placeholder="Nombre del estudiante"/></div>
    <div class="form-group"><label>Tipo</label>
      <select class="form-control" id="m-tipo"><option>Certificado</option><option>Beca</option><option>Transferencia</option><option>Matrícula</option></select>
    </div>
    <div class="form-group"><label>Descripción</label><textarea class="form-control" id="m-desc" rows="2" placeholder="Motivo del trámite..."></textarea></div>
  `, 'Registrar', async () => {
    const sol  = document.getElementById('m-sol').value.trim();
    const tipo = document.getElementById('m-tipo').value;
    const desc = document.getElementById('m-desc').value.trim();
    if(!sol){ showToast('Ingresa el solicitante','warning'); return; }
    const tipos = {'Certificado':1,'Beca':2,'Transferencia':3,'Matrícula':4};
    const codigo = `T-${Date.now().toString().slice(-6)}`;
    try {
      await window.supabase.from('tramite').insert({ codigo, id_tipo:tipos[tipo]||1, id_solicitante: currentUser.id, descripcion:desc||sol, estado:'Pendiente' });
    } catch(e) {
      const ts = JSON.parse(localStorage.getItem('sc_tramites')||'[]');
      ts.push({ id:codigo, solicitante:sol, tipo, descripcion:desc, fecha:new Date().toISOString().split('T')[0], estado:'Pendiente' });
      localStorage.setItem('sc_tramites',JSON.stringify(ts));
    }
    cargarTramites();
    showToast(`Trámite ${codigo} registrado`, 'success');
  });
}

document.getElementById('nuevoTramiteBtn')?.addEventListener('click', abrirNuevoTramite);
document.getElementById('filterEstado')?.addEventListener('change', cargarTramites);
document.getElementById('searchTramite')?.addEventListener('input', cargarTramites);

// ── HISTORIAL ─────────────────────────────────────────────
async function cargarHistorial() {
  let historial = [];
  try {
    const { data } = await window.supabase.from('historialaccion').select('*').order('creado_en',{ascending:false}).limit(30);
    historial = data || [];
  } catch(e) {
    historial = JSON.parse(localStorage.getItem('sc_historial')||'[]');
  }
  const tbody = document.getElementById('historialTbody');
  if(!tbody) return;
  tbody.innerHTML = historial.slice(0,20).map(h=>`
    <tr>
      <td>${new Date(h.creado_en||h.ts).toLocaleString('es-EC')}</td>
      <td>${h.accion}</td>
      <td>${h.usuario||'Sistema'}</td>
    </tr>`).join('');
}

// ── REPORTES ─────────────────────────────────────────────
async function cargarReportes() {
  // Delegado a cargarReportesSec
  await window.cargarReportesSec();
}

// ── NAVEGACIÓN ────────────────────────────────────────────
let _mapaSecListo = false;
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`page-${page}`)?.classList.add('active');
    if(page==='historial')  cargarHistorial();
    if(page==='reportes')   cargarReportes();
    if(page==='documentos') initArbol();
    if(page==='rutas' && !_mapaSecListo) {
      _mapaSecListo = true;
      setTimeout(() => {
        if (typeof initCampusMap !== 'undefined') {
          initCampusMap(new Grafo());
          // invalidateSize after map tiles start loading
          setTimeout(() => {
            if (window._leafletMap) window._leafletMap.invalidateSize();
          }, 400);
        }
      }, 300);
    }
  });
});

// ── LOGOUT ────────────────────────────────────────────────
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  sessionStorage.removeItem('smartcampus_session');
  window.location.replace('login.html');
});

// ── INIT ─────────────────────────────────────────────────
cargarTurnos();
cargarTramites();
if (typeof initArbol === 'function') {
  initArbol();
}
// ── AUTO-REFRESH: actualizar cola cada 20s ────────────────
(function startAutoRefreshSec() {
  function refreshSec() {
    if (document.hidden) return;
    cargarTurnos();
    // Solo recargar tramites si esa pestaña está activa
    const pageT = document.getElementById('page-tramites');
    if (pageT?.classList.contains('active')) cargarTramites();
  }
  const _autoRefreshSec = setInterval(refreshSec, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSec(); });
  window.addEventListener('focus', refreshSec);
})();

// ══════════════════════════════════════════════
// MÓDULO: REPORTES SECRETARIA
// ══════════════════════════════════════════════
let _secRepDatos = [];

window.cargarReportesSec = async function() {
  const tipo   = document.getElementById('sec-rep-tipo')?.value   || 'turnos';
  const estado = document.getElementById('sec-rep-estado')?.value || 'todos';
  const fecha  = document.getElementById('sec-rep-fecha')?.value  || '';

  const body  = document.getElementById('sec-rep-body');
  const head  = document.getElementById('sec-rep-head');
  const badge = document.getElementById('sec-rep-badge');
  const titulo= document.getElementById('sec-rep-titulo');

  if (body) body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#aaa"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

  let filas = [];

  if (tipo === 'turnos') {
    try {
      let q = window.supabase.from('turno')
        .select('numero, tipo_servicio, estado, fecha_cita, hora_cita, creado_en, usuario:id_usuario(nombre)')
        .order('fecha_cita', { ascending: false }).limit(200);
      if (estado !== 'todos') q = q.eq('estado', estado);
      if (fecha) q = q.eq('fecha_cita', fecha);
      const { data } = await q;
      filas = (data||[]).map(t => ({
        col1: t.numero||'-', col2: t.tipo_servicio||'-', col3: t.usuario?.nombre||'-',
        col4: t.fecha_cita||'-', col5: t.hora_cita||'-', col6: t.estado||'-',
        col7: (t.creado_en||'').split('T')[0]
      }));
    } catch(e) { console.warn(e); }

    if (titulo) titulo.innerHTML = '<i class="fas fa-ticket-alt"></i> Reporte de Turnos';
    if (head) head.innerHTML = '<tr><th>N° Turno</th><th>Servicio</th><th>Estudiante</th><th>Fecha Cita</th><th>Hora</th><th>Estado</th><th>Solicitado</th></tr>';
  } else {
    try {
      let q = window.supabase.from('tramite')
        .select('codigo, estado, descripcion, fecha_reg, observaciones, tipotramite(nombre), usuario:id_solicitante(nombre)')
        .order('fecha_reg', { ascending: false }).limit(200);
      if (estado !== 'todos') q = q.eq('estado', estado);
      if (fecha) q = q.gte('fecha_reg', fecha).lte('fecha_reg', fecha + 'T23:59:59');
      const { data } = await q;
      filas = (data||[]).map(t => ({
        col1: t.codigo||'-', col2: t.tipotramite?.nombre||'-', col3: t.usuario?.nombre||'-',
        col4: (t.fecha_reg||'').split('T')[0], col5: t.estado||'-', col6: t.descripcion||'-',
        col7: t.observaciones||'-'
      }));
    } catch(e) { console.warn(e); }

    if (titulo) titulo.innerHTML = '<i class="fas fa-file-alt"></i> Reporte de Trámites';
    if (head) head.innerHTML = '<tr><th>Código</th><th>Tipo</th><th>Solicitante</th><th>Fecha</th><th>Estado</th><th>Descripción</th><th>Observaciones</th></tr>';
  }

  _secRepDatos = filas;
  if (badge) badge.textContent = filas.length + ' registros';

  // KPIs
  try {
    const { data: t } = await window.supabase.from('turno').select('estado');
    const { data: tr } = await window.supabase.from('tramite').select('estado');
    document.getElementById('totalAtendidos') && (document.getElementById('totalAtendidos').textContent = (t||[]).filter(x=>x.estado==='Atendido').length);
    document.getElementById('totalEsperando') && (document.getElementById('totalEsperando').textContent = (t||[]).filter(x=>x.estado==='Esperando').length);
    document.getElementById('totalTramites') && (document.getElementById('totalTramites').textContent = (tr||[]).length);
    document.getElementById('totalCompletados') && (document.getElementById('totalCompletados').textContent = (tr||[]).filter(x=>x.estado==='Completado').length);
  } catch(e) {}

  const estadoBadge = (e) => {
    const c = {Completado:'#27AE60',Atendido:'#27AE60',Pendiente:'#F39C12',Esperando:'#F39C12',Rechazado:'#E74C3C',Cancelado:'#E74C3C','En proceso':'#2980B9',Llamado:'#2980B9'};
    return '<span style="background:' + (c[e]||'#aaa') + '22;color:' + (c[e]||'#666') + ';padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">' + e + '</span>';
  };

  if (body) {
    if (!filas.length) {
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#aaa">Sin registros para los filtros seleccionados</td></tr>';
    } else {
      const estadoCol = tipo === 'turnos' ? 5 : 4;
      body.innerHTML = filas.map(f =>
        '<tr><td><strong>' + f.col1 + '</strong></td><td>' + f.col2 + '</td><td>' + f.col3 + '</td><td>' + f.col4 + '</td>' +
        (tipo==='turnos' ? '<td>' + f.col5 + '</td><td>' + estadoBadge(f.col6) + '</td><td>' + f.col7 + '</td>'
                        : '<td>' + estadoBadge(f.col5) + '</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + f.col6 + '</td><td>' + f.col7 + '</td>') +
        '</tr>'
      ).join('');
    }
  }
};

window.exportarReporteSec = function(formato) {
  if (!_secRepDatos.length) { showToast('No hay datos para exportar', 'warning'); return; }
  const tipo = document.getElementById('sec-rep-tipo')?.value || 'turnos';
  const headers = tipo === 'turnos'
    ? ['N° Turno','Servicio','Estudiante','Fecha Cita','Hora','Estado','Solicitado']
    : ['Código','Tipo','Solicitante','Fecha','Estado','Descripción','Observaciones'];
  const rows = _secRepDatos.map(f => [f.col1,f.col2,f.col3,f.col4,f.col5,f.col6,f.col7]);
  const fechaStr = new Date().toISOString().split('T')[0];

  if (formato === 'excel') {
    const BOM = '\uFEFF';
    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v||'').replace(/"/g,'""') + '"').join(','))].join('\n');
    const blob = new Blob([BOM+csv], {type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='reporte_secretaria_'+tipo+'_'+fechaStr+'.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Reporte Excel descargado', 'success');
  } else {
    const kpis = [
      {valor: document.getElementById('totalAtendidos')?.textContent||'0', label:'Turnos Atendidos'},
      {valor: document.getElementById('totalTramites')?.textContent||'0',  label:'Trámites Totales'},
      {valor: document.getElementById('totalCompletados')?.textContent||'0', label:'Completados'},
      {valor: _secRepDatos.length, label:'Registros en reporte'}
    ];
    const tituloRep = tipo==='turnos' ? 'Reporte de Turnos' : 'Reporte de Trámites';
    const htmlStr = generarHTMLSecPDF(tituloRep, headers, rows, kpis);
    const fechaStr = new Date().toISOString().split('T')[0];
    // Abrir en visor integrado
    const blob = new Blob([htmlStr], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    let overlay = document.getElementById('repVisorOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'repVisorOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';
      overlay.innerHTML = '<div style="background:#fff;border-radius:12px;width:100%;max-width:1050px;height:92vh;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,.4);overflow:hidden">' +
        '<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #F0F0F0;background:#FFF8F8;flex-shrink:0">' +
        '<i class="fas fa-file-pdf" style="font-size:20px;color:#C0392B"></i>' +
        '<span id="repVisorNombre" style="flex:1;font-weight:600;font-size:14px;color:#333"></span>' +
        '<a id="repVisorDl" href="#" download style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#C0392B;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:5px 12px;text-decoration:none">' +
        '<i class="fas fa-download"></i> Descargar</a>' +
        '<button onclick="document.getElementById(&quot;repVisorOverlay&quot;).style.display=&quot;none&quot;" style="background:none;border:none;cursor:pointer;font-size:18px;color:#999;padding:4px 6px">' +
        '<i class="fas fa-times"></i></button></div>' +
        '<div style="flex:1;position:relative"><iframe id="repVisorFrame" style="width:100%;height:100%;border:none"></iframe></div>' +
        '</div>';
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display='none'; });
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    document.getElementById('repVisorNombre').textContent = tituloRep + ' ' + fechaStr;
    document.getElementById('repVisorDl').href = url;
    document.getElementById('repVisorDl').download = tituloRep.replace(/\s+/g,'_') + '_' + fechaStr + '.html';
    document.getElementById('repVisorFrame').src = url;
    showToast('Reporte PDF abierto en visor', 'success');
  }
};

function generarHTMLSecPDF(titulo, headers, rows, kpis) {
  const kpiH = (kpis||[]).map(k =>
    '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 18px;text-align:center;min-width:110px">' +
    '<div style="font-size:24px;font-weight:700;color:#991B1B">' + k.valor + '</div>' +
    '<div style="font-size:11px;color:#666;margin-top:4px">' + k.label + '</div></div>'
  ).join('');
  const rowsH = rows.map(r =>
    '<tr>' + r.map(c => '<td style="padding:7px 10px;border-bottom:1px solid #F3F4F6;font-size:12px">' + (c||'-') + '</td>').join('') + '</tr>'
  ).join('');
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + titulo + '</title>' +
    '<style>body{font-family:Arial,sans-serif;margin:30px;color:#111}h1{color:#991B1B;font-size:20px}p{color:#666;font-size:12px;margin-bottom:16px}' +
    '.kpis{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}table{width:100%;border-collapse:collapse}' +
    'th{background:#991B1B;color:#fff;padding:8px 10px;font-size:11px;text-align:left}tr:nth-child(even) td{background:#FEF2F2}' +
    '@media print{button{display:none}}</style></head><body>' +
    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px"><div>' +
    '<h1>🏛 SmartCampus UTA — ' + titulo + '</h1>' +
    '<p>Generado: ' + new Date().toLocaleString('es-EC') + '</p></div>' +
    '<button onclick="window.print()" style="background:#991B1B;color:#fff;border:none;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimir / PDF</button></div>' +
    '<div class="kpis">' + kpiH + '</div>' +
    '<table><thead><tr>' + headers.map(h=>'<th>'+h+'</th>').join('') + '</tr></thead>' +
    '<tbody>' + rowsH + '</tbody></table>' +
    '<div style="margin-top:16px;font-size:10px;color:#999;text-align:right">Universidad Técnica de Ambato — SmartCampus UTA</div>' +
    '</body></html>';
}