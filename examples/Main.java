public class test{
    public static <T>T arraySum(T[] a){

        return a[a.length/2];
        
    }
    public static <T> T min(T[] a){
        if (a == null || a.length ==0) return null;
        T smallest = a[0];
        for (int i=1; i <a.length; i++){
            if (smallest.compareTo(a[i])   >   0) smallest = a[i];
        }
        return smallest;
    }

    public static void main(String[] args) {
        String[] names = {"O", "X", "Middle","NO" ,"YES"};
        
        String result = arraySum(names);
        System.out.println(result);

        String result2 = arraySum(names);
        System.out.println(result);
        

    }
}
