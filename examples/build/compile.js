let ccode = `/*C*/\n#include<stdio.h>\nint main(){\n\tprintf("Hell0 C W0rld");\n}`;
let cppcode = `/*C++*/\n#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hell0 C++ World!";\n\treturn 0;\n}`;
let javacode = `/*java*/\nclass Main{\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hell0 java W0rld!");\n\t}\n}`;
let jscode = `/*javascript*/\nconsole.log("Hello javascript")`;
let pycode = `#python\nprint("Hell0 Python! ")`;
let curlang = language.value;

var editorElem = document.getElementById('textarea');
var editor = new CodeMirror(editorElem, {
    lineNumbers: true,
});
editor.setOption('mode', 'text/x-csrc');
editor.setValue(ccode);

document.querySelector('.ajaxsend').addEventListener('click', function () {
    sendAjaxCode(editor.getValue(), language.value, $('#input').val());
});

function sendAjaxCode(code, lang, input) {
    let url = 'http://localhost:8080/form_receive';
    var data = { 'code': code, 'language': lang,  'input': input};
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
document.getElementById('language').addEventListener('change', (event) => {
    if (curlang === "C") ccode = editor.getValue();
    else if (curlang === "C++") cppcode = editor.getValue();
    else if (curlang === "java") javacode = editor.getValue();
    else if (curlang === "javascript") jscode = editor.getValue();
    else if (curlang === "python") pycode = editor.getValue();

    if (language.value === "C") {
        editor.setOption('mode', 'text/x-csrc');
        editor.setValue(ccode);
    }
    else if (language.value === "C++") {
        editor.setOption('mode', 'text/x-c++src');
        editor.setValue(cppcode);
    }
    else if (language.value === "java") {
        editor.setOption('mode', 'text/x-java');
        editor.setValue(javacode)
    }
    else if (language.value === "javascript") {
        editor.setOption('mode', 'text/javascript');
        editor.setValue(jscode);
    }
    else if (language.value === "python") {
        editor.setOption('mode', 'text/x-python');
        editor.setValue(pycode);
    }
    curlang = language.value;
})
document.getElementById('wrap').addEventListener('click', () => {
    if (document.getElementById('wrap').checked) {
        editor.setOption('lineWrapping', true);
    } else {
        editor.setOption('lineWrapping', false);
    }
})