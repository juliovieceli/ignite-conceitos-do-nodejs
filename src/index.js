const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user  = users.find(item => item.username === username)

  if(!user) {
    return response.status(404).json({error:'user not found'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {username, name} = request.body
  
  const userAlreadyExist = users.find(item => item.username === username)

  if (userAlreadyExist){
    return  response.status(400).json({error:'user already exists'})
  }

  const user = { 
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body


  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  const findIndex = users.findIndex(item => item.id === user.id)

  if (findIndex === -1){
    return response.status(404).json({error:'user not found'})
  }

  users[findIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user}  = request
  const {id} = request.params
  const {title, deadline} = request.body

  const userIndex = users.findIndex(item => item.id === user.id)

  if (userIndex === -1){
    return response.status(404).json({error:'user not found'})
  }

  const todoIndex = user.todos.findIndex(item => item.id === id)

  if (todoIndex === -1){
    return response.status(404).json({error:'todo not found'})
  }

  const newTodo = users[userIndex].todos[todoIndex]

  newTodo.title = title
  newTodo.deadline = new Date(deadline)

  users[userIndex].todos[todoIndex] = {...newTodo}

  return response.json(newTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user}  = request
  const {id} = request.params

  const userIndex = users.findIndex(item => item.id === user.id)

  if (userIndex === -1){
    return response.status(404).json({error:'user not found'})
  }

  const todoIndex = user.todos.findIndex(item => item.id === id)

  if (todoIndex === -1){
    return response.status(404).json({error:'todo not found'})
  }

  const newTodo = users[userIndex].todos[todoIndex]

  newTodo.done = true

  users[userIndex].todos[todoIndex] = {...newTodo}

  return response.json(newTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user}  = request
  const {id} = request.params

  const userIndex = users.findIndex(item => item.id === user.id)

  if (userIndex === -1){
    return response.status(404).json({error:'user not found'})
  }

  const todoIndex = user.todos.findIndex(item => item.id === id)

  if (todoIndex === -1){
    return response.status(404).json({error:'todo not found'})
  }

  users[userIndex].todos.splice(todoIndex,1)

  return response.status(204).json()
});

module.exports = app;