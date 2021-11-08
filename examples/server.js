var http = require('http');
var path = require('path');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocketServer = require('ws').Server;
var otText = require('ot-text');
var WebSocketJSONStream = require('websocket-json-stream');

ShareDB.types.map['json0'].registerSubtype(otText.type);

var app = express();
var qs = require('querystring');
const fs = require('fs');
const db = require('../db');
const { c, cpp, node, python, java } = require('compile-run');  

var Client = require('mongodb').MongoClient;
var mongodburl = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false';

var username = "";
var users = [];
var shareUsers = [];

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/../node_modules/codemirror/mode'));
app.use(express.static(__dirname + '/../node_modules/codemirror/lib'));

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => res.render("login.html"));
app.get('/test', (rep, res) => res.render('test.html'))
app.get('/test2', (rep, res) => res.render('test2.html'))
app.get('/test4', (rep, res) => res.render('test4.html'))

app.post('/main', (req, res) => {
  var body = "";
  req.on('data', data => body += data);
  req.on('end', function () {
    var post = qs.parse(body);
    var testQuery = `select * from member where email = "${post.email}"`;

    if (post.name) {              // revise => main
      let q = `update member set password="${post.password}",name="${post.name}",phone="${post.phone}" where email = "${post.email}"`;
      db.query(q, (err, results) => {
        if (err);
        else {
          addUserlist(users, post.email);                 //53줄 line
          res.render('main.html', { post: post });
        }
      });
    }
    else if(post.page === "codemirror"){
      removeUserlist(shareUsers, post.email);
      addUserlist(users, post.email);
      res.render('main.html', { post: post });
    } 
    else {                      // login => main
      db.query(testQuery, function (err, results) {
        addUserlist(users, post.email);
        post = producePost(results[0]);
        res.render('main.html', { post: post });
      });
    }

  });
});
app.post('/board', (req, res) => {
  var body = "";
  req.on('data', function (data){ body += data; });
  req.on('end', function () {
    var post = qs.parse(body);
    var list;
    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        db.collection('board').find({}).sort({"timestring":-1}).toArray(function(err, result) {
          if (err) throw err;
          list = result;
          client.close();
          if(post.process==="new"){
            let dt = new Date();
            let mon = dt.getMonth() + 1;
            let t = dt.getFullYear() + '-' + mon.toString().padStart(2, '0') + '-' + dt.getDate().toString().padStart(2, '0');
            let title = post.title.replace(/ /g,'_');
            var data = { 'email': post.email, 'title': title, 'body': post.body, 'time': t, 'timestring': dt};

            Client.connect(mongodburl, function (error, client) {
              if (error) throw error;
              else {
                var db = client.db('jsdb');
                db.collection('board').insertOne(data, (err, result) => {
                  if (err) throw err;
                  else {
                    client.close();
                    res.render('board.html', {post: post, list:list});
                  }
                })
              }
            });
          }
          else if(post.process==="edit"){
            Client.connect(mongodburl, function (error, client) {
              if (error) throw error;
              else {
                var db = client.db('jsdb');
                let term = { "email": post.email, "title":post.pretitle };
                let title = post.title.replace(/ /g,'_');
                var newvalues = { $set: {"title": title, "body": post.body} };
                db.collection('board').updateOne(term, newvalues, (updataerr, result) => {
                  if (updataerr) throw updataerr;
                  client.close();
                  res.render('board.html', {post: post, list:list});
                })
              }
            });
          }
          else if(post.process==="delete"){
            Client.connect(mongodburl, function (error, client) {
              if (error) throw error;
              else {
                var db = client.db('jsdb');
                let query = {'email': post.email, 'title':post.title, 'time': post.time}
                db.collection('board').deleteOne(query, (err, result) => {
                  if (err) throw err;
                  else {
                    client.close();
                    res.render('board.html', {post: post, list:list});
                  }
                })
              }
            });
          }
          else{
            removeUserlist(users, post.email);
            res.render('board.html', { post: post , list: list});
          }
        });
      }
    });
  });
});
app.post('/board/new', (req, res) => {
  var body = "";
  req.on('data', function (data){ body += data; });
  req.on('end', function () {
    var post = qs.parse(body);
    res.render('board/new.html', { post: post });
  });
});
app.post('/board/show', (req, res) => {
  var body = "";
  req.on('data', function (data){ body += data; });
  req.on('end', function () {
    var post = qs.parse(body);
    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        db.collection('board').findOne({"title": post.title, "email":post.email, "time":post.time }, (err, result) => {
          if (err) throw err;
          client.close();
          let adduser = {user : post.user}
          Object.assign(result, adduser);
          res.render('board/show.html', { post: result });
        });
      }
    });

    
  });
});
app.post('/board/edit', (req, res) => {
  var body = "";
  req.on('data', function (data){ body += data; });
  req.on('end', function () {
    var post = qs.parse(body);
    
    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        db.collection('board').findOne({"title": post.title, "email":post.email, "time":post.time }, (err, result) => {
          if (err) throw err;
          client.close();

          res.render('board/edit.html', { post: result });
        });
      }
    });

    
  });
});

