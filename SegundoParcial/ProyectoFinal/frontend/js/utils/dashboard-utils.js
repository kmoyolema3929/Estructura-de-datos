/**
 * SmartCampus UTA — Utilidades compartidas para todos los dashboards
 * Incluye: Toast, Modal, Notificaciones, Perfil, Árbol documentos, Mapa
 * Cargar ANTES del JS específico de cada dashboard
 */

// ── TOAST ────────────────────────────────────────────────
window.showToast = function(msg, tipo = 'success') {
  let c = document.getElementById('toastContainer');
  if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  const icons = { success:'fa-check-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle', error:'fa-times-circle' };
  t.innerHTML = `<i class="fas ${icons[tipo]||'fa-info-circle'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(40px)'; t.style.transition='.3s'; setTimeout(()=>t.remove(),300); }, 3500);
};

// ── MODAL ────────────────────────────────────────────────
window._modalCallback = null;
window.openModal = function(titulo, bodyHTML, confirmLabel='Guardar', onConfirm=null) {
  let overlay = document.getElementById('modalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    overlay.innerHTML = `
      <div class="modal" id="modal">
        <div class="modal-header">
          <h3 id="modalTitle"></h3>
          <button class="modal-close" id="modalClose"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer">
          <button class="btn-outline" id="modalCancel">Cancelar</button>
          <button class="btn-primary" id="modalConfirm">Guardar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modalClose').addEventListener('click', window.closeModal);
    overlay.querySelector('#modalCancel').addEventListener('click', window.closeModal);
    overlay.addEventListener('click', e => { if(e.target===overlay) window.closeModal(); });
    overlay.querySelector('#modalConfirm').addEventListener('click', () => { if(window._modalCallback) window._modalCallback(); window.closeModal(); });
  }
  overlay.querySelector('#modalTitle').textContent = titulo;
  overlay.querySelector('#modalBody').innerHTML = bodyHTML;
  overlay.querySelector('#modalConfirm').textContent = confirmLabel;
  overlay.classList.add('open');
  window._modalCallback = onConfirm;
};
window.closeModal = function() {
  document.getElementById('modalOverlay')?.classList.remove('open');
  window._modalCallback = null;
};

// ── SUPABASE HELPERS ────────────────────────────────────
window.sbGet = async (tabla, filtros={}) => {
  let q = window.supabase.from(tabla).select('*');
  Object.entries(filtros).forEach(([k,v]) => { q = q.eq(k,v); });
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};
window.sbInsert = async (tabla, datos) => {
  const { data, error } = await window.supabase.from(tabla).insert(datos).select().single();
  if (error) throw error;
  return data;
};
window.sbUpdate = async (tabla, filtros, cambios) => {
  let q = window.supabase.from(tabla).update(cambios);
  Object.entries(filtros).forEach(([k,v]) => { q = q.eq(k,v); });
  const { error } = await q;
  if (error) throw error;
};

// ── ÁRBOL DE DOCUMENTOS ──────────────────────────────────
window.DOCS_TREE = {
  id: "root",
  nombre: "Documentos UTA",
  icono: "fa-university",
  docs: [],
  hijos: [
    {
      id: "academico",
      nombre: "Académico",
      icono: "fa-graduation-cap",
      docs: [],
      hijos: [
        { id: "reglamentos", nombre: "Reglamentos", icono: "fa-file-alt", hijos: [], docs: [] },
        { id: "mallas", nombre: "Mallas Curriculares", icono: "fa-file-alt", hijos: [], docs: [] },
        { id: "silabus", nombre: "Silabus", icono: "fa-file-alt", hijos: [], docs: [] }
      ]
    },
    {
      id: "administrativo",
      nombre: "Administrativo",
      icono: "fa-building",
      docs: [],
      hijos: [
        { id: "formularios", nombre: "Formularios", icono: "fa-file-alt", hijos: [], docs: [] },
        { id: "actas", nombre: "Actas", icono: "fa-file-alt", hijos: [], docs: [] }
      ]
    },
    {
      id: "financiero",
      nombre: "Financiero",
      icono: "fa-dollar-sign",
      hijos: [],
      docs: []
    }
  ]
};

