const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const mongodbStore = require("connect-mongodb-session");

const app = express();
const db = require("./data/database");

const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
  uri: "mongodb://localhost:27017",
  databaseName: "sms",
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);


app.get("/", function (req, res) {
  res.redirect("/index");
});

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/aboutUs", function (req, res) {
  res.render("aboutUs");
});

app.get("/contactUs", function (req, res) {
  res.render("contactUs");
});

app.get("/logIn", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      password: "",
      role: "",
    };
  }
  req.session.inputData = null;
  res.render("logIn", { inputData: sessionInputData });
});

app.get("/signUp", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    };
  }
  req.session.inputData = null;
  res.render("signup", { inputData: sessionInputData });
});

app.get("/admin", async function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || user.role !== "admin") {
    return res.status(403).render("403");
  }

  res.render("admin");
});

app.post("/logIn", async function (req, res) {
  const userData = req.body;

  const enteredEmail = userData.email;
  const entredPassword = userData.password;
  const enteredRole = userData.role;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail, role: enteredRole });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Could not log you in - please check your input!",
      email: enteredEmail,
      password: entredPassword,
      role: enteredRole,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  const passwordAreEqual = await bcrypt.compare(
    entredPassword,
    existingUser.password
  );

  if (!passwordAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: "Could not log you in -Password does not match!!",
      email: enteredEmail,
      password: entredPassword,
      role: enteredRole,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  req.session.user = {
    id: existingUser._id,
    email: existingUser.email,
  };

  req.session.isAuthenticated = true;
  req.session.save(function () {
    if (existingUser.role == "admin") {
      res.redirect("admin");
    } else if (existingUser.role == "hod") {
      res.redirect("admin");
    } else {
      res.redirect("admin");
    }
  });

  // const validRole = await db
  //   .getDb()
  //   .collection("users")
  //   .findOne({ role: enteredRole , role:enteredRole });
  // console.log("user Is Validated");

  // if(!validRole){
  //   console.log('could not logIn - role does not match')
  //   res.redirect('/login')
  // }
});

app.post("/signup", async function (req, res) {
  const userData = req.body;

  const enteredUsername = userData.username;
  const enteredEmail = userData.email;
  const entredPassword = userData.password;
  const enteredConfirmPassword = userData.confirmPassword;
  const enteredRole = userData.role;

  if (
    !enteredEmail ||
    !entredPassword.trim() || // Trim the password
    !enteredConfirmPassword.trim() || // Trim the confirm password
    entredPassword.trim().length < 6 || // Check the length after trimming
    enteredConfirmPassword.trim().length < 6 || // Check the length after trimming
    entredPassword.trim() !== enteredConfirmPassword.trim() ||
    !enteredEmail.includes("@")
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid Input- please check your data.",
      username: enteredUsername,
      email: enteredEmail,
      password: entredPassword,
      confirmPassword: enteredConfirmPassword,
      role: enteredRole,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "User exists already!",
      username: enteredUsername,
      email: enteredEmail,
      password: entredPassword,
      confirmPassword: enteredConfirmPassword,
      role: enteredRole,
    };
    req.session.save(function () {
      return res.redirect("/signup");
    });
    return;
  }

  const hashPassword = await bcrypt.hash(enteredConfirmPassword, 12);

  const user = {
    username: enteredUsername,
    email: enteredEmail,
    password: hashPassword,
    role: enteredRole,
  };

  await db.getDb().collection("users").insertOne(user);
  res.redirect("/logIn");
});

app.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

db.connectToDatabase().then(function () {
  app.listen(3000, function () {
    console.log("Server is running on 3000 Port");
  });
});
