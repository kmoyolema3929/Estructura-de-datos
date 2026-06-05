import java.util.LinkedList;
import java.util.Queue;

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

/**
 * CLASE NODO
 * Representa cada elemento del arbol binario
 * Cada nodo contiene:
 * - dato: valor entero almacenado
 * - izquierda: referencia al hijo izquierdo
 * - derecha: referencia al hijo derecho
 */
class Nodo {
    int dato;               // Valor del nodo
    Nodo izquierda;         // Referencia al subarbol izquierdo
    Nodo derecha;           // Referencia al subarbol derecho

    /**
     * Constructor: inicializa un nodo con un valor
     * Las referencias se inicializan en null (nulo)
     * 
     * @param dato Valor entero que almacenara el nodo
     */
    public Nodo(int dato) {
        this.dato = dato;
        this.izquierda = null;
        this.derecha = null;
    }
}

/**
 * CLASE PRINCIPAL
 * Contiene todos los metodos de recorrido y el programa principal
 */
public class Main {

    /**
     * =============================================
     * EJERCICIO 1: RECORRIDOS DEL ARBOL BASE
     * =============================================
     */

    /**
     * RECORRIDO PREORDEN (Raiz -> Izquierda -> Derecha)
     * Util para: crear copias del arbol, mostrar estructura jerarquica
     * Complejidad: O(n) donde n es numero de nodos
     * 
     * @param raiz Nodo raiz del arbol o subarbol
     */
    public static void preorden(Nodo raiz) {
        if (raiz == null) return;           // Caso base: nodo vacio
        
        System.out.print(raiz.dato + " ");   // 1. Visitar raiz
        preorden(raiz.izquierda);            // 2. Recorrer izquierda (recursivo)
        preorden(raiz.derecha);              // 3. Recorrer derecha (recursivo)
    }

    /**
     * RECORRIDO INORDEN (Izquierda -> Raiz -> Derecha)
     * Util para: obtener elementos en orden ascendente (en BST)
     * En un arbol binario de busqueda, este recorrido ordena los valores
     * 
     * @param raiz Nodo raiz del arbol o subarbol
     */
    public static void inorden(Nodo raiz) {
        if (raiz == null) return;           // Caso base: nodo vacio
        
        inorden(raiz.izquierda);             // 1. Recorrer izquierda
        System.out.print(raiz.dato + " ");   // 2. Visitar raiz
        inorden(raiz.derecha);               // 3. Recorrer derecha
    }

    /**
     * RECORRIDO POSTORDEN (Izquierda -> Derecha -> Raiz)
     * Util para: eliminar arboles (borrar hijos antes que padres)
     * Tambien usado en expresiones matematicas (notacion postfija)
     * 
     * @param raiz Nodo raiz del arbol o subarbol
     */
    public static void postorden(Nodo raiz) {
        if (raiz == null) return;           // Caso base: nodo vacio
        
        postorden(raiz.izquierda);           // 1. Recorrer izquierda
        postorden(raiz.derecha);             // 2. Recorrer derecha
        System.out.print(raiz.dato + " ");   // 3. Visitar raiz
    }

    /**
     * RECORRIDO BFS (Breadth-First Search) o NIVEL POR NIVEL
     * Util para: encontrar el camino mas corto, mostrar niveles
     * Estructura utilizada: COLA (FIFO - First In First Out)
     * Diferencia con DFS: recorre por niveles, no por profundidad
     * 
     * @param raiz Nodo raiz del arbol
     */
    public static void bfs(Nodo raiz) {
        if (raiz == null) return;
        
        // Usamos LinkedList como implementacion de Queue (cola)
        Queue<Nodo> cola = new LinkedList<>();
        cola.add(raiz);                      // Comenzamos con la raiz
        
        while (!cola.isEmpty()) {
            Nodo actual = cola.poll();       // Obtener y eliminar el primer nodo
            
            System.out.print(actual.dato + " ");  // Visitar el nodo actual
            
            // Agregar los hijos a la cola (si existen)
            if (actual.izquierda != null) 
                cola.add(actual.izquierda);
            if (actual.derecha != null) 
                cola.add(actual.derecha);
        }
    }

    /**
     * =============================================
     * EJERCICIO 3: FUNCION CONTAR NODOS
     * =============================================
     */

    /**
     * Contar cantidad total de nodos del arbol
     * 
     * @param raiz Nodo raiz del arbol
     * @return Numero total de nodos en el arbol
     */
    public static int contarNodos(Nodo raiz) {
        if (raiz == null) return 0;
        // Sumo: 1 (nodo actual) + nodos izquierda + nodos derecha
        return 1 + contarNodos(raiz.izquierda) + contarNodos(raiz.derecha);
    }

    /**
     * =============================================
     * EJERCICIO 4: FUNCION CONTAR HOJAS
     * =============================================
     */

