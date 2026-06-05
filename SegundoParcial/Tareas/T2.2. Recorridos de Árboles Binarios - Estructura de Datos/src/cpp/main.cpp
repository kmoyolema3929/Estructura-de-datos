/**
 * Estructura de Datos - Universidad Tecnica de Ambato
 * Tema: Recorridos de Arboles Binarios (Preorden, Inorden, Postorden, BFS)
 * 
 * Descripcion: Este programa implementa un arbol binario y muestra
 * los cuatro tipos de recorrido: DFS (Preorden, Inorden, Postorden)
 * y BFS (nivel por nivel usando cola).
 * 
 * CONTENIDO DE EJERCICIOS INTEGRADOS:
 * - Ejercicio 1: Recorridos del arbol base (implementado en funciones)
 * - Ejercicio 2: Arbol ampliado con 5 nuevos nodos (1, 3, 18, 25, 30)
 * - Ejercicio 3: Funcion contarNodos() para contar total de nodos
 * - Ejercicio 4: Funcion contarHojas() para contar nodos sin hijos
 * - Ejercicio 5: Se explica en el informe (no requiere codigo)
 */

#include <iostream>
#include <queue>
using namespace std;

/**
 * ESTRUCTURA DEL NODO
 * Representa cada elemento del arbol binario
 * Cada nodo contiene:
 * - dato: valor entero almacenado
 * - izquierda: puntero al hijo izquierdo
 * - derecha: puntero al hijo derecho
 */
struct Nodo {
    int dato;               // Valor del nodo
    Nodo* izquierda;        // Puntero al subarbol izquierdo
    Nodo* derecha;          // Puntero al subarbol derecho

    /**
     * Constructor: inicializa un nodo con un valor
     * Los punteros se inicializan en nullptr (nulo)
     */
    Nodo(int valor) {
        dato = valor;
        izquierda = nullptr;
        derecha = nullptr;
    }
};

/**
 * =============================================
 * EJERCICIO 1: RECORRIDOS DEL ARBOL BASE
 * =============================================
 */

/**
 * RECORRIDO PREORDEN (Raiz -> Izquierda -> Derecha)
 * Util para: crear copias del arbol, mostrar estructura jerarquica
 * Complejidad: O(n) donde n es numero de nodos
 */
void preorden(Nodo* raiz) {
    if (raiz == nullptr) return;           // Caso base: nodo vacio
    
    cout << raiz->dato << " ";              // 1. Visitar raiz
    preorden(raiz->izquierda);              // 2. Recorrer izquierda (recursivo)
    preorden(raiz->derecha);                // 3. Recorrer derecha (recursivo)
}

/**
 * RECORRIDO INORDEN (Izquierda -> Raiz -> Derecha)
 * Util para: obtener elementos en orden ascendente (en BST)
 * En un arbol binario de busqueda, este recorrido ordena los valores
 */
void inorden(Nodo* raiz) {
    if (raiz == nullptr) return;           // Caso base: nodo vacio
    
    inorden(raiz->izquierda);               // 1. Recorrer izquierda
    cout << raiz->dato << " ";              // 2. Visitar raiz
    inorden(raiz->derecha);                 // 3. Recorrer derecha
}

/**
 * RECORRIDO POSTORDEN (Izquierda -> Derecha -> Raiz)
 * Util para: eliminar arboles (borrar hijos antes que padres)
 * Tambien usado en expresiones matematicas (notacion postfija)
 */
void postorden(Nodo* raiz) {
    if (raiz == nullptr) return;           // Caso base: nodo vacio
    
    postorden(raiz->izquierda);             // 1. Recorrer izquierda
    postorden(raiz->derecha);               // 2. Recorrer derecha
    cout << raiz->dato << " ";              // 3. Visitar raiz
}

/**
 * RECORRIDO BFS (Breadth-First Search) o NIVEL POR NIVEL
 * Util para: encontrar el camino mas corto, mostrar niveles
 * Estructura utilizada: COLA (FIFO - First In First Out)
 * Diferencia con DFS: recorre por niveles, no por profundidad
 */
void bfs(Nodo* raiz) {
    if (raiz == nullptr) return;
    
    queue<Nodo*> cola;                      // Cola para almacenar nodos por nivel
    cola.push(raiz);                        // Comenzamos con la raiz
    
    while (!cola.empty()) {
        Nodo* actual = cola.front();        // Obtener el primer nodo
        cola.pop();                         // Eliminarlo de la cola
        
        cout << actual->dato << " ";        // Visitar el nodo actual
        
        // Agregar los hijos a la cola (si existen)
        if (actual->izquierda != nullptr) 
            cola.push(actual->izquierda);
        if (actual->derecha != nullptr) 
            cola.push(actual->derecha);
    }
}

/**
 * =============================================
 * EJERCICIO 3: FUNCION CONTAR NODOS
 * =============================================
 */

/**
 * Contar cantidad total de nodos del arbol
 * @param raiz Nodo raiz del arbol
 * @return Numero total de nodos
 */
int contarNodos(Nodo* raiz) {
    if (raiz == nullptr) return 0;
    // Sumo: 1 (nodo actual) + nodos izquierda + nodos derecha
    return 1 + contarNodos(raiz->izquierda) + contarNodos(raiz->derecha);
}

