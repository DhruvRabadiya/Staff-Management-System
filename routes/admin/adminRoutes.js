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
  const userEmail = req.session.user.email;

  try {
    // Fetch admin data based on the email of the user
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });

    const adminName = admin.username;

    // Query total number of achievements
    const totalAchievements = await db
      .getDb()
      .collection("Achievements")
      .estimatedDocumentCount();

    // Query total number of staff members
    const staffCount = await db
      .getDb()
      .collection("Users")
      .countDocuments({ role: { $ne: "admin" } });

    // Query upcoming events
    const currentDate = new Date();
    const upcomingEvents = await db
      .getDb()
      .collection("Events")
      .find()
      .toArray();

    const filteredEvents = upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= currentDate;
    });

    res.render("admin/admin-dashboard", {
      adminName: adminName,
      totalAchievements: totalAchievements,
      staffCount: staffCount,
      upcomingEvents: filteredEvents,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).send("Internal Server Error");
  }
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
  try {
    // Fetch all achievements from the database
    const achievements = await db
      .getDb()
      .collection("Achievements")
      .find()
      .toArray();

    // Fetch admin data based on the email of the user
    const userEmail = req.session.user.email;
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });
    const adminName = admin.username;

    res.render("admin/admin-achievement", {
      adminName: adminName,
      achievements: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).send("Internal Server Error");
  }
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
      !enteredSalary ||
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
      salary: enteredSalary,
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
  try {
    const userEmail = req.session.user.email;

    // Fetch admin data based on the email of the user
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });
    const adminName = admin.username;

    // Fetch all upcoming events from the database
    const eventsCursor = await db.getDb().collection("Events").find(); // Assuming you have a Mongoose model named Event
    const events = await eventsCursor.toArray(); // Convert cursor to array

    // Render the admin-events.ejs page with the fetched events
    res.render("admin/admin-event", { events: events, adminName: adminName });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin-addevent", async function (req, res) {
  const userEmail = req.session.user.email;

  // Fetch admin data based on the email of the user
  const admin = await db
    .getDb()
    .collection("Admins")
    .findOne({ email: userEmail });
  const adminName = admin.username;
  res.render("admin/admin-addevent", { adminName: adminName });
});
router.post("/admin-addevent", async function (req, res) {
  try {
    // Extract event details from the request body
    const { name, date, time, place, targetAudience } = req.body;

    // Insert the new event into the database
    await db
      .getDb()
      .collection("Events")
      .insertOne({ name, date, time, place, targetAudience });

    res.redirect("/admin/admin-event");
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/admin-department", async function (req, res) {
  try {
    const userEmail = req.session.user.email;

    // Fetch admin data based on the email of the user
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });

    const adminName = admin.username;

    // Fetch department data from the database
    const departments = await db
      .getDb()
      .collection("Departments")
      .find()
      .toArray();

    res.render("admin/admin-department", {
      adminName: adminName,
      departments: departments,
    });
  } catch (error) {
    console.error("Error fetching department data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Router
router.get("/admin-salary", async function (req, res) {
  const userEmail = req.session.user.email;

  try {
    // Fetch admin data based on the email of the user
    const admin = await db
      .getDb()
      .collection("Admins")
      .findOne({ email: userEmail });

    // Aggregate salary data for all users from different collections
    const users = await db
      .getDb()
      .collection("Principal")
      .aggregate([
        { $unionWith: { coll: "HODs" } },
        { $unionWith: { coll: "StaffMembers" } },
        {
          $project: {
            name: { $concat: ["$firstname", " ", "$lastname"] },
            salary: { $toDouble: "$salary" }, // Convert string to number
            role: 1, // Include the role
            department: 1, // Include the department
            AGP: { $literal: 5000 }, // Assumed AGP value
            DA: { $multiply: [0.1, { $toDouble: "$salary" }] }, // Calculate DA: 10% of base salary
            HRA: { $multiply: [0.05, { $toDouble: "$salary" }] }, // Calculate HRA: 5% of base salary
            otherSalary: { $multiply: [0.02, { $toDouble: "$salary" }] }, // Calculate other components: 2% of base salary
          },
        },
        {
          $set: {
            totalSalary: {
              $sum: ["$salary", "$AGP", "$DA", "$HRA", "$otherSalary"],
            }, // Calculate total salary
          },
        },
      ])
      .toArray();

    const adminName = admin.username;
    res.render("admin/admin-salary", { adminName: adminName, users: users });
  } catch (error) {
    console.error("Error fetching and aggregating salary data:", error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
