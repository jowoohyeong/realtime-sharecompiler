/**
 * @constructor
 * @param {CodeMirror} codeMirror - a CodeMirror 편집 instance
 * @param {Object} options - required. Options object with the following keys:
 *    - onOp(op): required. 
 * a function to call when a text OT op is produced by the editor. 
 * Typically will call `submitOp` on the ShareDB doc.
   When doing so, note that it's important to pass `{source: this}` as the second argument to `submitOp` so that `ShareDBCodeMirror` can identify its own ops when rebroadcasted.
 * verbose: optional. true일 경우, debug messages가 console에 출력.
 */
function ShareDBCodeMirror(codeMirror, options) {
  var curlang, codeObj;
  this.codeMirror = codeMirror;
  this.verbose = Boolean(options.verbose);
  this.onOp = options.onOp;
  this.onStart = options.onStart || function() {};
  this.onStop = options.onStop || function() {};

  this._started = false;
  this._suppressChange = false;
  this._changeListener = this._handleChange.bind(this);
}
module.exports = ShareDBCodeMirror;

/**
 *  ShareDB doc 를 CodeMirror instance 에 연결한다. 
 * You can also construct a ShareDBCodeMirror instance directly 
 * if you'd like to wire things up explicitly and have an abstraction layer between the two.
 * @param {sharedb.Doc} shareDoc
 * @param {CodeMirror} codeMirror
 * @param {Object} options - configuration options:
 *    - key: string; required. 
 * The key in the ShareDB doc at which to store the CodeMirror value. Deeply nested paths are currently not supported.
 *    - verbose: optional. If provided and true, debug messages will be printed to the console.
 * @param {function(Object)=} callback - optional. will be called when everything
 *    is hooked up. The first argument will be the error that occurred, if any.
 * @return {ShareDBCodeMirror} the created ShareDBCodeMirror object
 */
