
document.querySelector('#email').addEventListener('blur', function(){
    sendAjax('http://localhost:8080/check', email.value, );
});
function sendAjax(url, valueEmail, ) {
    valueEmail = JSON.stringify({'email' : valueEmail, 'state' : "id"});         //객체 ->문자열

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(valueEmail);
    xhr.addEventListener('load', function(){
        var result = JSON.parse(xhr.responseText);

        if (result.result === 'ok'){
            document.getElementById('output').innerText = "사용가능한 아이디입니다.";     //54_line
        
        }
        else{
            document.getElementById('output').innerText = "이미 사용중이거나 탈퇴한 아이디입니다.";
        }
    });
}
function checkID(){
    var textM = document.getElementById('output').innerText;
    if(textM === "사용가능한 아이디입니다."){
        alert("회원가입되었습니다.");
        return true;
    }
    else{
        alert('중복확인을 해주세요');
        return false;
    }
}