// Función mejorada para renderizar árbol (igual que admin)
// Renderizar árbol igual al admin, pasando showAddBtn=false para no-admin
window.renderArbol = function(nodo, nivel, showAddBtn) {
  nivel = nivel || 0;
  showAddBtn = showAddBtn || false;
  var hasHijos = nodo.hijos && nodo.hijos.length > 0;
  var esHoja   = !hasHijos;
  var indent   = nivel * 14;
  var icono    = hasHijos ? 'fa-folder' : 'fa-folder-open';
  var colorI   = hasHijos ? '#E67E22' : '#C0392B';
  var peso     = hasHijos ? '600' : '400';
  var idSafe   = JSON.stringify(nodo.id);
  var nomSafe  = JSON.stringify(nodo.nombre);

  var badge = hasHijos
    ? '<small style="color:#bbb;font-size:10px">' + nodo.hijos.length + '</small>'
    : '<small style="color:#aaa;font-size:10px">docs</small>';

  var chevron = esHoja
    ? '<i class="fas fa-chevron-right tree-chevron" style="color:#ccc;font-size:10px;transition:transform .2s"></i>'
    : '';

  var inlineFiles = esHoja
    ? '<div class="inline-file-list" id="files-' + nodo.id + '" style="display:none;margin-left:28px;margin-top:2px;border-left:2px solid #F9DADA;padding-left:8px"></div>'
    : '';

  // Botón + solo si showAddBtn (admin)
  var addBtn = showAddBtn
    ? '<button class="btn-nueva-sub" data-id=' + idSafe + ' data-nombre=' + nomSafe +
        ' style="background:none;border:none;cursor:pointer;color:#ccc;font-size:12px;padding:2px 5px;border-radius:4px;transition:.2s;margin-left:2px">' +
        '<i class="fas fa-folder-plus"></i></button>'
    : '';

  var children = hasHijos
    ? '<div style="border-left:2px solid #F0F0F0;margin-left:18px">' +
        nodo.hijos.map(function(h) { return window.renderArbol(h, 0, showAddBtn); }).join('') + '</div>'
    : '';

  return '<div class="tree-node" style="margin-left:' + indent + 'px">' +
    '<div class="tree-node-label tree-clickable"' +
      ' data-id=' + idSafe +
      ' data-nombre=' + nomSafe +
      ' data-hoja="' + esHoja + '"' +
      ' style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer">' +
      '<i class="fas ' + icono + ' tree-folder-icon" style="color:' + colorI + ';font-size:14px;flex-shrink:0"></i>' +
      '<span style="flex:1;font-size:13.5px;font-weight:' + peso + '">' + nodo.nombre + '</span>' +
      badge +
      chevron +
      addBtn +
    '</div>' +
    inlineFiles +
    children +
  '</div>';
};

