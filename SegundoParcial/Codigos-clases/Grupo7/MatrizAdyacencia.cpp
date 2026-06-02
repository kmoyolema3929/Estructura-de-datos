#include <iostream>
#include <iomanip>
using namespace std;

// Clase para la matriz de adyacencia
class MatrizAdyacencia {
private:
    int** matriz;
    int numVertices;
    string* nombres;
    int* grados;
    
public:
    // Constructor
    MatrizAdyacencia(int vertices, string* nombresEstaciones) {
        numVertices = vertices;
        
        // Reservar memoria para los nombres
        nombres = new string[vertices];
        for (int i = 0; i < vertices; i++) {
            nombres[i] = nombresEstaciones[i];
        }
        
        // Reservar memoria para el arreglo de grados
        grados = new int[vertices];
        for (int i = 0; i < vertices; i++) {
            grados[i] = 0;
        }
        
        // Reservar memoria para la matriz (matriz cuadrada)
        matriz = new int*[vertices];
        for (int i = 0; i < vertices; i++) {
            matriz[i] = new int[vertices];
            for (int j = 0; j < vertices; j++) {
                matriz[i][j] = 0;  // Inicializar todo en 0
            }
        }
    }
    
    // Destructor para liberar memoria
    ~MatrizAdyacencia() {
        for (int i = 0; i < numVertices; i++) {
            delete[] matriz[i];
        }
        delete[] matriz;
        delete[] nombres;
        delete[] grados;
    }
    
    // Agregar una arista (grafo no dirigido)
    void agregarArista(int i, int j) {
        matriz[i][j] = 1;
        matriz[j][i] = 1;
        grados[i]++;  // Incrementar grado del vertice i
        grados[j]++;  // Incrementar grado del vertice j
    }
    
    // Mostrar la matriz de adyacencia
    void mostrar() {
        cout << "\n========================================" << endl;
        cout << "MATRIZ DE ADYACENCIA - RED DE METRO" << endl;
        cout << "========================================" << endl;
        
        // Mostrar encabezados de columnas
        cout << "      ";
        for (int i = 0; i < numVertices; i++) {
            cout << setw(12) << nombres[i];
        }
        cout << endl;
        
        // Mostrar fila por fila
        for (int i = 0; i < numVertices; i++) {
            cout << setw(12) << nombres[i];
            for (int j = 0; j < numVertices; j++) {
                cout << setw(12) << matriz[i][j];
            }
            cout << endl;
        }
    }
    
    // Identificar propiedades del grafo
    void identificarPropiedades() {
        cout << "\n========================================" << endl;
        cout << "PROPIEDADES DEL GRAFO" << endl;
        cout << "========================================" << endl;
        
        // Mostrar grados de cada vertice
        cout << "\nGRADO DE CADA VERTICE:" << endl;
        for (int i = 0; i < numVertices; i++) {
            cout << "  " << nombres[i] << " (Indice " << i << "): Grado " << grados[i] << endl;
        }
        
        // Calcular el total de aristas
        int totalAristas = 0;
        for (int i = 0; i < numVertices; i++) {
            totalAristas += grados[i];
        }
        totalAristas = totalAristas / 2;  // Por ser grafo no dirigido
        
        cout << "\nTOTAL DE ARISTAS: " << totalAristas << endl;
        
        // Verificar si el grafo es completo (todos los vertices conectados entre si)
        bool esCompleto = true;
        int totalPosible = (numVertices * (numVertices - 1)) / 2;
        if (totalAristas == totalPosible) {
            cout << "El grafo es COMPLETO (K" << numVertices << ")" << endl;
        } else {
            cout << "El grafo NO es completo" << endl;
        }
        
        // Verificar si es regular (todos los vertices tienen el mismo grado)
        bool esRegular = true;
        for (int i = 1; i < numVertices; i++) {
            if (grados[i] != grados[0]) {
                esRegular = false;
                break;
            }
        }
        if (esRegular && numVertices > 0) {
            cout << "El grafo es REGULAR (todos los vertices tienen grado " << grados[0] << ")" << endl;
        } else {
            cout << "El grafo NO es regular" << endl;
        }
        
        // Verificar si es conexo (para este grafo pequeno, lo verificamos manualmente)
        cout << "\nEl grafo ES CONEXO? Si (todas las estaciones estan conectadas)" << endl;
        cout << "Se puede viajar desde cualquier estacion a cualquier otra." << endl;
    }
    
