#include "ArbolBST.h"
#include <iostream>
#include <algorithm>
using namespace std;

ArbolBST::ArbolBST() {
    raiz = nullptr;
}

Nodo* ArbolBST::insertar(Nodo* nodo, Empleado emp) {
    if (nodo == nullptr) {
        return new Nodo(emp);
    }

    if (emp.codigo < nodo->dato.codigo) {
        nodo->izquierdo = insertar(nodo->izquierdo, emp);
    } else if (emp.codigo > nodo->dato.codigo) {
        nodo->derecho = insertar(nodo->derecho, emp);
    } else {
        cout << "El codigo ya existe.\n";
    }

    return nodo;
}

Nodo* ArbolBST::buscar(Nodo* nodo, int codigo) {
    if (nodo == nullptr || nodo->dato.codigo == codigo) {
        return nodo;
    }

    if (codigo < nodo->dato.codigo) {
        return buscar(nodo->izquierdo, codigo);
    } else {
        return buscar(nodo->derecho, codigo);
    }
}

void ArbolBST::inorden(Nodo* nodo) {
    if (nodo != nullptr) {
        inorden(nodo->izquierdo);
        mostrarEmpleado(nodo);
        inorden(nodo->derecho);
    }
}

void ArbolBST::preorden(Nodo* nodo) {
    if (nodo != nullptr) {
        mostrarEmpleado(nodo);
        preorden(nodo->izquierdo);
        preorden(nodo->derecho);
    }
}

void ArbolBST::postorden(Nodo* nodo) {
    if (nodo != nullptr) {
        postorden(nodo->izquierdo);
        postorden(nodo->derecho);
        mostrarEmpleado(nodo);
    }
}

int ArbolBST::altura(Nodo* nodo) {
    if (nodo == nullptr) {
        return 0;
    }

    int alturaIzq = altura(nodo->izquierdo);
    int alturaDer = altura(nodo->derecho);

    return 1 + max(alturaIzq, alturaDer);
}

void ArbolBST::mostrarHojas(Nodo* nodo) {
    if (nodo != nullptr) {
        if (nodo->izquierdo == nullptr && nodo->derecho == nullptr) {
            mostrarEmpleado(nodo);
        }
        mostrarHojas(nodo->izquierdo);
        mostrarHojas(nodo->derecho);
    }
}

void ArbolBST::mostrarEmpleado(Nodo* nodo) {
    cout << "Codigo: " << nodo->dato.codigo
         << " | Nombre: " << nodo->dato.nombre
         << " | Cargo: " << nodo->dato.cargo << endl;
}

void ArbolBST::insertarEmpleado(Empleado emp) {
    raiz = insertar(raiz, emp);
}

void ArbolBST::buscarEmpleado(int codigo) {
    Nodo* resultado = buscar(raiz, codigo);

    if (resultado != nullptr) {
        cout << "\nEmpleado encontrado:\n";
        mostrarEmpleado(resultado);
    } else {
        cout << "\nEmpleado no encontrado.\n";
    }
}

void ArbolBST::mostrarRaiz() {
    if (raiz != nullptr) {
        cout << "\nRaiz del arbol:\n";
        mostrarEmpleado(raiz);
    } else {
        cout << "El arbol esta vacio.\n";
    }
}

void ArbolBST::mostrarInorden() {
    cout << "\nRecorrido Inorden:\n";
    inorden(raiz);
}

void ArbolBST::mostrarPreorden() {
    cout << "\nRecorrido Preorden:\n";
    preorden(raiz);
}

void ArbolBST::mostrarPostorden() {
    cout << "\nRecorrido Postorden:\n";
    postorden(raiz);
}

void ArbolBST::mostrarAltura() {
    cout << "\nAltura del arbol: " << altura(raiz) << endl;
}

void ArbolBST::mostrarNodosHoja() {
    cout << "\nNodos hoja:\n";
    mostrarHojas(raiz);
}