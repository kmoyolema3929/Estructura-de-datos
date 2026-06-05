#ifndef NODO_H
#define NODO_H

#include "Empleado.h"

struct Nodo {
    Empleado dato;
    Nodo* izquierdo;
    Nodo* derecho;

    Nodo(Empleado emp);
};

#endif