// Función mejorada para seleccionar categoría (igual que admin)
window.seleccionarCat = async function(id, nombre, esHoja, el) {
  document.querySelectorAll('.tree-node-label').forEach(function(e) {
    e.classList.remove('selected');
  });
  if (el) el.classList.add('selected');
  
  var catEl = document.getElementById('catActual');
  if (catEl) catEl.textContent = nombre;
  
  var docList = document.getElementById('docList');
  if (!docList) return;

  // Si no es hoja, mostrar subcarpetas
  if (!esHoja) {
    function buscarNodo(nodo, tid) {
      if (nodo.id === tid) return nodo;
      for (var i = 0; i < (nodo.hijos || []).length; i++) {
        var f = buscarNodo(nodo.hijos[i], tid);
        if (f) return f;
      }
      return null;
    }
    var hijos = (buscarNodo(window.DOCS_TREE, id) || {}).hijos || [];
    if (hijos.length > 0) {
      docList.innerHTML = '<div style="padding:8px 0">' +
        '<p style="font-size:13px;color:#888;margin-bottom:12px"><i class="fas fa-info-circle" style="color:var(--red-500)"></i> Selecciona una subcarpeta para ver los documentos.</p>' +
        hijos.map(function(h) {
          return '<div class="doc-item" data-id="' + h.id + '" data-nombre="' + h.nombre + '" style="cursor:pointer;margin-bottom:6px">' +
            '<i class="fas fa-folder-open" style="color:#C0392B;font-size:20px;flex-shrink:0"></i>' +
            '<div class="doc-item-info"><strong>' + h.nombre + '</strong><span>Subcarpeta</span></div>' +
            '<i class="fas fa-chevron-right" style="color:#ccc;font-size:12px"></i></div>';
        }).join('') + '</div>';
      // Agregar event listeners
      docList.querySelectorAll('.doc-item').forEach(function(item) {
        item.addEventListener('click', function() {
          window.seleccionarCat(this.dataset.id, this.dataset.nombre, true, null);
        });
      });
    } else {
      docList.innerHTML = '<div class="cola-empty">Esta categoría no tiene subcarpetas</div>';
    }
    return;
  }

  // Es hoja - mostrar documentos en panel inline y derecho
  var inlinePanel = document.getElementById('files-' + id);
  
  // Toggle del panel inline
  var isOpen = inlinePanel && inlinePanel.style.display !== 'none';
  
  if (isOpen) {
    if (inlinePanel) inlinePanel.style.display = 'none';
    var chevron = document.querySelector('.tree-node-label.selected .tree-chevron');
    if (chevron) chevron.style.transform = '';
    return;
  }

  // Cerrar otros paneles abiertos
  document.querySelectorAll('.inline-file-list').forEach(function(p) {
    p.style.display = 'none';
  });
  document.querySelectorAll('.tree-chevron').forEach(function(c) {
    c.style.transform = '';
  });

  if (inlinePanel) {
    inlinePanel.style.display = 'block';
    var chevronEl = document.querySelector('.tree-node-label.selected .tree-chevron');
    if (chevronEl) chevronEl.style.transform = 'rotate(90deg)';
  }

  // Cargar documentos
  if (inlinePanel) {
    inlinePanel.innerHTML = '<div style="padding:6px 4px;font-size:12px;color:#aaa"><i class="fas fa-spinner fa-spin"></i> Cargando archivos...</div>';
  }
  docList.innerHTML = '<div class="cola-empty"><i class="fas fa-spinner fa-spin"></i> Cargando documentos...</div>';

  // Cargar documentos desde Supabase y localStorage
  var catIdMap = {
    reglamentos: 2, mallas: 3, silabus: 4,
    formularios: 6, actas: 7, financiero: 8,
    academico: 1, administrativo: 5
  };
  
  var docs = [];
  var catNum = catIdMap[id];
  
  try {
    if (catNum && window.supabase) {
      var res = await window.supabase
        .from('documento')
        .select('*')
        .eq('id_categoria', catNum)
        .eq('activo', true)
        .order('creado_en', { ascending: false });
      
      if (res.data && res.data.length) {
        docs = res.data.map(function(d) {
          return {
            nombre: d.nombre,
            tipo: d.tipo_archivo || 'PDF',
            fecha: (d.creado_en || '').split('T')[0],
            url: d.ruta_archivo || '',
            id_documento: d.id_documento
          };
        });
      }
    }
  } catch(e) {
    console.warn('Error cargando documentos:', e);
  }

  // Fallback localStorage
  var lsDocs = JSON.parse(localStorage.getItem('sc_documentos') || '[]');
  var lsFiltered = lsDocs.filter(function(d) { return d.categoria === id; });
  for (var i = 0; i < lsFiltered.length; i++) {
    if (!docs.some(function(d) { return d.nombre === lsFiltered[i].nombre; })) {
      docs.push(lsFiltered[i]);
    }
  }

  var iconMap = { PDF: 'fa-file-pdf', DOCX: 'fa-file-word', XLSX: 'fa-file-excel' };
  
  var renderDocsHtml = function(docsArray) {
    if (!docsArray.length) {
      return '<div class="cola-empty">No hay documentos en esta subcarpeta.</div>';
    }
    return docsArray.map(function(d) {
      var icon = iconMap[d.tipo] || 'fa-file-pdf';
      var colorIcon = d.tipo === 'DOCX' ? '#2B6CB0' : d.tipo === 'XLSX' ? '#276749' : '#C0392B';
      var urlSafe = encodeURIComponent(d.url || '');
      var nomSafe = (d.nombre || '').replace(/'/g, "\\'");
      var tipoSafe = d.tipo || 'PDF';
      
      var btnView = d.url
        ? '<button class="btn-sm btn-ver-doc" onclick="abrirVisorDoc(\'' + urlSafe + '\',\'' + nomSafe + '\',\'' + tipoSafe + '\')" title="Ver documento" style="background:var(--red-600);color:#fff;border:none;cursor:pointer;margin-right:6px">' +
          '<i class="fas fa-eye"></i> Ver</button>'
        : '';
      var btnDownload = d.url
        ? '<a href="' + d.url + '" target="_blank" download class="btn-sm" title="Descargar"><i class="fas fa-download"></i> Descargar</a>'
        : '<span class="btn-sm" style="color:#aaa;cursor:default">Sin enlace</span>';
      
      return '<div class="doc-item" style="cursor:pointer" onclick="abrirVisorDoc(\'' + urlSafe + '\',\'' + nomSafe + '\',\'' + tipoSafe + '\')">' +
        '<i class="fas ' + icon + '" style="color:' + colorIcon + ';font-size:20px;flex-shrink:0"></i>' +
        '<div class="doc-item-info"><strong>' + d.nombre + '</strong><span>' + (d.tipo || 'PDF') + ' · ' + (d.fecha || '-') + '</span></div>' +
        '<div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">' + btnView + btnDownload + '</div>' +
      '</div>';
    }).join('');
  };

  var docsHtml = renderDocsHtml(docs);
  
  if (inlinePanel) inlinePanel.innerHTML = docsHtml;
  docList.innerHTML = docsHtml;
};

// Inicializar árbol (compartido para todos los dashboards no-admin)
window.initArbol = async function() {
  var tc = document.getElementById('treeContainer');
  if (!tc) return;

  tc.innerHTML = '<div style="padding:20px;text-align:center;color:#aaa;font-size:13px"><i class="fas fa-spinner fa-spin"></i> Cargando categorías...</div>';

  // Intentar cargar categorías desde Supabase
  var arbolData = null;
  try {
    if (window.supabase) {
      var res = await window.supabase
        .from('categoria')
        .select('id_categoria, nombre, id_padre, activo')
        .eq('activo', true)
        .order('id_categoria', { ascending: true });

      if (res.data && res.data.length) {
        // Construir árbol desde flat list
        var rootCats = res.data.filter(function(c) { return !c.id_padre; });
        function buildNode(cat) {
          var hijos = res.data
            .filter(function(c) { return c.id_padre === cat.id_categoria; })
            .map(buildNode);
          return { id: String(cat.id_categoria), nombre: cat.nombre, hijos: hijos, docs: [] };
        }
        arbolData = {
          id: 'root',
          nombre: 'Documentos UTA',
          hijos: rootCats.map(buildNode),
          docs: []
        };
      }
    }
  } catch(e) {
    console.warn('Error cargando árbol desde Supabase:', e);
  }

  // Fallback: árbol estático
  if (!arbolData) {
    arbolData = window.DOCS_TREE || {
      id: 'root', nombre: 'Documentos UTA', docs: [], hijos: [
        { id: 'academico', nombre: 'Académico', docs: [], hijos: [
          { id: 'reglamentos', nombre: 'Reglamentos', hijos: [], docs: [] },
          { id: 'mallas', nombre: 'Mallas Curriculares', hijos: [], docs: [] },
          { id: 'silabus', nombre: 'Silabus', hijos: [], docs: [] }
        ]},
        { id: 'administrativo', nombre: 'Administrativo', docs: [], hijos: [
          { id: 'formularios', nombre: 'Formularios', hijos: [], docs: [] },
          { id: 'actas', nombre: 'Actas', hijos: [], docs: [] }
        ]},
        { id: 'financiero', nombre: 'Financiero', hijos: [], docs: [] }
      ]
    };
  }

  window.DOCS_TREE = arbolData;

  // Renderizar sin botones de agregar (showAddBtn = false)
  tc.innerHTML = window.renderArbol(arbolData, 0, false);

  // Event listeners para hover y click
  tc.querySelectorAll('.tree-clickable').forEach(function(el) {
    el.addEventListener('mouseover', function() { this.style.background = '#FEF5F4'; });
    el.addEventListener('mouseout',  function() { this.style.background = ''; });
    el.addEventListener('click', function() {
      var id     = this.dataset.id;
      var nombre = this.dataset.nombre;
      var esHoja = this.dataset.hoja === 'true';
      window.seleccionarCat(id, nombre, esHoja, this);
    });
  });
};

// ── MAPA ─────────────────────────────────────────────────
window.initMapa = function() {
  if(window._mapaListo) return;
  window._mapaListo = true;
  setTimeout(()=>{
    if(typeof initCampusMap!=='undefined' && typeof Grafo!=='undefined'){
      initCampusMap(new Grafo());
    }
    if(window._leafletMap) window._leafletMap.invalidateSize();
  },300);
};

// ── NOTIFICACIONES (compartido) ──────────────────────────
window.NotifManager = {
  items: [],

  init(items=[]) {
    // Recuperar notifs ya leídas por título
    const readTitles = JSON.parse(localStorage.getItem('sc_notif_read_titles') || '[]');
    this.items = items.map(n => ({
      ...n,
      leida: readTitles.includes(n.titulo) ? true : n.leida
    }));
    this.render();
    this.bindEvents();
  },

  render() {
    const list = document.getElementById('notifList');
    if(!list) return;
    if(this.items.length===0){
      list.innerHTML='<div class="notif-empty"><i class="fas fa-bell-slash"></i>Sin notificaciones</div>';
    } else {
      list.innerHTML = this.items.map((n,i) => `
        <div class="notif-item ${n.leida?'':'unread'}" 
             data-idx="${i}" 
             data-page="${n.page||''}"
             onclick="NotifManager.clickNotif(${i})"
             style="cursor:${n.page?'pointer':'default'}">
          <div class="notif-dot ${n.tipo||'info'}"></div>
          <div class="notif-content">
            <strong>${n.titulo}</strong>
            <p>${n.desc}</p>
            <span class="notif-time"><i class="fas fa-clock"></i> ${n.tiempo||'Ahora'}</span>
          </div>
          ${n.page?'<i class="fas fa-chevron-right" style="color:#ccc;font-size:11px;flex-shrink:0;margin-top:4px"></i>':''}
        </div>`).join('');
    }
    this.updateBadge();
  },

  clickNotif(idx) {
    const n = this.items[idx];
    if(!n) return;
    n.leida = true;
    this._persistRead();
    this.render();
    document.getElementById('notifPanel')?.classList.remove('open');
    if(n.page) {
      const navItem = document.querySelector(`.nav-item[data-page="${n.page}"]`);
      if(navItem) navItem.click();
    }
  },

  markAll() {
    this.items.forEach(n=>n.leida=true);
    this._persistRead();
    this.render();
    showToast('Todas marcadas como leídas','success');
  },

  _persistRead() {
    // Guardar índices de notifs leídas + títulos para sobrevivir recargas
    const readTitles = this.items.filter(n=>n.leida).map(n=>n.titulo);
    localStorage.setItem('sc_notif_read_titles', JSON.stringify(readTitles));
  },

  updateBadge() {
    const unread = this.items.filter(n=>!n.leida).length;
    const badge = document.getElementById('notifCount');
    if(badge){ badge.textContent=unread; badge.style.display=unread>0?'flex':'none'; }
  },

  add(item) {
    this.items.unshift({...item, leida:false, tiempo:'Ahora'});
    this.render();
  },

  bindEvents() {
    const btn   = document.getElementById('notifBtn');
    const panel = document.getElementById('notifPanel');
    const markAll = document.getElementById('markAllBtn');
    if(btn && panel) {
      btn.addEventListener('click', e=>{ e.stopPropagation(); panel.classList.toggle('open'); });
      document.addEventListener('click', e=>{ if(!panel.contains(e.target)&&e.target!==btn) panel.classList.remove('open'); });
    }
    if(markAll) markAll.addEventListener('click', ()=>NotifManager.markAll());
  }
};

// ── PERFIL MODAL ─────────────────────────────────────────
window.initPerfil = function(user) {
  const userMenu = document.getElementById('userMenu');
  if(!userMenu) return;
  userMenu.style.cursor = 'pointer';
  userMenu.addEventListener('click', ()=>{
    // Crear modal si no existe
    let m = document.getElementById('perfilModal');
    if(!m){
      m = document.createElement('div');
      m.className = 'modal-overlay'; m.id = 'perfilModal';
      m.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3><i class="fas fa-user-edit"></i> Mi Perfil</h3>
            <button class="modal-close" onclick="document.getElementById('perfilModal').classList.remove('open')"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div style="text-align:center;margin-bottom:20px">
              <div id="perfilAvatar" style="width:68px;height:68px;background:var(--red-700);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;margin:0 auto 10px"></div>
              <div style="font-size:11px;color:#aaa">Actualiza tu información personal</div>
            </div>
            <div style="display:flex;gap:14px">
              <div class="form-group" style="flex:1"><label>Nombres</label><input class="form-control" id="perfilNombres" placeholder="Nombres"/></div>
              <div class="form-group" style="flex:1"><label>Apellidos</label><input class="form-control" id="perfilApellidos" placeholder="Apellidos"/></div>
            </div>
            <div class="form-group"><label>Correo <span style="color:#aaa;font-size:11px">(no editable)</span></label><input class="form-control" id="perfilEmail" disabled/></div>
            <div class="form-group"><label>Rol</label><input class="form-control" id="perfilRol" disabled/></div>
            <div style="border-top:1px solid #EEE;margin:14px 0;padding-top:14px">
              <div style="font-size:12px;font-weight:700;color:#555;margin-bottom:10px">Cambiar contraseña (opcional)</div>
              <div class="form-group"><label>Nueva contraseña</label><input class="form-control" type="password" id="perfilPass1" placeholder="Mínimo 8 caracteres"/></div>
              <div class="form-group"><label>Confirmar contraseña</label><input class="form-control" type="password" id="perfilPass2" placeholder="Repetir contraseña"/></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" onclick="document.getElementById('perfilModal').classList.remove('open')">Cancelar</button>
            <button class="btn-primary" id="perfilSaveBtn"><i class="fas fa-save"></i> Guardar</button>
          </div>
        </div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('open'); });
      document.getElementById('perfilSaveBtn').addEventListener('click', ()=>window.guardarPerfil(user));
    }
    // Rellenar datos
    const partes = (user.nombre||'').split(' ');
    document.getElementById('perfilNombres').value   = partes[0]||'';
    document.getElementById('perfilApellidos').value = partes.slice(1).join(' ')||'';
    document.getElementById('perfilEmail').value     = user.email||'';
    document.getElementById('perfilRol').value       = user.rol||'';
    document.getElementById('perfilAvatar').textContent = (user.nombre||'U').charAt(0).toUpperCase();
    document.getElementById('perfilPass1').value = '';
    document.getElementById('perfilPass2').value = '';
    m.classList.add('open');
  });
};

