#include <iostream>
#include <string>

using namespace std;

const int N = 6;
const int INF = 99999;

// Funcion para mostrar la ruta
void mostrarRuta(int padre[], int j)
{
    if (padre[j] == -1)
    {
        cout << j;
        return;
    }

    mostrarRuta(padre, padre[j]);
    cout << " -> " << j;
}

// Algoritmo de Dijkstra
void dijkstra(int matriz[N][N], int inicio, int destino, int otraMatriz[N][N])
{
    int distancia[N];
    bool visitado[N];
    int padre[N];

    for (int i = 0; i < N; i++)
    {
        distancia[i] = INF;
        visitado[i] = false;
        padre[i] = -1;
    }

    distancia[inicio] = 0;

    for (int contador = 0; contador < N - 1; contador++)
    {
        int min = INF;
        int u;

        for (int v = 0; v < N; v++)
        {
            if (!visitado[v] && distancia[v] <= min)
            {
                min = distancia[v];
                u = v;
            }
        }

        visitado[u] = true;

        for (int v = 0; v < N; v++)
        {
            if (!visitado[v] &&
                matriz[u][v] &&
                distancia[u] != INF &&
                distancia[u] + matriz[u][v] < distancia[v])
            {
                distancia[v] = distancia[u] + matriz[u][v];
                padre[v] = u;
            }
        }
    }

    cout << "\nRuta optima:\n";
    mostrarRuta(padre, destino);

    cout << "\n\nTotal principal: " << distancia[destino];

    // Calcular el otro costo
    int actual = destino;
    int otroTotal = 0;

    while (padre[actual] != -1)
    {
        otroTotal += otraMatriz[padre[actual]][actual];
        actual = padre[actual];
    }

    cout << "\nTotal secundario: " << otroTotal << endl;
}

void mostrarMatriz(int matriz[N][N], string nombre)
{
    cout << "\nMatriz de " << nombre << ":\n\n";

    for (int i = 0; i < N; i++)
    {
        for (int j = 0; j < N; j++)
        {
            cout << matriz[i][j] << "\t";
        }
        cout << endl;
    }
}

int main()
{
    // Matriz de dias
    int dias[N][N] =
    {
        {0, 4, 2, 0, 0, 0},
        {0, 0, 1, 5, 0, 0},
        {0, 0, 0, 8, 10, 0},
        {0, 0, 0, 0, 2, 6},
        {0, 0, 0, 0, 0, 3},
        {0, 0, 0, 0, 0, 0}
    };

    // Matriz de oro
    int oro[N][N] =
    {
        {0, 7, 3, 0, 0, 0},
        {0, 0, 2, 6, 0, 0},
        {0, 0, 0, 4, 8, 0},
        {0, 0, 0, 0, 1, 5},
        {0, 0, 0, 0, 0, 2},
        {0, 0, 0, 0, 0, 0}
    };

    int opcion;

    do
    {
        cout << "\n===== MENU =====\n";
        cout << "1. Mostrar mapa\n";
        cout << "2. Ruta mas rapida (Dias)\n";
        cout << "3. Ruta mas economica (Oro)\n";
        cout << "4. Salir\n";
        cout << "Seleccione: ";
        cin >> opcion;

        switch(opcion)
        {
            case 1:
                mostrarMatriz(dias, "Dias");
                mostrarMatriz(oro, "Oro");
                break;

            case 2:
                cout << "\nESCENARIO SPEEDRUNNER\n";
                dijkstra(dias, 0, 5, oro);
                break;

            case 3:
                cout << "\nESCENARIO MERCADER AVARO\n";
                dijkstra(oro, 0, 5, dias);
                break;

            case 4:
                cout << "\nSaliendo...\n";
                break;

            default:
                cout << "\nOpcion invalida\n";
        }

    } while(opcion != 4);

    return 0;
}
