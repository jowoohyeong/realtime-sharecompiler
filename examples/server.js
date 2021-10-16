var http = require('http');
var path = require('path');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocketServer = require('ws').Server;
var otText = require('ot-text');
var WebSocketJSONStream = require('websocket-json-stream');

ShareDB.types.map['json0'].registerSubtype(otText.type);

var shareDB = ShareDB();
var app = express();
var qs = require('querystring');
const fs = require('fs');
const db = require('../db');
const {c, cpp, node, python, java} = require('compile-run');
const { Console } = require('console');
const { emit } = require('process');

var username = "";
var users = [];
var shareUsers = [];

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/../node_modules/codemirror/mode'));
app.use(express.static(__dirname + '/../node_modules/codemirror/lib'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.get('/', (req, res) => res.render("login.html"));
app.get('/test' ,(rep, res) =>  res.render('test.html'))
app.get('/test2' ,(rep, res) =>  res.render('test2.html'))
app.get('/test3' ,(rep, res) =>  res.render('test3.html'))


app.post('/main', (req, res) => {
  var body = "";
  req.on('data', data => body += data );
  req.on('end', function(){
      var post = qs.parse(body);
      var testQuery = `select * from member where email = "${post.email}"`;
      
      if(post.name){              // revise => main
        let q = `update member set password="${post.password}",name="${post.name}",phone="${post.phone}" where email = "${post.email}"`;
        db.query(q, (err, results) => {
          if(err);
          else {
            addUserlist(post.email);
            res.render('main.html', {post : post});
          }
        });
      }
      else{                      // login => main
        console.log('=>main');
        db.query(testQuery, function (err, results) {
          addUserlist(post.email);
          post = producePost(results[0]);
          res.render('main.html', {post : post});  
        });
      }
      
  });
});
function addUserlist(email){
  username = email;
  if(!users.includes(username)) users.push(username);
}
function producePost(arr){
  let post = {
    email : arr.email,
    password : arr.password,
    name : arr.name,
    phone : arr.PHONE
  }
  return post;
}

app.post('/del_process', (req, res) => {
  var body = "";
  req.on('data', data => body += data );
  req.on('end',function(){
      var post = qs.parse(body);
      var testQuery = `delete from member where email = "${post.email}"`;
 
      db.query(testQuery, function (err) { 
        if (err)  console.log(err);
        else console.log("회원탈퇴");
      });
      res.redirect('/');
  });
});

app.get('/signup', (req, res) =>   res.render('signup.html'));

app.post('/signup_process', (req, res) => {
  var body = "";
  req.on('data', data => body += data );
  req.on('end',function(){
      var post = qs.parse(body);
      var testQuery = `INSERT INTO member (email, password, name, date, phone) VALUES ("${post.email}","${post.password}","${post.name}",now(),"${post.phone}")`;
      
      db.query(testQuery, function (err) {
        if (err)  res.redirect('/signup');
        else{
          console.log(`${post.email} - 회원가입 성공`);
          res.redirect('/');
        }
      });      
  });
})

app.post('/revise', (req, res)=>{
  var body = "";
  req.on('data', function(data){
      body += data;
  });
  req.on('end',function(){
      var post = qs.parse(body);
      let q = `select * from member where email = "${post.email}"`;
      
      db.query(q, function (err,results) {
        if(results[0] == null)  console.log("null");
        else {
          post = producePost(results[0]);
          res.render('revise.html', {post : post});
        }
      });
  });
});
app.post('/codemirror', (req, res)=>{
  var body = "";
  req.on('data', function(data){
      body += data;
  });
  req.on('end',function(){
      var post = qs.parse(body);
      if(!shareUsers.includes(post.email))  shareUsers.push(post.email);
      res.render('shareCode.html', {post:post});
  });
	
})
app.post('/compile', (req, res)=> {
  var body = "";
  req.on('data', function(data){
      body += data;
  });
  req.on('end',function(){
      var post = qs.parse(body);
      res.render('compile.html', {post:post});
  });
});

app.post('/form_receive',function(req,res) {
  var body = "";
  req.on('data', data => body = data );
  req.on('end',function(){
    let post = JSON.parse(body);          //문자열 -> 객체
    let lang = post.language;
    let input = post.input;
    let code = post.code;
    console.log(post)
    if(lang==="C"){
      fs.writeFile('test.c', code, 'utf-8',function(error) {
        console.log('C compiler');
      });
      let resultc = c.runFile('test.c', { stdin : input});;
      resultc
        .then(result => {
          let responseData;
          if(result.stdout) {
            responseData = {'result':'ok','output': result.stdout};
            res.json(responseData);
          }
          else{
            responseData = {'result':'ok','output': result.stderr};
            res.json(responseData);
          } 
        })
        .catch(err => {
          console.log(err);
        });
    }
    else if(lang==="C++"){
      fs.writeFile('test.cpp', code, 'utf-8',function(error) {
        console.log('Cpp coding program');
      });
      let resultcpp = cpp.runFile('test.cpp', { stdin: input});
      resultcpp
      .then(result => {
        let responseData;
        if(result.stdout) {
          responseData = {'result':'ok','output': result.stdout};
          res.json(responseData);
        }
        else{
          responseData = {'result':'ok','output': result.stderr};
          res.json(responseData);
        }          
      })
      .catch(err => {
        console.log(err);
      });
    }
    else if(lang==="java"){
      fs.writeFile('Main.java', code, 'utf-8',function(error) {
        console.log('java coding program');
      });
      let resultjava = java.runFile('Main.java', { stdin: input});
      resultjava
        .then(result => {
          let responseData;
          if(result.stdout) {
            responseData = {'result':'ok','output': result.stdout};
            res.json(responseData);
          }
          else{
            responseData = {'result':'ok','output': result.stderr};
            res.json(responseData);
          }  
        })
        .catch(err => {
          console.log(err);
          })
    }
    else if(lang==="javascript"){
      let resultPro = node.runSource(code);
      resultPro
        .then(result => {
          var responseData = {'result':'ok','output': result.stdout};
          res.json(responseData);
        })
        .catch(err => {
          console.log(err);
        });
    }
    else if(lang==="python"){
      fs.writeFile('test.py', code, 'utf-8',function(error) {
        console.log('text.py');
      });
      let resultc = python.runFile('test.py', { stdin : input});;
      resultc
        .then(result => {
          let responseData;
          console.log(result)
          if(result.stdout) {
            responseData = {'result':'ok','output': result.stdout};
            res.json(responseData);
          }
          else{
            responseData = {'result':'ok','output': result.stderr};
            res.json(responseData);
          } 
        })
        .catch(err => {
          console.log(err);
        });
      // let resultPromise = python.runSource(code);
      // resultPromise
      //   .then(result => {
      //     let responseData;
      //     if(result.stdout) {
      //       responseData = {'result':'ok','output': result.stdout};
      //       res.json(responseData);
      //     }
      //     else{
      //       responseData = {'result':'ok','output': result.stderr};
      //       res.json(responseData);
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   })
    }
  });
});
app.post('/code_save', (req, res) => {
  var body = "", body2 ='';
  req.on('data', data => body += data);

  req.on('end', function (){ 
    let post = JSON.parse(body);

    if(!post.codepackage){    //불러오기
      fs.readFile(`./codeStorage/${post.email}`,'utf8',function(err, data){
         if(err) console.log(err);
         else res.json(data);
      });
    }
    else{          //저장하기
      let stringcode =JSON.stringify(post.codepackage)
      fs.writeFile(`./codeStorage/${post.email}`, stringcode, 'utf8',function(error) {
        console.log('저장완');
      });

    }
  });
});


