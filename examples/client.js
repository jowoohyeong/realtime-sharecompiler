var sharedb = require('sharedb/lib/client');
var otText = require('ot-text');
var CodeMirror = require('codemirror');
require('codemirror/mode/clike/clike');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/python/python');
var ShareDBCodeMirror = require('..');
var StudyTF = false;

$('#language').fadeOut(0.1);

codeObj = {
  'C': `/*C*/\n#include<stdio.h>\nint main(){\n  printf("Hell0 C W0rld");\n}`,
  'C++': `/*C++*/\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hell0 C++ World!";\n  return 0;\n}`,
  'java': `/*java*/\nclass Main{\n  public static void main(String[] args) {\n    System.out.println("Hell0 java W0rld!");\n  }\n}`,
  'javascript': `/*javascript*/\nconsole.log("Hello javascript")`,
  'python': `#python\nprint("Hell0 Python! ")`
};
curlang = language.value;
sharedb.types.map['json0'].registerSubtype(otText.type);

var editorElem = document.getElementById('textarea');
var editor = new CodeMirror(editorElem, {   //코드공유 editor
  lineNumbers: true,
  autofocus: true,
  tabSize: 2,
});
var iputElem = document.getElementById('input');
var iput = new CodeMirror(iputElem, {     //입력창 editor
  smartIndent: false,
  lineWrapping: true,
});
var oputElem = document.getElementById('output');
var oput = new CodeMirror(oputElem, {     //출력창 editor
  readOnly: true,
  cursorBlinkRate: -1,
  lineWrapping: true,
});

var socket = new WebSocket("ws://" + location.host);
var shareConnection = new sharedb.Connection(socket);

var doc = shareConnection.get('users', 'other');
OpenDocument('content', doc, editor);
var indoc = shareConnection.get('input', 'other');
OpenDocument('input', indoc, iput)
var outdoc = shareConnection.get('output', 'other');
OpenDocument('output', outdoc, oput);


function OpenDocument(_key, _doc, _editor) {
  ShareDBCodeMirror.attachDocToCodeMirror(_doc, _editor, {
    key: _key,
    verbose: true,
  });
}

document.getElementById('wrap').addEventListener('click', () => {
  if (editor.options.lineWrapping) {
    editor.setOption('lineWrapping', false);
    $('#wrap').text("자동 줄바꿈")
  } else {
    editor.setOption('lineWrapping', true);
    $('#wrap').text("자동 줄바꿈 취소")
  }
})
console.log(editor)
document.getElementById('language').addEventListener('change', (event) => {
  codeObj[curlang] = editor.getValue();
  editor.setValue(codeObj[language.value]);

  if (language.value === "C") editor.setOption('mode', 'text/x-csrc');
  else if (language.value === "C++") editor.setOption('mode', 'text/x-c++src');
  else if (language.value === "javascript") editor.setOption('mode', 'text/javascript');
  else if (language.value === "java") editor.setOption('mode', 'text/x-java');
  else editor.setOption('mode', 'text/x-python');
  curlang = language.value;
})

document.querySelector('.ajaxsend').addEventListener('click', function () {
  sendAjaxCompile(editor.getValue(), language.value, iput.getValue());
});

document.querySelector('#list_refresh').addEventListener('click', function () {
  sendAjax($('#user_id').text(), 'codemirror');
});

document.querySelector('#codeSave').addEventListener('click', function () {
  codeObj[language.value] = editor.getValue();
  let TF = confirm(`모든 코드를 저장합니다.\n기존의 코드는 삭제됩니다.`);
  if (TF) sendAjaxSave($('#user_id').text(), codeObj);
});
document.querySelector('#register').addEventListener('click', function () {
  var title = prompt("글 제목을 입력하세요");
  if(title!==null)  sendAjaxWrite($('#user_id').text(), title, editor.getValue())
});
function sendAjaxWrite(email, title, body) {
  let url = 'http://localhost:8080/compile/register';
  var data = { 'email': email, 'title': title, 'body': body, 'process': "new" };
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
function sendAjaxSave(email, codeObj) {         //mongoDB에 저장
  let url = 'http://localhost:8080/code_save';
  var data;
  if (!codeObj) data = { 'email': email, 'codepackage': codeObj };
  else data = { 'email': email, 'codepackage': codeObj };

  data = JSON.stringify(data);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(data);
  xhr.addEventListener('load', function () {
    var result = JSON.parse(xhr.responseText);
    let resultObj = JSON.parse(result);
    editor.setValue(resultObj[language.value])
    codeObj = resultObj;
  });
}
function sendAjaxCompile(code, lang, input) {        // 코드 컴파일
  let url = 'http://localhost:8080/form_receive';
  var data = { 'code': code, 'language': lang, 'input': input };
  data = JSON.stringify(data);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(data);
  xhr.addEventListener('load', function () {
    var result = JSON.parse(xhr.responseText);
    if (result.result != 'ok') return;
    document.getElementById('output').value = result.output;
    oput.setValue(result.output);
  });
}
document.getElementById("list_refresh").click()
var permit = ["test", "admin"]
document.getElementById('ctrl').addEventListener('click', () => {
  var name = $('#user_id').text()
  if (permit.includes(name)) {
    if (!StudyTF) {
      StudyTF = true;
      $('#language').fadeIn(0.1);
    } else {
      StudyTF = false;
      $('#language').fadeOut(0.1);
    }
  }
})

