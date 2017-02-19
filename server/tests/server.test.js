const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
        _id: new ObjectID(),
        text: 'First test todo'
    },{
        _id: new ObjectID(),
        text:'Second test todo',
        completed: true,
        completedAt: 333
    }];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
    
});

describe('POST / todos',() =>{
    it('should create a new todo', (done) => {
        var text = 'new todo';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err)=>done(err));
            });
    });

    it('should not create todo with invalid body data',(done)=>{
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err))
            })
    })
});

describe('GET /todos',() => {
    it('should get all todos',(done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
})

describe('GET /todos/:id', () => {
    it('should return todo doc',(done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
        });

    it('should return 404 if todo not found',(done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object IDs', (done) => {
        request(app)
            .get(`/todos/1234`)
            .expect(404)
            .end(done);
    });
});
describe('DELETE /todos/:id',() => {
    it('should delete a todo',(done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist;
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found',(done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object IDs', (done) => {
        request(app)
            .delete(`/todos/1234`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id',() => {
    it('should mark a todo as completed',(done) => {
        var hexId = todos[0]._id.toHexString();
        var todo = {
            text: 'Updated todo',
            completed: true };

        request(app)
            .patch(`/todos/${hexId}`)
            .send(todo)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todo.text);
                expect(res.body.todo.completedAt).toBeA('number');
                expect(res.body.todo.completed).toBe(true);
                done();
            }).end((err, res) => {
                if(err){
                    return done(err);
                }
            });
    });

    it('should mark a todo as incomplete',(done) => {
        var hexId = todos[1]._id;
        var completed = {completed: false};

        request(app)
            .patch(`/todos/${hexId}`)
            .send(completed)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
                done();
            }).end((err, res) => {
                if(err){
                    return done(err);
                }
            });
    })
});