app.post('/check',function(req,res) {     //아이디 중복확인, 비밀번호 확인   
  var body = "";
  req.on('data', function(data){ body = data;});
  req.on('end',function(){
    let post = JSON.parse(body);
    let q = `select * from member where email = "${post.email}"`;
    db.query(q, function (err,results) {
      if(post.state === "id"){
        if(results[0] == null)  res.json({'result':'ok'});
        else  res.json({'result':'no'});
      }
      else if(post.state ==="pwd"){
        if(results[0].password === post.pwd)  res.json({'result':'ok'});
        else  res.json({'result':'no'});  
      }
      else if(post.state ==="login"){
        if(results[0] == null)  res.json({'result':'no'});  
        else if(results[0].email === post.email && results[0].password === post.pwd) res.json({'result':'ok'});
        else  res.json({'result':'no'});
      }
    });
    
  });
});
app.post('/userlist', function(req, res){
  var body = "";
  req.on('data', function(data){
    body = data;
  });
  req.on('end',function(){
    var code = body;
    code = JSON.parse(code);
    if(code.page ==='main'){
      if(!users.includes(code.email)) users.push(code.email);
      var responseData = {'result' : 'ok', 'users' : users}
      res.json(responseData);
    }
    else{
      if(!shareUsers.includes(code.email)) shareUsers.push(code.email);
      var responseData = {'result' : 'ok', 'users' : shareUsers}
      console.log(shareUsers)
      res.json(responseData);
    }
  })
})


var server = http.createServer(app);
server.listen(8080, function (err) {
  if (err) throw err;
  console.log('Sharedb codemirror http://%s:%s', server.address().address, server.address().port);
});

var webSocketServer = new WebSocketServer({server: server});
webSocketServer.on('connection', function (socket) {
  var stream = new WebSocketJSONStream(socket);
  shareDB.listen(stream);
  socket.email = username;
  socket.addEventListener('open', () => {
    console.log('312line = openenenenen')
  });
  socket.on('close', () => {      //수정하자
    for(let i=0; i<users.length; i++){
      if((users[i] !== null) && (users[i] === socket.email)) {
        users.splice(i,1);
      }
    } 
    for(let i=0; i<shareUsers.length; i++){
      if((shareUsers[i] !== null) && (shareUsers[i] === socket.email)) shareUsers.splice(i,1);
    }
  });
});

var chatSer = http.createServer();
chatSer.listen(7007, function (err) {
  if (err) throw err;
  console.log('chat On http://%s:%s', chatSer.address().address, chatSer.address().port);
})

var ChatSocketServer = new WebSocketServer({server: chatSer});  

ChatSocketServer.on('connection', (res, req) =>{
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  res.email = username;
  res.on('message', function incoming(data) {
    ChatSocketServer.clients.forEach(function each(client) {
      client.send(data);
    })
  })
  res.on('close', () => {
    const data = {
      "content" : "OUT",
      "message" : res.email+"님이 퇴장하셨습니다"
    }
    ChatSocketServer.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    })
  })
})