/**
 * SmartCampus UTA — Dashboard Personal Administrativo
 * Rol: Personal Administrativo | Permisos: Estadísticas, Trámites, Documentos
 */

const _session = sessionStorage.getItem('smartcampus_session');
if (!_session) window.location.replace('login.html');
const currentUser = _session ? JSON.parse(_session) : null;
if (currentUser && currentUser.rol !== 'Personal Administrativo') window.location.replace('login.html');

if (currentUser) {
  const ini = currentUser.nombre.charAt(0).toUpperCase();
  document.getElementById('userName').textContent   = currentUser.nombre;
  document.getElementById('userRole').textContent   = currentUser.rol;
  document.getElementById('userAvatar').textContent = ini;
}

// ── FECHA ───────────────────────────────────────────────
if (typeof initFecha !== 'undefined') initFecha();

// ── NOTIFICACIONES ───────────────────────────────────────
NotifManager.init([
  { titulo: 'Sesión iniciada correctamente', desc: `Bienvenido al sistema, ${currentUser?.nombre}`, tipo: 'success', leida: false, tiempo: 'Ahora', page: '' },
  { titulo: 'Nuevos trámites pendientes', desc: 'Hay trámites que requieren revisión administrativa', tipo: 'warning', leida: false, tiempo: 'Hace 30 min', page: 'tramites' },
  { titulo: 'Reporte mensual disponible', desc: 'El reporte de gestión de mayo está listo', tipo: 'info', leida: false, tiempo: 'Hoy', page: 'reportes' },
]);

initPerfil(currentUser);

// ── ESTADÍSTICAS ─────────────────────────────────────────
async function cargarEstadisticas() {
  let tramites = [];
  try {
    const { data } = await window.supabase.from('tramite').select('estado, fecha_reg').order('fecha_reg',{ascending:false});
    tramites = data || [];
  } catch(e) {
    tramites = JSON.parse(localStorage.getItem('sc_tramites')||'[]');
  }

  const total      = tramites.length;
  const pendientes = tramites.filter(t=>t.estado==='Pendiente').length;
  const completados= tramites.filter(t=>t.estado==='Completado').length;
  const enProceso  = tramites.filter(t=>t.estado==='En proceso').length;

  const setEl = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  setEl('totalTramites',      total);
  setEl('tramitesPendientes', pendientes);
  setEl('tramitesCompletados',completados);

  // Tabla recientes
  const tbody = document.getElementById('tramitesRecientes');
  if(tbody) {
    tbody.innerHTML = tramites.slice(0,10).map(t=>`
      <tr>
        <td>${t.codigo||t.id||'-'}</td>
        <td>${t.usuario?.nombre||t.solicitante||'-'}</td>
        <td><span class="status-badge status-${(t.estado||'').replace(' ','-')}">${t.estado}</span></td>
        <td>${(t.fecha_reg||t.fecha||'').split('T')[0]||'-'}</td>
      </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:16px">Sin datos</td></tr>';
  }

  // Tabla todos los trámites
  const todosBody = document.getElementById('todosTramites');
  if(todosBody) {
    todosBody.innerHTML = tramites.map(t=>`
      <tr>
        <td>${t.codigo||t.id||'-'}</td>
        <td>${t.usuario?.nombre||t.solicitante||'-'}</td>
        <td>${t.tipotramite?.nombre||t.tipo||'-'}</td>
        <td><span class="status-badge status-${(t.estado||'').replace(' ','-')}">${t.estado}</span></td>
        <td>${(t.fecha_reg||t.fecha||'').split('T')[0]||'-'}</td>
      </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">Sin datos</td></tr>';
  }

  // Gráfico con Chart.js si está disponible
  const ctx = document.getElementById('estadisticasChart')?.getContext('2d');
  if(ctx && typeof Chart !== 'undefined') {
    if(window._chart) window._chart.destroy();
    window._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes','En proceso','Completados','Rechazados'],
        datasets:[{
          data: [pendientes, enProceso, completados, tramites.filter(t=>t.estado==='Rechazado').length],
          backgroundColor:['#F39C12','#3498db','#27AE60','#E74C3C'],
          borderWidth: 2
        }]
      },
      options: { responsive:true, plugins:{ legend:{ position:'bottom' } } }
    });
  }
}

// ── DOCUMENTOS ───────────────────────────────────────────
// ── NAVEGACIÓN ────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`page-${page}`)?.classList.add('active');
    // Guardar página activa para restaurar al recargar
    sessionStorage.setItem('smartcampus_active_page_per', page);
    if(page==='reportes')   cargarEstadisticas();
    if(page==='documentos') initArbol();
  });
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  sessionStorage.removeItem('smartcampus_session');
  window.location.replace('login.html');
});

cargarEstadisticas();
initArbol();

// ── AUTO-REFRESH: actualizar estadísticas cada 60s ────────
(function startAutoRefreshPer() {
  function refreshPer() {
    if (document.hidden) return;
    cargarEstadisticas();
  }
  const _autoRefreshPer = setInterval(refreshPer, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshPer(); });
  window.addEventListener('focus', refreshPer);
})();