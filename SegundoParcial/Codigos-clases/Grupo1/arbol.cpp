#include <iostream>
#include <vector>
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

int main() {
    // Raíz
    Nodo* empresa = new Nodo("EMPRESA");

    // Nivel 1
    Nodo* gerenteGeneral = new Nodo("GERENTE GENERAL");
    empresa->agregarHijo(gerenteGeneral);

    // Nivel 2
    Nodo* ventas = new Nodo("GERENTE DE VENTAS");
    Nodo* operaciones = new Nodo("GERENTE DE OPERACIONES");
    Nodo* finanzas = new Nodo("GERENTE DE FINANZAS");

    gerenteGeneral->agregarHijo(ventas);
    gerenteGeneral->agregarHijo(operaciones);
    gerenteGeneral->agregarHijo(finanzas);

    // Nivel 3 (hojas)
    ventas->agregarHijo(new Nodo("EMP 1"));
    ventas->agregarHijo(new Nodo("EMP 2"));

    operaciones->agregarHijo(new Nodo("EMP 3"));
    operaciones->agregarHijo(new Nodo("EMP 4"));

    finanzas->agregarHijo(new Nodo("EMP 5"));
    finanzas->agregarHijo(new Nodo("EMP 6"));

    // Imprimir
    imprimirArbol(empresa);

    return 0;
}
