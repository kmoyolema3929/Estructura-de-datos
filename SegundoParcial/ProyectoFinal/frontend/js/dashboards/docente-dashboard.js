/**
 * SmartCampus UTA — Dashboard Docente
 * Rol: Docente | Permisos: Trámites propios, Documentos, Mapa
 */

// ── SESIÓN ───────────────────────────────────────────────
const _session = sessionStorage.getItem('smartcampus_session');
if (!_session) window.location.replace('login.html');
const currentUser = _session ? JSON.parse(_session) : null;
if (currentUser && currentUser.rol !== 'Docente') window.location.replace('login.html');

// ── UI INICIAL ───────────────────────────────────────────
if (currentUser) {
  const ini = currentUser.nombre.charAt(0).toUpperCase();
  document.getElementById('userName').textContent     = currentUser.nombre;
  document.getElementById('userRole').textContent     = currentUser.rol;
  document.getElementById('userAvatar').textContent   = ini;
  document.getElementById('welcomeName').textContent  = `¡Bienvenido, ${currentUser.nombre}!`;
  document.getElementById('welcomeAvatar').textContent = ini;
}

// ── FECHA ───────────────────────────────────────────────
if (typeof initFecha !== 'undefined') initFecha();

// ── NOTIFICACIONES ───────────────────────────────────────
NotifManager.init([
  { titulo: 'Sesión iniciada', desc: `Bienvenido, ${currentUser?.nombre}`, tipo: 'success', leida: false, tiempo: 'Ahora', page: '' },
]);

// ── NOTIFICACIONES EN TIEMPO REAL ────────────────────────
if (currentUser) RealtimeNotif.init(currentUser.id, 'Docente');

// ── PERFIL ───────────────────────────────────────────────
initPerfil(currentUser);

// ── MODAL ────────────────────────────────────────────────
let _modalCb = null;
document.getElementById('modalClose').addEventListener('click',   () => closeModalLocal());
document.getElementById('modalCancel').addEventListener('click',  () => closeModalLocal());
document.getElementById('modalConfirm').addEventListener('click', () => { if(_modalCb) _modalCb(); closeModalLocal(); });
document.getElementById('modalOverlay').addEventListener('click', e => { if(e.target.id==='modalOverlay') closeModalLocal(); });

function openModalLocal(titulo, body, label='Guardar', cb=null) {
  document.getElementById('modalTitle').textContent   = titulo;
  document.getElementById('modalBody').innerHTML      = body;
  document.getElementById('modalConfirm').textContent = label;
  document.getElementById('modalOverlay').classList.add('open');
  _modalCb = cb;
}
function closeModalLocal() {
  document.getElementById('modalOverlay').classList.remove('open');
  _modalCb = null;
}
// También exponer como openModal para compatibilidad
window.openModal = openModalLocal;
window.closeModal = closeModalLocal;

// ── TRÁMITES ─────────────────────────────────────────────
async function cargarMisTramites() {
  let misTramites = [];
  try {
    const { data, error } = await window.supabase
      .from('tramite')
      .select('*, tipotramite(nombre)')
      .eq('id_solicitante', currentUser.id)
      .order('fecha_reg', { ascending: false });

    if (!error && data) {
      misTramites = data.map(t => ({
        id:          t.codigo || `T-${t.id_tramite}`,
        tipo:        t.tipotramite?.nombre || 'Trámite',
        fecha:       t.fecha_reg?.split('T')[0] || '-',
        estado:      t.estado || 'Pendiente',
        descripcion: t.descripcion || '-'
      }));
    }
  } catch(e) {
    // Fallback localStorage
    const todos = JSON.parse(localStorage.getItem('sc_tramites') || '[]');
    misTramites  = todos.filter(t => t.solicitante === currentUser.nombre);
  }

  // KPIs
  document.getElementById('misTramites').textContent          = misTramites.length;
  document.getElementById('tramitesPendientes').textContent   = misTramites.filter(t => t.estado === 'Pendiente' || t.estado === 'En proceso').length;
  document.getElementById('tramitesCompletadosKpi').textContent = misTramites.filter(t => t.estado === 'Completado').length;

  const filaResumen = t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.tipo}</td>
      <td>${t.fecha}</td>
      <td><span class="status-badge status-${t.estado.replace(' ','-')}">${t.estado}</span></td>
    </tr>`;

  const filaCompleta = t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.tipo}</td>
      <td>${t.fecha}</td>
      <td><span class="status-badge status-${t.estado.replace(' ','-')}">${t.estado}</span></td>
      <td>${t.descripcion}</td>
    </tr>`;

  const vacio4 = '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:16px">Sin trámites registrados</td></tr>';
  const vacio5 = '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">Sin trámites registrados</td></tr>';

  document.getElementById('ultimosTramites').innerHTML  = misTramites.length ? misTramites.slice(0,5).map(filaResumen).join('') : vacio4;
  document.getElementById('tramitesCompletos').innerHTML = misTramites.length ? misTramites.map(filaCompleta).join('') : vacio5;
}

// Cache de tipos desde Supabase
let _tiposCache = [];

async function cargarTiposTramite() {
  if (_tiposCache.length) return _tiposCache;
  try {
    const { data } = await window.supabase.from('tipotramite').select('id_tipo, nombre').order('id_tipo');
    if (data && data.length) { _tiposCache = data; return data; }
  } catch(e) {}
  _tiposCache = [
    { id_tipo:1, nombre:'Certificado' },
    { id_tipo:2, nombre:'Beca' },
    { id_tipo:3, nombre:'Transferencia' },
    { id_tipo:4, nombre:'Matrícula' },
    { id_tipo:5, nombre:'Justificación' },
    { id_tipo:6, nombre:'Solicitud' },
    { id_tipo:7, nombre:'Constancia' },
  ];
  return _tiposCache;
}

