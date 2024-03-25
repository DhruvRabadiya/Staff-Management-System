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
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });

  // if (!user || (user.role !== "admin" && user.role !== "staff")) {
  //   return res.status(403).render("403");
  // }

  const adminName = admin.username;
const staffCount = await db
  .getDb()
  .collection("Users")
  .countDocuments({ role: { $ne: "admin" } });

  res.render("admin/admin-dashboard", {
    adminName: adminName,
    staffCount: staffCount,
  });
});

router.get("/staff-member", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });

  // if (!user || (user.role !== "admin" && user.role !== "staff")) {
  //   return res.status(403).render("403");
  // }

  const adminName = admin.username;
 const allUsers = await db
   .getDb()
   .collection("Principal")
   .aggregate([
     { $unionWith: { coll: "HODs" } },
     { $unionWith: { coll: "StaffMembers" } },
   ])
   .toArray();

  res.render("admin/staff-member", {
    adminName: adminName,
    allUsers: allUsers,
  });
});

// Add more routes for admin functionalities
// ...
router.get("/admin-contact", async function (req, res) {
  try {
    const userEmail = req.session.user.email;

    // Fetch admin data based on the email of the user
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });

    const adminName = admin.username;

    // Aggregate data from Principal, HODs, and StaffMembers collections
    const allUsers = await db
      .getDb()
      .collection("Principal")
      .aggregate([
        { $unionWith: { coll: "HODs" } },
        { $unionWith: { coll: "StaffMembers" } },
      ])
      .toArray();

    res.render("admin/admin-contact", {
      adminName: adminName,
      allUsers: allUsers,
    });
  } catch (error) {
    console.error("Error fetching admin contact:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/admin-achievement", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-achievement", { adminName: adminName });
});
router.get("/admin-attendance", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-attendance", { adminName: adminName });
});
router.get("/admin-leave", async function (req, res) {
  const userEmail = req.session.user.email;
try {
  const leaveRequests = await db
    .getDb()
    .collection("LeaveRequests")
    .find()
    .toArray();

  // Iterate through each leave request and fetch the corresponding user email
  for (const request of leaveRequests) {
    const userEmail = await db
      .getDb()
      .collection("StaffMembers")
      .findOne({ email: request.email }); // Assuming email field contains the user email

    // Add the user email to the leave request object
    request.userEmail = userEmail;
  }
  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;

  res.render("admin/admin-leave", {
    leaveRequests: leaveRequests,
    adminName: adminName,
  });
} catch (error) {
  console.error("Error fetching leave requests:", error);
  res.status(500).send("Internal server error");
}
  


});

router.get("/admin-createUser", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-createUser", { adminName: adminName });
});

router.post(
  "/admin-createUser",
  upload.single("userPhoto"),
  async function (req, res) {
    const newUser = req.body;
    const enteredRole = newUser.role;
    const enteredEmail = newUser.email;
    const enteredPassword = newUser.password;
    const enteredSalary = newUser.salary;

    if (
      !enteredEmail ||
      !enteredRole ||
      !enteredSalary||
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
      email: enteredEmail,
      password: hashPassword,
      role: enteredRole,
      salary:enteredSalary
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
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-event", { adminName: adminName });
});

router.get("/admin-department", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-department", { adminName: adminName });
});

router.get("/admin-salary", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-salary", { adminName: adminName });
});
module.exports = router;
