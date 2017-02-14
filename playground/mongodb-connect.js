const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err){
       return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to MongoDB server.');
    
    db.collection('Users').insertOne({
        name: 'Adam',
        age: 27,
        location: 'Boronia'
    }, (err, res)=>{
        if(err){
            return console.log('Unable to insert user', err);
        }

        console.log(JSON.stringify(res.ops[0]._id.getTimestamp()));
    });
    // db.collection('Todos').insertOne({
    //     text:'Something to do',
    //     completed: false
    // },(err,res)=>{
    //     if(err){
    //        return console.log('Unable to insert todo', err);
    //     }
        
    //     console.log(JSON.stringify(res.ops, undefined, 2));

    // });



    db.close();
});