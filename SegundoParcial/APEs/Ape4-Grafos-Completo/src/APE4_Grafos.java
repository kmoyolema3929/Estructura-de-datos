import java.util.*;

public class APE4_Grafos {

    // ═══════════════════════════════════════
    // Nodo - Representa cada punto del grafo
    // ═══════════════════════════════════════
    static class Nodo {
        String id;      // Identificador único (ej: "uta")
        String nombre;  // Nombre legible (ej: "Universidad")

        public Nodo(String id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }
    }

    // ═══════════════════════════════════════
    // Arista - Conexión entre nodos
    // ═══════════════════════════════════════
    static class Arista {
        String destino;  // Hacia qué nodo va
        int peso;        // Distancia o costo

        public Arista(String destino, int peso) {
            this.destino = destino;
            this.peso = peso;
        }
    }

    // ═══════════════════════════════════════
    // Grafo - Estructura principal
    // ═══════════════════════════════════════
    static class Grafo {

        // Diccionario para guardar todos los nodos
        Map<String, Nodo> nodos = new HashMap<>();
        
        // Lista de adyacencia: cada nodo tiene sus conexiones
        Map<String, List<Arista>> adyacencia = new HashMap<>();

        // TODO 1: Agregar un nuevo lugar al mapa
        public void agregarNodo(String id, String nombre) {
            // Creo el nodo con su id y nombre
            Nodo nodo = new Nodo(id, nombre);
            
            // Lo guardo en el diccionario de nodos
            nodos.put(id, nodo);
            
            // Inicializo su lista de conexiones (vacía por ahora)
            adyacencia.put(id, new ArrayList<>());
        }

        // TODO 2: Conectar dos lugares con una distancia
        public void agregarArista(String origen, String destino, int peso) {
            // Conexión de ida (origen → destino)
            adyacencia.get(origen)
                    .add(new Arista(destino, peso));
            
            // Conexión de vuelta (destino → origen)
            // Como el mapa es no dirigido, conecto en ambos sentidos
            adyacencia.get(destino)
                    .add(new Arista(origen, peso));
        }

        // TODO 3: Búsqueda en Anchura (encuentra la ruta con menos paradas)
        public List<String> bfs(String inicio, String fin) {
            // Cola para guardar los caminos completos
            Queue<List<String>> cola = new LinkedList<>();
            
            // Set para recordar qué nodos ya visité
            Set<String> visitados = new HashSet<>();
            
            // Creo el primer camino que solo tiene el nodo inicio
            List<String> caminoInicial = new ArrayList<>();
            caminoInicial.add(inicio);
            
            // Añado el primer camino a la cola
            cola.add(caminoInicial);
            
            // Marco el inicio como visitado
            visitados.add(inicio);
            
            // Mientras haya caminos por explorar
            while (!cola.isEmpty()) {
                // Saco el primer camino de la cola
                List<String> camino = cola.poll();
                
                // El nodo actual es el último del camino
                String actual = camino.get(camino.size() - 1);
                
                // Si llegué al destino, devuelvo el camino
                if (actual.equals(fin)) {
                    return camino;
                }
                
                // Reviso todos los vecinos del nodo actual
                for (Arista arista : adyacencia.get(actual)) {
                    // Si no he visitado este vecino
                    if (!visitados.contains(arista.destino)) {
                        // Lo marco como visitado
                        visitados.add(arista.destino);
                        
                        // Creo un nuevo camino copiando el actual
                        List<String> nuevoCamino = new ArrayList<>(camino);
                        
                        // Añado el vecino al nuevo camino
                        nuevoCamino.add(arista.destino);
                        
                        // Lo encolo para explorarlo después
                        cola.add(nuevoCamino);
                    }
                }
            }
            
            // Si salgo del while, no encontré ruta
            return null;
        }

