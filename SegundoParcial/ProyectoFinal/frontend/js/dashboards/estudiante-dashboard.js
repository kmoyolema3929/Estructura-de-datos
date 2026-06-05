/**
 * SmartCampus UTA — Dashboard Estudiante
 * Versión corregida: perfil, notificaciones, mapa, botones
 */

// ── TOAST ────────────────────────────────────────────────
window.showToast = function(msg, tipo = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  const icons = { success:'fa-check-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle', error:'fa-times-circle' };
  t.innerHTML = `<i class="fas ${icons[tipo] || 'fa-info-circle'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(40px)'; t.style.transition='.3s'; setTimeout(() => t.remove(), 300); }, 3500);
};

// ── MODAL GENÉRICO ───────────────────────────────────────
let modalCallback = null;
window.openModal = function(titulo, bodyHTML, confirmLabel = 'Guardar', onConfirm = null) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalConfirm').textContent = confirmLabel;
  document.getElementById('modalOverlay').classList.add('open');
  modalCallback = onConfirm;
};
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); modalCallback = null; }
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
document.getElementById('modalConfirm').addEventListener('click', () => { if (modalCallback) modalCallback(); closeModal(); });

// ── VERIFICAR SESIÓN Y ROL ───────────────────────────────
const session = sessionStorage.getItem('smartcampus_session');
if (!session) { window.location.replace('login.html'); }
const currentUser = session ? JSON.parse(session) : null;
if (currentUser && currentUser.rol !== 'Estudiante') { window.location.replace('login.html'); }

// Mostrar datos del usuario en navbar
if (currentUser) {
  const inicial = currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'E';
  document.getElementById('userName').textContent    = currentUser.nombre || 'Estudiante';
  document.getElementById('userRole').textContent    = currentUser.rol || 'Estudiante';
  document.getElementById('userAvatar').textContent  = inicial;
  document.getElementById('welcomeName').textContent = `¡Bienvenido, ${currentUser.nombre}!`;
  document.getElementById('welcomeAvatar').textContent = inicial;
  document.getElementById('welcomeSub').textContent  = `${currentUser.email} · ${currentUser.rol}`;
}

// ── NAVEGACIÓN ───────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    // Inicializar mapa cuando se activa la pestaña de rutas
    if (page === 'rutas') {
      setTimeout(() => {
        if (window._leafletMap) {
          window._leafletMap.invalidateSize();
        } else if (typeof initCampusMap !== 'undefined') {
          const grafo = new Grafo();
          initCampusMap(grafo);
        }
      }, 200);
    }
  });
});

// ── LOGOUT ───────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('smartcampus_session');
  window.location.replace('login.html');
});

// ── FECHA ───────────────────────────────────────────────
if (typeof initFecha !== 'undefined') initFecha();

// ── NOTIFICACIONES ───────────────────────────────────────
const notifBtn   = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');

// Inicializar notificaciones con NotifManager
NotifManager.init([
  { titulo: 'Bienvenido al sistema', desc: `Hola, ${currentUser?.nombre || 'Estudiante'}`, tipo: 'success', leida: false, tiempo: 'Ahora', page: '' },
]);

// Notificaciones en tiempo real
if (currentUser) RealtimeNotif.init(currentUser.id, 'Estudiante');

// ── PERFIL ───────────────────────────────────────────────
document.getElementById('userMenu').addEventListener('click', () => {
  if (!currentUser) return;
  const partes = (currentUser.nombre || '').split(' ');
  document.getElementById('perfilNombres').value   = partes[0] || '';
  document.getElementById('perfilApellidos').value = partes.slice(1).join(' ') || '';
  document.getElementById('perfilEmail').value     = currentUser.email || '';
  document.getElementById('perfilRol').value       = currentUser.rol || '';
  document.getElementById('perfilAvatar').textContent = (currentUser.nombre || 'E').charAt(0).toUpperCase();
  document.getElementById('perfilPass1').value = '';
  document.getElementById('perfilPass2').value = '';
  document.getElementById('perfilModal').classList.add('open');
});

document.getElementById('perfilClose').addEventListener('click', () => {
  document.getElementById('perfilModal').classList.remove('open');
});
document.getElementById('perfilCancelBtn').addEventListener('click', () => {
  document.getElementById('perfilModal').classList.remove('open');
});
document.getElementById('perfilModal').addEventListener('click', e => {
  if (e.target.id === 'perfilModal') document.getElementById('perfilModal').classList.remove('open');
});

document.getElementById('perfilSaveBtn').addEventListener('click', async () => {
  const nombres   = document.getElementById('perfilNombres').value.trim();
  const apellidos = document.getElementById('perfilApellidos').value.trim();
  const pass1     = document.getElementById('perfilPass1').value;
  const pass2     = document.getElementById('perfilPass2').value;

  if (!nombres) { showToast('Ingresa tu nombre', 'warning'); return; }
  if (pass1 && pass1 !== pass2) { showToast('Las contraseñas no coinciden', 'warning'); return; }
  if (pass1 && pass1.length < 8) { showToast('La contraseña debe tener al menos 8 caracteres', 'warning'); return; }

  const nombreCompleto = `${nombres} ${apellidos}`.trim();

  try {
    // Actualizar en Supabase
    const updates = { nombre: nombreCompleto };
    if (pass1) {
      // Hash de la nueva contraseña
      const encoder = new TextEncoder();
      const data = encoder.encode(pass1);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      updates.password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const { error } = await window.supabase
      .from('usuario')
      .update(updates)
      .eq('id_usuario', currentUser.id);

    if (error) throw error;

    // Actualizar sesión local
    currentUser.nombre = nombreCompleto;
    sessionStorage.setItem('smartcampus_session', JSON.stringify(currentUser));

    // Actualizar UI
    document.getElementById('userName').textContent     = nombreCompleto;
    document.getElementById('userAvatar').textContent   = nombreCompleto.charAt(0).toUpperCase();
    document.getElementById('welcomeName').textContent  = `¡Bienvenido, ${nombreCompleto}!`;
    document.getElementById('welcomeAvatar').textContent = nombreCompleto.charAt(0).toUpperCase();

    document.getElementById('perfilModal').classList.remove('open');
    showToast('Perfil actualizado correctamente', 'success');

  } catch (err) {
    console.error('Error actualizando perfil:', err);
    // Actualizar solo localmente si falla Supabase
    currentUser.nombre = nombreCompleto;
    sessionStorage.setItem('smartcampus_session', JSON.stringify(currentUser));
    document.getElementById('userName').textContent     = nombreCompleto;
    document.getElementById('userAvatar').textContent   = nombreCompleto.charAt(0).toUpperCase();
    document.getElementById('welcomeName').textContent  = `¡Bienvenido, ${nombreCompleto}!`;
    document.getElementById('welcomeAvatar').textContent = nombreCompleto.charAt(0).toUpperCase();
    document.getElementById('perfilModal').classList.remove('open');
    showToast('Perfil actualizado (modo local)', 'info');
  }
});

// ── TRÁMITES ─────────────────────────────────────────────
async function cargarMisTramites() {
  let misTramites = [];
  try {
    // Intentar desde Supabase
    const { data, error } = await window.supabase
      .from('tramite')
      .select(`*, tipotramite(nombre)`)
      .eq('id_solicitante', currentUser.id)
      .order('fecha_reg', { ascending: false });

    if (!error && data) {
      misTramites = data.map(t => ({
        id:     t.codigo || `T-${t.id_tramite}`,
        tipo:   t.tipotramite?.nombre || 'Trámite',
        fecha:  t.fecha_reg ? t.fecha_reg.split('T')[0] : '-',
        estado: t.estado,
        descripcion: t.descripcion || '-'
      }));
    }
  } catch (e) {
    // Fallback: localStorage
    const todos = JSON.parse(localStorage.getItem('sc_tramites') || '[]');
    misTramites = todos.filter(t => t.solicitante === currentUser.nombre);
  }

  document.getElementById('misTramitesCount').textContent  = misTramites.length;
  document.getElementById('tramitesPendientes').textContent =
    misTramites.filter(t => t.estado === 'Pendiente' || t.estado === 'En proceso').length;

  const fila = t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.tipo}</td>
      <td>${t.fecha}</td>
      <td><span class="status-badge status-${t.estado.replace(' ', '-')}">${t.estado}</span></td>
    </tr>`;

  document.getElementById('misTramitesTbody').innerHTML =
    misTramites.length ? misTramites.slice(0, 5).map(fila).join('') :
    '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:20px">Sin trámites registrados</td></tr>';

  const tbodyCompleto = document.getElementById('tramitesTbodyCompleto');
  if (tbodyCompleto) {
    tbodyCompleto.innerHTML = misTramites.length
      ? misTramites.map(t => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${t.tipo}</td>
          <td>${t.fecha}</td>
          <td><span class="status-badge status-${t.estado.replace(' ', '-')}">${t.estado}</span></td>
          <td>${t.descripcion}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">Sin trámites registrados</td></tr>';
  }
}

// Cache tipos
let _tiposCacheEst = [];
async function cargarTiposEst() {
  if (_tiposCacheEst.length) return _tiposCacheEst;
  try {
    const { data } = await window.supabase.from('tipotramite').select('id_tipo,nombre').order('id_tipo');
    if (data && data.length) { _tiposCacheEst = data; return data; }
  } catch(e) {}
  // Fallback con tipos reales de la DB
  _tiposCacheEst = [
    { id_tipo:1, nombre:'Certificado de Matrícula' },
    { id_tipo:2, nombre:'Solicitud de Beca' },
    { id_tipo:3, nombre:'Transferencia' },
    { id_tipo:4, nombre:'Trámite de Matrícula' },
  ];
  return _tiposCacheEst;
}

async function nuevoTramite() {
  const tipos = await cargarTiposEst();
  const optsHTML = tipos.map(t => '<option value="' + t.id_tipo + '">' + t.nombre + '</option>').join('');

  openModal('Nuevo Trámite',
    '<div class="form-group"><label>Tipo de trámite</label>' +
    '<select class="form-control" id="tipoTramite">' + optsHTML + '</select></div>' +
    '<div class="form-group"><label>Descripción</label>' +
    '<textarea class="form-control" id="descripcionTramite" rows="3" placeholder="Describe el motivo de tu solicitud..."></textarea></div>',
    'Solicitar', async () => {
      const sel         = document.getElementById('tipoTramite');
      const idTipo      = parseInt(sel.value);
      const tipoNombre  = sel.options[sel.selectedIndex]?.text || 'Trámite';
      const descripcion = document.getElementById('descripcionTramite').value.trim();
      if (!descripcion) { showToast('Ingresa una descripción', 'warning'); return; }

      const codigo = 'T-' + Date.now().toString().slice(-6);
      try {
        const { error } = await window.supabase.from('tramite').insert({
          codigo,
          id_tipo:        idTipo,
          id_solicitante: currentUser.id,
          descripcion,
          estado:         'Pendiente'
        });
        if (error) throw error;

        await window.supabase.from('historialaccion').insert({
          id_usuario:     currentUser.id,
          accion:         'Trámite ' + codigo + ' solicitado (' + tipoNombre + ')',
          modulo:         'Trámites',
          estado:         'info',
          usuario_nombre: currentUser.nombre
        });

        showToast('Trámite ' + codigo + ' (' + tipoNombre + ') registrado', 'success');
      } catch (e) {
        const tramites = JSON.parse(localStorage.getItem('sc_tramites') || '[]');
        tramites.push({ id: codigo, solicitante: currentUser.nombre, tipo: tipoNombre, descripcion, fecha: new Date().toISOString().split('T')[0], estado: 'Pendiente' });
        localStorage.setItem('sc_tramites', JSON.stringify(tramites));
        showToast('Trámite ' + codigo + ' registrado (local)', 'info');
      }
      cargarMisTramites();
    }
  );
}

document.getElementById('nuevoTramiteBtn')?.addEventListener('click', nuevoTramite);
document.getElementById('nuevoTramiteBtn2')?.addEventListener('click', nuevoTramite);

// ── TURNOS ───────────────────────────────────────────────
async function cargarMisTurnos() {
  let misTurnos = [];
  try {
    const { data, error } = await window.supabase
      .from('turno')
      .select('*')
      .eq('id_usuario', currentUser.id)
      .in('estado', ['Esperando', 'Llamado'])
      .order('creado_en', { ascending: false })
      .limit(10);
    if (!error && data) misTurnos = data;
  } catch (e) {
    const todos = JSON.parse(localStorage.getItem('sc_turnos') || '[]');
    misTurnos = todos.filter(t => (t.id_usuario === currentUser.id || t.nombre === currentUser.nombre)
      && ['Esperando','Llamado'].includes(t.estado));
  }

  const activos = misTurnos.filter(t => t.estado === 'Esperando' || t.estado === 'Llamado');
  document.getElementById('misTurnosCount').textContent = activos.length;
  // Update KPI in dashboard too
  const kpiEl = document.getElementById('misTurnosCount');
  if (kpiEl) kpiEl.textContent = activos.length;
  const container = document.getElementById('misTurnosLista');
  if (!container) return;

  if (misTurnos.length === 0) {
    container.innerHTML = '<div class="cola-empty">No tienes turnos activos</div>';
    return;
  }

  const _eColor = { 'Esperando':'#F39C12','Llamado':'#2980B9' };
  const _eLabel = { 'Esperando':'En espera','Llamado':'📢 Te llaman' };

  container.innerHTML = misTurnos.map(function(t, i) {
    const ahora = new Date();
    const citaDate = t.fecha_cita && t.hora_cita ? new Date(t.fecha_cita + 'T' + t.hora_cita + ':00') : null;
    const puedeCancel = t.estado === 'Esperando' && (!citaDate || citaDate > ahora);
    const btnCancel = puedeCancel
      ? '<button data-id="' + (t.id_turno||t.id||t.numero) + '" data-num="' + (t.numero||'') + '" class="btn-cancel-turno" style="background:none;border:1px solid #E74C3C;color:#E74C3C;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:600">✕ Cancelar</button>'
      : '';
    return '<div class="cola-item" style="border-left:4px solid ' + (_eColor[t.estado]||'#aaa') + '">' +
      '<div class="cola-num" style="color:' + (_eColor[t.estado]||'#aaa') + '">' + (t.numero||'#'+t.id_turno) + '</div>' +
      '<div class="cola-info">' +
        '<strong>' + (t.tipo_servicio||t.tipo||'Servicio') + '</strong>' +
        '<span>' + (t.fecha_cita ? '📅 '+t.fecha_cita+' · ⏰ '+(t.hora_cita||'') : 'Sin fecha') + '</span>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
        '<span style="font-size:12px;font-weight:700;color:' + (_eColor[t.estado]||'#aaa') + '">' + (_eLabel[t.estado]||t.estado) + ' · Pos. '+(i+1)+'</span>' +
        btnCancel +
      '</div>' +
    '</div>';
  }).join('');
}

// Inicializar selector de fecha/hora
if (typeof initFechaCita !== 'undefined') setTimeout(initFechaCita, 500);


// ── VERIFICAR HORAS OCUPADAS EN SUPABASE ─────────────────
async function obtenerHorasOcupadas(fecha, servicio) {
  try {
    const { data } = await window.supabase
      .from('turno')
      .select('hora_cita')
      .eq('fecha_cita', fecha)
      .eq('tipo_servicio', servicio)
      .in('estado', ['Esperando', 'Llamado']);
    return (data || []).map(t => t.hora_cita).filter(Boolean);
  } catch(e) { return []; }
}

// Versión que filtra horas pasadas Y ocupadas
window.actualizarHorasConFiltro = async function() {
  const fc  = document.getElementById('fechaCita');
  const hs  = document.getElementById('horaCita');
  const svc = document.getElementById('tipoServicio');
  if (!fc || !hs) return;

  const fecha   = fc.value;
  const servicio = svc?.value || '';
  const dia     = fecha ? new Date(fecha + 'T12:00:00').getDay() : -1;
  const ahora   = new Date();
  const esHoy   = fecha === ahora.toISOString().split('T')[0];

  if (!fecha || dia === 0 || dia === 6) {
    hs.innerHTML = '<option value="">Día no laborable</option>';
    hs.disabled  = true;
    return;
  }

  hs.innerHTML = '<option value="">Cargando horas...</option>';
  hs.disabled  = true;

  // Obtener horas ya ocupadas para esa fecha+servicio
  const horasOcupadas = await obtenerHorasOcupadas(fecha, servicio);

  // Generar slots
  var slots = [];
  for (var h = 8; h <= 12; h++) {
    slots.push(String(h).padStart(2,'0') + ':00');
    if (h < 12) slots.push(String(h).padStart(2,'0') + ':30');
    if (h === 12) slots.push('12:30');
  }
  for (var h2 = 14; h2 <= 16; h2++) {
    slots.push(String(h2).padStart(2,'0') + ':00');
    slots.push(String(h2).padStart(2,'0') + ':30');
  }

  // Filtrar horas pasadas (si es hoy, +30min margen)
  if (esHoy) {
    var limiteMs = ahora.getTime() + 30 * 60 * 1000;
    slots = slots.filter(function(s) {
      return new Date(fecha + 'T' + s + ':00').getTime() > limiteMs;
    });
  }

  // Filtrar horas ya ocupadas
  slots = slots.filter(function(s) { return !horasOcupadas.includes(s); });

  if (slots.length === 0) {
    hs.innerHTML = '<option value="">No hay horas disponibles</option>';
    hs.disabled  = true;
    return;
  }

  hs.disabled  = false;
  hs.innerHTML = '<option value="">Selecciona hora</option>' +
    slots.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
};
document.getElementById('solicitarTurnoBtn').addEventListener('click', async () => {
  const tipo   = document.getElementById('tipoServicio').value;
  const motivo = document.getElementById('motivo').value.trim();
  const fecha  = document.getElementById('fechaCita')?.value || '';
  const hora   = document.getElementById('horaCita')?.value  || '';

  if (!motivo) { showToast('Describe el motivo de tu consulta', 'warning'); return; }
  if (!fecha)  { showToast('Selecciona una fecha para tu cita', 'warning'); return; }
  if (!hora)   { showToast('Selecciona una hora disponible', 'warning'); return; }

  // ── VALIDAR QUE NO SEA FECHA/HORA PASADA ──────────────
  const ahora    = new Date();
  const citaDate = new Date(fecha + 'T' + hora + ':00');

  if (citaDate <= ahora) {
    showToast('No puedes agendar un turno en una fecha u hora pasada', 'error');
    return;
  }

  // Validar día laborable
  const dia = citaDate.getDay();
  if (dia === 0 || dia === 6) {
    showToast('Solo se permiten días laborables (lunes a viernes)', 'warning');
    return;
  }

  const numero = 'T-' + Date.now().toString().slice(-4);

  // Deshabilitar botón para evitar doble envío
  const btnAgendar = document.getElementById('solicitarTurnoBtn');
  if (btnAgendar) { btnAgendar.disabled = true; btnAgendar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...'; }

  let turnoGuardado = false;

  // 1. Intentar guardar en Supabase
  try {
    const { error } = await window.supabase.from('turno').insert({
      numero,
      id_usuario:    currentUser.id,
      tipo_servicio: tipo,
      estado:        'Esperando',
      fecha_cita:    fecha,
      hora_cita:     hora
    });
    if (error) throw error;
    turnoGuardado = true;
  } catch (e) {
    console.warn('Supabase turno insert:', e.message || e);
  }

  // 2. Si falló Supabase, guardar en localStorage
  if (!turnoGuardado) {
    const turnos = JSON.parse(localStorage.getItem('sc_turnos') || '[]');
    turnos.push({ numero, nombre: currentUser.nombre, tipo, tipo_servicio: tipo,
      id_usuario: currentUser.id, motivo, fecha_cita: fecha, hora_cita: hora,
      ts: new Date().toISOString(), estado: 'Esperando' });
    localStorage.setItem('sc_turnos', JSON.stringify(turnos));
  }

  // 3. Guardar historial (ignorar errores — no bloquea el flujo)
  window.supabase.from('historialaccion').insert({
    id_usuario: currentUser.id,
    accion:     'Turno ' + numero + ' agendado para ' + fecha + ' a las ' + hora,
    modulo:     'Turnos',
    estado:     'info'
  }).then(() => {}).catch(() => {});

  // 4. Programar recordatorio (Notification API si el usuario dio permiso)
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      var citaMs = new Date(fecha + 'T' + hora + ':00').getTime();
      var diff = citaMs - Date.now() - 15 * 60 * 1000;
      if (diff > 0) {
        setTimeout(function() {
          new Notification('\u23F0 Recordatorio SmartCampus', {
            body: 'Tu turno ' + numero + ' (' + tipo + ') es hoy a las ' + hora
          });
        }, diff);
      }
    }
  } catch(e) { /* Notificaciones no disponibles */ }

  // 5. Re-habilitar botón y mostrar resultado (UN SOLO toast)
  if (btnAgendar) {
    btnAgendar.disabled = false;
    btnAgendar.innerHTML = '<i class="fas fa-calendar-check"></i> Agendar Turno';
  }
  showToast(
    '✅ Turno ' + numero + ' agendado para el ' + fecha + ' a las ' + hora,
    'success'
  );

  // 6. Navegar al dashboard después de 1.2s
  setTimeout(function() {
    var navDash = document.querySelector('.nav-item[data-page="dashboard"]');
    if (navDash) navDash.click();
  }, 1200);

  // Limpiar formulario completo
  const camposLimpiar = ['motivo'];
  camposLimpiar.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  // Resetear selector de hora
  const hsEl = document.getElementById('horaCita');
  if (hsEl) { hsEl.innerHTML = '<option value="">Elige fecha primero</option>'; hsEl.disabled = true; }
  // Resetear fecha al próximo día laborable
  if (typeof initFechaCita !== 'undefined') setTimeout(initFechaCita, 100);
  cargarMisTurnos();
});

