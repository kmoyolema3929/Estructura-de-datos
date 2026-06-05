/**
 * SmartCampus UTA - Storage con Supabase y Datos Locales
 */

// Función auxiliar para hashear contraseñas
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.AppStorage = {

// ── LOGIN ──────────────────────────────────────
  async login(email, password) {

    try {

      // ── BUSCAR USUARIO EN SUPABASE ─────────────
      const { data: userData, error: userError } =
        await window.supabase
          .from('usuario')
          .select('*')
          .eq('email', email)
          .single();

      if (userError || !userData) {

        throw new Error('Usuario no encontrado');
      }

      // ── VERIFICAR ESTADO ───────────────────────
      if (userData.estado !== 'Activo') {

        throw new Error('Usuario inactivo');
      }

      // ── HASH DE CONTRASEÑA INGRESADA ───────────
      const passwordHash = await hashPassword(password);

      // ── COMPARAR PASSWORDS ─────────────────────
      // Soportar tanto SHA-256 como btoa (compatibilidad)
      const btoaHash = btoa(password);
      const passwordMatch = 
        userData.password_hash === passwordHash ||
        userData.password_hash === btoaHash ||
        userData.password_hash === password; // texto plano (demo)

      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }

      // ── OBTENER ROL ────────────────────────────
      const { data: rolData } = await window.supabase
        .from('rol')
        .select('nombre')
        .eq('id_rol', userData.id_rol)
        .single();

      // ── RETORNAR SESIÓN ────────────────────────
      return {

        token: btoa(`${email}:${Date.now()}`),

        user: {

          id: userData.id_usuario,

          nombre: userData.nombre,

          email: userData.email,

          rol: rolData?.nombre || 'Usuario'
        }
      };

    } catch (error) {

      console.error('Login error:', error);

      throw error;
    }
  },

  // ── REGISTER  ─────────────────────────────
  async register(usuario) {

    try {

      // ── VALIDACIÓN DE CONTRASEÑA ─────────────────
      const password = usuario.password;

      const tieneMayuscula = /[A-Z]/.test(password);
      const tieneMinuscula = /[a-z]/.test(password);
      const tieneNumero = /[0-9]/.test(password);
      const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (
        password.length < 8 ||
        !tieneMayuscula ||
        !tieneMinuscula ||
        !tieneNumero ||
        !tieneEspecial
      ) {

        throw new Error(
          'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo'
        );
      }

      // ── VERIFICAR SI EL EMAIL YA EXISTE ──────────
      const { data: existingUser } = await window.supabase
        .from('usuario')
        .select('email')
        .eq('email', usuario.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('El correo ya está registrado');
      }

      // ── HASH DE CONTRASEÑA ───────────────────────
      const passwordHash = await hashPassword(
        usuario.password
      );

      // ── OBTENER ID DEL ROL ───────────────────────
      const { data: rolData, error: rolError } =
        await window.supabase
          .from('rol')
          .select('id_rol')
          .eq('nombre', usuario.rol)
          .single();

      if (rolError) {

        throw new Error('No se pudo obtener el rol');
      }

      // ── INSERTAR EN TABLA USUARIO ────────────────
      const { data: newUser, error: insertError } = await window.supabase
        .from('usuario')
        .insert({
          nombre: usuario.nombre,
          email: usuario.email,
          password_hash: passwordHash,
          id_rol: rolData.id_rol,
          estado: 'Activo'
        })
        .select()
        .single();

      if (insertError) {

        throw new Error(insertError.message);
      }

      return {

        message: 'Usuario registrado exitosamente',

        user: {
          id: newUser.id_usuario,

          nombre: usuario.nombre,

          email: usuario.email,

          rol: usuario.rol
        }
      };

    } catch (error) {

      console.error('Register error:', error);

      throw error;
    }
  },

  // ── GET USUARIOS ───────────────────────────────
  getUsuarios() {
    return JSON.parse(localStorage.getItem('sc_usuarios') || '[]');
  },

  // ── UPDATE USUARIO ─────────────────────────────
  updateUsuario(id, updates) {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios[index] = { ...usuarios[index], ...updates };
      localStorage.setItem('sc_usuarios', JSON.stringify(usuarios));
    }
  },

  // ── ADD USUARIO ────────────────────────────────
  addUsuario(usuario) {
    const usuarios = this.getUsuarios();
    const nuevo = {
      id: Date.now(),
      ...usuario,
      contrasena: '',
      fechaRegistro: new Date().toISOString()
    };
    usuarios.push(nuevo);
    localStorage.setItem('sc_usuarios', JSON.stringify(usuarios));
    return nuevo;
  },

  // ── GET TRÁMITES ───────────────────────────────
  getTramites() {
    return JSON.parse(localStorage.getItem('sc_tramites') || '[]');
  },

  // ── ADD TRÁMITE ────────────────────────────────
  addTramite(tramite) {
    const tramites = this.getTramites();
    tramites.push(tramite);
    localStorage.setItem('sc_tramites', JSON.stringify(tramites));
  },

  // ── UPDATE TRÁMITE ─────────────────────────────
  updateTramite(id, updates) {
    const tramites = this.getTramites();
    const index = tramites.findIndex(t => t.id === id);
    if (index !== -1) {
      tramites[index] = { ...tramites[index], ...updates };
      localStorage.setItem('sc_tramites', JSON.stringify(tramites));
    }
  },

  // ── GET TURNOS ─────────────────────────────────
  getTurnos() {
    return JSON.parse(localStorage.getItem('sc_turnos') || '[]');
  },

  // ── SAVE TURNOS ────────────────────────────────
  saveTurnos(turnos) {
    localStorage.setItem('sc_turnos', JSON.stringify(turnos));
  },

  // ── ADD TURNO ──────────────────────────────────
  addTurno(turno) {
    const turnos = this.getTurnos();
    turnos.push(turno);
    this.saveTurnos(turnos);
  },

  // ── ATENDER TURNO ──────────────────────────────
  atenderTurno(numero) {
    const turnos = this.getTurnos();
    const index = turnos.findIndex(t => t.numero === numero);
    if (index !== -1) {
      turnos[index].estado = 'Atendido';
      this.saveTurnos(turnos);
    }
  },

  // ── GET HISTORIAL ──────────────────────────────
  getHistorial() {
    return JSON.parse(localStorage.getItem('sc_historial') || '[]');
  },

  // ── ADD HISTORIAL ──────────────────────────────
  addHistorial(entrada) {
    const historial = this.getHistorial();
    historial.unshift(entrada);
    if (historial.length > 100) historial.pop();
    localStorage.setItem('sc_historial', JSON.stringify(historial));
  },

  // ── CLEAR HISTORIAL ────────────────────────────
  clearHistorial() {
    localStorage.setItem('sc_historial', '[]');
  },

  // ── GET STATS ──────────────────────────────────
  getStats() {
    const tramites = this.getTramites();
    const turnos = this.getTurnos();
    const usuarios = this.getUsuarios();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    
    return {
      turnosAtendidos: turnos.filter(t => t.estado === 'Atendido').length,
      tramitesCompletados: tramites.filter(t => t.estado === 'Completado').length,
      usuariosNuevosMes: usuarios.filter(u => new Date(u.fechaRegistro) > fechaLimite).length
    };
  },

  // ── UPDATE STATS ────────────────────────────────
  updateStats(stats) {
    const currentStats = this.getStats();
    const newStats = { ...currentStats, ...stats };
    localStorage.setItem('sc_stats', JSON.stringify(newStats));
  },

  // ── INCREMENT TURNO COUNTER ────────────────────
  incrementTurnoCounter() {
    const lastNum = parseInt(localStorage.getItem('sc_turnoCounter') || '100');
    const newNum = lastNum + 1;
    localStorage.setItem('sc_turnoCounter', newNum.toString());
    return newNum;
  }
};

