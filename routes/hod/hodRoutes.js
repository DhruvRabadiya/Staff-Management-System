const express = require("express");
const router = express.Router();
const db = require("../../data/database");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

let Storege = multer.diskStorage({
  destination: "public/userImg/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: Storege,
});
router.get("/hod-dashboard", async function (req, res) {
  res.render("hod/hod-dashboard");
});
router.get("/HOD-staff", async function (req, res) {
  try {
    // Fetch HOD's email from session
    const hodEmail = req.session.user.email; // Assuming HOD's email is stored in session

    // Fetch HOD's department based on their email
    const hod = await db
      .getDb()
      .collection("HODs")
      .findOne({ email: hodEmail });

    if (!hod) {
      return res.status(404).send("HOD not found");
    }

    const hodDepartment = hod.department;

    // Fetch staff members associated with HOD's department
    const staffMembers = await db
      .getDb()
      .collection("StaffMembers")
      .find({ department: hodDepartment })
      .toArray();

    res.render("hod/HOD-staff", { staffMembers: staffMembers });
  } catch (error) {
    console.error("Error fetching staff members:", error);
    res.status(500).send("Internal server error");
  }
});
router.get("/HOD-ach", async function (req, res) {
  res.render("hod/HOD-ach");
});
router.get("/HOD-event", async function (req, res) {
  try {
    // Fetch events from the database
    const events = await db.getDb().collection("Events").find().toArray();

    // Render the HOD-event.ejs page with the fetched events
    res.render("hod/HOD-event", { events: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/HOD-Attendance", async function (req, res) {
  res.render("hod/HOD-Attendance");
});

router.get("/HOD-salary", async function (req, res) {
  res.render("hod/HOD-salary");
});

router.get("/HOD-profile", async function (req, res) {
  try {
    const userEmail = req.session.user.email;
    const user = await db
      .getDb()
      .collection("HODs")
      .findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const department = await db
      .getDb()
      .collection("Departments")
      .findOne({ "members.email": userEmail });

    res.render("hod/HOD-profile", { user: user, department: department });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal server error");
  }
});
router.get("/HOD-updprof", async function (req, res) {
  res.render("hod/HOD-updprof");
});

router.post(
  "/HOD-updprof",
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
        .collection("HODs")
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
              qualification: enteredqualification,
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

      res.redirect("/hod/hod-dashboard"); // Redirect to a different page if necessary
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route to fetch leave requests for HOD
router.get("/HOD-leave", async (req, res) => {
  try {
    // Fetch HOD's email from session
    const hodEmail = req.session.user.email;

    // Fetch HOD's department based on their email
    const hod = await db
      .getDb()
      .collection("HODs")
      .findOne({ email: hodEmail });

    if (!hod) {
      return res.status(404).send("HOD not found");
    }

    const hodDepartment = hod.department;
console.log(hodDepartment)
    // Fetch leave requests only for HOD's department
    const leaveRequests = await db
      .getDb()
      .collection("LeaveRequests")
      .find({ department: hodDepartment })
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

    res.render("hod/HOD-leave", {
      leaveRequests: leaveRequests,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/HOD-leave/update-status", async (req, res) => {
  const email = req.body.email;
  const status = req.body.status;

  try {
    if (!email || !status) {
      throw new Error("Email or status is missing.");
    }

    // Ensure status is valid
    if (status !== "approved" && status !== "rejected") {
      throw new Error("Invalid status.");
    }

    // Update the status of the leave request
    const result = await db
      .getDb()
      .collection("LeaveRequests")
      .updateOne(
        { email: email, status: "pending" },
        { $set: { status: status } }
      );

    if (result.modifiedCount === 0) {
      throw new Error("Leave request not found or not modified");
    }

    res.redirect("/hod/HOD-leave");
  } catch (error) {
    console.error("Error updating leave request status:", error);
    res.status(500).send("Internal server error");
  }
});



module.exports = router;
