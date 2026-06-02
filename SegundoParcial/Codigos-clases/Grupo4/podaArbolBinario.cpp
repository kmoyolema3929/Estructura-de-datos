#include <iostream>
using namespace std;

// Estructura base en C++
struct Nodo {
    int decision;
    Nodo* izq;
    Nodo* der;
    bool esHoja;

    // Constructor para inicializar
    Nodo(int val, bool hoja = false) {
        decision = val;
        izq = NULL;
        der = NULL;
        esHoja = hoja;
    }
};

// Funcion para podar el arbol
void aplicarPoda(Nodo* &raiz) {
    // Si el nodo es nulo o es hoja, no hay nada que podar
    if (raiz == NULL || raiz->esHoja) return;

    // 1. Recursion para llegar a las ramas finales
    aplicarPoda(raiz->izq);
    aplicarPoda(raiz->der);

    // Verificar que los hijos existan (no sean nulos)
    if (raiz->izq != NULL && raiz->der != NULL) {
        // 2. Logica de Poda: Si ambos hijos son hojas y tienen la misma decision
        if (raiz->izq->esHoja && raiz->der->esHoja && 
            raiz->izq->decision == raiz->der->decision) {
            
            int valorFinal = raiz->izq->decision;

            // Eliminar los hijos
            delete raiz->izq;
            delete raiz->der;
            raiz->izq = NULL;
            raiz->der = NULL;
            
            // Convertir al padre en hoja
            raiz->esHoja = true;
            raiz->decision = valorFinal;
            
            cout << "Nodo podado y simplificado." << endl;
        }
    }
}

// Funcion para imprimir el arbol (recorrido preorden)
void imprimirArbol(Nodo* raiz, int nivel = 0) {
    if (raiz == NULL) return;
    
    // Indentacion para visualizar niveles
    for (int i = 0; i < nivel; i++) cout << "  ";
    
    if (raiz->esHoja) {
        cout << "Hoja: " << raiz->decision << endl;
    } else {
        cout << "Nodo interno: " << raiz->decision << endl;
        imprimirArbol(raiz->izq, nivel + 1);
        imprimirArbol(raiz->der, nivel + 1);
    }
}

// Funcion para liberar memoria del arbol
void liberarArbol(Nodo* &raiz) {
    if (raiz == NULL) return;
    
    if (!raiz->esHoja) {
        liberarArbol(raiz->izq);
        liberarArbol(raiz->der);
    }
    
    delete raiz;
    raiz = NULL;
}

int main() {
    // Crear arbol de ejemplo:
    //        N1(0)
    //       /     \
    //    H1(1)   H2(1)  -> Ambos hijos son hojas con mismo valor (1)
    //                    -> Despues de poda, N1 se convierte en hoja con valor 1
    
    // Crear nodos
    Nodo* hoja1 = new Nodo(1, true);   // Hoja con valor 1
    Nodo* hoja2 = new Nodo(1, true);   // Hoja con valor 1
    Nodo* raiz = new Nodo(0, false);   // Nodo interno con valor 0
    
    raiz->izq = hoja1;
    raiz->der = hoja2;
    
    cout << "=== ARBOL ANTES DE LA PODA ===" << endl;
    imprimirArbol(raiz);
    
    cout << "\n=== APLICANDO PODA ===" << endl;
    aplicarPoda(raiz);
    
    cout << "\n=== ARBOL DESPUES DE LA PODA ===" << endl;
    imprimirArbol(raiz);
    
    // Liberar memoria
    liberarArbol(raiz);
    
    return 0;
}