// ── DATOS GLOBALES DB ──────────────────────────────────
window.DB = {
  ventanillas: ['Secretaría', 'Finanzas', 'Académico', 'Bienestar'],
  tramites: [],
  documentosTree: {
    id: 'root',
    nombre: 'Documentos UTA',
    icono: 'fa-university',
    docs: [],
    hijos: [
      {
        id: 'academico',
        nombre: 'Académico',
        icono: 'fa-graduation-cap',
        docs: [],
        hijos: [
          { id: 'reglamentos', nombre: 'Reglamentos',        icono: 'fa-file-alt', hijos: [], docs: [] },
          { id: 'mallas',      nombre: 'Mallas Curriculares', icono: 'fa-file-alt', hijos: [], docs: [] },
          { id: 'silabus',     nombre: 'Silabus',             icono: 'fa-file-alt', hijos: [], docs: [] }
        ]
      },
      {
        id: 'administrativo',
        nombre: 'Administrativo',
        icono: 'fa-folder',
        docs: [],
        hijos: [
          { id: 'formularios', nombre: 'Formularios', icono: 'fa-file-alt', hijos: [], docs: [] },
          { id: 'actas',       nombre: 'Actas',       icono: 'fa-file-alt', hijos: [], docs: [] }
        ]
      },
      {
        id: 'financiero',
        nombre: 'Financiero',
        icono: 'fa-dollar-sign',
        hijos: [],
        docs: []
      }
    ]
  }
};

// ── INICIALIZAR DATOS LOCALES (SOLO TRÁMITES, TURNOS, ETC.) ──
(function initLocalData() {
  // Trámites por defecto
  if (!localStorage.getItem('sc_tramites')) {
    const defaultTramites = [
      { id: 'T-001', solicitante: 'Juan Pérez', tipo: 'Certificado', fecha: '2025-01-15', estado: 'Completado', descripcion: 'Certificado de matrícula' },
      { id: 'T-002', solicitante: 'María García', tipo: 'Beca', fecha: '2025-01-20', estado: 'En proceso', descripcion: 'Solicitud de beca académica' },
      { id: 'T-003', solicitante: 'Carlos López', tipo: 'Transferencia', fecha: '2025-01-25', estado: 'Pendiente', descripcion: 'Cambio de carrera' },
      { id: 'T-004', solicitante: 'Ana López', tipo: 'Certificado', fecha: '2025-02-01', estado: 'Pendiente', descripcion: 'Certificado de notas' }
    ];
    localStorage.setItem('sc_tramites', JSON.stringify(defaultTramites));
  }
  
  // Turnos por defecto
  if (!localStorage.getItem('sc_turnos')) {
    localStorage.setItem('sc_turnos', '[]');
  }
  
  // Contador de turnos
  if (!localStorage.getItem('sc_turnoCounter')) {
    localStorage.setItem('sc_turnoCounter', '100');
  }
  
  // Historial
  if (!localStorage.getItem('sc_historial')) {
    localStorage.setItem('sc_historial', '[]');
  }
  
  console.log('Datos locales inicializados correctamente');
})();

console.log('Storage y DB inicializados');
window.Storage = window.AppStorage;
console.log('AppStorage.register es:', typeof AppStorage.register);