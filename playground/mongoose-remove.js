const {mongoose} = require('./../server/db/mongoose');
const {ObjectID} = require('mongodb');
const {Todo} = require('./../server/models/todo');

// Todo.remove({}).then((result) => {
//     console.log(result);
// })

Todo.findByIdAndRemove('58a93c1732970132f17d45f6').then((todo) => {
    console.log(todo);
})