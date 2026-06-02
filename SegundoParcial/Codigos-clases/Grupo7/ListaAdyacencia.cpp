#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Estructura para un nodo de la lista enlazada
struct NodoLista {
    int destino;
    NodoLista* siguiente;
    
    NodoLista(int dest) {
        destino = dest;
        siguiente = NULL;
    }
};

// Clase para la lista de adyacencia
class ListaAdyacencia {
private:
    int numVertices;
    string* nombres;
    NodoLista** arregloPunteros;  // Arreglo de punteros a listas enlazadas
    
public:
    // Constructor
    ListaAdyacencia(int vertices, string* nombresEstaciones) {
        numVertices = vertices;
        
        // Reservar memoria para los nombres
        nombres = new string[vertices];
        for (int i = 0; i < vertices; i++) {
            nombres[i] = nombresEstaciones[i];
        }
        
        // Reservar memoria para el arreglo de punteros
        arregloPunteros = new NodoLista*[vertices];
        for (int i = 0; i < vertices; i++) {
            arregloPunteros[i] = NULL;  // Inicializar cada puntero como NULL
        }
    }
    
    // Destructor para liberar memoria
    ~ListaAdyacencia() {
        for (int i = 0; i < numVertices; i++) {
            NodoLista* actual = arregloPunteros[i];
            while (actual != NULL) {
                NodoLista* temp = actual;
                actual = actual->siguiente;
                delete temp;
            }
        }
        delete[] arregloPunteros;
        delete[] nombres;
    }
    
    // Agregar una arista (grafo no dirigido)
    void agregarArista(int origen, int destino) {
        // Agregar destino a la lista del origen
        NodoLista* nuevoNodo = new NodoLista(destino);
        nuevoNodo->siguiente = arregloPunteros[origen];
        arregloPunteros[origen] = nuevoNodo;
        
        // Agregar origen a la lista del destino (por ser no dirigido)
        nuevoNodo = new NodoLista(origen);
        nuevoNodo->siguiente = arregloPunteros[destino];
        arregloPunteros[destino] = nuevoNodo;
    }
    
    // Mostrar la lista de adyacencia completa
    void mostrar() {
        cout << "\n========================================" << endl;
        cout << "LISTA DE ADYACENCIA - RED DE METRO" << endl;
        cout << "========================================" << endl;
        
        int totalValores = 0;
        
        for (int i = 0; i < numVertices; i++) {
            cout << nombres[i] << " (Indice " << i << ") -> ";
            
            NodoLista* actual = arregloPunteros[i];
            if (actual == NULL) {
                cout << "[]" << endl;
            } else {
                cout << "[";
                while (actual != NULL) {
                    cout << nombres[actual->destino];
                    totalValores++;
                    if (actual->siguiente != NULL) {
                        cout << ", ";
                    }
                    actual = actual->siguiente;
                }
                cout << "]" << endl;
            }
        }
        
        cout << "\nTotal de valores guardados en la lista: " << totalValores << endl;
        cout << "(Cada arista se guarda 2 veces - una por cada direccion)" << endl;
    }
    
    // Calcular el total de valores guardados (cada conexion se cuenta)
    int calcularTotalValores() {
        int total = 0;
        for (int i = 0; i < numVertices; i++) {
            NodoLista* actual = arregloPunteros[i];
            while (actual != NULL) {
                total++;
                actual = actual->siguiente;
            }
        }
        return total;
    }
    
    // Mostrar vecinos de una estacion especifica
    void mostrarVecinos(int indice) {
        if (indice < 0 || indice >= numVertices) {
            cout << "Indice no valido" << endl;
            return;
        }
        
        cout << "Vecinos de " << nombres[indice] << ": ";
        NodoLista* actual = arregloPunteros[indice];
        if (actual == NULL) {
            cout << "No tiene vecinos" << endl;
        } else {
            while (actual != NULL) {
                cout << nombres[actual->destino];
                if (actual->siguiente != NULL) {
                    cout << ", ";
                }
                actual = actual->siguiente;
            }
            cout << endl;
        }
    }
};

int main() {
    // Definir las estaciones
    string estaciones[] = {"El Labrador", "Jipijapa", "La Pradera", "El Ejido", "La Magdalena"};
    int numEstaciones = 5;
    
    ListaAdyacencia redMetro(numEstaciones, estaciones);
    
    // Aristas del grafo: 0-1, 0-2, 1-3, 2-3, 3-4
    redMetro.agregarArista(0, 1);  // El Labrador - Jipijapa
    redMetro.agregarArista(0, 2);  // El Labrador - La Pradera
    redMetro.agregarArista(1, 3);  // Jipijapa - El Ejido
    redMetro.agregarArista(2, 3);  // La Pradera - El Ejido
    redMetro.agregarArista(3, 4);  // El Ejido - La Magdalena
    
    int opcion;
    
    do {
        cout << "\n========================================" << endl;
        cout << "   RED DE METRO - LISTA DE ADYACENCIA" << endl;
        cout << "========================================" << endl;
        cout << "1. Inicializar y Cargar la Red de Metro" << endl;
        cout << "2. Mostrar Estaciones y sus Vecinos" << endl;
        cout << "3. Calcular Total de Valores Guardados" << endl;
        cout << "4. Salir del Programa" << endl;
        cout << "========================================" << endl;
        cout << "Ingrese una opcion: ";
        cin >> opcion;
        
        switch(opcion) {
            case 1:
                cout << "\n--- INICIALIZANDO RED DE METRO ---" << endl;
                cout << "Estaciones cargadas:" << endl;
                for (int i = 0; i < numEstaciones; i++) {
                    cout << "  " << i << ". " << estaciones[i] << endl;
                }
                cout << "Aristas cargadas:" << endl;
                cout << "  0-1 (El Labrador - Jipijapa)" << endl;
                cout << "  0-2 (El Labrador - La Pradera)" << endl;
                cout << "  1-3 (Jipijapa - El Ejido)" << endl;
                cout << "  2-3 (La Pradera - El Ejido)" << endl;
                cout << "  3-4 (El Ejido - La Magdalena)" << endl;
                cout << "Red de metro inicializada correctamente." << endl;
                break;
                
            case 2:
                redMetro.mostrar();
                break;
                
            case 3:
                cout << "\n--- TOTAL DE VALORES GUARDADOS ---" << endl;
                cout << "Total: " << redMetro.calcularTotalValores() << " valores" << endl;
                cout << "Explicacion: Cada arista se guarda dos veces (una en cada direccion)." << endl;
                cout << "Aristas: 5 x 2 = 10 valores guardados en total." << endl;
                break;
                
            case 4:
                cout << "\nSaliendo del programa..." << endl;
                cout << "¡Hasta luego!" << endl;
                break;
                
            default:
                cout << "\nOpcion no valida. Intente de nuevo." << endl;
                break;
        }
        
    } while(opcion != 4);
    
    return 0;
}
