#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Nodo {
public:
    string nombre;
    vector<Nodo*> hijos;

    Nodo(string nombre) {
        this->nombre = nombre;
    }

    void agregarHijo(Nodo* hijo) {
        hijos.push_back(hijo);
    }
};

void imprimirArbol(Nodo* nodo, int nivel = 0) {
    for (int i = 0; i < nivel; i++) {
        cout << "  ";
    }
    cout << "- " << nodo->nombre << endl;
    for (int i = 0; i < nodo->hijos.size(); i++) {
        imprimirArbol(nodo->hijos[i], nivel + 1);
    }
}

Nodo* buscarNodo(Nodo* raiz, string nombre) {
    if (raiz->nombre == nombre) {
        return raiz;
    }
    for (int i = 0; i < raiz->hijos.size(); i++) {
        Nodo* encontrado = buscarNodo(raiz->hijos[i], nombre);
        if (encontrado != NULL) {
            return encontrado;
        }
    }
    return NULL;
}

void eliminarNodo(Nodo* raiz, string nombre) {
    if (raiz->nombre == nombre) {
        cout << "No se puede eliminar la raiz del arbol." << endl;
        return;
    }
    
    for (int i = 0; i < raiz->hijos.size(); i++) {
        if (raiz->hijos[i]->nombre == nombre) {
            delete raiz->hijos[i];
            raiz->hijos.erase(raiz->hijos.begin() + i);
            cout << "Nodo '" << nombre << "' eliminado exitosamente." << endl;
            return;
        }
    }
    
    for (int i = 0; i < raiz->hijos.size(); i++) {
        eliminarNodo(raiz->hijos[i], nombre);
    }
}

void insertarNodo(Nodo* raiz) {
    string padreNombre, hijoNombre;
    cout << "Ingrese el nombre del nodo padre: ";
    cin >> padreNombre;
    
    Nodo* padre = buscarNodo(raiz, padreNombre);
    if (padre == NULL) {
        cout << "No se encontro el nodo padre." << endl;
        return;
    }
    
    cout << "Ingrese el nombre del nuevo nodo: ";
    cin >> hijoNombre;
    
    Nodo* existente = buscarNodo(raiz, hijoNombre);
    if (existente != NULL) {
        cout << "Ya existe un nodo con ese nombre." << endl;
        return;
    }
    
    Nodo* nuevoNodo = new Nodo(hijoNombre);
    padre->agregarHijo(nuevoNodo);
    cout << "Nodo '" << hijoNombre << "' insertado exitosamente." << endl;
}

void mostrarMenu() {
    cout << "\n=== MENU DE ARBOL JERARQUICO ===" << endl;
    cout << "1. Insertar nodo" << endl;
    cout << "2. Eliminar nodo" << endl;
    cout << "3. Buscar nodo" << endl;
    cout << "4. Mostrar arbol" << endl;
    cout << "5. Salir" << endl;
    cout << "Seleccione una opcion: ";
}

int main() {
    // Crear el árbol inicial
    Nodo* empresa = new Nodo("EMPRESA");
    
    Nodo* gerenteGeneral = new Nodo("GERENTE GENERAL");
    empresa->agregarHijo(gerenteGeneral);
    
    Nodo* ventas = new Nodo("GERENTE DE VENTAS");
    Nodo* operaciones = new Nodo("GERENTE DE OPERACIONES");
    Nodo* finanzas = new Nodo("GERENTE DE FINANZAS");
    
    gerenteGeneral->agregarHijo(ventas);
    gerenteGeneral->agregarHijo(operaciones);
    gerenteGeneral->agregarHijo(finanzas);
    
    ventas->agregarHijo(new Nodo("EMP 1"));
    ventas->agregarHijo(new Nodo("EMP 2"));
    operaciones->agregarHijo(new Nodo("EMP 3"));
    operaciones->agregarHijo(new Nodo("EMP 4"));
    finanzas->agregarHijo(new Nodo("EMP 5"));
    finanzas->agregarHijo(new Nodo("EMP 6"));
    
    int opcion;
    do {
        mostrarMenu();
        cin >> opcion;
        
        switch(opcion) {
            case 1:
                insertarNodo(empresa);
                break;
            case 2: {
                string nombre;
                cout << "Ingrese el nombre del nodo a eliminar: ";
                cin >> nombre;
                eliminarNodo(empresa, nombre);
                break;
            }
            case 3: {
                string nombre;
                cout << "Ingrese el nombre del nodo a buscar: ";
                cin >> nombre;
                Nodo* encontrado = buscarNodo(empresa, nombre);
                if (encontrado != NULL) {
                    cout << "Nodo '" << nombre << "' encontrado." << endl;
                } else {
                    cout << "Nodo '" << nombre << "' no encontrado." << endl;
                }
                break;
            }
            case 4:
                cout << "\nArbol jerarquico:" << endl;
                imprimirArbol(empresa);
                break;
            case 5:
                cout << "Saliendo del programa..." << endl;
                break;
            default:
                cout << "Opcion invalida. Intente nuevamente." << endl;
        }
    } while(opcion != 5);
    
    // Liberar memoria (opcional para este ejemplo)
    // En un programa real, deberías liberar toda la memoria
    
    return 0;
}
