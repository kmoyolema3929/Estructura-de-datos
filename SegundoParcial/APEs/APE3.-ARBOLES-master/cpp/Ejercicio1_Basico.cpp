#include <iostream>
#include <vector>
using namespace std;

struct NodoN {
    int valor;
    vector<NodoN*> hijos;
    NodoN(int v) : valor(v) {}
};

int contarNodos(NodoN* raiz) {
    if (raiz == nullptr) return 0;
    int count = 1; // Contar el nodo actual
    for (NodoN* hijo : raiz->hijos) {
        count += contarNodos(hijo);
    }
    return count;
}

int main() {
    // Construimos el árbol
    NodoN* n5 = new NodoN(5);
    NodoN* n6 = new NodoN(6);
    NodoN* n2 = new NodoN(2);
    n2->hijos.push_back(n5);
    n2->hijos.push_back(n6);
    NodoN* n3 = new NodoN(3);
    NodoN* n4 = new NodoN(4);
    NodoN* raiz = new NodoN(1);
    raiz->hijos.push_back(n2);
    raiz->hijos.push_back(n3);
    raiz->hijos.push_back(n4);

    cout << "--- Prueba Ejercicio 1 ---" << endl;
    cout << "Nodos esperados: 6" << endl;
    cout << "Nodos calculados: " << contarNodos(raiz) << endl;
    
    return 0;
}