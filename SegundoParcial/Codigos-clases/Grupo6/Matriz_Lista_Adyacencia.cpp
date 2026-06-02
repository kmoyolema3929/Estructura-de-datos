#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

using namespace std;

// ========== 1. REPRESENTACIÓN CON MATRIZ DE ADYACENCIA ==========
class GrafoMatriz {
private:
    int** matriz;
    int numVertices;
    string* nombres;  // Para dar nombres a los nodos

public:
    GrafoMatriz(int vertices, string* nombres) {
        this->numVertices = vertices;
        this->nombres = new string[vertices];
        
        // Copiar nombres
        for (int i = 0; i < vertices; i++) {
            this->nombres[i] = nombres[i];
        }
        
        // Crear matriz dinámicamente
        matriz = new int*[vertices];
        for (int i = 0; i < vertices; i++) {
            matriz[i] = new int[vertices];
            for (int j = 0; j < vertices; j++) {
                matriz[i][j] = 0;
            }
        }
    }
    
    ~GrafoMatriz() {
        for (int i = 0; i < numVertices; i++) {
            delete[] matriz[i];
        }
        delete[] matriz;
        delete[] nombres;
    }
    
    // Agregar arista (no dirigida)
    void agregarArista(int i, int j) {
        matriz[i][j] = 1;
        matriz[j][i] = 1;
    }
    
    // Verificar si dos nodos están conectados (O(1))
    bool estanConectados(int i, int j) {
        return matriz[i][j] == 1;
    }
    
    // Obtener vecinos de un nodo (O(n) porque recorre toda la fila)
    vector<int> obtenerVecinos(int nodo) {
        vector<int> vecinos;
        for (int i = 0; i < numVertices; i++) {
            if (matriz[nodo][i] == 1) {
                vecinos.push_back(i);
            }
        }
        return vecinos;
    }
    
    // Calcular memoria aproximada en bytes (int = 4 bytes)
    int calcularMemoria() {
        return numVertices * numVertices * 4;
    }
    
    // Mostrar matriz visualmente
    void mostrar() {
        cout << "\nMATRIZ DE ADYACENCIA ( " << numVertices << "x" << numVertices << " ):" << endl;
        cout << "      ";
        for (int i = 0; i < numVertices; i++) {
            printf("%-6s", nombres[i].c_str());
        }
        cout << endl;
        for (int i = 0; i < numVertices; i++) {
            printf("%-6s", nombres[i].c_str());
            for (int j = 0; j < numVertices; j++) {
                printf("%-6d", matriz[i][j]);
            }
            cout << endl;
        }
    }
};

// ========== 2. REPRESENTACIÓN CON LISTA DE ADYACENCIA ==========
class GrafoLista {
private:
    map<int, vector<int> > lista;
    int numVertices;
    string* nombres;

public:
    GrafoLista(int vertices, string* nombres) {
        this->numVertices = vertices;
        this->nombres = new string[vertices];
        
        // Copiar nombres
        for (int i = 0; i < vertices; i++) {
            this->nombres[i] = nombres[i];
        }
        
        for (int i = 0; i < vertices; i++) {
            lista[i] = vector<int>();
        }
    }
    
    ~GrafoLista() {
        delete[] nombres;
    }
    
    // Agregar arista (no dirigida)
    void agregarArista(int i, int j) {
        lista[i].push_back(j);
        lista[j].push_back(i);
    }
    
    // Verificar si dos nodos están conectados (O(grado))
    bool estanConectados(int i, int j) {
        vector<int> vecinos = lista[i];
        for (size_t k = 0; k < vecinos.size(); k++) {
            if (vecinos[k] == j) {
                return true;
            }
        }
        return false;
    }
    
    // Obtener vecinos de un nodo (O(1) para acceder, O(grado) para iterar)
    vector<int> obtenerVecinos(int nodo) {
        return lista[nodo];
    }
    
    // Calcular memoria aproximada (cada entero = 4 bytes + overhead de lista)
    int calcularMemoria() {
        int total = 0;
        for (int i = 0; i < numVertices; i++) {
            total += 4;  // overhead por nodo en map
            total += lista[i].size() * 4;  // cada vecino
        }
        return total;
    }
    
    // Mostrar lista visualmente
    void mostrar() {
        cout << "\nLISTA DE ADYACENCIA:" << endl;
        for (int i = 0; i < numVertices; i++) {
            cout << nombres[i] << " -> ";
            vector<int> vecinos = lista[i];
            if (vecinos.empty()) {
                cout << "[]" << endl;
            } else {
                cout << "[";
                for (size_t j = 0; j < vecinos.size(); j++) {
                    cout << nombres[vecinos[j]];
                    if (j < vecinos.size() - 1) cout << ", ";
                }
                cout << "]" << endl;
            }
        }
    }
};

