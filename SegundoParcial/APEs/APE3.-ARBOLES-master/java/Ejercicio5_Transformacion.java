public class Ejercicio5_Transformacion {
    public static Nodo invertir(Nodo raiz) {
        if (raiz == null) return null;
        // Intercambiar hijos recursivamente
        Nodo temp = raiz.izquierdo;
        raiz.izquierdo = invertir(raiz.derecho);
        raiz.derecho = invertir(temp);
        return raiz;
    }

    public static void main(String[] args) {
        //        1                 1
        //      /   \    -->      /   \
        //     2     3           3     2
        Nodo raiz = new Nodo(1);
        raiz.izquierdo = new Nodo(2);
        raiz.derecho = new Nodo(3);

        System.out.println("--- Prueba Ejercicio 5 ---");
        System.out.println("Antes de invertir:");
        System.out.println("Hijo Izq: " + raiz.izquierdo.valor + " | Hijo Der: " + raiz.derecho.valor);
        
        invertir(raiz);
        
        System.out.println("\nDespués de invertir (Esperado: Izq 3 | Der 2):");
        String izq = (raiz.izquierdo != null) ? String.valueOf(raiz.izquierdo.valor) : "null";
        String der = (raiz.derecho != null) ? String.valueOf(raiz.derecho.valor) : "null";
        
        System.out.println("Hijo Izq: " + izq + " | Hijo Der: " + der);
    }
}