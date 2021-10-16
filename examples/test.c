/*C*/
#include <stdio.h>

int main(){
    int num1, num2;
	int a, b, c;
  
    printf("정수를 입력하세요: ");
	scanf("%d", &num1); 
	printf("%d\n", num1);

  	printf("정수를 입력하세요: ");
    scanf("%d", &num2); 
	printf("%d\n\n", num2);
  
  	printf("+ : %d\n", add(num1,num2));
	printf("- : %d\n", sub(num1,num2));
  	printf("/ : %d\n", div(num1,num2));
  	printf("* : %d\n", mul(num1,num2));
  
  	printf("-----------------\n");
	
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
int add(int a, int b){
 	return a+b; 
}
int sub(int a, int b){
 	return a-b; 
}
int div(int a, int b){
 	return a/b; 
}
int mul(int a, int b){
 	return a*b; 
}