app.post('/del_process', (req, res) => {
  var body = "";
  req.on('data', data => body += data);
  req.on('end', function () {
    var post = qs.parse(body);
    var testQuery = `delete from member where email = "${post.email}"`;

    db.query(testQuery, function (err) {
      if (err) throw err;
    });
    res.redirect('/');
  });
});

app.get('/signup', (req, res) => res.render('signup.html'));

app.post('/signup_process', (req, res) => {
  var body = "";
  req.on('data', data => body += data);
  req.on('end', function () {
    var post = qs.parse(body);
    var testQuery = `INSERT INTO member (email, password, name, date, phone) VALUES ("${post.email}","${post.password}","${post.name}",now(),"${post.phone}")`;

    db.query(testQuery, function (err) {
      if (err) res.redirect('/signup');
      else {
        console.log(`${post.email} - 회원가입 성공`);
        res.redirect('/');
      }
    });
  });
})

app.post('/revise', (req, res) => {
  var body = "";
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    var post = qs.parse(body);
    let q = `select * from member where email = "${post.email}"`;

    db.query(q, function (err, results) {
      if (results[0] == null) console.log("null");
      else {
        post = producePost(results[0]);
        res.render('revise.html', { post: post });
      }
    });
  });
});
app.post('/codemirror', (req, res) => {
  var body = "";
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    var post = qs.parse(body);
    removeUserlist(users, post.email);
    addUserlist(shareUsers, post.email);
    res.render('shareCode.html', { post: post });
  });
});
app.post('/form_receive', function (req, res) {
  var body = "";
  req.on('data', data => body = data);
  req.on('end', function () {
    let post = JSON.parse(body);          //문자열 -> 객체
    if (post.language === "C") {
      fs.writeFile('test.c', post.code, 'utf-8', function (error) {
        console.log('C compiler');
      });
      let resultc = c.runFile('test.c', { stdin: post.input });;
      resultc
        .then(result => {
          let responseData;
          if (result.stdout) {
            responseData = { 'result': 'ok', 'output': result.stdout };
            res.json(responseData);
          }
          else {
            responseData = { 'result': 'ok', 'output': result.stderr };
            res.json(responseData);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    else if (post.language === "C++") {
      fs.writeFile('test.cpp', post.code, 'utf-8', function (error) {
        console.log('Cpp coding program');
      });
      let resultcpp = cpp.runFile('test.cpp', { stdin: post.input });
      resultcpp
        .then(result => {
          let responseData;
          if (result.stdout) {
            responseData = { 'result': 'ok', 'output': result.stdout };
            res.json(responseData);
          }
          else {
            responseData = { 'result': 'ok', 'output': result.stderr };
            res.json(responseData);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    else if (post.language === "java") {
      fs.writeFile('Main.java', post.code, 'utf-8', function (error) {
        console.log('java coding program');
      });
      let resultjava = java.runFile('Main.java', { stdin: post.input });
      resultjava
        .then(result => {
          let responseData;
          if (result.stdout) {
            responseData = { 'result': 'ok', 'output': result.stdout };
            res.json(responseData);
          }
          else {
            responseData = { 'result': 'ok', 'output': result.stderr };
            res.json(responseData);
          }
        })
        .catch(err => {
          console.log(err);
        })
    }
    else if (post.language === "javascript") {
      let resultPro = node.runSource(post.code);
      resultPro
        .then(result => {
          let responseData;
          if (result.stdout) {
            responseData = { 'result': 'ok', 'output': result.stdout };
            res.json(responseData);
          }
          else {
            responseData = { 'result': 'ok', 'output': result.stderr };
            res.json(responseData);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    else if (post.language === "python") {
      fs.writeFile('test.py', post.code, 'utf-8', function (error) {
        console.log('text.py');
      });
      let resultc = python.runFile('test.py', { stdin: post.input });;
      resultc
        .then(result => {
          let responseData;
          if (result.stdout) {
            responseData = { 'result': 'ok', 'output': result.stdout };
            res.json(responseData);
          }
          else {
            responseData = { 'result': 'ok', 'output': result.stderr };
            res.json(responseData);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

let codeObj = {
  'C': `/*C*/\n#include<stdio.h>\nint main(){\n  printf("Hell0 C W0rld");\n}`,
  'C++': `/*C++*/\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hell0 C++ World!";\n  return 0;\n}`,
  'java': `/*java*/\nclass Main{\n  public static void main(String[] args) {\n    System.out.println("Hell0 java W0rld!");\n  }\n}`,
  'javascript': `/*javascript*/\nconsole.log("Hello javascript")`,
  'python': `#python\nprint("Hell0 Python! ")`
};
app.post('/compile', (req, res) => {
  var body = "";
  req.on('data', (data) => { body += data; });
  req.on('end', function () {
    var post = qs.parse(body);
    removeUserlist(users, post.email);
    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        let term = { "email": post.email };

        db.collection('save').findOne(term, (err, result) => {
          if (err) throw err;
          else {
            client.close();
            if (!result)  res.render('compile.html', { post: post, data: codeObj })
             else {
              res.render('compile.html', { post: post, data: result });
            }
          }
        })
      }
    });

  });
});
app.post('/compile/register', (req, res) => {      //코드저장
  var body = "";
  req.on('data', data => body += data);

  req.on('end', function () {
    let post = JSON.parse(body);
    let dt = new Date();
    let mon = dt.getMonth() + 1;
    let t = dt.getFullYear() + '-' + mon.toString().padStart(2, '0') + '-' + dt.getDate().toString().padStart(2, '0');
    let title = post.title.replace(/ /g,'_');
    var data = { 'email': post.email, 'title': title, 'body': post.body, 'time': t , 'timestring': dt};

    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        db.collection('board').insertOne(data, (err, result) => {
          if (err) throw err;
          else {
            client.close();
          }
        })
      }
    });
    
  });
});
app.post('/code_save', (req, res) => {      //코드저장
  var body = "";
  req.on('data', data => body += data);

  req.on('end', function () {
    let post = JSON.parse(body);

    let query_object = { "email": post.email };
    Object.assign(query_object, post.codepackage);

    Client.connect(mongodburl, function (error, client) {
      if (error) throw error;
      else {
        var db = client.db('jsdb');
        db.collection('save').insertOne(query_object, (err, res) => {
          if (err) {
            let term = { "email": post.email };
            var newvalues = { $set: post.codepackage };
            db.collection('save').updateOne(term, newvalues, (updataerr, result) => {
              if (updataerr) throw updataerr;
              client.close();
            })
          }
          else {
            client.close();
          }
        })
      }
    });
  });
});
app.post('/check', function (req, res) {     //login, 중복체크
  var body = "";
  req.on('data', function (data) { body = data; });
  req.on('end', function () {
    let post = JSON.parse(body);
    let q = `select * from member where email = "${post.email}"`;
    db.query(q, function (err, results) {
      if (post.state === "id") {
        if (results[0] == null) res.json({ 'result': 'ok' });
        else res.json({ 'result': 'no' });
      }
      else if (post.state === "pwd") {
        if (results[0].password === post.pwd) res.json({ 'result': 'ok' });
        else res.json({ 'result': 'no' });
      }
      else if (post.state === "login") {
        if (results[0] == null) res.json({ 'result': 'no' });
        else if (results[0].email === post.email && results[0].password === post.pwd) res.json({ 'result': 'ok' });
        else res.json({ 'result': 'no' });
      }
    });

  });
});
app.post('/userlist', function (req, res) {   //리스트에 사람추가하기
  var body = "";
  req.on('data', function (data) {
    body = data;
  });
  req.on('end', function () {
    var code = body;
    var responseData;
    code = JSON.parse(code);
    if (code.page === 'main') {
      addUserlist(users, code.email)
      responseData = { 'result': 'ok', 'users': users }
      res.json(responseData);
    }
    else if (code.page === 'codemirror') {
      addUserlist(shareUsers, code.email)
      responseData = { 'result': 'ok', 'users': shareUsers }
      res.json(responseData);
    }
  })
})


var server = http.createServer(app);
server.listen(8080, function (err) {
  if (err) throw err;
  console.log('Sharedb codemirror http://%s:%s', server.address().address, server.address().port);
});
var webSocketServer = new WebSocketServer({ server: server });
webSocketServer.on('connection', function (socket) {
  var stream = new WebSocketJSONStream(socket);
  shareDB.listen(stream);
  socket.email = username;
  socket.on('open', () => {});
  socket.on('close', () => {
    removeUserlist(shareUsers, socket.email);
    
  });
});

var chatSer = http.createServer();
chatSer.listen(7007, function (err) {
  if (err) throw err;
  console.log('chat On http://%s:%s', chatSer.address().address, chatSer.address().port);
})

var ChatSocketServer = new WebSocketServer({ server: chatSer });
ChatSocketServer.on('connection', (res, req) => {
  //const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  res.email = username;
  res.on('message', function incoming(data) {
    ChatSocketServer.clients.forEach(function each(client) {
      client.send(data);
    })
  })
  res.on('close', () => {
    const data = {"content": "OUT","message": res.email + "님이 퇴장하셨습니다" }
    removeUserlist(users, res.email)
    ChatSocketServer.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    })

  })
})

var Comirror = http.createServer();
Comirror.listen(8000, (err) => { if (err) throw err; })

var comirrorSocketSer = new WebSocketServer({ server: Comirror });
comirrorSocketSer.on('connection', (res, req) => {
  res.on('message', function incoming(data){
    comirrorSocketSer.clients.forEach(function each(client) {
      client.send(data);
    })
  })
  res.on('close', () => {
    const data = {"content": "open"};

    comirrorSocketSer.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    })
  })
})
var shareDB = ShareDB({ Client });

function addUserlist(arr, email) {
  username = email;
  if (!arr.includes(username)) arr.push(username);
}

function removeUserlist(arr, target){
  const idx = arr.indexOf(target);
  if(idx !==-1) arr.splice(idx, 1);
}

function producePost(arr) {
  let post = {
    email: arr.email,
    password: arr.password,
    name: arr.name,
    phone: arr.PHONE
  }
  return post;
}