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
router.get("/principal-dashboard", async function (req, res) {
  res.render("principal/principal-dashboard");
});
router.get("/Principal-Achievement", async function (req, res) {
  res.render("principal/Principal-Achievement");
});
router.get("/principal-department", async function (req, res) {
  res.render("principal/principal-department");
});

router.get("/principal-leave", async function (req, res) {
  res.render("principal/principal-leave");
});
router.get("/principal-events", async function (req, res) {
  res.render("principal/principal-events");
});

router.get("/principal-salary", async function (req, res) {
  res.render("principal/principal-salary");
});

router.get("/principal-profile", async function (req, res) {
  try {
    const userEmail = req.session.user.email;
    const user = await db
      .getDb()
      .collection("Principal")
      .findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const department = await db
      .getDb()
      .collection("Departments")
      .findOne({ "members.email": userEmail });

    res.render("principal/principal-profile", {
      user: user,
      department: department,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal server error");
  }
});
router.get("/principal-updprof", async function (req, res) {
  res.render("principal/principal-updprof");
});


router.post(
  "/principal-updprof",
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
        .collection("Principal")
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

      res.redirect("/principal/principal-dashboard"); // Redirect to a different page if necessary
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send("Internal server error");
    }
  }
);

module.exports = router;
