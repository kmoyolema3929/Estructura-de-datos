/**
 * SmartCampus UTA — Estructuras de Datos
 * Implementaciones propias (sin librerías de colecciones)
 * Asignatura: Estructura de Datos | UTA
 */

/* ═══════════════════════════════════════
   NODO GENÉRICO
   ═══════════════════════════════════════ */
class Nodo {
  constructor(dato) {
    this.dato = dato;
    this.siguiente = null;
  }
}

class NodoDoble {
  constructor(dato) {
    this.dato = dato;
    this.siguiente = null;
    this.anterior = null;
  }
}

class NodoArbol {
  constructor(dato) {
    this.dato = dato;
    this.hijos = [];
    this.padre = null;
  }
}

/* ═══════════════════════════════════════
   COLA (QUEUE) — FIFO
   Módulo: Turnos de atención (RF5)
   ═══════════════════════════════════════ */
class Cola {
  constructor() {
    this.frente = null;
    this.fin = null;
    this.tamaño = 0;
  }

  /** Enqueue: agrega al final */
  encolar(dato) {
    const nuevo = new Nodo(dato);
    if (this.fin === null) {
      this.frente = this.fin = nuevo;
    } else {
      this.fin.siguiente = nuevo;
      this.fin = nuevo;
    }
    this.tamaño++;
  }

  /** Dequeue: extrae del frente */
  desencolar() {
    if (this.estaVacia()) return null;
    const valor = this.frente.dato;
    this.frente = this.frente.siguiente;
    if (this.frente === null) this.fin = null;
    this.tamaño--;
    return valor;
  }

  /** Peek: observa sin extraer */
  verFrente() {
    return this.estaVacia() ? null : this.frente.dato;
  }

  estaVacia() { return this.tamaño === 0; }
  getTamaño() { return this.tamaño; }

  /** Convierte la cola a array para visualización */
  toArray() {
    const arr = [];
    let actual = this.frente;
    while (actual !== null) {
      arr.push(actual.dato);
      actual = actual.siguiente;
    }
    return arr;
  }
}

/* ═══════════════════════════════════════
   PILA (STACK) — LIFO
   Módulo: Historial de acciones (RF11)
   ═══════════════════════════════════════ */
class Pila {
  constructor() {
    this.tope = null;
    this.tamaño = 0;
  }

  /** Push: apila elemento */
  apilar(dato) {
    const nuevo = new Nodo(dato);
    nuevo.siguiente = this.tope;
    this.tope = nuevo;
    this.tamaño++;
  }

  /** Pop: desapila elemento */
  desapilar() {
    if (this.estaVacia()) return null;
    const valor = this.tope.dato;
    this.tope = this.tope.siguiente;
    this.tamaño--;
    return valor;
  }

  /** Peek */
  verTope() {
    return this.estaVacia() ? null : this.tope.dato;
  }

  estaVacia() { return this.tamaño === 0; }
  getTamaño() { return this.tamaño; }

  toArray() {
    const arr = [];
    let actual = this.tope;
    while (actual !== null) {
      arr.push(actual.dato);
      actual = actual.siguiente;
    }
    return arr;
  }
}

/* ═══════════════════════════════════════
   LISTA SIMPLEMENTE ENLAZADA
   Módulo: Historial de trámites (RF4, RF6)
   ═══════════════════════════════════════ */
class ListaEnlazada {
  constructor() {
    this.cabeza = null;
    this.tamaño = 0;
  }

  insertarAlFinal(dato) {
    const nuevo = new Nodo(dato);
    if (this.cabeza === null) {
      this.cabeza = nuevo;
    } else {
      let actual = this.cabeza;
      while (actual.siguiente !== null) actual = actual.siguiente;
      actual.siguiente = nuevo;
    }
    this.tamaño++;
  }

  insertarAlInicio(dato) {
    const nuevo = new Nodo(dato);
    nuevo.siguiente = this.cabeza;
    this.cabeza = nuevo;
    this.tamaño++;
  }

