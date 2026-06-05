#include <iostream>
#include <string>
#include "ArbolBST.h"

using namespace std;

int main() {
    ArbolBST arbol;
    int opcion;

    do {
        cout << "\n===== MENU ARBOL BST EMPRESARIAL =====\n";
        cout << "1. Insertar empleado\n";
        cout << "2. Buscar empleado\n";
        cout << "3. Mostrar raiz\n";
        cout << "4. Recorrido inorden\n";
        cout << "5. Recorrido preorden\n";
        cout << "6. Recorrido postorden\n";
        cout << "7. Mostrar altura\n";
        cout << "8. Mostrar hojas\n";
        cout << "0. Salir\n";
        cout << "Seleccione una opcion: ";
        cin >> opcion;

        if (opcion == 1) {
            Empleado emp;
            cout << "Codigo: ";
            cin >> emp.codigo;
            cin.ignore();

            cout << "Nombre: ";
            getline(cin, emp.nombre);

            cout << "Cargo: ";
            getline(cin, emp.cargo);

            arbol.insertarEmpleado(emp);
        } 
        else if (opcion == 2) {
            int codigo;
            cout << "Ingrese codigo a buscar: ";
            cin >> codigo;
            arbol.buscarEmpleado(codigo);
        } 
        else if (opcion == 3) {
            arbol.mostrarRaiz();
        } 
        else if (opcion == 4) {
            arbol.mostrarInorden();
        } 
        else if (opcion == 5) {
            arbol.mostrarPreorden();
        } 
        else if (opcion == 6) {
            arbol.mostrarPostorden();
        } 
        else if (opcion == 7) {
            arbol.mostrarAltura();
        } 
        else if (opcion == 8) {
            arbol.mostrarNodosHoja();
        }

    } while (opcion != 0);

    return 0;
}