// ── DOCUMENTOS (árbol) ───────────────────────────────────
// Usa initArbol compartido de dashboard-utils (igual que admin pero sin botones de edición)
if (typeof window.initArbol === 'function') {
  window.initArbol();
}

// Reinicializar árbol cuando el usuario navega a documentos
document.querySelectorAll('.nav-item[data-page="documentos"]').forEach(function(el) {
  el.addEventListener('click', function() {
    setTimeout(function() {
      if (typeof window.initArbol === 'function') window.initArbol();
    }, 100);
  });
});

// ── MAPA ─────────────────────────────────────────────────
// El mapa se inicializa cuando el usuario abre la pestaña de rutas
// para evitar problemas con el tamaño del contenedor
let mapaInicializado = false;
document.querySelector('[data-page="rutas"]').addEventListener('click', () => {
  if (mapaInicializado) return;
  mapaInicializado = true;
  setTimeout(() => {
    if (typeof initCampusMap !== 'undefined' && typeof Grafo !== 'undefined') {
      const grafo = new Grafo();
      initCampusMap(grafo);
    } else {
      document.getElementById('leafletMap').innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-size:14px"><i class="fas fa-map-marked-alt" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3"></i>Cargando mapa...</div>';
    }
  }, 300);
});

// ── INICIALIZAR ──────────────────────────────────────────
cargarMisTramites();
cargarMisTurnos();
// ── REALTIME: Auto-actualizar trámites del estudiante ────
(async function initRealtimeEstudiante() {
  if (!currentUser?.id || !window.supabase) return;
  try {
    window.supabase
      .channel('est-tramites-' + currentUser.id)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'tramite',
        filter: 'id_solicitante=eq.' + currentUser.id
      }, (payload) => {
        const t      = payload.new;
        const estado = t.estado || '';
        const obs    = t.observaciones ? ' — ' + t.observaciones : '';
        const ico    = estado === 'Completado' ? 'success' : estado === 'Rechazado' ? 'error' : 'info';
        cargarMisTramites();
        showToast(
          estado === 'Completado' ? '✅ Tu trámite fue aprobado' :
          estado === 'Rechazado'  ? '❌ Tu trámite fue rechazado' :
          'Tu trámite fue actualizado: ' + estado, ico
        );
        NotifManager.add({
          titulo: estado === 'Completado' ? '✅ Trámite aprobado' :
                  estado === 'Rechazado'  ? '❌ Trámite rechazado' : 'Trámite actualizado',
          desc:   'Código ' + (t.codigo||'') + ': ' + estado + obs,
          tipo:   ico, page: 'tramites'
        });
      })
      .subscribe();
  } catch(e) { console.warn('Realtime estudiante:', e); }
})();