ShareDBCodeMirror.attachDocToCodeMirror = function(shareDoc, codeMirror, options, callback) {
  var key = options.key;
  var verbose = Boolean(options.verbose);
  var shareDBCodeMirror = new ShareDBCodeMirror(codeMirror, {
    verbose: verbose,
    onStart: function() {
      shareDoc.on('op', shareDBOpListener);
    },
    onStop: function() {
      shareDoc.removeListener('op', shareDBOpListener);
    },
    onOp: function(op) {
      var docOp = [{p: [key], t: 'text', o: op}];

      if (verbose) {    //입력할 때 사용자 1에게만 
//        console.log('ShareDBCodeMirror: submitting op to doc:', docOp);
      }

      shareDoc.submitOp(docOp, {source: this});
      shareDBCodeMirror.assertValue(shareDoc.data[key]);
    }
  });

  function shareDBOpListener(op, source) {
    if(!source && typeof(op[0].o[0])==='object'){   //1006-selectbox 변경사항있을 시 이전 코드 저장 
      codeObj[curlang] = codeMirror.getValue();
    }
    for (var i = 0; i < op.length; i++) {
      var opPart = op[i];

      if (opPart.p && opPart.p.length === 1 && opPart.p[0] === key && opPart.t === 'text') {
        shareDBCodeMirror.applyOp(opPart.o, source === undefined ? null : source);

      } else if (verbose) {
        console.log('ShareDBCodeMirror: ignoring op because of path or type:', opPart);
      }
    }
    if(!source && typeof(op[0].o[0])==='object'){	//selectbox 변경사항o -> codemirror 변경
      let code = codeMirror.getValue();
      let splited = code.split(/\n/, 1);
      let target = splited[0];
      
      if (target === "/*C*/") {
        document.getElementById('language')[0].selected = true;
        codeMirror.setOption('mode', 'text/x-csrc');
      }
      else if (target === "/*C++*/") {
        document.getElementById('language')[1].selected = true;
        codeMirror.setOption('mode', 'text/x-c++src');
      }
      else if (target === "/*java*/") {
        document.getElementById('language')[2].selected = true;
        codeMirror.setOption('mode', 'text/x-java');
      } else if (target === "/*javascript*/") {
        document.getElementById('language')[3].selected = true;
        codeMirror.setOption('mode', 'text/javascript');
      }
      else if (target === "#python") {
        document.getElementById('language')[4].selected = true;
        codeMirror.setOption('mode', 'text/x-python');
      }
      curlang = language.value;
    }
    
    shareDBCodeMirror.assertValue(shareDoc.data[key]);
  }

  shareDoc.subscribe(function(err) {
    if (err) {
      if (callback) {
        callback(err);
        return;
      } else {
        throw err;
      }
    }

    if (!shareDoc.type) {         //최초 접속
      if (verbose) {    
        //텍스트 만들기');
      }
      var newDoc = {};
      newDoc[key] = '';
      shareDoc.create(newDoc);
      var FirstTimecon= true;     
      var outputFirst, iputFirst;
      if(shareDoc.collection==='output' || shareDoc.collection=== 'input'){
        outputFirst = true; 
        iputFirst = true;
      }
    }

    if (verbose) {                      //클라이언트 각각 첫 문서 접속 //첫 접속일때만 선언
      var Firstcon = true;
    }
    console.log(shareDoc.data);
    shareDBCodeMirror.setValue(shareDoc.data[key] || '');

    if(outputFirst || iputFirst) codeMirror.setValue('');
    else if(FirstTimecon){
      codeMirror.setOption('mode', 'text/x-csrc');
      codeMirror.setValue(codeObj['C']);
    }else if(Firstcon && !outputFirst){                     //첫 접속 - 선택박스 클릭
      let code = codeMirror.getValue();
      let splited = code.split(/\n/, 1);
      let target = splited[0];
      if (target === "/*C*/") {
        document.getElementById('language')[0].selected = true;
        codeMirror.setOption('mode', 'text/x-csrc');
      }
      else if (target === "/*C++*/") {
        document.getElementById('language')[1].selected = true;
        codeMirror.setOption('mode', 'text/x-c++src');
      }
      else if (target === "/*java*/") {
        document.getElementById('language')[2].selected = true;
        codeMirror.setOption('mode', 'text/x-java');
      } else if (target === "/*javascript*/") {
        document.getElementById('language')[3].selected = true;
        codeMirror.setOption('mode', 'text/javascript');
      }
      else if (target === "#python") {
        document.getElementById('language')[4].selected = true;
        codeMirror.setOption('mode', 'text/x-python');
      }
      curlang = language.value;
    }
    
    if (callback) {
      callback(null);
    }
  });

  return shareDBCodeMirror;
};

// CodeMirror instance의 변경 사항을 수신하기 시작한다.. 필요하다면 `setValue` 를 호출할 경우에도 이것을 호출합니다.
ShareDBCodeMirror.prototype.start = function() {
  if (this._started) {
    return;
  }
  this.codeMirror.on('change', this._changeListener);
  this._started = true;
  this.onStart();
};

/**
 * Replaces the contents of the CodeMirror instance with the supplied text and
 * starts listening for changes.
 */
ShareDBCodeMirror.prototype.setValue = function(text) {
  if (!this._started) {
    this.start();
  }
  
  this._suppressChange = true;
  this.codeMirror.setValue(text);
  this._suppressChange = false;
};

/**
 * Convenience - returns the text in the CodeMirror instance.
 */
ShareDBCodeMirror.prototype.getValue = function() {
  return this.codeMirror.getValue();
};

/**
 * This should be called periodically with the value from the ShareDB doc to ensure the value in CodeMirror hasn't diverged.
 * @return {boolean} 전달된 값이 공유중인 CodeMirror instance와 일치하면 true, false otherwise
 */
