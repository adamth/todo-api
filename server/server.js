var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.port || 3000;

app.use(bodyParser.json())

app.post('/todos',(req,res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) =>{
        res.send(doc);
    }, (err)  => {
        res.status(400).send(err);
    })
});

app.get('/todos',(req,res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /todos/id
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.sendStatus(404);
    }

    Todo.findById(id).then((todo) => {
        if(!todo){
            return res.sendStatus(404);
        }
        res.send({todo}).status(200);
    }).catch((e) => {
        res.send(e).sendStatus(400);
    });

});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = {app};