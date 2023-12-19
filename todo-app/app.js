/* eslint-disable no-unused-vars */
const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const app = express();
const { Todo, User } = require("./models");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
//app.use(csrf({ cookie:true}));


app.set("viewengine", "ejs");
app.set("views", path.join(__dirname, "views"));
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
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

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
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((err) => {
          return err;
        });
    },
  ),
);
//The serialize function will take user document i.e all realted information and outputs only the user_id which is sent into session
passport.serializeUser((user, done) => {
  console.log("serializing user in session ", user.id);
  done(null, user.id);
});
//When any request is called the deserilaize function will be called and which will take ID from the sessions and give user document which consists of all related todos of user
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
    const loggedinUser = request.user.id;
    //console.log("userid", loggedinUser);
    let allTodos = await Todo.getTodos(loggedinUser);
    //console.log(`ALL TODOS LENGTH==>${allTodos.length}`);
    //console.log("all todos",allTodos);
    let overDue = allTodos.filter((item) => {
      return (
        item.dueDate < new Date().toISOString().slice(0, 10) &&
        item.completed == false
      );
    });
    // console.log(overDue);
    let DueToday = allTodos.filter((item) => {
      return (
        item.dueDate === new Date().toISOString().slice(0, 10) &&
        item.completed == false
      );
    });
    let DueLater = allTodos.filter((item) => {
      return (
        item.dueDate > new Date().toISOString().slice(0, 10) &&
        item.completed == false
      );
    });
    let completedItems = allTodos.filter((item) => {
      return item.completed == true;
    });
    //console.log("due", DueToday);
    if (request.accepts("html")) {
      response.render("todo.ejs", {
        overDue,
        DueToday,
        DueLater,
        completedItems,
        csrfToken: request.csrfToken(),
      });
    } else {
      //console.log("due", DueToday);
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
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    request.flash("success", "Login successful!");
    response.redirect("/todos");
  },
);
app.get(
  "/signout",
  connectEnsureLogin.ensureLoggedIn(),
  (request, response, next) => {
    request.logout((err) => {
      if (err) {
        return next(err);
      }
      response.redirect("/");
    });
  },
);
app.post("/users", async (req, res) => {
  if (req.body.firstName.length === 0) {
    req.flash("error", "First Name can't be empty");
    return res.redirect("/signup");
  }

  if (req.body.email.length === 0) {
    req.flash("error", "Email can't be empty");
    return res.redirect("/signup");
  }

  if (req.body.password.length === 0) {
    req.flash("error", "Password can't be empty");
    return res.redirect("/signup");
  }
  //hash password using bcrypt

  const hasedPwd = await bcrypt.hash(req.body.password, saltRounds);

  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hasedPwd,
    });

    req.login(user, (err) => {
      if (err) {
        return res.status(422).send({ error: err.message });
      }
      res.redirect("/todos");
    });
  } catch (error) {
    req.flash("error", "Email Already Exists");
    return res.redirect("/signup");
  }

  //add user
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

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      if (request.body.title.length < 5) {
        request.flash(
          "error",
          "Please make sure title should be more than 5 letters",
        );
        return response.redirect("/todos");
      }
      if (request.body.dueDate == "") {
        request.flash("error", "Please Enter date");
        return response.redirect("/todos");
      }
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      // window.location.href = "/";
      request.flash("success", "Todo created successfully.");
      return response.redirect("/todos");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.message;
        request.flash("message", errors);
        return response.status(422).json(error);
      } else {
        // Handle other errors
        //console.error(error);
        request.flash("error", "An error occurred while creating the todo.");
        return response.status(422).json(error);
      }
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const id = request.params.id;
      const todo = await Todo.findByPk(id);
      const userId = request.user.id;
      const updatedTodo = await todo.setCompletionStatus(userId, id);
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);

    try {
      const id = request.params.id;
      console.log(id);
      await Todo.destroy({
        where: {
          id,
          userId: request.user.id,
        },
      });
      //return response.status(302).json(true);
      return response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

module.exports = app;
/* eslint-disable no-unused-vars */