window.guardarPerfil = async function(user) {
  const nombres   = document.getElementById('perfilNombres').value.trim();
  const apellidos = document.getElementById('perfilApellidos').value.trim();
  const pass1     = document.getElementById('perfilPass1').value;
  const pass2     = document.getElementById('perfilPass2').value;

  if(!nombres){ showToast('Ingresa tu nombre','warning'); return; }
  if(pass1 && pass1!==pass2){ showToast('Las contraseñas no coinciden','warning'); return; }
  if(pass1 && pass1.length<8){ showToast('Contraseña mínimo 8 caracteres','warning'); return; }

  const nombreCompleto = `${nombres} ${apellidos}`.trim();
  const updates = { nombre: nombreCompleto };

  if(pass1){
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(pass1));
    updates.password_hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  try {
    await sbUpdate('usuario', { id_usuario: user.id }, updates);
  } catch(e) { console.warn('Supabase update failed, updating locally'); }

  user.nombre = nombreCompleto;
  sessionStorage.setItem('smartcampus_session', JSON.stringify(user));

  // Actualizar UI
  ['userName','welcomeName'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = id==='welcomeName'?`¡Bienvenido, ${nombreCompleto}!`:nombreCompleto; });
  ['userAvatar','welcomeAvatar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=nombreCompleto.charAt(0).toUpperCase(); });

  document.getElementById('perfilModal').classList.remove('open');
  showToast('Perfil actualizado correctamente','success');
};
/* ═══════════════════════════════════════════════════════════
   MÓDULO: NOTIFICACIONES EN TIEMPO REAL (Supabase Realtime)
   Funciona para todos los roles: admin, docente, estudiante, secretaria
   ═══════════════════════════════════════════════════════════ */