ShareDBCodeMirror.prototype.assertValue = function(expectedValue) {
  var editorValue = expectedValue;

  if (expectedValue !== editorValue) {
    console.error(
      "Value in CodeMirror doesn't match expected value:\n\n",
      "Expected Value:\n", expectedValue,
      "\n\nEditor Value:\n", editorValue);

    this._suppressChange = true;
    this.codeMirror.setValue(expectedValue);
    this._suppressChange = false;

    return false;
  }

  return true;
};

/** 지정된 text OT op로 표시되는 변경 사항을 적용, 가장 최근에 제출된 local op의 echo인 경우 무시될 수 있다.
 * In order to do this properly, the second argument, `source`, **must** be passed in. 
 * This will be the second argument to an "op" listener on a ShareDB doc.
 */
ShareDBCodeMirror.prototype.applyOp = function(op, source) {
  if (source === undefined) {
    throw new Error("The 'source' argument must be provided");
  }

  if (!Array.isArray(op)) {
    throw new Error("Unexpected non-Array op for text document");
  }

  if (!this._started) {
    if (this.verbose) {
      console.log('ShareDBCodeMirror: op received while not running, ignored', op);
    }
    return;
  }

  if (source === this) {
    if (this.verbose) {       //같은 로컬에 변화를 보낼때
//      console.log('ShareDBCodeMirror: skipping local op', op);
    }
    return;
  }

  if (this.verbose) {   //다른 사용자 코드에 변화가 있을때
//    console.log('ShareDBCodeMirror: op 적용', op);    
  }

  this._suppressChange = true;
  this._applyChangesFromOp(op);
  this._suppressChange = false;
};
/**CodeMirror 인스턴스의 변경 사항 수신을 중지한다. */
ShareDBCodeMirror.prototype.stop = function() {
  if (!this._started) {
    return;
  }
  this.codeMirror.off('change', this._changeListener);
  this._started = false;
  this.onStop();
};

ShareDBCodeMirror.prototype._applyChangesFromOp = function(op) {
  var textIndex = 0;
  var codeMirror = this.codeMirror;

  op.forEach(function(part) {
    switch (typeof part) {
      case 'number': // skip n chars
        textIndex += part;
        break;
      case 'string': // "chars" - insert "chars"
        codeMirror.replaceRange(part, codeMirror.posFromIndex(textIndex));
        textIndex += part.length;
        break;
      case 'object': // {d: num} - delete `num` chars
        var from = codeMirror.posFromIndex(textIndex);
        var to = codeMirror.posFromIndex(textIndex + part.d);
        codeMirror.replaceRange('', from, to);
        break;
    }
  });
};

ShareDBCodeMirror.prototype._handleChange = function(codeMirror, change) {
  if (this._suppressChange) {
    return;
  }
  var op = this._createOpFromChange(change);

  if (this.verbose) {
    //ShareDBCodeMirror: op 생산, 보냄
  }

  this.onOp(op);
};

ShareDBCodeMirror.prototype._createOpFromChange = function(change) {
  var codeMirror = this.codeMirror;
  var op = [];
  var textIndex = 0;
  var startLine = change.from.line;

  for (var i = 0; i < startLine; i++) {
    textIndex += codeMirror.lineInfo(i).text.length + 1; // + 1 for '\n'
  }
  textIndex += change.from.ch;

  if (textIndex > 0) {
    op.push(textIndex); // skip textIndex chars
  }

  if (change.to.line !== change.from.line || change.to.ch !== change.from.ch) {
    var delLen = 0;
    var numLinesRemoved = change.removed.length;
    for (var i = 0; i < numLinesRemoved; i++) {
      delLen += change.removed[i].length + 1; // +1 for '\n'
    }
    delLen -= 1; // last '\n' shouldn't be included

    op.push({d: delLen}) // delete delLen chars
  }

  if (change.text) {
    var text = change.text.join('\n');
    if (text) {
      op.push(text); // insert text
    }
  }

  return op;
};
