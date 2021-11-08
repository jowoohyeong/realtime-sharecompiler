function sendAjax(data, page){
    let url ='http://localhost:8080/userlist';
    var data = {'email' : data, 'page' : page};
    
    data = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', "application/json");
    xhr.send(data);
    
    xhr.addEventListener('load', function(){
        var result = JSON.parse(xhr.responseText);
        if(result.result !== 'ok') return;
        
        update_userlist(result.users);
    });
} 
function update_userlist(users){
    $(".userLog").empty();
    $.each(users, function(key, value){
        $(".userLog").append(value + "\n");
    })
    $("#userCount").empty();
    $("#userCount").append("접속인원 : "+ users.length + "명");
}
