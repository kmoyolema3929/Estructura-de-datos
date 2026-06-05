#include "Nodo.h"

Nodo::Nodo(Empleado emp) {
    dato = emp;
    izquierdo = nullptr;
    derecho = nullptr;
}