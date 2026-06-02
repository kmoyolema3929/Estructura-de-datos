import java.util.*;

class Nodo {
    int valor;
    Nodo izquierdo;
    Nodo derecho;

    public Nodo(int valor) {
        this.valor = valor;
        this.izquierdo = null;
        this.derecho = null;
    }
}

public class RecorridoBFS {

    // Método que imprime el recorrido BFS en una sola línea
    public static void bfsUnaLinea(Nodo raiz) {
        if (raiz == null) return;

        Queue<Nodo> cola = new LinkedList<>();
        cola.add(raiz);

        while (!cola.isEmpty()) {
            Nodo actual = cola.poll();
            System.out.print(actual.valor + " ");

            if (actual.izquierdo != null) cola.add(actual.izquierdo);
            if (actual.derecho != null) cola.add(actual.derecho);
        }
        System.out.println();
    }

    // Método que imprime el recorrido BFS por niveles
    public static void bfsPorNiveles(Nodo raiz) {
        if (raiz == null) return;

        Queue<Nodo> cola = new LinkedList<>();
        cola.add(raiz);
        int nivel = 0;

        while (!cola.isEmpty()) {
            int tamañoNivel = cola.size();
            System.out.print("Nivel " + nivel + ": ");

            for (int i = 0; i < tamañoNivel; i++) {
                Nodo actual = cola.poll();
                System.out.print(actual.valor + " ");

                if (actual.izquierdo != null) cola.add(actual.izquierdo);
                if (actual.derecho != null) cola.add(actual.derecho);
            }
            System.out.println();
            nivel++;
        }
    }

    public static void main(String[] args) {
        // Construcción del árbol:
        //        50
        //       /  \
        //      30   70
        //     / \   / \
        //    20 40 60 80

        Nodo raiz = new Nodo(50);
        raiz.izquierdo = new Nodo(30);
        raiz.derecho = new Nodo(70);
        raiz.izquierdo.izquierdo = new Nodo(20);
        raiz.izquierdo.derecho = new Nodo(40);
        raiz.derecho.izquierdo = new Nodo(60);
        raiz.derecho.derecho = new Nodo(80);

        System.out.println("=== RECORRIDO BFS ===");
        System.out.println("\n1. En una sola línea:");
        System.out.print("   ");
        bfsUnaLinea(raiz);

        System.out.println("\n2. Por niveles:");
        bfsPorNiveles(raiz);
    }
}