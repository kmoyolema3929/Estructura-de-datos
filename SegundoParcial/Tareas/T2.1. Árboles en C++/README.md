# Arbol BST Empresarial en C++

## Datos del proyecto
- Asignatura: Estructura de Datos
- Tema: Arboles en C++
- Tipo: Trabajo Individual

## Objetivo
Implementar un Arbol Binario de Busqueda (BST) en C++ para organizar empleados de una empresa utilizando un codigo numerico como clave, permitiendo inserciones, busquedas y recorridos eficientes.

## Integrante
- Nombre: Katherine Lissette Moyolema Criollo

## Funcionalidades
| Funcionalidad | Estado |
|---------------|--------|
| Insertar empleados | SI |
| Buscar empleados por codigo | SI |
| Mostrar raiz del arbol | SI |
| Recorrido inorden | SI |
| Recorrido preorden | SI |
| Recorrido postorden | SI |
| Calcular altura del arbol | SI |
| Mostrar nodos hoja | SI |

## Datos de prueba insertados
| Codigo | Nombre | Cargo |
|--------|--------|-------|
| 50 | Empresa UTA | Raiz |
| 30 | Gerente Ventas | Nodo interno |
| 70 | Gerente Finanzas | Nodo interno |
| 20 | Emp 1 | Hoja |
| 40 | Emp 2 | Hoja |
| 60 | Emp 3 | Hoja |
| 80 | Emp 4 | Hoja |

## Capturas de ejecucion

1. <a href="Capturas/Captura1_menu.PNG" target="_blank">Menu principal</a>
2. <a href="Capturas/Captura2_insersion.PNG" target="_blank">Insercion de empleados</a>
3. <a href="Capturas/Captura2_busqueda.PNG" target="_blank">Busqueda de empleado</a>
4. <a href="Capturas/Captura3_raiz.PNG" target="_blank">Mostrar raiz</a>
5. <a href="Capturas/Captura4_inorden.PNG" target="_blank">Recorrido Inorden</a>
6. <a href="Capturas/Captura5_preorden.PNG" target="_blank">Recorrido Preorden</a>
7. <a href="Capturas/Captura6_postorden.PNG" target="_blank">Recorrido Postorden</a>
8. <a href="Capturas/Captura7_altura.PNG" target="_blank">Altura del arbol</a>
9. <a href="Capturas/Captura8_hojas.PNG" target="_blank">Nodos hoja</a>

## Conceptos clave
| Concepto | Explicacion | Ejemplo en el arbol |
|----------|-------------|---------------------|
| Raiz | Primer nodo del arbol | Codigo 50 - Empresa UTA |
| Nodo interno | Nodo con al menos un hijo | Codigos 30 y 70 |
| Hoja | Nodo sin hijos | Codigos 20, 40, 60, 80 |
| Nivel | Distancia desde la raiz | Raiz nivel 0, hijos nivel 1 |
| Altura | Maximo numero de niveles | Altura = 3 |

## Estructura del proyecto

- `Grupo1/`
  - `src/`
    - `ArbolBST.cpp`
    - `ArbolBST.h`
    - `Empleado.h`
    - `Nodo.cpp`
    - `Nodo.h`
    - `main.cpp`
  - `Capturas/`
    - `Captura1_menu.PNG`
    - `Captura2_busqueda.PNG`
    - `Captura2_insersion.PNG`
    - `Captura3_raiz.PNG`
    - `Captura4_inorden.PNG`
    - `Captura5_preorden.PNG`
    - `Captura6_postorden.PNG`
    - `Captura7_altura.PNG`
    - `Captura8_hojas.PNG`
  - `README.md`

## Como compilar y ejecutar

### 1. Descargar o clonar el repositorio

**Clonar con Git:**
```bash
git clone https://github.com/kmoyolema3929/G1-ArbolBST-Empresarial
```
#### Pasos para clonar

```bash
 1. Navegar a la carpeta donde quieres guardar el proyecto
cd Documentos/Proyectos

 2. Clonar el repositorio
git clone https://github.com/kmoyolema3929/G1-ArbolBST-Empresarial.git

 3. Entrar a la carpeta del proyecto
cd G1-ArbolBST-Empresarial

 4. Verificar que se clono correctamente
ls
```
**Descargar como ZIP:**
- Entrar al repositorio en GitHub
- Hacer clic en el boton verde "Code"
- Seleccionar "Download ZIP"
- Extraer el archivo ZIP en una carpeta

### 2. Ejecutar en Visual Studio Code

**Paso 1:** Abrir Visual Studio Code

**Paso 2:** Abrir la carpeta del proyecto
- Ir a "Archivo" -> "Abrir carpeta"
- Seleccionar la carpeta donde descargaste o clonaste el repositorio

**Paso 3:** Instalar la extension de C++ (si no la tienes)
- Ir a extensiones (Ctrl + Shift + X)
- Buscar "C/C++" de Microsoft
- Hacer clic en "Instalar"

**Paso 4:** Abrir la terminal integrada
- Presionar `Ctrl + Ñ` o `Ctrl + J`
- O ir a "Terminal" -> "Nueva terminal"

**Paso 5:** Compilar el programa

En la terminal, escribir:
```bash
g++ src/Nodo.cpp src/ArbolBST.cpp src/main.cpp -o arbol
```

**Paso 6:** Ejecutar el programa

En Linux / Mac:
```bash
./arbol
```

En Windows:
```bash
arbol.exe
```
## Requisitos tecnicos

- Compilador: g++ (MinGW en Windows, GCC en Linux/Mac)
- Tener Git instalado en tu computadora
- IDE recomendado: Visual Studio Code
- Sistema operativo: Windows, Linux o Mac
- Conocimientos previos: Estructura de datos, Arboles BST, C++ basico
  
## Conclusion
El Arbol Binario de Busqueda (BST) permite:
- Organizar jerarquicamente a los empleados
- Busquedas eficientes en tiempo O(log n)
- Recorridos ordenados automaticos (inorden)
- Identificar facilmente nodos raiz, internos y hojas

## Repositorio
[GitHub - Proyecto Arbol BST Empresarial](https://github.com/kmoyolema3929/G1-ArbolBST-Empresarial)