    /**
     * Contar hojas del arbol (nodos sin hijos)
     * Hoja: nodo que NO tiene hijos izquierdo ni derecho
     * 
     * @param raiz Nodo raiz del arbol
     * @return Numero de hojas en el arbol
     */
    public static int contarHojas(Nodo raiz) {
        if (raiz == null) return 0;
        // Si es hoja (sin hijos), retorna 1
        if (raiz.izquierda == null && raiz.derecha == null) 
            return 1;
        // Sino, suma las hojas de los subarboles
        return contarHojas(raiz.izquierda) + contarHojas(raiz.derecha);
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
     * 
     * @param raiz Nodo raiz del arbol
     * @return Altura del arbol (0 si es vacio)
     */
    public static int calcularAltura(Nodo raiz) {
        if (raiz == null) return 0;
        // Calculo altura de cada subarbol
        int alturaIzquierda = calcularAltura(raiz.izquierda);
        int alturaDerecha = calcularAltura(raiz.derecha);
        // Retorno la mayor altura + 1 (por el nodo actual)
        return Math.max(alturaIzquierda, alturaDerecha) + 1;
    }

    /**
     * =============================================
     * METODO PRINCIPAL
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
    public static void main(String[] args) {
        System.out.println("==============================================");
        System.out.println("   RECORRIDOS DE ARBOLES BINARIOS - UTA");
        System.out.println("   Curso: Tercero B - Estructura de Datos");
        System.out.println("==============================================\n");

        // =============================================
        // CONSTRUCCION DEL ARBOL BINARIO
        // =============================================
        
        // === ARBOL BASE (Ejercicio 1) ===
        Nodo raiz = new Nodo(10);
        raiz.izquierda = new Nodo(5);
        raiz.derecha = new Nodo(15);
        raiz.izquierda.izquierda = new Nodo(2);
        raiz.izquierda.derecha = new Nodo(7);
        raiz.derecha.izquierda = new Nodo(12);
        raiz.derecha.derecha = new Nodo(20);
        
        // === NUEVOS 5 NODOS AGREGADOS (Ejercicio 2) ===
        raiz.izquierda.izquierda.izquierda = new Nodo(1);   // Hijo izquierdo de 2
        raiz.izquierda.izquierda.derecha = new Nodo(3);     // Hijo derecho de 2
        raiz.derecha.derecha.izquierda = new Nodo(18);      // Hijo izquierdo de 20
        raiz.derecha.derecha.derecha = new Nodo(25);        // Hijo derecho de 20
        raiz.derecha.derecha.derecha.derecha = new Nodo(30); // Hijo derecho de 25

        // =============================================
        // MOSTRAR RECORRIDOS (Ejercicio 1 y 2)
        // =============================================
        
        System.out.println("--- RECORRIDOS EN PROFUNDIDAD (DFS) ---");
        
        System.out.print("Preorden  (Raiz -> Izquierda -> Derecha): ");
        preorden(raiz);
        
        System.out.print("\nInorden   (Izquierda -> Raiz -> Derecha): ");
        inorden(raiz);
        
        System.out.print("\nPostorden (Izquierda -> Derecha -> Raiz): ");
        postorden(raiz);
        
        System.out.println("\n\n--- RECORRIDO EN ANCHURA (BFS) ---");
        System.out.print("BFS (Nivel por nivel usando cola): ");
        bfs(raiz);
        
        // =============================================
        // MOSTRAR ESTADISTICAS (Ejercicios 3 y 4)
        // =============================================
        
        System.out.println("\n\n--- ESTADISTICAS DEL ARBOL ---");
        System.out.println("Ejercicio 3 - Total de nodos: " + contarNodos(raiz));
        System.out.println("Ejercicio 4 - Total de hojas: " + contarHojas(raiz));
        System.out.println("Altura del arbol (extra): " + calcularAltura(raiz));
        
        // =============================================
        // ANALISIS DE RESULTADOS
        // =============================================
        
        System.out.println("\n--- ANALISIS DE RESULTADOS ---");
        System.out.println("El recorrido Inorden muestra los valores ordenados: ");
        System.out.println("1, 2, 3, 5, 7, 10, 12, 15, 18, 20, 25, 30");
        System.out.println("\nLas hojas del arbol son los nodos: 1, 3, 7, 12, 18, 30");
        System.out.println("Total de hojas: 6");
        System.out.println("\nLa altura del arbol es 4 (niveles: 0->10, 1->5/15, 2->2/7/12/20, 3->1/3/18/25, 4->30)");
        
        System.out.println("\n==============================================");
        System.out.println("   FIN DEL PROGRAMA");
        System.out.println("   Los recorridos han sido ejecutados exitosamente");
        System.out.println("==============================================");
    }
}