window.RealtimeNotif = {
  _channel: null,
  _pollingInterval: null,
  _lastSeenTramite: null,
  _lastSeenDoc: null,
  _lastSeenTurno: null,
  _userId: null,
  _rol: null,

  async init(userId, rol) {
    this._userId = userId;
    this._rol    = rol;

    // Cargar timestamps de último visto desde localStorage
    const key = 'sc_notif_seen_' + userId;
    const seen = JSON.parse(localStorage.getItem(key) || '{}');
    this._lastSeenTramite = seen.tramite || new Date(Date.now() - 5 * 60 * 1000).toISOString();
    this._lastSeenDoc     = seen.doc     || new Date(Date.now() - 5 * 60 * 1000).toISOString();
    this._lastSeenTurno   = seen.turno   || new Date(Date.now() - 5 * 60 * 1000).toISOString();

    this._iniciarRealtime();
    this._iniciarPolling();

    // Guardar timestamps al cerrar página
    window.addEventListener('beforeunload', () => this._guardarSeen());
  },

  _guardarSeen() {
    if (!this._userId) return;
    localStorage.setItem('sc_notif_seen_' + this._userId, JSON.stringify({
      tramite: this._lastSeenTramite,
      doc:     this._lastSeenDoc,
      turno:   this._lastSeenTurno
    }));
  },

  _iniciarRealtime() {
    if (!window.supabase) return;
    try {
      // Desuscribir canal anterior si existe
      if (this._channel) { window.supabase.removeChannel(this._channel); }

      const tablas = this._getTablasPorRol();
      if (!tablas.length) return;

      this._channel = window.supabase.channel('realtime-notifs-' + (this._userId || 'anon'));

      tablas.forEach(tabla => {
        const config = { event: '*', schema: 'public', table: tabla };
        // Filtrar por usuario si es necesario
        if (tabla === 'tramite' && (this._rol === 'Docente' || this._rol === 'Estudiante')) {
          // tramite usa id_solicitante, no id_usuario
          config.filter = 'id_solicitante=eq.' + this._userId;
        }
        if (tabla === 'turno' && this._rol === 'Estudiante') {
          config.filter = 'id_usuario=eq.' + this._userId;
        }
        this._channel.on('postgres_changes', config, (payload) => {
          this._manejarCambio(tabla, payload);
        });
      });

      this._channel
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Conectado para', this._rol);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[Realtime] Error de canal, usando polling');
          }
        });
    } catch(e) {
      console.warn('[Realtime] No se pudo iniciar:', e.message);
    }
  },

  _getTablasPorRol() {
    const rolTablas = {
      'Admin':      ['tramite', 'documento', 'turno'],
      'Docente':    ['tramite', 'documento'],
      'Estudiante': ['tramite', 'turno'],
      'Secretaria': ['tramite', 'turno'],
    };
    return rolTablas[this._rol] || ['tramite'];
  },

  _manejarCambio(tabla, payload) {
    const ev     = payload.eventType; // INSERT | UPDATE | DELETE
    const record = payload.new || payload.old || {};
    const now    = new Date().toISOString();

    if (tabla === 'tramite') {
      this._lastSeenTramite = now;
      if (ev === 'INSERT') {
        const desc = record.tipo ? `Nuevo trámite: ${record.tipo}` : 'Se registró un nuevo trámite';
        this._push('Nuevo trámite registrado', desc, 'warning', 'tramites');
      } else if (ev === 'UPDATE') {
        const estado = record.estado || '';
        const ico    = estado === 'Completado' ? 'success' : estado === 'Rechazado' ? 'error' : 'info';
        const obs    = record.observaciones ? (' — ' + record.observaciones) : '';
        this._push(
          estado === 'Completado' ? '✅ Trámite aprobado' :
          estado === 'Rechazado'  ? '❌ Trámite rechazado' :
          'Trámite actualizado',
          `Código ${record.codigo || ''}: ${estado}${obs}`,
          ico, 'tramites'
        );
      }
    } else if (tabla === 'documento') {
      this._lastSeenDoc = now;
      if (ev === 'INSERT') {
        this._push('Nuevo documento publicado', record.nombre || 'Documento añadido al sistema', 'info', 'documentos');
      }
    } else if (tabla === 'turno') {
      this._lastSeenTurno = now;
      if (ev === 'INSERT') {
        // Solo notificar a Secretaria/Admin, NO al estudiante que lo creó
        if ((this._rol === 'Secretaria' || this._rol === 'Admin') && record.id_usuario !== this._userId) {
          this._push('Nuevo turno en cola', 'Turno ' + (record.numero || '#?') + ' — ' + (record.tipo_servicio || 'Servicio'), 'warning', 'turnos');
        }
      } else if (ev === 'UPDATE') {
        const estado = record.estado || '';
        if (this._rol === 'Estudiante' && (estado === 'Atendido' || estado === 'Llamado')) {
          this._push(
            estado === 'Atendido' ? '✅ Tu turno fue atendido' : '📢 ¡Te están llamando!',
            'Turno ' + (record.numero || '') + ' — acércate a la ventanilla',
            'success', 'turnos'
          );
        }
      }
    }
    this._guardarSeen();
  },

  // Polling de respaldo: consulta cambios recientes cada 30s
  _iniciarPolling() {
    if (this._pollingInterval) clearInterval(this._pollingInterval);
    this._pollingInterval = setInterval(() => this._poll(), 30000);
  },

  async _poll() {
    if (!window.supabase) return;
    try {
      // Verificar si el canal Realtime está activo; si sí, no duplicamos
      if (this._channel && this._channel.state === 'joined') return;

      const tablas = this._getTablasPorRol();

      if (tablas.includes('tramite')) {
        const { data } = await window.supabase
          .from('tramite').select('id,tipo,estado,creado_en,modificado_en')
          .gt('modificado_en', this._lastSeenTramite)
          .order('modificado_en', { ascending: false })
          .limit(5);
        if (data && data.length) {
          data.forEach(t => {
            this._push('Trámite actualizado', `${t.tipo || 'Trámite'} → ${t.estado || ''}`, 'info', 'tramites');
          });
          this._lastSeenTramite = new Date().toISOString();
        }
      }

      if (tablas.includes('documento')) {
        const { data } = await window.supabase
          .from('documento').select('id,nombre,creado_en')
          .gt('creado_en', this._lastSeenDoc)
          .eq('activo', true)
          .order('creado_en', { ascending: false })
          .limit(5);
        if (data && data.length) {
          data.forEach(d => {
            this._push('Nuevo documento', d.nombre || 'Documento añadido', 'info', 'documentos');
          });
          this._lastSeenDoc = new Date().toISOString();
        }
      }

      if (tablas.includes('turno')) {
        const { data } = await window.supabase
          .from('turno').select('id,numero,nombre,estado,creado_en')
          .gt('creado_en', this._lastSeenTurno)
          .order('creado_en', { ascending: false })
          .limit(5);
        if (data && data.length) {
          data.forEach(t => {
            this._push('Nuevo turno', `Turno #${t.numero || '?'}`, 'warning', 'turnos');
          });
          this._lastSeenTurno = new Date().toISOString();
        }
      }

      this._guardarSeen();
    } catch(e) { /* silencioso */ }
  },

  _push(titulo, desc, tipo, page) {
    // Evitar duplicados recientes (mismo título en últimos 5s)
    const ahora = Date.now();
    if (!this._recent) this._recent = [];
    const key = titulo + desc;
    if (this._recent.find(r => r.key === key && ahora - r.ts < 5000)) return;
    this._recent = this._recent.filter(r => ahora - r.ts < 10000);
    this._recent.push({ key, ts: ahora });

    // Calcular tiempo relativo
    const tiempo = 'Ahora';

    // Agregar al NotifManager
    if (window.NotifManager) {
      NotifManager.add({ titulo, desc, tipo, page, tiempo });
    }

    // Sonido suave de notificación (beep con Web Audio API)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = tipo === 'error' ? 300 : tipo === 'warning' ? 520 : 660;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch(e) { /* sin audio */ }

    // Toast visible
    if (window.showToast) {
      showToast(`🔔 ${titulo}: ${desc}`, tipo === 'error' ? 'error' : tipo === 'warning' ? 'warning' : 'info');
    }
  },

  destroy() {
    if (this._channel) { window.supabase?.removeChannel(this._channel); this._channel = null; }
    if (this._pollingInterval) { clearInterval(this._pollingInterval); this._pollingInterval = null; }
    this._guardarSeen();
  }
};

