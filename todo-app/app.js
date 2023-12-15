/* eslint-disable no-unused-vars */
const express = require("express");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const { Todo, User } = require("./models");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("shhh! some secret string"));
app.use(csrf({ cookie: true }));

app.set("viewengine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my-super-secret-key-156655548662145",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          console.log("comparing passwords");
          const result = await bcrypt.compare(password, user.password);
          console.log("result", result);
          if (result) {
            return done(null, user);
          } else {
            return "invalid password";
          }
        })
        .catch((err) => {
          return err;
        });
    },
  ),
);
//to convert object to byte
passport.serializeUser((user, done) => {
  console.log("serializing user in session ", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      console.log("deserializing user from session ", user.id);
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});
const saltRounds = 10;
app.get("/", async (request, response) => {
  response.render("index.ejs", {
    csrfToken: request.csrfToken(),
  });
});
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
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
      response.render("todo.ejs", {
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
  },
);

app.get("/signup", async (request, response) => {
  response.render("signup.ejs", { csrfToken: request.csrfToken() });
});
app.get("/login", async (request, response) => {
  response.render("login.ejs", { csrfToken: request.csrfToken() });
});
app.post(
  "/session",
  passport.authenticate(
    "local",
    { failureRedirect: "/login" },
    (request, response) => {
      console.log(request.user);
      response.redirect("/todos");
    },
  ),
);
app.post("/users", async (request, response) => {
  const hashedpwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedpwd,
    });

    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("redirecting to todos");
      response.redirect("/todos");
      console.log(" after redirecting to todos");
    });
  } catch (err) {
    console.log(err);
  }
});

/*app.get("/todos", async function (_request, response) {
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
});*/

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
    return response.redirect("/todos");
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
/* eslint-disable no-unused-vars */