// Helper para mostrar nombres de vecinos
string vecinosComoString(vector<int> vecinos, string* nombres) {
    if (vecinos.empty()) return "[]";
    stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vecinos.size(); i++) {
        ss << nombres[vecinos[i]];
        if (i < vecinos.size() - 1) ss << ", ";
    }
    ss << "]";
    return ss.str();
}

// ========== 3. MAIN - EJEMPLO PRÁCTICO ==========
int main() {
    cout << "\n----------------------------------------------------------------------" << endl;
    cout << "        COMPARACION PRACTICA: MATRIZ vs LISTA DE ADYACENCIA" << endl;
    cout << "----------------------------------------------------------------------" << endl;
    
    // Grafo ejemplo: 6 nodos (ciudades), 5 aristas (disperso)
    string nombresArr[] = {"A", "B", "C", "D", "E", "F"};
    string* nombres = nombresArr;
    int numVertices = 6;
    
    // Crear ambas representaciones
    GrafoMatriz matriz(numVertices, nombres);
    GrafoLista lista(numVertices, nombres);
    
    // Aristas del grafo (disperso: 5 aristas)
    int aristas[][2] = {
        {0, 1},  // A-B
        {0, 2},  // A-C
        {1, 3},  // B-D
        {2, 4},  // C-E
        {3, 5}   // D-F
    };
    
    for (int i = 0; i < 5; i++) {
        matriz.agregarArista(aristas[i][0], aristas[i][1]);
        lista.agregarArista(aristas[i][0], aristas[i][1]);
    }
    
    // ===== MOSTRAR AMBAS REPRESENTACIONES =====
    matriz.mostrar();
    lista.mostrar();
    
    // ===== COMPARACIÓN DE MEMORIA =====
    cout << "\n----------------------------------------------------------------------" << endl;
    cout << "COMPARACION DE MEMORIA:" << endl;
    cout << "   Matriz: " << matriz.calcularMemoria() << " bytes" << endl;
    cout << "   Lista:  " << lista.calcularMemoria() << " bytes" << endl;
    cout << "   Nota: En este caso (grafo disperso), la lista usa " 
         << (matriz.calcularMemoria() - lista.calcularMemoria()) << " bytes menos." << endl;
    
    // ===== OPERACIÓN: VER CONEXIÓN DIRECTA =====
    cout << "\n----------------------------------------------------------------------" << endl;
    cout << "OPERACION 1: ¿A y B estan conectados?" << endl;
    cout << "   Matriz: consulta O(1) -> " << (matriz.estanConectados(0, 1) ? "true" : "false") << endl;
    cout << "   Lista:  consulta O(grado) -> " << (lista.estanConectados(0, 1) ? "true" : "false") << endl;
    
    // ===== OPERACIÓN: VER VECINOS =====
    cout << "\n----------------------------------------------------------------------" << endl;
    int nodoConsultado = 0;
    cout << "OPERACION 2: Obtener vecinos de " << nombres[nodoConsultado] << endl;
    cout << "   Matriz: recorre toda la fila (O(n)) -> " 
         << vecinosComoString(matriz.obtenerVecinos(nodoConsultado), nombres) << endl;
    cout << "   Lista:  accede directamente a su lista (O(grado)) -> " 
         << vecinosComoString(lista.obtenerVecinos(nodoConsultado), nombres) << endl;
    
    // ===== GRÁFICO DEL GRAFO EN CONSOLA =====
    cout << "\n----------------------------------------------------------------------" << endl;
    cout << "REPRESENTACION VISUAL DEL GRAFO:" << endl;
    cout << "        A" << endl;
    cout << "       / \\" << endl;
    cout << "      B   C" << endl;
    cout << "      |   |" << endl;
    cout << "      D   E" << endl;
    cout << "      |" << endl;
    cout << "      F" << endl;
    cout << "\n   Aristas: A-B, A-C, B-D, C-E, D-F" << endl;
    
    // ===== CONCLUSIÓN =====
    cout << "\n----------------------------------------------------------------------" << endl;
    cout << "CONCLUSION PARA ESTE GRAFO DISPERSO:" << endl;
    cout << "    La LISTA de adyacencia es mejor porque:" << endl;
    cout << "      - Usa menos memoria (" << matriz.calcularMemoria() << " vs " << lista.calcularMemoria() << " bytes)" << endl;
    cout << "      - Obtener vecinos es mas rapido (acceso directo)" << endl;
    cout << "    La MATRIZ desperdicia espacio en celdas con 0" << endl;
    cout << "\n    Nota: Si el grafo fuera DENSO (muchas aristas), la matriz seria mejor" << endl;
    cout << "----------------------------------------------------------------------\n" << endl;
    
    return 0;
}
