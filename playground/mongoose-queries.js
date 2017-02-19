const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = '58a57f0543039c33193a22cb';

// Todo.find({
//     _id: id}).then((todos) => {
//         console.log('Todos', todos);
//     })

// Todo.findOne({_id: id}).then((todo) => {
//         console.log('Todo', todo);
//     });

Todo.findById(id).then((todo) => {
        console.log('Todo', todo);
    });