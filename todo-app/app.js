const express = require("express");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const app = express();
const { Todo } = require("./models");
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("shhh! some secret string"));
app.use(csrf({ cookie: true }));

app.set("viewengine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (request, response) => {
  let allTodos = await Todo.getTodos();
  //console.log(`ALL TODOS LENGTH==>${allTodos.length}`);
  //console.log(allTodos);
  let overDue = allTodos.filter((item) => {
    return item.dueDate < new Date().toISOString().slice(0, 10);
  });
  // console.log(overDue);
  let DueToday = allTodos.filter((item) => {
    return item.dueDate == new Date().toISOString().slice(0, 10);
  });
  let DueLater = allTodos.filter((item) => {
    return item.dueDate > new Date().toISOString().slice(0, 10);
  });
  let completedItems = allTodos.filter((item) => {
    return item.completed == true;
  });
  if (request.accepts("html")) {
    response.render("index.ejs", {
      overDue,
      DueToday,
      DueLater,
      completedItems,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overDue,
      DueToday,
      DueLater,
      completedItems,
    });
  }
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
    await Todo.addTodo(request.body);
    // window.location.href = "/";
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  try {
    const id = request.params.id;
    const todo = await Todo.findByPk(id);
    const updatedTodo = await todo.setCompletionStatus();
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
    console.log(id);
    await Todo.destroy({
      where: {
        id,
      },
    });

    return response.status(302).json(true);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
