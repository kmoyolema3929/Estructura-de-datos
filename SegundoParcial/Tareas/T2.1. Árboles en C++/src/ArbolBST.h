#ifndef ARBOLBST_H
#define ARBOLBST_H

#include "Nodo.h"

class ArbolBST {
private:
    Nodo* raiz;

    // Métodos privados
    Nodo* insertar(Nodo* nodo, Empleado emp);
    Nodo* buscar(Nodo* nodo, int codigo);
    void inorden(Nodo* nodo);
    void preorden(Nodo* nodo);
    void postorden(Nodo* nodo);
    int altura(Nodo* nodo);
    void mostrarHojas(Nodo* nodo);
    void mostrarEmpleado(Nodo* nodo);

public:
    ArbolBST();
    
    // Métodos públicos
    void insertarEmpleado(Empleado emp);
    void buscarEmpleado(int codigo);
    void mostrarRaiz();
    void mostrarInorden();
    void mostrarPreorden();
    void mostrarPostorden();
    void mostrarAltura();
    void mostrarNodosHoja();
};

#endif