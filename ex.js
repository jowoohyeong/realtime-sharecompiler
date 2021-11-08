var Client = require('mongodb').MongoClient;
var dburl = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false';
Client.connect(dburl, function (error, client) {
    if (error) {
        console.log(error);
    } else {
        var michael = { name: 'Michael', age: 24, gender: 'M' };
        
        var db = client.db('jsdb');
        var ww = {name:'Michael'}       //조건
        //  추가하기
        // db.collection('code').insertOne(michael, (err, res) => {
        //     if (err) throw err;
        //     console.log("1 document inserted");
        //     client.close();
        // })
        //  조회하기
        // db.collection('code').findOne(ww, (err, result)=>{
        //     console.log(result);
        //     client.close();
        // })
        //  갱신하기
        // var ml = { age: 13, gender: 'W' };
        // var newvalues = { $set: ml };
        // db.collection('code').updateOne(ww, newvalues, (err, result)=>{
        //     console.log("1 document inserted");
        //     client.close();
        // })
        //삭제하기
        // var ww = {name:'ABC'}
        // db.collection("code").deleteOne(ww, function (err, obj) {
        //     if (err) throw err;
        //     console.log("1 document 삭제 완료.");
        //     client.close();

        // });
    }
});