const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err){
       return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to MongoDB server.');

    db.collection('Todos').findOneAndUpdate({_id: new ObjectID('58a2eeadc7219418c9fc5ea6')},
        {
            $set:{
                completed: true
            }
        },{
            returnOriginal: false    
    }).then((res) => {
        console.log(res);
    });
    
    db.collection('Users').findOneAndUpdate({_id: new ObjectID('58a2e00efb9fdb0b9ffabdc1')},{
        $set: {
            name: 'Adam'
        },
        $inc: {
            age: 1
    }},{
       returnOriginal: false 
    }).then((res) => {
        console.log(res);
    });
    // db.close();
});