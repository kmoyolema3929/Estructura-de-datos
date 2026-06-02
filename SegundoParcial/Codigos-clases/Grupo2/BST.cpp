#include<iostream>
using namespace std;

class TreeNode{

	public:
		int value;
		TreeNode *left;
		TreeNode *right;
		
		TreeNode(){
			value=0;
			left = NULL;
			right = NULL;
		}
};

class BST{
	public:
		TreeNode *root;
		
		BST(){  // Correccion: antes decia BTS()
			root = NULL;
			
		}
		
		bool isEmpty(){
			if(root == NULL){
				return true;
			}else{
				return false;
			}
		}
		
		
	void insertNode(TreeNode *new_node){
		if(root == NULL){
			root = new_node;
			cout <<"Valor insertado como root"<<endl;
		}else{
			TreeNode *temp = root;
			while(temp != NULL){
				
				if (new_node->value == temp->value){ 
					cout <<"El valor ingresado ya existe, ingrese otro valor" <<endl;
					return;  // Salir para no duplicar
				}
				else if((new_node->value < temp->value) && (temp->left == NULL)){
					temp->left = new_node;
					cout <<"Valor insertado a la izquierda"<<endl;
					break;
				}
				else if (new_node->value < temp->value ){
					temp = temp->left;
				}
				else if((new_node->value > temp->value) && (temp->right == NULL)){ // Correccion: operador correcto
					temp->right = new_node;
					cout <<"Valor insertado a la derecha"<<endl;
					break;
				}
				else if (new_node->value > temp->value ){
					temp = temp->right;
				}
			}
		}
	}
	
	// Mostrar en orden (in-order traversal)
	void inOrder(TreeNode *nodo){
		if(nodo == NULL) return;
		inOrder(nodo->left);
		cout << nodo->value << " ";
		inOrder(nodo->right);
	}
	
	// Mostrar pre-orden
	void preOrder(TreeNode *nodo){
		if(nodo == NULL) return;
		cout << nodo->value << " ";
		preOrder(nodo->left);
		preOrder(nodo->right);
	}
	
	// Mostrar post-orden
	void postOrder(TreeNode *nodo){
		if(nodo == NULL) return;
		postOrder(nodo->left);
		postOrder(nodo->right);
		cout << nodo->value << " ";
	}
	
	// Buscar un valor
	TreeNode* buscar(int val){
		TreeNode *temp = root;
		while(temp != NULL){
			if(val == temp->value){
				return temp;
			}
			else if(val < temp->value){
				temp = temp->left;
			}
			else{
				temp = temp->right;
			}
		}
		return NULL;
	}
};

int main(){
	BST arbol;
	int opcion, valor;
	
	do{
		cout << "\n===== MENU ARBOL BINARIO DE BUSQUEDA =====" << endl;
		cout << "1. Insertar nodo" << endl;
		cout << "2. Mostrar en orden (In-Order)" << endl;
		cout << "3. Mostrar en pre-orden (Pre-Order)" << endl;
		cout << "4. Mostrar en post-orden (Post-Order)" << endl;
		cout << "5. Buscar valor" << endl;
		cout << "6. Verificar si esta vacio" << endl;
		cout << "0. Salir" << endl;
		cout << "Ingrese opcion: ";
		cin >> opcion;
		
		switch(opcion){
			case 1:
				cout << "Ingrese valor entero a insertar: ";
				cin >> valor;
				{
					TreeNode *nuevo = new TreeNode();
					nuevo->value = valor;
					arbol.insertNode(nuevo);
				}
				break;
				
			case 2:
				if(arbol.isEmpty()){
					cout << "El arbol esta vacio" << endl;
				}else{
					cout << "Recorrido In-Order: ";
					arbol.inOrder(arbol.root);
					cout << endl;
				}
				break;
				
			case 3:
				if(arbol.isEmpty()){
					cout << "El arbol esta vacio" << endl;
				}else{
					cout << "Recorrido Pre-Order: ";
					arbol.preOrder(arbol.root);
					cout << endl;
				}
				break;
				
			case 4:
				if(arbol.isEmpty()){
					cout << "El arbol esta vacio" << endl;
				}else{
					cout << "Recorrido Post-Order: ";
					arbol.postOrder(arbol.root);
					cout << endl;
				}
				break;
				
			case 5:
				if(arbol.isEmpty()){
					cout << "El arbol esta vacio" << endl;
				}else{
					cout << "Ingrese valor a buscar: ";
					cin >> valor;
					TreeNode *encontrado = arbol.buscar(valor);
					if(encontrado != NULL){
						cout << "Valor " << valor << " encontrado en el arbol" << endl;
					}else{
						cout << "Valor " << valor << " NO encontrado" << endl;
					}
				}
				break;
				
			case 6:
				if(arbol.isEmpty()){
					cout << "El arbol esta VACIO" << endl;
				}else{
					cout << "El arbol NO esta vacio" << endl;
				}
				break;
				
			case 0:
				cout << "Saliendo del programa..." << endl;
				break;
				
			default:
				cout << "Opcion no valida. Intente de nuevo" << endl;
		}
		
	}while(opcion != 0);
	
	return 0;
}