// ── FECHA ACTUAL (compartido por todos los dashboards) ────
window.initFecha = function() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

// ── SELECTOR DE HORA PARA TURNOS (compartido) ─────────────
window.actualizarHoras = function() {
  const fc = document.getElementById('fechaCita');
  const hs = document.getElementById('horaCita');
  if (!fc || !hs) return;

  const fecha = new Date(fc.value + 'T12:00:00');
  const dia   = fecha.getDay(); // 0=dom 6=sab

  if (!fc.value) {
    hs.innerHTML = '<option value="">Primero elige fecha</option>';
    hs.disabled = true;
    return;
  }

  if (dia === 0 || dia === 6) {
    hs.innerHTML = '<option value="">Día no laborable</option>';
    hs.disabled = true;
    if (window.showToast) showToast('Elige un día de lunes a viernes', 'warning');
    return;
  }

  var slots = [];
  // Mañana 08:00 - 12:30
  for (var h = 8; h <= 12; h++) {
    slots.push(String(h).padStart(2,'0') + ':00');
    if (h < 12) slots.push(String(h).padStart(2,'0') + ':30');
    if (h === 12) slots.push('12:30');
  }
  // Tarde 14:00 - 16:30
  for (var h2 = 14; h2 <= 16; h2++) {
    slots.push(String(h2).padStart(2,'0') + ':00');
    slots.push(String(h2).padStart(2,'0') + ':30');
  }

  hs.disabled = false;
  hs.innerHTML = '<option value="">Selecciona hora</option>' +
    slots.map(function(s){ return '<option value="' + s + '">' + s + '</option>'; }).join('');
};

