/*C++*/
#include<iostream>
using namespace std;
int add(int a, int b){
 	return a+b; 
}
int sub(int a, int b){
 	return a-b; 
}
int divi(int a, int b){
 	return a/b; 
}
int mul(int a, int b){
 	return a*b; 
}

int main(){
  	
    int a, b, x, y, c; 
    cout << "정수입력 :" <<endl;
    cin >> x;
  	printf("%d\n", x);
	cout << "정수입력 :" <<endl;
    cin >> y;
	printf("%d\n", y);
	cout << "+ : " << add(x,y) << endl;
    cout << "- : " << sub(x,y) << endl;
	cout << "/ : " << divi(x,y) << endl;
	cout << "* : " << mul(x,y) << endl;
  	
    for (a=0; a<5; a++) {
    	for (b=0;b<=a; b++) {
        	printf("*");
        }
        printf("\n");
    }

    for (a=0; a<5; a++) {
        for (b=a; b<=5-1; b++) {
            printf(" "); 
        }
        for (c = 0; c <=(a*2); c++){
            printf("*");
        } 
        printf("\n");
    }
  	return 0;
}

