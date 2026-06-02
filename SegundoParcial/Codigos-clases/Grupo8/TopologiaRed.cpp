#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <map>
#include <string>

using namespace std;

class NodoGrafo {
public:
    string nombre;
    vector<NodoGrafo*> adyacentes;
    
    NodoGrafo(string nom) : nombre(nom), adyacentes() {}
};

class Red {
private:
    map<string, NodoGrafo*> nodos;
    
    void limpiarVisitados(map<string, bool>& visitados) {
        map<string, NodoGrafo*>::iterator it;
        for (it = nodos.begin(); it != nodos.end(); ++it) {
            visitados[it->first] = false;
        }
    }
    
public:
    Red() {
        // Crear nodos de la red
        nodos["Firewall"] = new NodoGrafo("Firewall");
        nodos["Router"] = new NodoGrafo("Router");
        nodos["Switch"] = new NodoGrafo("Switch");
        nodos["Servidor"] = new NodoGrafo("Servidor");
        nodos["PC1"] = new NodoGrafo("PC1");
        nodos["PC2"] = new NodoGrafo("PC2");
        
        // Establecer conexiones (lista de adyacencia)
        // Firewall conecta con Router
        nodos["Firewall"]->adyacentes.push_back(nodos["Router"]);
        nodos["Router"]->adyacentes.push_back(nodos["Firewall"]);
        
        // Router conecta con Switch
        nodos["Router"]->adyacentes.push_back(nodos["Switch"]);
        nodos["Switch"]->adyacentes.push_back(nodos["Router"]);
        
        // Switch conecta con Servidor, PC1 y PC2
        nodos["Switch"]->adyacentes.push_back(nodos["Servidor"]);
        nodos["Servidor"]->adyacentes.push_back(nodos["Switch"]);
        
        nodos["Switch"]->adyacentes.push_back(nodos["PC1"]);
        nodos["PC1"]->adyacentes.push_back(nodos["Switch"]);
        
        nodos["Switch"]->adyacentes.push_back(nodos["PC2"]);
        nodos["PC2"]->adyacentes.push_back(nodos["Switch"]);
    }
    
    ~Red() {
        map<string, NodoGrafo*>::iterator it;
        for (it = nodos.begin(); it != nodos.end(); ++it) {
            delete it->second;
        }
    }
    
    void mostrarTopologia() {
        cout << "\n========================================" << endl;
        cout << "        TOPOLOGIA DE RED" << endl;
        cout << "========================================" << endl;
        cout << "\n     Firewall" << endl;
        cout << "        |" << endl;
        cout << "      Router" << endl;
        cout << "        |" << endl;
        cout << "      Switch" << endl;
        cout << "     /  |  \\" << endl;
        cout << "Servidor PC1 PC2" << endl;
        
        cout << "\nLista de Adyacencia:" << endl;
        cout << "----------------------------------------" << endl;
        
        map<string, NodoGrafo*>::iterator it;
        for (it = nodos.begin(); it != nodos.end(); ++it) {
            cout << it->first << " -> ";
            for (size_t i = 0; i < it->second->adyacentes.size(); i++) {
                cout << it->second->adyacentes[i]->nombre;
                if (i < it->second->adyacentes.size() - 1) {
                    cout << ", ";
                }
            }
            cout << endl;
        }
        cout << "========================================" << endl;
    }
    
    void simulacionInfeccionMasiva(string origen) {
        cout << "\n========================================" << endl;
        cout << "   SIMULACION DE INFECCION MASIVA (BFS)" << endl;
        cout << "========================================" << endl;
        
        if (nodos.find(origen) == nodos.end()) {
            cout << "Error: Nodo '" << origen << "' no encontrado!" << endl;
            return;
        }
        
        map<string, bool> visitados;
        limpiarVisitados(visitados);
        
        queue<NodoGrafo*> cola;
        vector<string> ordenInfeccion;
        
        cola.push(nodos[origen]);
        visitados[origen] = true;
        
        cout << "\nProceso de infeccion (BFS):" << endl;
        cout << "----------------------------------------" << endl;
        
        while (!cola.empty()) {
            NodoGrafo* actual = cola.front();
            cola.pop();
            ordenInfeccion.push_back(actual->nombre);
            
            cout << "Infectando: " << actual->nombre << endl;
            
            for (size_t i = 0; i < actual->adyacentes.size(); i++) {
                NodoGrafo* vecino = actual->adyacentes[i];
                if (!visitados[vecino->nombre]) {
                    visitados[vecino->nombre] = true;
                    cola.push(vecino);
                    cout << "  -> Propagando a: " << vecino->nombre << endl;
                }
            }
        }
        
        cout << "\nOrden de infeccion:" << endl;
        cout << "----------------------------------------" << endl;
        for (size_t i = 0; i < ordenInfeccion.size(); i++) {
            cout << i+1 << ". " << ordenInfeccion[i] << endl;
        }
        
        cout << "\nTotal de equipos infectados: " << ordenInfeccion.size() << endl;
        cout << "========================================" << endl;
    }
    
