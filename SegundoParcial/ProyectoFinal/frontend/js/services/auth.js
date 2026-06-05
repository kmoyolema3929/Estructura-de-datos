/**
 * SmartCampus UTA - Módulo de Autenticación y Roles
 */

// Roles del sistema
const ROLES = {
  ADMINISTRADOR: 'Administrador',
  SECRETARIA: 'Secretaria',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
  PERSONAL_ADMINISTRATIVO: 'Personal Administrativo'
};

// Permisos por rol
const PERMISOS = {
  [ROLES.ADMINISTRADOR]: [
    'dashboard', 'turnos', 'tramites', 'documentos', 
    'rutas', 'historial', 'usuarios', 'reportes'
  ],
  [ROLES.SECRETARIA]: [
    'dashboard', 'turnos', 'tramites', 'documentos', 'historial'
  ],
  [ROLES.DOCENTE]: [
    'dashboard', 'tramites', 'documentos', 'rutas', 'historial'
  ],
  [ROLES.ESTUDIANTE]: [
    'dashboard', 'tramites', 'documentos', 'rutas', 'historial'
  ],
  [ROLES.PERSONAL_ADMINISTRATIVO]: [
    'dashboard', 'turnos', 'tramites', 'documentos', 'historial'
  ]
};

// Obtener el rol del usuario actual
function getCurrentUserRole() {
  const session = sessionStorage.getItem('smartcampus_session');
  if (!session) return null;
  const user = JSON.parse(session);
  return user.rol;
}

// Obtener el usuario actual
function getCurrentUser() {
  const session = sessionStorage.getItem('smartcampus_session');
  if (!session) return null;
  return JSON.parse(session);
}

// Verificar si hay sesión activa
async function isAuthenticated() {

  try {

    const {
      data: { session }
    } = await window.supabase.auth.getSession();

    return session !== null;

  } catch (error) {

    console.error('Error verificando sesión:', error);

    return false;
  }
}
// Verificar si el usuario tiene permiso
function tienePermiso(rol, pagina) {
  const permisosRol = PERMISOS[rol] || [];
  return permisosRol.includes(pagina);
}

// Redirigir según el rol
function redirectByRole(rol) {
  const roleRedirects = {
    [ROLES.ADMINISTRADOR]: 'admin.html',
    [ROLES.SECRETARIA]: 'secretaria.html',
    [ROLES.DOCENTE]: 'docente.html',
    [ROLES.ESTUDIANTE]: 'estudiante.html',
    [ROLES.PERSONAL_ADMINISTRATIVO]: 'personal.html'
  };
  
  const redirectPage = roleRedirects[rol] || 'login.html';
  window.location.href = redirectPage;
}

// Cerrar sesión
  async function logout() {

    try {

      // cerrar sesión Supabase
      if (window.supabase) {

        await window.supabase.auth.signOut();
      }

      // limpiar almacenamiento local
      sessionStorage.removeItem('smartcampus_session');

      localStorage.removeItem('smartcampus_current_user');

      // mensaje
      if (window.showToast) {

        window.showToast(
          'Sesión cerrada correctamente',
          'success'
        );
      }

      // redirigir
      setTimeout(() => {

        window.location.href = 'login.html';

      }, 500);

    } catch (error) {

      console.error('Error al cerrar sesión:', error);

      // forzar limpieza
      sessionStorage.removeItem('smartcampus_session');

      localStorage.removeItem('smartcampus_current_user');

      window.location.href = 'login.html';
    }
  }

// Push al historial
async function pushHistorial(accion, modulo, estado = 'info') {
  const user = getCurrentUser();
  const entrada = {
    accion,
    modulo,
    estado,
    usuario: user ? user.nombre : 'Sistema',
    ts: new Date()
  };
  
  if (window.Storage && window.AppStorage.addHistorial) {
    await window.AppStorage.addHistorial(entrada);
  }
  
  return entrada;
}

// Exportar para uso global
window.Auth = {
  ROLES,
  PERMISOS,
  tienePermiso,
  getCurrentUserRole,
  getCurrentUser,
  isAuthenticated,
  redirectByRole,
  logout,
  pushHistorial
};