/**
 * =============================================
 * EJERCICIO 4: FUNCION CONTAR HOJAS
 * =============================================
 */

/**
 * Contar hojas del arbol (nodos sin hijos)
 * @param raiz Nodo raiz del arbol
 * @return Numero de hojas
 */
int contarHojas(Nodo* raiz) {
    if (raiz == nullptr) return 0;
    // Si es hoja (sin hijos), retorna 1
    if (raiz->izquierda == nullptr && raiz->derecha == nullptr) 
        return 1;
    // Sino, suma las hojas de los subarboles
    return contarHojas(raiz->izquierda) + contarHojas(raiz->derecha);
}

/**
 * =============================================
 * FUNCION ADICIONAL: CALCULAR ALTURA
 * (Extra para complementar el analisis)
 * =============================================
 */

/**
 * Calcular la altura del arbol
 * Altura: distancia desde la raiz hasta la hoja mas profunda
 * @param raiz Nodo raiz del arbol
 * @return Altura del arbol (0 si es vacio)
 */
int calcularAltura(Nodo* raiz) {
    if (raiz == nullptr) return 0;
    int alturaIzquierda = calcularAltura(raiz->izquierda);
    int alturaDerecha = calcularAltura(raiz->derecha);
    return max(alturaIzquierda, alturaDerecha) + 1;
}

/**
 * =============================================
 * FUNCION PRINCIPAL
 * =============================================
 * 
 * Arbol final con nodos agregados (Ejercicio 2):
 * 
 *                   10 (Raiz - Nivel 0)
 *                 /    \
 *                5      15 (Nivel 1)
 *               / \    /  \
 *              2   7  12  20 (Nivel 2)
 *             / \        / \
 *            1   3      18  25 (Nivel 3)
 *                           \
 *                            30 (Nivel 4)
 */
int main() {
    cout << "==============================================" << endl;
    cout << "   RECORRIDOS DE ARBOLES BINARIOS - UTA" << endl; << endl;
    cout << "   Curso: Tercero B - Estructura de Datos" << endl;
    cout << "==============================================\n" << endl;
    
    // =============================================
    // CONSTRUCCION DEL ARBOL BINARIO
    // =============================================
    
    // === ARBOL BASE (Ejercicio 1) ===
    Nodo* raiz = new Nodo(10);
    raiz->izquierda = new Nodo(5);
    raiz->derecha = new Nodo(15);
    raiz->izquierda->izquierda = new Nodo(2);
    raiz->izquierda->derecha = new Nodo(7);
    raiz->derecha->izquierda = new Nodo(12);
    raiz->derecha->derecha = new Nodo(20);
    
    // === NUEVOS 5 NODOS AGREGADOS (Ejercicio 2) ===
    raiz->izquierda->izquierda->izquierda = new Nodo(1);   // Hijo izquierdo de 2
    raiz->izquierda->izquierda->derecha = new Nodo(3);     // Hijo derecho de 2
    raiz->derecha->derecha->izquierda = new Nodo(18);      // Hijo izquierdo de 20
    raiz->derecha->derecha->derecha = new Nodo(25);        // Hijo derecho de 20
    raiz->derecha->derecha->derecha->derecha = new Nodo(30); // Hijo derecho de 25
    
    // =============================================
    // MOSTRAR RECORRIDOS (Ejercicio 1 y 2)
    // =============================================
    
    cout << "--- RECORRIDOS EN PROFUNDIDAD (DFS) ---" << endl;
    
    cout << "Preorden  (Raiz -> Izquierda -> Derecha): ";
    preorden(raiz);
    
    cout << "\nInorden   (Izquierda -> Raiz -> Derecha): ";
    inorden(raiz);
    
    cout << "\nPostorden (Izquierda -> Derecha -> Raiz): ";
    postorden(raiz);
    
    cout << "\n\n--- RECORRIDO EN ANCHURA (BFS) ---" << endl;
    cout << "BFS (Nivel por nivel usando cola): ";
    bfs(raiz);
    
    // =============================================
    // MOSTRAR ESTADISTICAS (Ejercicios 3 y 4)
    // =============================================
    
    cout << "\n\n--- ESTADISTICAS DEL ARBOL ---" << endl;
    cout << "Ejercicio 3 - Total de nodos: " << contarNodos(raiz) << endl;
    cout << "Ejercicio 4 - Total de hojas: " << contarHojas(raiz) << endl;
    cout << "Altura del arbol (extra): " << calcularAltura(raiz) << endl;
    
    // =============================================
    // ANALISIS DE RESULTADOS
    // =============================================
    
    cout << "\n--- ANALISIS DE RESULTADOS ---" << endl;
    cout << "El recorrido Inorden muestra los valores ordenados: ";
    cout << "1,2,3,5,7,10,12,15,18,20,25,30" << endl;
    cout << "Las hojas del arbol son los nodos: 1, 3, 7, 12, 18, 30" << endl;
    cout << "La altura del arbol es 4 (niveles: 0->10, 1->5/15, 2->2/7/12/20, 3->1/3/18/25, 4->30)" << endl;
    
    cout << "\n==============================================" << endl;
    cout << "   FIN DEL PROGRAMA" << endl;
    cout << "   Los recorridos han sido ejecutados exitosamente" << endl;
    cout << "==============================================" << endl;
    
    return 0;
}