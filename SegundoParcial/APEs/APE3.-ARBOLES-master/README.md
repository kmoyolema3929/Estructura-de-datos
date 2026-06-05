# Práctica de Estructuras de Datos: Árboles

El objetivo de este repositorio es proporcionarles un entorno práctico donde puedan aplicar los conceptos teóricos vistos en clase relacionados con árboles N-arios, árboles binarios, recorridos y transformaciones.

## Objetivos de Aprendizaje

Al completar estos ejercicios, serán capaces de:
1. Comprender y manipular la estructura básica de nodos con múltiples hijos y nodos binarios.
2. Implementar la lógica de inserción en un Árbol Binario de Búsqueda (BST).
3. Utilizar la recursividad para calcular métricas estructurales, como la profundidad máxima.
4. Extraer datos mediante recorridos estándar (In-Order).
5. Modificar la estructura subyacente de los punteros para transformar un árbol.

## Estructura del Repositorio

El repositorio contiene 5 ejercicios, cada uno debe ser hecho en c++ y java

1. Ejercicio 1: Árboles Básicos (Conteo de nodos en árboles N-arios).
2. Ejercicio 2: Árbol Binario (Inserción en BST).
3. Ejercicio 3: Árbol Binario (Cálculo de profundidad máxima).
4. Ejercicio 4: Recorridos (Implementación de In-Order).
5. Ejercicio 5: Transformación (Inversión o árbol espejo).

## Instrucciones para el Desarrollo

1. Dentro de cada archivo encontrarán la estructura básica de las clases (o structs) y la definición de un método específico que deben completar. 
2. Localicen el comentario `TODO: Implementa tu lógica aquí`. Esa es la única sección del código que necesitan modificar.
3. No es necesario modificar el método `main`. Este método ya contiene la construcción de un árbol de prueba y las impresiones necesarias para validar que su algoritmo funciona correctamente.
4. Su objetivo es lograr que, al ejecutar el código, los resultados calculados coincidan con los resultados esperados impresos en la consola.

### Carpetas y Archivos

- **README.md**  
- **informe.pdf**  
- **Capturas/**  
  - **C++/** → Ejercicio1.png, Ejercicio2.png, Ejercicio3.png, Ejercicio4.png, Ejercicio5.png  
  - **Java/** → Ejercicio1.png, Ejercicio2.png, Ejercicio3.png, Ejercicio4.png, Ejercicio5.png  
- **cpp/**  
  - Ejercicio1_Basico.cpp  
  - Ejercicio2_Binario.cpp  
  - Ejercicio3_Binario.cpp  
  - Ejercicio4_Recorridos.cpp  
  - Ejercicio5_Transformacion.cpp  
- **java/**  
  - Ejercicio1_Basico.java  
  - Ejercicio2_Binario.java  
  - Ejercicio3_Binario2.java  
  - RecorridoInOrder.java  
  - Ejercicio5_Transformacion.java  

## Ejercicios

| Ejercicio | Descripción | Archivo C++ | Archivo Java |
|-----------|-------------|-------------|--------------|
| 1 | Conteo de nodos en árbol N-ario | Ejercicio1_Basico.cpp | Ejercicio1_Basico.java |
| 2 | Inserción en BST | Ejercicio2_Binario.cpp | Ejercicio2_Binario.java |
| 3 | Cálculo de altura | Ejercicio3_Binario.cpp | Ejercicio3_Binario2.java |
| 4 | Recorrido In-Order | Ejercicio4_Recorridos.cpp | RecorridoInOrder.java |
| 5 | Inversión de árbol | Ejercicio5_Transformacion.cpp | Ejercicio5_Transformacion.java |

## Compilación y Ejecución

```bash
# C++ 
# Compilar
g++ Ejercicio1_Basico.cpp -o Ejercicio1.exe

# Ejecutar
./Ejercicio1.exe

# Java
# Compilar
javac Ejercicio1_Basico.java

# Ejecutar
java Ejercicio1_Basico

