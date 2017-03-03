const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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
            }).catch((e) => done());
    })
});

describe('GET /users/me', () => {
    it('should return user if authenticatd', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    })
});

describe('POST /users',() => {
    it('should create a new user',(done) => {
        var email = 'passing@adamth.com'
        var password = 'P@ssw0rd'

        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.body.email).toBe(email);
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }

            User.findOne({email}).then((user) =>{
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((e) => done());
        });
    });
    it('should reutrn validation errors if request invalid', (done) => {
        request(app)
        .post('/users')
        .send({email:'test', password:'12'})
        .expect(400)
        .end(done);
    });
    it('should not create user if email is in use', (done) => {
        request(app)
        .post('/users')
        .send({email: users[0].email, password: users[0].password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email, password: users[1].password})
        .expect(200)
        .expect((res) =>{
            expect(res.headers['x-auth']).toExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[0]).toInclude({
                    access: 'x-auth',
                    token: res.headers['x-auth']
                });
                done();
            }).catch((e) => done());
        });
    });

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email + '1', password: users[1].password})
        .expect(400)
        .expect((res) =>{
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toEqual(0);
                done();
            }).catch((e) => done());
        });
    });
});