// ── INICIALIZAR FECHA MÍNIMA PARA TURNO ──────────────────
window.initFechaCita = function() {
  var fc = document.getElementById('fechaCita');
  if (!fc) return;
  var hoy = new Date();
  while (hoy.getDay() === 0 || hoy.getDay() === 6) hoy.setDate(hoy.getDate() + 1);
  var min = hoy.toISOString().split('T')[0];
  fc.min   = min;
  fc.value = min;
  fc.addEventListener('change', window.actualizarHorasConFiltro || window.actualizarHoras);
  if (window.actualizarHorasConFiltro) window.actualizarHorasConFiltro();
  else window.actualizarHoras();
};
// ── VISOR DE DOCUMENTOS (compartido) ─────────────────────
window.abrirVisorDoc = function(urlEncoded, nombre, tipo) {
  var url = decodeURIComponent(urlEncoded);
  if (!url) {
    if (window.showToast) window.showToast('Este documento no tiene enlace disponible', 'warning');
    return;
  }

  var iframeSrc;
  if (tipo === 'DOCX') {
    iframeSrc = 'https://docs.google.com/gview?url=' + encodeURIComponent(url) + '&embedded=true';
  } else {
    iframeSrc = url;
  }

  var overlay = document.getElementById('docVisorOverlay');
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
            onerror="document.getElementById('docVisorLoading').innerHTML='<i class=\\'fas fa-exclamation-circle\\' style=\\'font-size:28px;color:#C0392B\\'></i><span>No se pudo cargar el documento.<br>Usa el botón Descargar.</span>'"
          ></iframe>
        </div>
      </div>`;
    overlay.addEventListener('click', function(e) { if (e.target === overlay) window.cerrarVisorDoc(); });
    document.body.appendChild(overlay);
  }

  var iconMap2 = { PDF: 'fa-file-pdf', DOCX: 'fa-file-word', XLSX: 'fa-file-excel' };
  var colorMap = { PDF: '#C0392B', DOCX: '#2B6CB0', XLSX: '#276749' };
  
  document.getElementById('docVisorNombre').textContent = nombre;
  document.getElementById('docVisorIcon').className = 'fas ' + (iconMap2[tipo] || 'fa-file');
  document.getElementById('docVisorIcon').style.color = colorMap[tipo] || '#C0392B';
  document.getElementById('docVisorDl').href = url;
  document.getElementById('docVisorLoading').style.display = 'flex';
  document.getElementById('docVisorFrame').src = '';

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(function() {
    document.getElementById('docVisorFrame').src = iframeSrc;
  }, 80);
};

window.cerrarVisorDoc = function() {
  var overlay = document.getElementById('docVisorOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    var iframe = document.getElementById('docVisorFrame');
    if (iframe) iframe.src = '';
  }
  document.body.style.overflow = '';
};

// Cerrar visor con Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') window.cerrarVisorDoc();
});