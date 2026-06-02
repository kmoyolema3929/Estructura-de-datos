#include <iostream>
#include <string>
#include <cstdlib>
#include <cctype>
using namespace std;

// Nodo del arbol binario
struct Nodo {
    char operador;
    double valor;
    Nodo* izquierdo;
    Nodo* derecho;
    bool esOperador;

    Nodo(double val) {
        valor = val;
        esOperador = false;
        izquierdo = NULL;
        derecho = NULL;
    }

    Nodo(char op, Nodo* izq, Nodo* der) {
        operador = op;
        esOperador = true;
        izquierdo = izq;
        derecho = der;
    }
};

// Clase ArbolExpresion
class ArbolExpresion {
private:
    Nodo* raiz;

    double evaluar(Nodo* nodo) {
        if (nodo == NULL) return 0;
        if (!nodo->esOperador) return nodo->valor;

        double izquierdoVal = evaluar(nodo->izquierdo);
        double derechoVal = evaluar(nodo->derecho);

        switch (nodo->operador) {
            case '+': return izquierdoVal + derechoVal;
            case '-': return izquierdoVal - derechoVal;
            case '*': return izquierdoVal * derechoVal;
            case '/': return izquierdoVal / derechoVal;
            default: return 0;
        }
    }

    void destruir(Nodo* nodo) {
        if (nodo == NULL) return;
        destruir(nodo->izquierdo);
        destruir(nodo->derecho);
        delete nodo;
    }

public:
    ArbolExpresion() {
        raiz = NULL;
    }

    ~ArbolExpresion() {
        destruir(raiz);
    }

    void construirDesdeString(const string& expr) {
        raiz = construir(expr);
    }

    Nodo* construir(const string& expr) {
        // Buscar el ultimo operador (fuera de parentesis) como raiz
        int nivel = 0;
        int pos = -1;
        int prioridad = -1;

        for (int i = 0; i < expr.length(); i++) {
            char c = expr[i];
            if (c == '(') nivel++;
            else if (c == ')') nivel--;
            else if (nivel == 0 && (c == '+' || c == '-')) {
                pos = i;
                prioridad = 1;
            }
            else if (nivel == 0 && (c == '*' || c == '/') && prioridad < 1) {
                pos = i;
                prioridad = 2;
            }
        }

        // Si se encontro un operador
        if (pos != -1) {
            string izquierdaExpr = expr.substr(0, pos);
            string derechaExpr = expr.substr(pos + 1);
            char op = expr[pos];

            Nodo* izq = construir(izquierdaExpr);
            Nodo* der = construir(derechaExpr);
            return new Nodo(op, izq, der);
        }

        // Si no hay operador, puede ser un numero o una expresion entre parentesis
        if (expr[0] == '(' && expr[expr.length()-1] == ')') {
            string interna = expr.substr(1, expr.length()-2);
            return construir(interna);
        }

        // Es un numero
        double num = atof(expr.c_str());
        return new Nodo(num);
    }

    double obtenerValor() {
        return evaluar(raiz);
    }

    void imprimirPreorden(Nodo* nodo) {
        if (nodo == NULL) return;
        if (nodo->esOperador) {
            cout << nodo->operador << " ";
            imprimirPreorden(nodo->izquierdo);
            imprimirPreorden(nodo->derecho);
        } else {
            cout << nodo->valor << " ";
            imprimirPreorden(nodo->izquierdo);
            imprimirPreorden(nodo->derecho);
        }
    }

    void imprimirArbol() {
        cout << "Recorrido preorden: ";
        imprimirPreorden(raiz);
        cout << endl;
    }
};

int main() {
    string expresion;
    cout << "Ingrese una expresion aritmetica simple: ";
    getline(cin, expresion);

    ArbolExpresion arbol;
    arbol.construirDesdeString(expresion);

    cout << "\nArbol binario de expresion construido." << endl;
    arbol.imprimirArbol();

    double resultado = arbol.obtenerValor();
    cout << "Resultado: " << resultado << endl;

    system("pause");
    return 0;
}
