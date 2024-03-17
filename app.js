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

const adminRoutes = require("./routes/admin/adminRoutes");
app.use("/admin", adminRoutes);

const staffRoutes = require("./routes/staff/staffRoutes");
app.use("/staff", staffRoutes);

const principalRoutes = require("./routes/principal/principalRoutes");
app.use("/principal", principalRoutes); 

const hodRoutes = require("./routes/hod/hodRoutes")
app.use('/hod' ,hodRoutes)

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


app.post("/contactUs", async function (req, res) {
  const contactData = req.body;

  const enteredUsername = contactData.username;
  const enteredEmail = contactData.email;
  const enteredMessage = contactData.message;
  // Validate if the user exists in the database
  const userExists = await db
    .getDb()
    .collection("users")
    .findOne({ email: contactData.email });

  if (!userExists) {
    return res.status(400).send("User does not exist.");
  }

  const contactUsData = {
    username: enteredUsername,
    email: enteredEmail,
    message: enteredMessage,
  };

  await db.getDb().collection("contactUs").insertOne(contactUsData);

  res.redirect("/"); // Redirect to home or any other page after submission
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

app.post("/logIn", async function (req, res) {
  const userData = req.body;

  const enteredEmail = userData.email;
  const enteredPassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Could not log you in - please check your input!",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  const passwordAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: "Could not log you in - Password does not match!",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  req.session.user = {
    id: existingUser._id,
    email: existingUser.email,
    role: existingUser.role, // Store the user role in the session
  };

  req.session.user.isAuthenticated = true;
  req.session.save(function () {
    if (existingUser.role === "admin") {
      res.redirect("/admin/admin-dashboard");
    } else if (existingUser.role === "staff") {
      res.redirect("/staff/staff-dashboard");
    } else if (existingUser.role === "principal") {
      res.redirect("/principal/principal-dashboard");
    } else if (existingUser.role === "hod") {
      res.redirect("/hod/hod-dashboard");
    } else {
      res.redirect("/index");
    }
  });

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
  const enteredRole = req.session.user.role;

  req.session[enteredRole] = null;
  req.session[enteredRole].isAuthenticated = false;
  res.redirect("/");
});
db.connectToDatabase().then(function () {
  app.listen(3000, function () {
    console.log("Server is running on 3000 Port");
  });
});