// ── CANCELAR TURNO (solo si está Esperando y no ha pasado) ──
window.cancelarTurno = async function(idTurno, numero) {
  if (!confirm('¿Cancelar el turno ' + (numero||'') + '? Esta acción no se puede deshacer.')) return;

  try {
    const { error } = await window.supabase.from('turno')
      .update({ estado: 'Cancelado' })
      .eq('id_turno', parseInt(idTurno) || idTurno);
    if (error) throw error;

    await window.supabase.from('historialaccion').insert({
      id_usuario:     currentUser.id,
      accion:         'Turno ' + (numero||idTurno) + ' cancelado por el estudiante',
      modulo:         'Turnos',
      estado:         'warning',
      usuario_nombre: currentUser.nombre
    });

    showToast('Turno ' + (numero||'') + ' cancelado', 'warning');
    cargarMisTurnos();
  } catch(e) {
    // Fallback localStorage
    const ts = JSON.parse(localStorage.getItem('sc_turnos') || '[]');
    const idx = ts.findIndex(t => t.numero === numero);
    if (idx !== -1) { ts[idx].estado = 'Cancelado'; localStorage.setItem('sc_turnos', JSON.stringify(ts)); }
    showToast('Turno cancelado', 'warning');
    cargarMisTurnos();
  }
};
// Actualizar horas cuando cambia el servicio
const svcSelect = document.getElementById('tipoServicio');
if (svcSelect) {
  svcSelect.addEventListener('change', function() {
    if (document.getElementById('fechaCita')?.value) {
      window.actualizarHorasConFiltro();
    }
  });
}

