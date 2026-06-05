/**
 * SmartCampus UTA — Mapa del Campus con OpenStreetMap + Leaflet.js
 * Campus Huachi, Av. Los Chasquis y Río Payamino, Ambato, Ecuador
 * Coordenadas reales desde Google Maps
 */

window.initCampusMap = function(grafo) {

  // ── NODOS REALES DEL CAMPUS HUACHI UTA ──────────────────
  // Coordenadas reales proporcionadas
  const nodosData = [
    // --- PRINCIPALES ---
    {
      id: 'universidad',
      nombre: 'Universidad Técnica de Ambato',
      lat: -1.269316, lng: -78.625960,
      tipo: 'principal', color: '#C0392B', icono: '🏛️'
    },
    {
      id: 'contabilidad',
      nombre: 'Facultad de Contabilidad y Auditoría',
      lat: -1.268672, lng: -78.624755,
      tipo: 'academico', color: '#E67E22', icono: '📊'
    },
    {
      id: 'civil_mecanica',
      nombre: 'Facultad de Ingeniería Civil y Mecánica',
      lat: -1.268769, lng: -78.624191,
      tipo: 'academico', color: '#E67E22', icono: '⚙️'
    },
    {
      id: 'administrativas',
      nombre: 'Facultad de Ciencias Administrativas',
      lat: -1.268095, lng: -78.625302,
      tipo: 'academico', color: '#E67E22', icono: '📋'
    },
    {
      id: 'jurisprudencia',
      nombre: 'Facultad de Jurisprudencia y Ciencias Sociales',
      lat: -1.268056, lng: -78.624606,
      tipo: 'academico', color: '#E67E22', icono: '⚖️'
    },
    {
      id: 'sistemas',
      nombre: 'Facultad de Ingeniería en Sistemas',
      lat: -1.267688, lng: -78.624189,
      tipo: 'academico', color: '#2980B9', icono: '💻'
    },
    {
      id: 'alimentos',
      nombre: 'Facultad de Ciencia e Ingeniería en Alimentos',
      lat: -1.269581, lng: -78.623811,
      tipo: 'academico', color: '#E67E22', icono: '🍎'
    },
    {
      id: 'diseno',
      nombre: 'Facultad de Diseño, Arquitectura y Artes',
      lat: -1.266968, lng: -78.624698,
      tipo: 'academico', color: '#E67E22', icono: '🎨'
    },

    // --- SERVICIOS ---
    {
      id: 'idiomas',
      nombre: 'Centro de Idiomas',
      lat: -1.267857, lng: -78.623974,
      tipo: 'servicio', color: '#16A085', icono: '🌐'
    },
    {
      id: 'ciencias_basicas',
      nombre: 'Edificio de Ciencias Básicas',
      lat: -1.267579, lng: -78.623937,
      tipo: 'servicio', color: '#27AE60', icono: '🔬'
    },
    {
      id: 'ieee',
      nombre: 'IEEE DAY UTA',
      lat: -1.267492, lng: -78.624183,
      tipo: 'servicio', color: '#3498DB', icono: '💡'
    },
    {
      id: 'mercadotecnia',
      nombre: 'Carrera de Mercadotecnia',
      lat: -1.267719, lng: -78.625151,
      tipo: 'servicio', color: '#F39C12', icono: '📈'
    },
    {
      id: 'cadme',
      nombre: 'CADME - Evaluación de Conformidad',
      lat: -1.266954, lng: -78.624298,
      tipo: 'servicio', color: '#8E44AD', icono: '🔧'
    },

    // --- DEPORTES Y CULTURA ---
    {
      id: 'estadio',
      nombre: 'Estadio Universitario',
      lat: -1.269474, lng: -78.625509,
      tipo: 'deporte', color: '#2980B9', icono: '⚽'
    },
    {
      id: 'complejo_acuatico',
      nombre: 'Complejo Acuático Universitario',
      lat: -1.270205, lng: -78.624235,
      tipo: 'deporte', color: '#2980B9', icono: '🏊'
    },
    {
      id: 'canchas',
      nombre: 'Canchas Universitarias',
      lat: -1.270475, lng: -78.622862,
      tipo: 'deporte', color: '#2980B9', icono: '🏀'
    },
    {
      id: 'centro_cultura',
      nombre: 'Centro de Cultura y Deporte',
      lat: -1.269465, lng: -78.624265,
      tipo: 'deporte', color: '#8E44AD', icono: '🎭'
    },

    // --- ASOCIACIONES ---
    {
      id: 'apua',
      nombre: 'APUA - Asociación de Profesores',
      lat: -1.270297, lng: -78.624737,
      tipo: 'servicio', color: '#27AE60', icono: '👨‍🏫'
    },
    {
      id: 'feue',
      nombre: 'Auditorio FEUE - Casa del Estudiante',
      lat: -1.270049, lng: -78.624621,
      tipo: 'servicio', color: '#F39C12', icono: '🎓'
    },
    {
      id: 'asociacion_estudiantes',
      nombre: 'Asociación de Estudiantes',
      lat: -1.269334, lng: -78.624496,
      tipo: 'servicio', color: '#27AE60', icono: '👨‍🎓'
    },
    {
      id: 'laconal',
      nombre: 'Laboratorio LACONAL',
      lat: -1.269472, lng: -78.623858,
      tipo: 'servicio', color: '#16A085', icono: '🔬'
    },
  ];

  // ── ARISTAS — conexiones entre edificios (distancia en metros) ──
  const aristasData = [
    // Conexiones principales
    { o: 'universidad', d: 'contabilidad', p: 80 },
    { o: 'universidad', d: 'estadio', p: 60 },
    { o: 'contabilidad', d: 'jurisprudencia', p: 70 },
    { o: 'contabilidad', d: 'administrativas', p: 90 },
    { o: 'contabilidad', d: 'civil_mecanica', p: 85 },
    { o: 'civil_mecanica', d: 'sistemas', p: 100 },
    { o: 'civil_mecanica', d: 'jurisprudencia', p: 75 },
    { o: 'jurisprudencia', d: 'administrativas', p: 65 },
    { o: 'administrativas', d: 'mercadotecnia', p: 70 },
    { o: 'sistemas', d: 'ciencias_basicas', p: 60 },
    { o: 'sistemas', d: 'idiomas', p: 55 },
    { o: 'sistemas', d: 'ieee', p: 40 },
    { o: 'ciencias_basicas', d: 'idiomas', p: 50 },
    { o: 'diseno', d: 'cadme', p: 60 },
    { o: 'diseno', d: 'mercadotecnia', p: 110 },
    { o: 'alimentos', d: 'laconal', p: 40 },
    { o: 'alimentos', d: 'centro_cultura', p: 120 },
    
    // Zona deportiva
    { o: 'estadio', d: 'complejo_acuatico', p: 100 },
    { o: 'estadio', d: 'centro_cultura', p: 90 },
    { o: 'complejo_acuatico', d: 'apua', p: 50 },
    { o: 'complejo_acuatico', d: 'feue', p: 60 },
    { o: 'feue', d: 'apua', p: 45 },
    { o: 'feue', d: 'asociacion_estudiantes', p: 55 },
    { o: 'centro_cultura', d: 'asociacion_estudiantes', p: 70 },
    { o: 'centro_cultura', d: 'canchas', p: 130 },
    { o: 'canchas', d: 'feue', p: 140 },
    
    // Conexiones cruzadas
    { o: 'jurisprudencia', d: 'centro_cultura', p: 150 },
    { o: 'contabilidad', d: 'alimentos', p: 100 },
    { o: 'sistemas', d: 'alimentos', p: 180 },
    { o: 'universidad', d: 'asociacion_estudiantes', p: 110 },
  ];

  // ── POBLAR GRAFO ─────────────────────────────────────────
  nodosData.forEach(n => grafo.agregarNodo(n.id, {
    nombre: n.nombre, lat: n.lat, lng: n.lng,
    tipo: n.tipo, color: n.color, icono: n.icono
  }));
  aristasData.forEach(a => grafo.agregarArista(a.o, a.d, a.p));

  // ── POBLAR SELECTS Y LISTA ───────────────────────────────
  const desdeEl    = document.getElementById('desde');
  const hastaEl    = document.getElementById('hasta');
  const nodosListEl = document.getElementById('nodosList');

  if (desdeEl && hastaEl) {
    nodosData.forEach(n => {
      [desdeEl, hastaEl].forEach(sel => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = `${n.icono} ${n.nombre}`;
        sel.appendChild(opt);
      });
    });
  }

  if (nodosListEl) {
    nodosData.forEach(n => {
      const div = document.createElement('div');
      div.className = 'nodo-item';
      div.innerHTML = `
        <div class="nodo-dot" style="background:${n.color}"></div>
        <span style="font-size:12px">${n.icono} ${n.nombre}</span>`;
      nodosListEl.appendChild(div);
    });
  }

  // ── CONTENEDOR LEAFLET ───────────────────────────────────
  let mapDiv = document.getElementById('leafletMap');
  if (!mapDiv) {
    mapDiv = document.createElement('div');
    mapDiv.id = 'leafletMap';
    mapDiv.style.cssText = 'width:100%;height:440px;border-radius:0;z-index:1;';
    const container = document.querySelector('.panel-body');
    if (container) container.appendChild(mapDiv);
  }

  // ── INICIALIZAR MAPA ─────────────────────────────────────
  // Destruir mapa previo si existe (evita error "Map container already initialized")
  if (window._leafletMap) {
    try { window._leafletMap.off(); window._leafletMap.remove(); } catch(e) {}
    window._leafletMap = null;
  }
  // Limpiar estado interno de Leaflet del contenedor
  const mapContainer = document.getElementById('leafletMap');
  if (mapContainer) {
    // Vaciar el contenedor completamente para reinicio limpio
    mapContainer.innerHTML = '';
    // Limpiar propiedades internas de Leaflet
    delete mapContainer._leaflet_id;
    if (mapContainer._leaflet) delete mapContainer._leaflet;
  }

  const map = L.map('leafletMap', {
    center: [-1.2688, -78.6244],
    zoom: 16.5,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
  }).addTo(map);

  // ── ARISTAS (caminos) ─────────────────────────
  const lineasMap = {};
  const procesadas = new Set();

  aristasData.forEach(a => {
    const nO = grafo.nodos.get(a.o);
    const nD = grafo.nodos.get(a.d);
    if (!nO || !nD) return;
    
    const keyA = `${a.o}-${a.d}`;
    const keyB = `${a.d}-${a.o}`;
    if (procesadas.has(keyA) || procesadas.has(keyB)) return;
    procesadas.add(keyA);

    const linea = L.polyline(
      [[nO.lat, nO.lng], [nD.lat, nD.lng]],
      { color: '#AAAAAA', weight: 2, opacity: 0.6, dashArray: '6,4' }
    ).addTo(map);
    linea.bindTooltip(`${a.p} m`, { sticky: true });
    lineasMap[keyA] = linea;
    lineasMap[keyB] = linea;
  });

  // ── ICONOS ───────────────────────────────────────────────
  function crearIcono(color, emoji, grande = false) {
    const s = grande ? 40 : 28;
    return L.divIcon({
      className: '',
      html: `<div style="
        background:${color};
        border:2px solid #fff;
        border-radius:50%;
        width:${s}px;height:${s}px;
        display:flex;align-items:center;justify-content:center;
        font-size:${grande ? 16 : 13}px;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
      ">${emoji}</div>`,
      iconSize: [s, s],
      iconAnchor: [s/2, s/2],
      popupAnchor: [0, -(s/2 + 4)],
    });
  }

  // ── MARCADORES ───────────────────────────────────────────
  nodosData.forEach(n => {
    const grande = n.tipo === 'principal';
    L.marker([n.lat, n.lng], { icon: crearIcono(n.color, n.icono, grande) })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:'Inter',sans-serif;text-align:center;padding:4px 0">
          <div style="font-size:20px;margin-bottom:4px">${n.icono}</div>
          <strong style="font-size:12px;color:#1a0b0d;display:block">${n.nombre}</strong>
          <span style="font-size:9px;color:#888;background:#f4f4f4;padding:2px 6px;border-radius:20px;display:inline-block;margin-top:4px">${n.tipo}</span>
        </div>
      `, { maxWidth: 200 });
  });

  // ── RUTA ACTIVA ─────────────────────────────────────────
  let rutaPolyline = null;
  let marcadoresRuta = [];

  function limpiarRuta() {
    if (rutaPolyline) { map.removeLayer(rutaPolyline); rutaPolyline = null; }
    marcadoresRuta.forEach(m => map.removeLayer(m));
    marcadoresRuta = [];
    Object.values(lineasMap).forEach(l =>
      l.setStyle({ color: '#AAAAAA', weight: 2, opacity: 0.6, dashArray: '6,4' })
    );
  }

  function dibujarRuta(camino) {
    limpiarRuta();
    if (!camino || camino.length < 2) return;

    const coords = camino.map(id => {
      const n = grafo.nodos.get(id);
      return [n.lat, n.lng];
    });

    rutaPolyline = L.polyline(coords, {
      color: '#B91C31', weight: 5, opacity: 0.9,
      lineJoin: 'round', lineCap: 'round',
    }).addTo(map);

    for (let i = 0; i < camino.length - 1; i++) {
      const key = `${camino[i]}-${camino[i+1]}`;
      if (lineasMap[key]) {
        lineasMap[key].setStyle({ color: '#B91C31', weight: 4, opacity: 1, dashArray: '' });
      }
    }

    const nI = grafo.nodos.get(camino[0]);
    const nF = grafo.nodos.get(camino[camino.length - 1]);
    
    if (nI && nF) {
      const pinA = L.marker([nI.lat, nI.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:#27AE60;color:#fff;border:2px solid #fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">A</div>`,
          iconSize: [24, 24], iconAnchor: [12, 12],
        })
      }).addTo(map);
      
      const pinB = L.marker([nF.lat, nF.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:#B91C31;color:#fff;border:2px solid #fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">B</div>`,
          iconSize: [24, 24], iconAnchor: [12, 12],
        })
      }).addTo(map);
      
      marcadoresRuta.push(pinA, pinB);
    }

    map.fitBounds(rutaPolyline.getBounds(), { padding: [50, 50] });
  }

  // ── CALCULAR RUTA ────────────────────────────────────────
  const calcularBtn = document.getElementById('calcularRutaBtn');
  if (calcularBtn) {
    calcularBtn.addEventListener('click', () => {
      const d = document.getElementById('desde')?.value;
      const h = document.getElementById('hasta')?.value;

      if (!d || !h) {
        if (window.showToast) window.showToast('Seleccione origen y destino', 'warning');
        return;
      }
      if (d === h) {
        if (window.showToast) window.showToast('El origen y destino deben ser diferentes', 'warning');
        return;
      }

      const result = grafo.dijkstra(d, h);

      if (!result.camino.length || result.distancia === Infinity) {
        if (window.showToast) window.showToast('No se encontró ruta entre los puntos seleccionados', 'error');
        return;
      }

      dibujarRuta(result.camino);

      const nombres = result.camino.map(id => grafo.nodos.get(id)?.nombre || id);
      const tiempoMin = Math.ceil(result.distancia / 80);

      const rutaResult = document.getElementById('rutaResult');
      const rutaPath = document.getElementById('rutaPath');
      const rutaDist = document.getElementById('rutaDist');
      
      if (rutaResult) rutaResult.style.display = 'block';
      if (rutaPath) {
        rutaPath.innerHTML = nombres.map((n, i) =>
          i < nombres.length - 1 ? `${n} →` : n
        ).join(' ');
      }
      if (rutaDist) {
        rutaDist.textContent = `📍 Distancia: ${result.distancia} m · 🚶 Tiempo estimado: ~${tiempoMin} min`;
      }

      if (window.pushHistorial) {
        window.pushHistorial(
          `Ruta: ${nombres[0]} → ${nombres[nombres.length - 1]} (${result.distancia} m)`,
          'Rutas', 'info'
        );
      }
    });
  }

  // Corregir tiles al activar el tab de rutas
  const rutasLink = document.querySelector('[data-page="rutas"]');
  if (rutasLink) {
    rutasLink.addEventListener('click', () => {
      setTimeout(() => map.invalidateSize(), 200);
    });
  }

  window._leafletMap = map;

  // Force resize after tiles load - fixes blank map when div was hidden
  setTimeout(() => { try { map.invalidateSize(); } catch(e){} }, 300);
  setTimeout(() => { try { map.invalidateSize(); } catch(e){} }, 800);
};