#python
def add(a, b):
  return a+b
def sub(first, second):
  return first-second
def div(first, second):
  return first/second
def mul(first, second):
  return first*second


print("num input : ", end=" ");
a = int(input())
print(a)
print("num input : ", end=" ");
a1 = int(input())
print(a1)

print("add: ", add(a,a1))
print("sub: ", sub(a,a1))
print("div: ", div(a,a1))
print("mul: ", mul(a,a1))

print('\n')
alphabets = "abcdefghijklmnopqrstuvwxyz"
for c in alphabets: 
    print(c, end="-")

print('\n')
b = []
c = [1, 2, 3] 

b.append(4)
c.append(5)
b.append(6)
b.append(7)
c.append(8)
print(b)
print(c,"\n")

print(1 == 1)
print(1 == 2)
print(1 != 1)
print(1 != 2)
print(1 > 1)
print(1 < 2)
print(1 >= 1)
print(1 >= 2)
print(1 <= 2, '\n')

for a in range(0, 5, 1):
  for b in range(0, a+1, 1):
    print("*", end='')
  print();
print('\n')
  
for a in range(0, 5, 1):
  for b in range(a, 5, 1):
    print(" ", end='') 
  for c in range(0, (a*2)+1, 1):
    print("*", end='')
  print();
