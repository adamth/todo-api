const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err){
       return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to MongoDB server.');

    // db.collection('Todos').find({
    //         _id: new ObjectID('58a2e3f0c7219418c9fc5cea')})
    //         .toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs,undefined,2));
    // },(err) => {
    //     console.log('Unable to fetch docs', err)
    // })

    // db.collection('Todos').find()
    //         .count().then((count) => {
    //     console.log('Todos');
    //     console.log(`Todos count: ${count}`);
    // },(err) => {
    //     console.log('Unable to fetch docs', err)
    // })

    db.collection('Users').find({name: 'Mike'})
            .count().then((count) => {
        console.log('Todos');
        console.log(`Todos count: ${count}`);
    },(err) => {
        console.log('Unable to fetch docs', err)
    })

    db.close();
});