/*C++*/
#include<iostream>
using namespace std;
int add(int a, int b){
  return a+b; 
}int sub(int a, int b){
  return a-b; 
}
int divi(int a, int b){
  return a/b;
}
int mul(int a, int b){
  return a*b; 
}
void star1() {
  int a, b;
  for (a=0; a<5; a++) {
    for (b=0;b<=a; b++) {
      printf("*");
    }
    printf("\n");
  }
}
void star2() {
  int a, b,c;
  for (a=0; a<5; a++) {
    for (b=a; b<=5-1; b++) {
      printf(" ");
    }
    for (c = 0; c <=(a*2); c++){
      printf("*");
    }
    printf("\n");    
  }
}
int main(){
  int x, y, c;
  cout << "정수입력 :";
  cin >> x;
  printf("%d\n", x);
  cout << "정수입력 :";
  cin >> y;
  printf("%d\n", y);
  printf("--------------------\n");
  
  cout << "+ : " << add(x,y) << endl;
  cout << "- : " << sub(x,y) << endl;
  cout << "/ : " << divi(x,y) << endl;
  cout << "* : " << mul(x,y) << endl;
 
  star1();
  star2();
  return 0;
}