  eliminar(id) {
    if (this.cabeza === null) return false;
    if (this.cabeza.dato.id === id) {
      this.cabeza = this.cabeza.siguiente;
      this.tamaño--;
      return true;
    }
    let actual = this.cabeza;
    while (actual.siguiente !== null) {
      if (actual.siguiente.dato.id === id) {
        actual.siguiente = actual.siguiente.siguiente;
        this.tamaño--;
        return true;
      }
      actual = actual.siguiente;
    }
    return false;
  }

  buscar(id) {
    let actual = this.cabeza;
    while (actual !== null) {
      if (actual.dato.id === id) return actual.dato;
      actual = actual.siguiente;
    }
    return null;
  }

  toArray() {
    const arr = [];
    let actual = this.cabeza;
    while (actual !== null) {
      arr.push(actual.dato);
      actual = actual.siguiente;
    }
    return arr;
  }

  getTamaño() { return this.tamaño; }
}

/* ═══════════════════════════════════════
   LISTA DOBLEMENTE ENLAZADA
   Módulo: Expedientes (navegación bidireccional)
   ═══════════════════════════════════════ */
class ListaDoble {
  constructor() {
    this.cabeza = null;
    this.cola = null;
    this.tamaño = 0;
    this.actual = null;
  }

  insertar(dato) {
    const nuevo = new NodoDoble(dato);
    if (this.cabeza === null) {
      this.cabeza = this.cola = nuevo;
    } else {
      nuevo.anterior = this.cola;
      this.cola.siguiente = nuevo;
      this.cola = nuevo;
    }
    if (this.actual === null) this.actual = nuevo;
    this.tamaño++;
  }

  avanzar() {
    if (this.actual && this.actual.siguiente) {
      this.actual = this.actual.siguiente;
      return this.actual.dato;
    }
    return null;
  }

  retroceder() {
    if (this.actual && this.actual.anterior) {
      this.actual = this.actual.anterior;
      return this.actual.dato;
    }
    return null;
  }

  toArray() {
    const arr = [];
    let a = this.cabeza;
    while (a !== null) { arr.push(a.dato); a = a.siguiente; }
    return arr;
  }
}

/* ═══════════════════════════════════════
   LISTA CIRCULAR
   Módulo: Rotación de ventanillas (Round-Robin)
   ═══════════════════════════════════════ */
class ListaCircular {
  constructor() {
    this.actual = null;
    this.tamaño = 0;
  }

  insertar(dato) {
    const nuevo = new Nodo(dato);
    if (this.actual === null) {
      nuevo.siguiente = nuevo;
      this.actual = nuevo;
    } else {
      let ultimo = this.actual;
      while (ultimo.siguiente !== this.actual) ultimo = ultimo.siguiente;
      ultimo.siguiente = nuevo;
      nuevo.siguiente = this.actual;
    }
    this.tamaño++;
  }

  /** Avanza al siguiente (Round-Robin) */
  rotar() {
    if (this.actual) {
      this.actual = this.actual.siguiente;
      return this.actual.dato;
    }
    return null;
  }

  verActual() {
    return this.actual ? this.actual.dato : null;
  }

  toArray() {
    if (!this.actual) return [];
    const arr = [];
    let inicio = this.actual;
    do {
      arr.push(inicio.dato);
      inicio = inicio.siguiente;
    } while (inicio !== this.actual);
    return arr;
  }
}

/* ═══════════════════════════════════════
   ÁRBOL N-ARIO (N-Ary Tree)
   Módulo: Jerarquía de documentos (RF7, RF8)
   ═══════════════════════════════════════ */
class Arbol {
  constructor() {
    this.raiz = null;
    this.nodos = 0;
  }

  /** Crea la raíz del árbol */
  crearRaiz(dato) {
    this.raiz = new NodoArbol(dato);
    this.nodos++;
    return this.raiz;
  }

  /** Inserta hijo en nodo padre dado por id */
  insertarHijo(idPadre, dato) {
    const padre = this._buscar(this.raiz, idPadre);
    if (!padre) return null;
    const hijo = new NodoArbol(dato);
    hijo.padre = padre;
    padre.hijos.push(hijo);
    this.nodos++;
    return hijo;
  }

