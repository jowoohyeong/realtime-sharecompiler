var sharedb = require('sharedb/lib/client');
var otText = require('ot-text');
var CodeMirror = require('codemirror');
require('codemirror/mode/clike/clike');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/python/python');
var ShareDBCodeMirror = require('..');
const e = require('cors');
codeObj = {
  'C' : `/*C*/\n#include<stdio.h>\nint main(){\n\tprintf("Hell0 C W0rld");\n}`,
  'C++' : `/*C++*/\n#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hell0 C++ World!";\n\treturn 0;\n}`,
  'java' : `/*java*/\nclass Main{\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hell0 java W0rld!");\n\t}\n}`,
  'javascript' : `/*javascript*/\nconsole.log("Hello javascript")`,
  'python' : `#python\nprint("Hell0 Python! ")`
};
curlang = language.value;
sharedb.types.map['json0'].registerSubtype(otText.type);

var editorElem = document.getElementById('textarea');
var editor = new CodeMirror(editorElem, {
  lineNumbers : true,
  autofocus: true,
  smartIndent : true,
  mode : 'text/x-csrc',
});

var iputElem = document.getElementById('input');
var iput = new CodeMirror(iputElem, {
  lineWrapping : true,
});
var oputElem = document.getElementById('output');
var oput = new CodeMirror(oputElem, {
  lineWrapping : true,
  smartIndent : true,
});

var socket = new WebSocket("ws://" + location.host);
var shareConnection = new sharedb.Connection(socket);

var doc = shareConnection.get('users', 'other');
var indoc = shareConnection.get('input', 'other');
var outdoc = shareConnection.get('output', 'other');

ShareDBCodeMirror.attachDocToCodeMirror(doc, editor, {
  key: 'content',
  verbose: true,
});
ShareDBCodeMirror.attachDocToCodeMirror(indoc, iput, {
  key: 'input',
  verbose: true,
});
ShareDBCodeMirror.attachDocToCodeMirror(outdoc, oput, {
  key: 'output',
  verbose: true,
});
oput.setOption('readOnly', true);
oput.setOption('cursorBlinkRate', -1);

document.getElementById('wrap').addEventListener('click',()=>{
  if(document.getElementById('wrap').checked){
    editor.setOption('lineWrapping', true);
  }else{
    editor.setOption('lineWrapping', false);
  }
})

document.getElementById('language').addEventListener('change', (event)=>{
  codeObj[curlang] = editor.getValue();
  editor.setValue(codeObj[language.value]);

  if(language.value === "C")		editor.setOption('mode', 'text/x-csrc');
  else if(language.value === "C++")	editor.setOption('mode', 'text/x-c++src');
  else if(language.value === "javascript")	editor.setOption('mode', 'text/javascript');
  else	editor.setOption('mode', 'text/x-'+language.value);

  curlang = language.value;
}) 
document.querySelector('.ajaxsend').addEventListener('click', function () {
  sendAjaxCode(editor.getValue(), language.value, iput.getValue());
});

document.querySelector('.list_refresh').addEventListener('click', function () {
  sendAjax($('#email').text(), 'codemirror');
});

document.querySelector("button[class=list_refresh]").click();


document.querySelector('#codeSave').addEventListener('click', function () {
  codeObj[language.value] = editor.getValue();
  console.log('저장하기');
  let TF = confirm(`모든 코드를 저장합니다.`);
  if(TF){
    savemachine($('#email').text(), codeObj)
  }
});
document.querySelector('#codeLoad').addEventListener('click', function () {
  let TF = confirm(`저장된 ${language.value}언어 코드를 가져온다.`);
  if(TF){
    savemachine($('#email').text());
  }
});

function savemachine(email, codeObj) {
	let url = 'http://localhost:8080/code_save';
  var data;
  if(!codeObj)  var data = {'email': email, 'codepackage':codeObj};
  else	var data = {'email': email, 'codepackage':codeObj};
	
  data = JSON.stringify(data);         //객체 ->문자열
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(data);
	xhr.addEventListener('load', function(){
		var result = JSON.parse(xhr.responseText);
		let resultObj = JSON.parse(result);
    
    editor.setValue(resultObj[language.value])
    codeObj = resultObj;
	});
}
function sendAjaxCode(code, lang, input) {
	let url = 'http://localhost:8080/form_receive';
	var data = {'code': code, 'language':lang, 'input': input };
	data = JSON.stringify(data);         //객체 ->문자열
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(data);
	xhr.addEventListener('load', function(){
		var result = JSON.parse(xhr.responseText);
		if (result.result != 'ok') return;
		document.getElementById('output').value = result.output;
    oput.setValue(result.output);
	});
}