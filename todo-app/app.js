const express = require("express");

const app = express();
const { Todo } = require("./models");
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.set("viewengine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (request, response) => {
  let allTodos = await Todo.getTodos();
  console.log(`ALL TODOS LENGTH==>${allTodos.length}`);
  //console.log(allTodos);
  let overDue = allTodos.filter((item) => {
    return item.dueDate < new Date().toISOString().slice(0, 10);
  });
  console.log(overDue);
  let DueToday = allTodos.filter((item) => {
    return item.dueDate == new Date().toISOString().slice(0, 10);
  });
  let DueLater = allTodos.filter((item) => {
    return item.dueDate > new Date().toISOString().slice(0, 10);
  });

  response.render("index.ejs", { overDue, DueToday, DueLater });
});

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
  try {
    const todos = await Todo.findAll();
    response.send(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  try {
    const id = request.params.id;
    await Todo.destroy({
      where: {
        id: id,
      },
    });
    return response.json(true);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