  _buscar(nodo, id) {
    if (!nodo) return null;
    if (nodo.dato.id === id) return nodo;
    for (const hijo of nodo.hijos) {
      const r = this._buscar(hijo, id);
      if (r) return r;
    }
    return null;
  }

  /** Recorrido en preorden */
  preorden(nodo = this.raiz, nivel = 0) {
    if (!nodo) return [];
    const arr = [{ dato: nodo.dato, nivel }];
    for (const h of nodo.hijos) {
      arr.push(...this.preorden(h, nivel + 1));
    }
    return arr;
  }

  buscar(id) { return this._buscar(this.raiz, id); }
}

/* ═══════════════════════════════════════
   GRAFO (Lista de Adyacencia)
   Módulo: Mapa del campus, rutas (RF9, RF10)
   ═══════════════════════════════════════ */
class Grafo {
  constructor() {
    this.adyacencia = new Map();   // nodo -> [{nodo, peso}]
    this.nodos = new Map();        // id -> {id, nombre, x, y, tipo}
  }

  agregarNodo(id, datos) {
    this.nodos.set(id, { id, ...datos });
    if (!this.adyacencia.has(id)) this.adyacencia.set(id, []);
  }

  agregarArista(origen, destino, peso = 1) {
    if (!this.adyacencia.has(origen)) this.adyacencia.set(origen, []);
    if (!this.adyacencia.has(destino)) this.adyacencia.set(destino, []);
    this.adyacencia.get(origen).push({ nodo: destino, peso });
    this.adyacencia.get(destino).push({ nodo: origen, peso }); // no dirigido
  }

  /** BFS — Búsqueda en anchura para ruta más corta (saltos) */
  bfs(inicio, fin) {
    if (!this.adyacencia.has(inicio) || !this.adyacencia.has(fin)) return null;
    const visitados = new Set();
    const cola = [[inicio, [inicio]]];
    visitados.add(inicio);

    while (cola.length > 0) {
      const [nodoActual, camino] = cola.shift();
      if (nodoActual === fin) return camino;
      for (const { nodo } of (this.adyacencia.get(nodoActual) || [])) {
        if (!visitados.has(nodo)) {
          visitados.add(nodo);
          cola.push([nodo, [...camino, nodo]]);
        }
      }
    }
    return null;
  }

  /** Dijkstra — Camino mínimo por peso */
  dijkstra(inicio, fin) {
    const dist = new Map();
    const prev = new Map();
    const pq = [];

    for (const id of this.nodos.keys()) dist.set(id, Infinity);
    dist.set(inicio, 0);
    pq.push({ nodo: inicio, dist: 0 });

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const { nodo: u } = pq.shift();
      if (u === fin) break;

      for (const { nodo: v, peso } of (this.adyacencia.get(u) || [])) {
        const alt = dist.get(u) + peso;
        if (alt < dist.get(v)) {
          dist.set(v, alt);
          prev.set(v, u);
          pq.push({ nodo: v, dist: alt });
        }
      }
    }

    const camino = [];
    let actual = fin;
    while (actual !== undefined) {
      camino.unshift(actual);
      actual = prev.get(actual);
    }
    return { camino, distancia: dist.get(fin) };
  }

  getVecinos(id) { return this.adyacencia.get(id) || []; }
  getNodos()     { return Array.from(this.nodos.values()); }
  getAristas() {
    const aristas = [];
    const visto = new Set();
    for (const [origen, vecinos] of this.adyacencia) {
      for (const { nodo: destino, peso } of vecinos) {
        const key = [origen, destino].sort().join('-');
        if (!visto.has(key)) { visto.add(key); aristas.push({ origen, destino, peso }); }
      }
    }
    return aristas;
  }
}

// Exportar al scope global (entorno browser)
window.Cola = Cola;
window.Pila = Pila;
window.ListaEnlazada = ListaEnlazada;
window.ListaDoble = ListaDoble;
window.ListaCircular = ListaCircular;
window.Arbol = Arbol;
window.Grafo = Grafo;
