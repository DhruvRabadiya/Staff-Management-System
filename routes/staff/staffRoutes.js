// routes/staff/staffRoutes.js
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

router.get("/staff-dashboard", async function (req, res) {
  res.render("staff/staff-dashboard");
});
router.get("/staff-salary", async function (req, res) {
  res.render("staff/staff-salary");
});
router.get("/staff-profile", async function (req, res) {
  try {
    const userEmail = req.session.user.email;
    const user = await db
      .getDb()
      .collection("StaffMembers")
      .findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    const department = await db
      .getDb()
      .collection("Departments")
      .findOne({ "members.email": userEmail });

    res.render("staff/staff-profile", { user: user  , department:department});
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/staff-updprof", async function (req, res) {
  res.render("staff/staff-updprof");
});
router.get("/staff-ach", async function (req, res) {
  res.render("staff/staff-ach");
});
router.get("/staff-achadd", async function (req, res) {
  res.render("staff/staff-achadd");
});




router.get("/staff-event", async function (req, res) {
try {
  // Fetch events from the database
  const events = await db.getDb().collection("Events").find().toArray();

  // Render the HOD-event.ejs page with the fetched events
  res.render("staff/staff-event", { events: events });
} catch (error) {
  console.error("Error fetching events:", error);
}
});
router.get("/staff-salary", async function (req, res) {
  res.render("staff/staff-salary");
});

router.post(
  "/staff-updprof",
  upload.single("userPhoto"),
  async function (req, res) {
    const userEmail = req.session.user.email;

    const newUser = req.body;

    const entredFirstName = newUser.firstName;
    const enteredLastName = newUser.lastName;
    const enteredPhoneNumber = newUser.phoneNumber;
    const enteredEmgPhoneNumber = newUser.emnumber;
    const enterdGender = newUser.gender;
    const enteredDateOfBirth = newUser.dateOfBirth;
    const enteredHouseno = newUser.houseno;
    const enteredSociety = newUser.society;
    const enteredArea = newUser.area;
    const enteredcity = newUser.City;
    const enteredDateOfJoining = newUser.dateOfJoining;
    const enteredQualification = newUser.qualification;
    const enteredExperience = newUser.experience;
    const enteredqualification = newUser.qualification;
    const enterdDept = newUser.dept;

    if (
      !entredFirstName ||
      !enteredLastName ||
      !enteredPhoneNumber ||
      !enterdGender ||
      !enteredDateOfBirth ||
      !enteredDateOfJoining ||
      !enteredQualification ||
      !enteredExperience
    ) {
      console.log("Invalid Input- please check your data.");
    }

    try {
      await db
        .getDb()
        .collection("StaffMembers")
        .updateOne(
          { email: userEmail }, // Update based on the user's email
          {
            $set: {
              firstname: entredFirstName,
              lastname: enteredLastName,
              phonenumber: enteredPhoneNumber,
              emgnumber: enteredEmgPhoneNumber,
              gender: enterdGender,
              dateofbirth: enteredDateOfBirth,
              dateofjoining: enteredDateOfJoining,
              experience: enteredExperience,
              qualification:enteredqualification,
              address: {
                Houseno: enteredHouseno,
                Society: enteredSociety,
                Area: enteredArea,
                city: enteredcity,
              },
              department: newUser.dept,

              userphoto: req.file.filename,
            },
          }
        );

      const departmentExists = await db
        .getDb()
        .collection("Departments")
        .findOne({ name: enterdDept });

      if (!departmentExists) {
        await db
          .getDb()
          .collection("Departments")
          .insertOne({ name: enterdDept, members: [] });
      }

      // Add the user to the specified department
      await db
        .getDb()
        .collection("Departments")
        .updateOne(
          { name: enterdDept },
          {
            $addToSet: {
              members: {
                firstname: entredFirstName,
                lastname: enteredLastName,
                phonenumber: enteredPhoneNumber,
                dateofbirth: enteredDateOfBirth,
                email: userEmail,
              },
            },
          }
        );

      res.redirect("/staff/staff-dashboard"); // Redirect to a different page if necessary
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send("Internal server error");
    }
  }
);
router.get("/staff-leave", async function (req, res) {
  try {
    const userEmail = req.session.user.email;

    // Fetch user details based on the email stored in the session
    const user = await db
      .getDb()
      .collection("StaffMembers")
      .findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch current leave status for the user
    const currentLeaves = await db
      .getDb()
      .collection("LeaveRequests")
      .find({email:userEmail}) // Assuming "Pending" status indicates current leaves
      .toArray();
console.log(currentLeaves)
    // Fetch all past leaves for the user
    // const pastLeaves = await db
    //   .getDb()
    //   .collection("LeaveRequests")
    //   .find({ userEmail, status: { $ne: "Pending" } }) // Exclude leaves with "Pending" status
    //   .toArray();

    // Render the staff-leave EJS template with the user, currentLeaves, and pastLeaves arrays
    res.render("staff/staff-leave", {
      user,
      currentLeaves
    });
  } catch (error) {
    console.error("Error fetching leave details:", error);
    res.status(500).send("Internal server error");
  }
});


router.get("/staff-leaveapply", async (req, res) => {
  try {
    // Check if user is logged in and session contains user information
    if (!req.session || !req.session.user || !req.session.user.email) {
      return res.status(401).send("Unauthorized");
    }

    // Retrieve user email from the session
    const userEmail = req.session.user.email;

    // Render the leave application form and pass the user email
    res.render("staff/staff-leaveapply", { userEmail });
  } catch (error) {
    console.error("Error rendering leave application form:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to handle leave application submission
router.post("/staff-leaveapply", async (req, res) => {
  const { title, fromDate, toDate, reason, leaveType } = req.body;
  const userEmail = req.session.user.email;

  try {
    const dept = await db.getDb().collection("StaffMembers").findOne(userEmail)
    // Save the leave request to the database
    await db.getDb().collection("LeaveRequests").insertOne({
      email: userEmail,
      title: title,
      fromDate: fromDate,
      toDate: toDate,

      leaveType: leaveType,
      status: "pending",
      department: dept.department, // Set initial status as pending
    });

    res.redirect("/staff/staff-dashboard"); // Redirect to dashboard after submission
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).send("Internal server error");
  }
});

// Add more routes for staff functionalities

module.exports = router;
