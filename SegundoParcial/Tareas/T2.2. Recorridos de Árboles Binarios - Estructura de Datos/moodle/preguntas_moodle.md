# Banco de preguntas para Moodle

## Preguntas tipo opción múltiple

1. ¿Cuál es el orden del recorrido Inorden?
   - A. Raíz, izquierda, derecha
   - B. Izquierda, raíz, derecha
   - C. Izquierda, derecha, raíz
   - D. Nivel por nivel
   - Respuesta: B

2. ¿Qué estructura utiliza BFS?
   - A. Pila
   - B. Lista circular
   - C. Cola
   - D. Árbol AVL
   - Respuesta: C

3. ¿Cuál recorrido visita primero la raíz?
   - A. Inorden
   - B. Preorden
   - C. Postorden
   - D. BFS únicamente
   - Respuesta: B

4. ¿Cuál recorrido procesa la raíz al final?
   - A. Preorden
   - B. Inorden
   - C. Postorden
   - D. Nivel por nivel
   - Respuesta: C

5. En un BST, el recorrido Inorden permite obtener:
   - A. Elementos desordenados
   - B. Elementos por niveles
   - C. Elementos en orden ascendente
   - D. Solo hojas
   - Respuesta: C

## Pregunta práctica
Complete el código C++ del recorrido inorden:

```cpp
void inorden(Nodo* raiz) {
    if (raiz == nullptr) return;
    _____________(raiz->izquierda);
    cout << raiz->dato << " ";
    _____________(raiz->derecha);
}
```

Respuesta esperada: inorden