async function nuevoTramite() {
  const tipos = await cargarTiposTramite();
  const opcionesHTML = tipos.map(t =>
    '<option value="' + t.id_tipo + '">' + t.nombre + '</option>'
  ).join('');

  openModalLocal('Nuevo Trámite', '<div class="form-group"><label>Tipo de trámite</label><select class="form-control" id="m-tipo">' + opcionesHTML + '</select></div><div class="form-group"><label>Descripción</label><textarea class="form-control" id="m-desc" rows="3" placeholder="Describe tu solicitud..."></textarea></div>', 'Solicitar', async () => {
    const sel    = document.getElementById('m-tipo');
    const idTipo = parseInt(sel.value);
    const tipo   = sel.options[sel.selectedIndex]?.text || 'Trámite';
    const desc   = document.getElementById('m-desc').value.trim();
    if (!desc) { showToast('Ingresa una descripción', 'warning'); return; }

    const codigo = 'T-' + Date.now().toString().slice(-6);
    try {
      const { error } = await window.supabase.from('tramite').insert({
        codigo,
        id_tipo:        idTipo,
        id_solicitante: currentUser.id,
        descripcion:    desc,
        estado:         'Pendiente'
      });
      if (error) throw error;

      await window.supabase.from('historialaccion').insert({
        id_usuario:     currentUser.id,
        accion:         'Trámite ' + codigo + ' solicitado (' + tipo + ')',
        modulo:         'Trámites',
        estado:         'info',
        usuario_nombre: currentUser.nombre
      });

      showToast('Trámite ' + codigo + ' (' + tipo + ') enviado a Secretaría', 'success');
    } catch(e) {
      const ts = JSON.parse(localStorage.getItem('sc_tramites') || '[]');
      ts.push({ id: codigo, solicitante: currentUser.nombre, tipo, descripcion: desc, fecha: new Date().toISOString().split('T')[0], estado: 'Pendiente' });
      localStorage.setItem('sc_tramites', JSON.stringify(ts));
      showToast('Trámite ' + codigo + ' registrado localmente', 'info');
    }

    cargarMisTramites();
    NotifManager.add({ titulo: 'Trámite ' + codigo + ' enviado', desc: tipo + ' — Secretaría revisará pronto', tipo: 'success', page: 'tramites' });
  });
}

document.getElementById('nuevoTramiteBtn')?.addEventListener('click',  nuevoTramite);
document.getElementById('nuevoTramiteBtn2')?.addEventListener('click', nuevoTramite);

// ── NAVEGACIÓN ────────────────────────────────────────────
let mapaListo = false;
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`page-${page}`)?.classList.add('active');
    // Guardar página activa para restaurar al recargar
    sessionStorage.setItem('smartcampus_active_page_doc', page);

    if (page === 'documentos') initArbol();
    if (page === 'historial')  cargarHistorialDocente();
    if (page === 'rutas' && !mapaListo) {
      mapaListo = true;
      setTimeout(() => {
        if (typeof initCampusMap !== 'undefined' && typeof Grafo !== 'undefined') {
          initCampusMap(new Grafo());
          setTimeout(() => {
            if (window._leafletMap) window._leafletMap.invalidateSize();
          }, 400);
        }
      }, 300);
    }
  });
});

// ── LOGOUT ────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('smartcampus_session');
  window.location.replace('login.html');
});

// ── INIT ─────────────────────────────────────────────────
cargarMisTramites();
if (typeof initArbol === 'function') {
  initArbol();
}
// ── REALTIME: Auto-actualizar trámites sin recargar ──────
(async function initRealtimeDocente() {
  if (!currentUser?.id || !window.supabase) return;
  try {
    window.supabase
      .channel('docente-tramites-' + currentUser.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tramite',
        filter: 'id_solicitante=eq.' + currentUser.id
      }, (payload) => {
        const t = payload.new;
        const estado = t.estado || '';
        const ico    = estado === 'Completado' ? 'success' : estado === 'Rechazado' ? 'error' : 'info';
        const obs    = t.observaciones ? (' — ' + t.observaciones) : '';
        // Auto-refresh tabla
        cargarMisTramites();
        // Notificación
        NotifManager.add({
          titulo: estado === 'Completado' ? '✅ Trámite aprobado' :
                  estado === 'Rechazado'  ? '❌ Trámite rechazado' : 'Trámite actualizado',
          desc:   `Código ${t.codigo || ''}: ${estado}${obs}`,
          tipo:   ico,
          page:   'tramites'
        });
        showToast(
          estado === 'Completado' ? '✅ Tu trámite fue aprobado' :
          estado === 'Rechazado'  ? '❌ Tu trámite fue rechazado' :
          `Trámite actualizado → ${estado}`,
          ico
        );
      })
      .subscribe();
  } catch(e) { console.warn('Realtime docente:', e); }
})();

// ── AUTO-REFRESH: actualizar trámites cada 30s ────────────
(function startAutoRefreshDoc() {
  function refreshDoc() {
    if (document.hidden) return;
    cargarMisTramites();
  }
  const _autoRefreshDoc = setInterval(refreshDoc, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDoc(); });
  window.addEventListener('focus', refreshDoc);
})();