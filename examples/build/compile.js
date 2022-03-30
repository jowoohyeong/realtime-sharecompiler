let curlang = language.value;
let codeObj = initializeCode();
var editorElem = document.getElementById('textarea');
var editor = new CodeMirror(editorElem, {
    lineNumbers: true,
    autofocus: true,
    tabSize: 2,
});
editor.setOption('mode', 'text/x-csrc');
editor.setValue(codeObj['C']);
document.querySelector('.ajaxsend').addEventListener('click', function () {
    sendAjaxCode(editor.getValue(), language.value, $('#input').val());
});
document.querySelector('#register').addEventListener('click', function () {
    var title = prompt("글 제목을 입력하세요");
    if (title !== null) sendAjaxWrite($('#user_id').text(), title, editor.getValue(), "new");
});

document.querySelector('#submit').addEventListener('click', function () {
    var title = prompt("글 제목을 입력하세요\n양식 : 수업날짜_학번이름 \nex)1115_2016000000홍길동");
    if (title !== null) sendAjaxWrite($('#user_id').text(), title, editor.getValue(), "submit", $('#output')[0].value);
});
function sendAjaxWrite(email, title, body, process, output) {
    let url = 'http://localhost:8080/compile/register';
    var data = { 'email': email, 'title': title, 'body': body, 'process': process, "output":output};
    data = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);            //server.js로 보내기
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        if (result.result != 'ok') return;
        else return;
    });
}
function sendAjaxCode(code, lang, input) {
    let url = 'http://localhost:8080/form_receive';
    var data = { 'code': code, 'language': lang, 'input': input };
    data = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);            //server.js로 보내기
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        if (result.result != 'ok') return;
        document.getElementById('output').value = result.output;
    });
}
function sendAjaxSave(email, codeObj) {
    let url = 'http://localhost:8080/code_save';
    var data = { 'email': email, 'codepackage': codeObj };
    data = JSON.stringify(data);     
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        let resultObj = JSON.parse(result);
        if (resultObj) {
            console.log(resultObj)
            initializeCode(resultObj)
        }
    });
}
document.getElementById('language').addEventListener('change', (event) => {
    codeObj[curlang] = editor.getValue();
    editor.setValue(codeObj[language.value]);
    if (language.value === "C") editor.setOption('mode', 'text/x-csrc');
    else if (language.value === "C++") editor.setOption('mode', 'text/x-c++src');
    else if (language.value === "java") editor.setOption('mode', 'text/x-java');
    else if (language.value === "javascript") editor.setOption('mode', 'text/javascript');
    else if (language.value === "python") editor.setOption('mode', 'text/x-python');
    curlang = language.value;
})
document.getElementById('wrap').addEventListener('click', () => {
    if (editor.options.lineWrapping) {
        editor.setOption('lineWrapping', false);
        $('#wrap').text("자동 줄바꿈")
    } else {
        editor.setOption('lineWrapping', true);
        $('#wrap').text("자동 줄바꿈 취소")
    }
})
document.querySelector('#codeSave').addEventListener('click', function () {
    codeObj[language.value] = editor.getValue();
    let TF = confirm(`모든 코드를 저장합니다.`);
    if (TF) sendAjaxSave($('#user_id').text(), codeObj)
});
function initializeCode() {
    return {
        'C': $("#C").text(),
        'C++': $("#Cpp").text(),
        'java': $("#java").text(),
        'javascript': $("#javascript").text(),
        'python': $("#python").text()
    }
}
// $(function () {
//     var failMessage = function (text) {
//         return alert(text + " 기능은 사용하실 수 없습니다."), false;
//     },
//     preventEvent = {
//         "keydown": function (e) {
//             var keycode = function (e) {
//                 return ('which' in e ? e.which : e.keyCode)
//             }(e),
//             ctrl_v = (e.ctrlKey && (keycode == 86));
//             if (ctrl_v) return failMessage("붙여넣기");
//         }
//         , "mousedown": function (e) {
//             var rightClick = (e.button == 2);
//             if (rightClick) return failMessage("우클릭");
            
//         }
//     };
//     $(document).bind(preventEvent);
// }());