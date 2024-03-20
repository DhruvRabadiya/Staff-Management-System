// routes/admin/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");
const multer = require("multer");
const bcrypt = require("bcryptjs");

let Storege = multer.diskStorage({
  destination: "public/userImg/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: Storege,
});

router.get("/admin-dashboard", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  // const admin = await db
  //   .getDb()
  //   .collection("Admins")
  //   .findOne();

  // if (!user || (user.role !== "admin" && user.role !== "staff")) {
  //   return res.status(403).render("403");
  // }

  // const adminName = admin.username;
  // const staffCount = await db
  //   .getDb()
  //   .collection("Admins")
  //   .countDocuments({ role: "staff" });

  res.render("admin/admin-dashboard");
});

router.get("/staff-member", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  // const user = await db
  //   .getDb()
  //   .collection("users")
  //   .findOne({ _id: req.session.user.id });

  // if (!user || user.role !== "admin") {
  //   return res.status(403).render("403");
  // }
  // Handle admin contact information functionality
  res.render("admin/staff-member");
});

// Add more routes for admin functionalities
// ...
router.get("/admin-contact", async function (req, res) {
  res.render("admin/admin-contact");
});
router.get("/admin-achievement", async function (req, res) {
  res.render("admin/admin-achievement");
});
router.get("/admin-attendance", async function (req, res) {
  res.render("admin/admin-attendance");
});
router.get("/admin-leave", async function (req, res) {
  res.render("admin/admin-leave");
});

router.get("/admin-createUser", async function (req, res) {
  res.render("admin/admin-createUser");
});

router.post(
  "/admin-createUser",
  upload.single("userPhoto"),
  async function (req, res) {
    const newUser = req.body;

    const entredFirstName = newUser.firstName;
    const enteredLastName = newUser.lastName;
    const enteredPhoneNumber = newUser.phoneNumber;
    const enteredRole = newUser.role;
    const enterdGender = newUser.gender;
    const enteredDateOfBirth = newUser.dateOfBirth;
    const enteredDateOfJoining = newUser.dateOfJoining;
    const enteredQualification = newUser.qualification;
    const enteredAddress = newUser.address;
    const enteredExperience = newUser.experience;
    const enteredEmail = newUser.email;
    const enteredPassword = newUser.password;

    if (
      !enteredEmail ||
      !entredFirstName ||
      !enteredLastName ||
      !enteredPhoneNumber ||
      !enteredRole ||
      !enterdGender ||
      !enteredDateOfBirth ||
      !enteredDateOfJoining ||
      !enteredQualification ||
      !enteredAddress ||
      !enteredExperience ||
      !enteredPassword.trim() || // Trim the password
      enteredPassword.trim().length < 6 || // Check the length after trimming
      !enteredEmail.includes("@")
    ) {
      console.log("Invalid Input- please check your data.");
    }

    function getDbName(enteredRole) {
      let dbName;
      if (enteredRole == "principal") {
        dbName = "Principal";
      } else if (enteredRole == "hod") {
        dbName = "HODs";
      } else if (enteredRole == "staff") {
        dbName = "StaffMembers";
      } else {
        throw new Error("Role Does not Exist");
      }
      return dbName;
    }
    const DbName = getDbName(enteredRole);

    const addUsersExists = await db
      .getDb()
      .collection("Users")
      .findOne({ email: enteredEmail });

    if (addUsersExists) {
      console.log("User exists already!");
      return res.status(400).send("User already exists");
    }
    const hashPassword = await bcrypt.hash(enteredPassword, 12);

    const addUsers = {
      firstname: entredFirstName,
      lastname: enteredLastName,
      phonenumber: enteredPhoneNumber,
      role: enteredRole,
      gender: enterdGender,
      dateofbirth: enteredDateOfBirth,
      dateofjoining: enteredDateOfJoining,
      address: enteredAddress,
      experience: enteredExperience,
      email: enteredEmail,
      password: hashPassword,
      userphoto: req.file.filename,
    };

    
    const Users = {
      email: enteredEmail,
      password: hashPassword,
      role: enteredRole,
    };
    try {
      await db.getDb().collection(DbName).insertOne(addUsers);
      await db.getDb().collection("Users").insertOne(Users);
    res.redirect("/admin/admin-dashboard"); // Redirect to a different page if necessary
    } catch (error) {
      console.error("Error inserting user:", error);
      res.status(500).send("Internal server error");
    }
  }
);
router.get("/admin-event", async function (req, res) {
  res.render("admin/admin-event");
});
router.get("/admin-salary", async function (req, res) {
  res.render("admin/admin-salary");
});
module.exports = router;