        // TODO 4: Algoritmo de Dijkstra (encuentra la ruta más corta en distancia)
        public List<String> dijkstra(String inicio, String fin) {
            // Diccionario para guardar la distancia mínima a cada nodo
            Map<String, Integer> distancias = new HashMap<>();
            
            // Diccionario para recordar por qué nodo llegué a cada nodo
            Map<String, String> anteriores = new HashMap<>();
            
            // Cola de prioridad para procesar los nodos por distancia
            PriorityQueue<String> cola = new PriorityQueue<>(
                    Comparator.comparingInt(distancias::get)
            );
            
            // Inicializar: todas las distancias son infinito
            for (String nodo : nodos.keySet()) {
                distancias.put(nodo, Integer.MAX_VALUE);
            }
            
            // La distancia al inicio es 0
            distancias.put(inicio, 0);
            
            // Empiezo procesando el nodo inicio
            cola.add(inicio);
            
            // Mientras haya nodos por procesar
            while (!cola.isEmpty()) {
                // Saco el nodo con menor distancia
                String actual = cola.poll();
                
                // Reviso todos los vecinos del nodo actual
                for (Arista arista : adyacencia.get(actual)) {
                    // Calculo la nueva distancia yendo por el nodo actual
                    int nuevaDistancia = distancias.get(actual) + arista.peso;
                    
                    // Si esta nueva distancia es mejor que la que tenía
                    if (nuevaDistancia < distancias.get(arista.destino)) {
                        // Actualizo la distancia mínima
                        distancias.put(arista.destino, nuevaDistancia);
                        
                        // Guardo que llegué a este vecino desde el nodo actual
                        anteriores.put(arista.destino, actual);
                        
                        // Añado el vecino a la cola para procesarlo
                        cola.add(arista.destino);
                    }
                }
            }
            
            // Reconstruir el camino desde el final hasta el inicio
            List<String> camino = new ArrayList<>();
            String actual = fin;
            
            // Voy retrocediendo desde el destino hasta el origen
            while (actual != null) {
                camino.add(0, actual);  // Inserto al principio
                actual = anteriores.get(actual);
            }
            
            return camino;
        }

        // Mostrar la ruta de forma bonita
        public void mostrarRuta(List<String> ruta) {
            // Si la ruta es null, no existe conexión
            if (ruta == null) {
                System.out.println("No existe ruta");
                return;
            }
            
            // Recorro cada nodo de la ruta
            for (int i = 0; i < ruta.size(); i++) {
                String idNodo = ruta.get(i);
                Nodo nodo = nodos.get(idNodo);
                
                // Muestro nombre e id del lugar
                System.out.print(nodo.nombre + " (" + nodo.id + ")");
                
                // Si no es el último, pongo una flecha
                if (i < ruta.size() - 1) {
                    System.out.print(" -> ");
                }
            }
            System.out.println();
        }
    }

    // ═══════════════════════════════════════
    // MAIN - Programa principal
    // ═══════════════════════════════════════
    public static void main(String[] args) {
        
        // Creo el grafo (mapa de la universidad)
        Grafo grafo = new Grafo();
        
        // Agrego los lugares (nodos)
        grafo.agregarNodo("uta", "Universidad");
        grafo.agregarNodo("fisei", "FISEI");
        grafo.agregarNodo("idiomas", "Idiomas");
        grafo.agregarNodo("biblioteca", "Biblioteca");
        grafo.agregarNodo("estadio", "Estadio");
        grafo.agregarNodo("comedor", "Comedor");
        
        // Agrego los caminos (aristas) con sus distancias
        // Camino normal por la facultad
        grafo.agregarArista("uta", "fisei", 50);
        grafo.agregarArista("fisei", "idiomas", 40);
        grafo.agregarArista("idiomas", "biblioteca", 30);
        grafo.agregarArista("biblioteca", "estadio", 70);
        
        // Ruta alternativa con menos paradas pero más distancia
        grafo.agregarArista("uta", "comedor", 20);
        grafo.agregarArista("comedor", "estadio", 200);
        
        // PRUEBAS
        System.out.println("===== BFS =====");
        // BFS busca el camino con MENOS PARADAS
        List<String> rutaBFS = grafo.bfs("uta", "estadio");
        grafo.mostrarRuta(rutaBFS);
        
        System.out.println("\n===== DIJKSTRA =====");
        // Dijkstra busca el camino más CORTO EN DISTANCIA
        List<String> rutaDijkstra = grafo.dijkstra("uta", "estadio");
        grafo.mostrarRuta(rutaDijkstra);
    }
}