const path = require("path");
const express = require("express");

const bcrypt = require("bcryptjs");
const app = express();

const db = require("./data/database");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

const adminRoutes = require("./routes/admin/adminRoutes");
app.use("/admin", adminRoutes);

const staffRoutes = require("./routes/staff/staffRoutes");
app.use("/staff", staffRoutes);

const principalRoutes = require("./routes/principal/principalRoutes");
app.use("/principal", principalRoutes);

const hodRoutes = require("./routes/hod/hodRoutes");
app.use("/hod", hodRoutes);

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
  res.render("logIn");
});
app.get("/signup", function (req, res) {
  res.render("signup");
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
    console.log("Invalid Input- please check your data.");
  }

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    console.log("User exists already!");
    return res.status(400).send("User already exists");
  }

  const hashPassword = await bcrypt.hash(entredPassword, 12);

  const user = {
    username: enteredUsername,
    email: enteredEmail,
    password: hashPassword,
    role: enteredRole,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});
app.post("/logIn", async function (req, res) {
  const { email, password, role } = req.body;

  
  const DbName = getDbName(role);
  try {
    const existingUser = await db.getDb().collection(DbName).findOne({ email });

    if (!existingUser) {
      console.log("User not found!");
      return res.status(400).send("User not found");
    }

    const passwordAreEqual = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!passwordAreEqual) {
      console.log("Invalid password!");
      return res.status(400).send("Invalid password");
    }

    if (existingUser.role !== role) {
      console.log("Role does not match!");
      return res.status(400).send("Role does not match");
    }

    switch (existingUser.role) {
      case "admin":
        res.redirect("/admin/admin-dashboard");
        break;
      case "staff":
        res.redirect("/staff/staff-dashboard");
        break;
      case "principal":
        res.redirect("/principal/principal-dashboard");
        break;
      case "hod":
        res.redirect("/hod/hod-dashboard");
        break;
      default:
        res.redirect("/index");
        break;
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Internal server error");
  }
});

function getDbName(role) {
  let dbName;
  if (role == "admin") {
    dbName = "users";
  } else if (role == "principal") {
    dbName = "Principal";
  } else if (role == "hod") {
    dbName = "HODs";
  } else if (role == "staff") {
    dbName = "StaffMembers";
  } else {
    throw new Error("Role Does not Exist");
  }
  return dbName;
}

db.connectToDatabase().then(function () {
  app.listen(3000, function () {
    console.log("Server is running on 3000 Port");
  });
});
