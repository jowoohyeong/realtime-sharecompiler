document.querySelector('.overlapPW').addEventListener('click', function () {
    sendAjax('http://localhost:8080/check', email.value, pwd.value);
})

function sendAjax(url, valueEmail, valuePW,) {
    valueEmail = JSON.stringify({ 'email': valueEmail, 'pwd': valuePW, 'state': "pwd" });         //객체 ->문자열

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(valueEmail);
    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        if (result.result === 'ok') document.getElementById('output').innerText = "비밀번호가 일치합니다.";
        else document.getElementById('output').innerText = "비밀번호가 일치하지 않습니다.";
    });
}
function check() {
    var textM = document.getElementById('output').innerText;
    if (textM === "비밀번호가 일치합니다.") {
        alert('수정완료');
        return true;
    }
    else {
        alert('비밀번호를 확인해주세요');
        return false;
    }
}
function chse() {
    let TF = confirm('탈퇴하시겠습니까?');
    if (TF) return true;
    else return false;
}