// ── HISTORIAL DE TURNOS ───────────────────────────────────
async function cargarHistorialTurnos() {
  const tbody = document.getElementById('historialTurnosTbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

  let turnos = [];
  try {
    const { data, error } = await window.supabase
      .from('turno')
      .select('*')
      .eq('id_usuario', currentUser.id)
      .order('creado_en', { ascending: false })
      .limit(50);
    if (!error && data) turnos = data;
  } catch(e) {
    turnos = JSON.parse(localStorage.getItem('sc_turnos') || '[]')
      .filter(t => t.id_usuario === currentUser.id || t.nombre === currentUser.nombre);
  }

  if (!turnos.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">No tienes turnos registrados</td></tr>';
    return;
  }

  const estadoConfig = {
    'Esperando': { label: 'Pendiente',   color: '#F39C12', bg: '#FEF9E7' },
    'Llamado':   { label: 'Llamado',     color: '#2980B9', bg: '#EBF5FB' },
    'Atendido':  { label: 'Finalizado',  color: '#27AE60', bg: '#EAFAF1' },
    'Cancelado': { label: 'Caducado',    color: '#E74C3C', bg: '#FDEDEC' },
  };

  tbody.innerHTML = turnos.map(t => {
    const cfg    = estadoConfig[t.estado] || { label: t.estado, color: '#aaa', bg: '#F5F5F5' };
    const fecha  = t.fecha_cita  || '-';
    const hora   = t.hora_cita   || '-';
    const creado = t.creado_en   ? new Date(t.creado_en).toLocaleDateString('es-EC') : '-';
    return '<tr>' +
      '<td><strong>' + (t.numero || '#' + t.id_turno) + '</strong></td>' +
      '<td>' + (t.tipo_servicio || '-') + '</td>' +
      '<td>' + fecha + '</td>' +
      '<td>' + hora + '</td>' +
      '<td><span style="background:' + cfg.bg + ';color:' + cfg.color + ';padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">' + cfg.label + '</span></td>' +
      '<td>' + creado + '</td>' +
    '</tr>';
  }).join('');
}

// ── AUTO-REFRESH: actualizar turnos y trámites cada 30s ───
(function startAutoRefreshEst() {
  function refreshEst() {
    if (document.hidden) return;
    cargarMisTurnos();
    cargarMisTramites();
  }
  const _autoRefreshEst = setInterval(refreshEst, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshEst(); });
  window.addEventListener('focus', refreshEst);
})();