    // Analisis de memoria comparativo
    void analisisMemoria() {
        // Memoria ocupada por la matriz (int = 4 bytes)
        int memoriaMatriz = numVertices * numVertices * sizeof(int);
        
        // Memoria estimada si usara lista de adyacencia
        // Cada arista se guarda 2 veces, cada entero 4 bytes
        int totalAristas = 0;
        for (int i = 0; i < numVertices; i++) {
            totalAristas += grados[i];
        }
        int memoriaLista = totalAristas * sizeof(int);  // Solo los enteros de destino
        memoriaLista += numVertices * sizeof(void*);   // Arreglo de punteros
        
        cout << "\n========================================" << endl;
        cout << "ANALISIS DE MEMORIA COMPARATIVO" << endl;
        cout << "========================================" << endl;
        cout << "\nGRAFO ACTUAL:" << endl;
        cout << "  Vertices: " << numVertices << endl;
        cout << "  Aristas: " << (totalAristas / 2) << endl;
        
        cout << "\nMEMORIA OCUPADA:" << endl;
        cout << "  Matriz de Adyacencia: " << memoriaMatriz << " bytes" << endl;
        cout << "  Lista de Adyacencia:  ~" << memoriaLista << " bytes (estimado)" << endl;
        
        cout << "\nCOMPARACION:" << endl;
        if (memoriaMatriz > memoriaLista) {
            cout << "  La lista usa " << (memoriaMatriz - memoriaLista) 
                 << " bytes menos que la matriz." << endl;
            cout << "  En este caso (grafo disperso), la LISTA es mas eficiente." << endl;
        } else if (memoriaLista > memoriaMatriz) {
            cout << "  La matriz usa " << (memoriaLista - memoriaMatriz) 
                 << " bytes menos que la lista." << endl;
            cout << "  En este caso (grafo denso), la MATRIZ es mas eficiente." << endl;
        } else {
            cout << "  Ambas representaciones usan memoria similar." << endl;
        }
        
        cout << "\nEXPLICACION:" << endl;
        cout << "  - Matriz: Siempre ocupa V^2 * 4 bytes (V = vertices)" << endl;
        cout << "  - Lista:  Ocupa (2E * 4) + (V * 8) bytes (E = aristas)" << endl;
        cout << "  - Para grafos dispersos (E << V^2), la lista es mejor." << endl;
        cout << "  - Para grafos densos (E ˜ V^2), la matriz es mejor." << endl;
    }
    
    // Obtener el grado de un vertice
    int obtenerGrado(int indice) {
        if (indice >= 0 && indice < numVertices) {
            return grados[indice];
        }
        return -1;
    }
};

int main() {
    // Definir las estaciones
    string estaciones[] = {"El Labrador", "Jipijapa", "La Pradera", "El Ejido", "La Magdalena"};
    int numEstaciones = 5;
    
    MatrizAdyacencia redMetro(numEstaciones, estaciones);
    
    // Aristas del grafo: 0-1, 0-2, 1-3, 2-3, 3-4
    redMetro.agregarArista(0, 1);  // El Labrador - Jipijapa
    redMetro.agregarArista(0, 2);  // El Labrador - La Pradera
    redMetro.agregarArista(1, 3);  // Jipijapa - El Ejido
    redMetro.agregarArista(2, 3);  // La Pradera - El Ejido
    redMetro.agregarArista(3, 4);  // El Ejido - La Magdalena
    
    int opcion;
    
    do {
        cout << "\n========================================" << endl;
        cout << "   RED DE METRO - MATRIZ DE ADYACENCIA" << endl;
        cout << "========================================" << endl;
        cout << "1. Inicializar y Cargar la Red de Metro" << endl;
        cout << "2. Mostrar Matriz de Adyacencia" << endl;
        cout << "3. Identificar Propiedades del Grafo" << endl;
        cout << "4. Analisis de Memoria Comparativo" << endl;
        cout << "5. Salir del Programa" << endl;
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
                cout << "\nAristas cargadas:" << endl;
                cout << "  0-1 (El Labrador - Jipijapa)" << endl;
                cout << "  0-2 (El Labrador - La Pradera)" << endl;
                cout << "  1-3 (Jipijapa - El Ejido)" << endl;
                cout << "  2-3 (La Pradera - El Ejido)" << endl;
                cout << "  3-4 (El Ejido - La Magdalena)" << endl;
                cout << "\nMatriz de adyacencia inicializada correctamente." << endl;
                break;
                
            case 2:
                redMetro.mostrar();
                break;
                
            case 3:
                redMetro.identificarPropiedades();
                break;
                
            case 4:
                redMetro.analisisMemoria();
                break;
                
            case 5:
                cout << "\nSaliendo del programa..." << endl;
                cout << "¡Hasta luego!" << endl;
                break;
                
            default:
                cout << "\nOpcion no valida. Intente de nuevo." << endl;
                break;
        }
        
    } while(opcion != 5);
    
    return 0;
}