    void auditoriaSeguridad(string inicio) {
        cout << "\n========================================" << endl;
        cout << "       AUDITORIA DE SEGURIDAD (DFS)" << endl;
        cout << "========================================" << endl;
        
        if (nodos.find(inicio) == nodos.end()) {
            cout << "Error: Nodo '" << inicio << "' no encontrado!" << endl;
            return;
        }
        
        map<string, bool> visitados;
        limpiarVisitados(visitados);
        
        stack<NodoGrafo*> pila;
        vector<string> ordenAuditoria;
        
        pila.push(nodos[inicio]);
        
        cout << "\nRecorrido de auditoria (DFS):" << endl;
        cout << "----------------------------------------" << endl;
        
        while (!pila.empty()) {
            NodoGrafo* actual = pila.top();
            pila.pop();
            
            if (!visitados[actual->nombre]) {
                visitados[actual->nombre] = true;
                ordenAuditoria.push_back(actual->nombre);
                
                cout << "Auditando: " << actual->nombre << endl;
                
                // Push vecinos en orden inverso para mantener orden natural
                for (int i = actual->adyacentes.size() - 1; i >= 0; i--) {
                    NodoGrafo* vecino = actual->adyacentes[i];
                    if (!visitados[vecino->nombre]) {
                        pila.push(vecino);
                        cout << "  -> Descubriendo: " << vecino->nombre << endl;
                    }
                }
            }
        }
        
        cout << "\nOrden de auditoria (profundidad):" << endl;
        cout << "----------------------------------------" << endl;
        for (size_t i = 0; i < ordenAuditoria.size(); i++) {
            cout << i+1 << ". " << ordenAuditoria[i] << endl;
        }
        
        // Verificar si hay nodos aislados o vulnerables
        cout << "\nAnalisis de vulnerabilidades:" << endl;
        cout << "----------------------------------------" << endl;
        
        bool todosAuditados = true;
        map<string, NodoGrafo*>::iterator it;
        for (it = nodos.begin(); it != nodos.end(); ++it) {
            if (!visitados[it->first]) {
                cout << "ALERTA: " << it->first << " no fue auditado!" << endl;
                todosAuditados = false;
            }
        }
        
        if (todosAuditados) {
            cout << "Todos los nodos fueron auditados exitosamente." << endl;
        }
        
        // Detectar PC1 como brecha de seguridad
        cout << "\nDETECCION DE BRECHA:" << endl;
        cout << "----------------------------------------" << endl;
        cout << "Se ha detectado una brecha de seguridad en la PC1!" << endl;
        cout << "Recomendacion: Aislar PC1 de la red inmediatamente." << endl;
        
        cout << "========================================" << endl;
    }
    
    void mostrarMenu() {
        int opcion;
        string nodoOrigen;
        
        do {
            cout << "\n";
            cout << "========================================" << endl;
            cout << "     SISTEMA DE SEGURIDAD DE RED" << endl;
            cout << "========================================" << endl;
            cout << "  [1] Mostrar Topologia de Red" << endl;
            cout << "  [2] Simular Infeccion Masiva (BFS)" << endl;
            cout << "  [3] Auditoria de Seguridad (DFS)" << endl;
            cout << "  [4] Salir" << endl;
            cout << "========================================" << endl;
            cout << "Seleccione una opcion: ";
            cin >> opcion;
            
            switch(opcion) {
                case 1:
                    mostrarTopologia();
                    break;
                    
                case 2:
                    cout << "\nIngrese nodo origen (Firewall/Router/Switch/Servidor/PC1/PC2): ";
                    cin >> nodoOrigen;
                    simulacionInfeccionMasiva(nodoOrigen);
                    break;
                    
                case 3:
                    cout << "\nIngrese nodo inicio auditoria (Firewall/Router/Switch/Servidor/PC1/PC2): ";
                    cin >> nodoOrigen;
                    auditoriaSeguridad(nodoOrigen);
                    break;
                    
                case 4:
                    cout << "\nSaliendo del sistema de seguridad..." << endl;
                    break;
                    
                default:
                    cout << "\nOpcion no valida. Intente de nuevo." << endl;
                    break;
            }
            
        } while(opcion != 4);
    }
};

int main() {
    Red red;
    
    cout << "=== SISTEMA DE DETECCION Y AUDITORIA DE RED ===" << endl;
    cout << "Brecha de seguridad detectada en PC1" << endl;
    cout << "Iniciando protocolo de seguridad..." << endl;
    
    red.mostrarMenu();
    
    return 0;
}
