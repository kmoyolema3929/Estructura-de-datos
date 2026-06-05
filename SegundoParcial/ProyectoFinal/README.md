<div align="center">

# 🏛️ SmartCampus UTA

### Sistema de Gestión Universitaria con Estructuras de Datos

[![Universidad](https://img.shields.io/badge/Universidad%20Técnica%20de%20Ambato-red?style=for-the-badge)](https://uta.edu.ec)
[![Asignatura](https://img.shields.io/badge/Estructura%20de%20Datos-darkred?style=for-the-badge)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

*Plataforma web universitaria que implementa 7 estructuras de datos clásicas en un entorno real*

</div>

---

## 👥 Equipo de Desarrollo

| Integrante | Módulo | Rama |
|---|---|---|
| 👑 **Monse** *(Líder)* | Admin Dashboard + Mapa del Campus | `feature/admin-mapa` |
| **Jair** | Autenticación y Seguridad | `feature/auth` |
| **Alina** | Dashboard Estudiante | `feature/dashboard-estudiante` |
| **Katherine** | Dashboard Secretaría | `feature/dashboard-secretaria` |
| **Rolando** | Dashboard Docente / Personal | `feature/dashboard-docente` |

> **Rama principal:** `develop` — todos los PR deben apuntar aquí.

---

## 📋 Descripción

SmartCampus UTA es un sistema web de gestión universitaria desarrollado para el **Campus Huachi** de la Universidad Técnica de Ambato. El proyecto demuestra la aplicación práctica de estructuras de datos en un entorno universitario real, con cinco roles de usuario diferenciados y comunicación en tiempo real vía Supabase Realtime.

---

## 🏗️ Arquitectura

```
SmartUta/frontend/
├── index.html                    # Landing page
├── _redirects                    # Netlify redirects
├── css/
│   └── main.css                  # Estilos globales
├── pages/
│   ├── admin.html                # Dashboard Administrador
│   ├── secretaria.html           # Dashboard Secretaría
│   ├── docente.html              # Dashboard Docente
│   ├── estudiante.html           # Dashboard Estudiante
│   ├── personal.html             # Dashboard Personal Administrativo
│   ├── login.html
│   ├── register.html
│   └── forgot-password.html
└── js/
    ├── config/
    │   └── supabase-config.js    # Credenciales Supabase
    ├── services/
    │   ├── auth.js               # Autenticación y roles
    │   └── data.js               # AppStorage + fallback localStorage
    ├── utils/
    │   ├── structures.js         # ⭐ 7 estructuras de datos
    │   └── dashboard-utils.js    # Utilidades compartidas + árbol docs
    └── dashboards/
        ├── app.js                # Lógica Admin
        ├── estudiante-dashboard.js
        ├── secretaria-dashboard.js
        ├── docente-dashboard.js
        ├── personal-dashboard.js
        └── campus-map.js         # Mapa + Dijkstra
```

---

## 🧩 Estructuras de Datos Implementadas

Todas implementadas **desde cero** en `js/utils/structures.js` — sin librerías externas.

| Estructura | Módulo | Descripción |
|---|---|---|
| **Cola (FIFO)** | Turnos de atención | Fila ordenada por `hora_cita` — el primero en llegar es atendido primero |
| **Pila (LIFO)** | Historial de acciones | Las acciones más recientes aparecen primero |
| **Lista Simple** | Trámites | Inserción, búsqueda y eliminación de trámites |
| **Lista Doble** | Expedientes | Navegación bidireccional ↔ entre registros |
| **Lista Circular** | Ventanillas | Rotación Round-Robin entre ventanillas de atención |
| **Árbol N-ario** | Documentos | Jerarquía: Categorías → Subcarpetas → Archivos |
| **Grafo + Dijkstra** | Mapa del campus | 15 nodos GPS reales, rutas mínimas en metros |

---

## ⚙️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript Vanilla (sin frameworks) |
| Backend / DB | Supabase (PostgreSQL + Storage + Realtime) |
| Mapas | Leaflet.js 1.9.4 + OpenStreetMap |
| Almacenamiento | Supabase Storage (PDFs y DOCX) |
| Tiempo real | Supabase Realtime (WebSockets) |
| Despliegue | Netlify |

---

## 👤 Roles y Funcionalidades

<details>
<summary><b>🔴 Administrador</b></summary>

- Gestión completa de usuarios (crear, filtrar por rol/estado, activar/inactivar)
- Ver y cambiar estado de todos los trámites + observaciones
- Árbol documental: crear carpetas padre/subcarpetas, subir PDF/DOCX
- Reportes con filtros (tipo, rol, estado, fecha, usuario) → exportar Excel/PDF
- Reporte individual por usuario con historial completo
- Historial de acciones del sistema
- Mapa del campus con rutas Dijkstra

</details>

<details>
<summary><b>🟠 Secretaria</b></summary>

- Cola FIFO de turnos ordenada por `hora_cita` (solo turnos de hoy)
- Llamar / Atender turnos (habilitado solo en horario laboral: 08:00–13:00 y 14:00–17:00)
- Validación: no puede atender un turno antes de su hora asignada
- Ver y actualizar estado de trámites + observaciones
- Reportes de turnos y trámites → exportar Excel/PDF
- Árbol de documentos con descarga
- Mapa del campus

</details>

<details>
<summary><b>🔵 Docente</b></summary>

- Crear trámites (tipos cargados dinámicamente desde BD)
- Ver estado de sus trámites en tiempo real (Supabase Realtime)
- Notificación automática al cambiar estado
- Árbol de documentos con visualización y descarga
- Mapa del campus

</details>

<details>
<summary><b>🟢 Estudiante</b></summary>

- Solicitar turno: servicio + fecha (L-V) + hora disponible
- Horas filtradas: sin horas pasadas ni ya ocupadas por otro usuario
- Cancelar turno (solo si está Esperando y la hora no pasó)
- Historial de turnos (Pendiente → Llamado → Finalizado / Caducado)
- Crear trámites y ver su estado en tiempo real
- Árbol de documentos con descarga
- Mapa del campus

</details>

<details>
<summary><b>⚪ Personal Administrativo</b></summary>

- Estadísticas del sistema
- Árbol de documentos con descarga

</details>

---

## 🗄️ Base de Datos

```sql
usuario(id_usuario, nombre, email, password_hash, estado, id_rol)
rol(id_rol, nombre)
turno(id_turno, numero, id_usuario, tipo_servicio, estado, fecha_cita, hora_cita, atendido_en)
tramite(id_tramite, codigo, id_tipo, id_solicitante, descripcion, estado, observaciones, fecha_reg)
tipotramite(id_tipo, nombre, descripcion, dias_resol, activo)
categoriadocumento(id_categoria, nombre, id_padre, nivel, icono, activo)
documento(id_documento, nombre, id_categoria, id_autor, tipo_archivo, ruta_archivo, version, activo)
historialaccion(id, id_usuario, accion, modulo, estado, usuario_nombre, creado_en)
```

---

## 🚀 Configuración y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-org/smartcampus-uta.git
cd smartcampus-uta
```

### 2. Configurar Supabase
Edita `js/config/supabase-config.js`:
```javascript
const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON = 'TU_ANON_KEY';
```

### 3. Ejecutar localmente
```bash
# Con Node.js
npx serve SmartUta/frontend -l 3000

# O simplemente abre index.html en el navegador
```

### 4. Configurar Supabase Storage
- Crear bucket llamado `documentos` → **Public**
- Ejecutar políticas RLS (ver `/docs/supabase-policies.sql`)

---

## 🔄 Flujo de Trabajo Git

```bash
# Crear tu rama feature
git checkout develop
git pull origin develop
git checkout -b feature/tu-modulo

# Trabajar y commitear
git add .
git commit -m "feat: descripción del cambio"

# Subir y crear PR a develop
git push origin feature/tu-modulo
```

### Convención de commits
```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
style:    formato, sin cambio de lógica
refactor: refactorización de código
```

---

## 📁 Estructura de Ramas

```
main          ← producción (solo merge desde develop)
develop       ← rama principal de integración ← todos los PR aquí
├── feature/auth
├── feature/admin-mapa
├── feature/dashboard-estudiante
├── feature/dashboard-secretaria
└── feature/dashboard-docente
```

---

## 📄 Licencia

Proyecto académico — Universidad Técnica de Ambato · Estructura de Datos · 2026

<div align="center">
<sub>Desarrollado con ❤️ por el equipo SmartCampus UTA</sub>
</div>
