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
  res.render("hod/HOD-event");
});
router.get("/HOD-Attendance", async function (req, res) {
  res.render("hod/HOD-Attendance");
});

router.get("/HOD-leave", async function (req, res) {
  res.render("hod/HOD-leave");
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
              enterdDept: newUser.dept,

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

module.exports = router;
