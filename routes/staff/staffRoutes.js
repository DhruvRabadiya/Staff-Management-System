// routes/staff/staffRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");
const multer = require("multer");


let Storege = multer.diskStorage({
  destination: "public/userImg/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: Storege, 
});

const achievementStorage = multer.diskStorage({
  destination: "public/achievement/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadAchievementPhoto = multer({ storage: achievementStorage });
router.get("/staff-dashboard", async function (req, res) {
  res.render("staff/staff-dashboard");
});


router.get("/staff-salary", async function (req, res) {
  try {
    const userEmail = req.session.user.email;

    const staffMember = await db
      .getDb()
      .collection("StaffMembers")
      .findOne({ email: userEmail });

    // Convert salary string to number
    const baseSalary = parseFloat(staffMember.salary);

    // Check if the conversion was successful
    if (isNaN(baseSalary)) {
      throw new Error("Invalid salary format in the database");
    }

    // Calculate A.G.P (Assuming it's a fixed amount)
    const AGP = 5000; // Example: A.G.P is 5000

    // Calculate other components based on the base salary
    const DA = 0.1 * baseSalary; // Example: 10% of base salary for D.A
    const HRA = 0.05 * baseSalary; // Example: 5% of base salary for HRA
    const otherSalary = 0.02 * baseSalary; // Example: 2% of base salary for other components

    // Calculate total salary
    const totalSalary = baseSalary + AGP + DA + HRA + otherSalary;

    const staffSalary = {
      name: staffMember.firstname,
      salary: {
        basic: baseSalary,
        agp: AGP,
        da: DA,
        hra: HRA,
        other: otherSalary,
        total: totalSalary,
      },
    };

    res.render("staff/staff-salary", { staffSalary: staffSalary });
  } catch (error) {
    console.error("Error fetching staff salary:", error);
    res.status(500).send("Internal Server Error");
  }
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
  try {
    const userEmail = req.session.user.email;

    const staffAchievements = await db
      .getDb()
      .collection("Achievements")
      .find({ email: userEmail })
      .toArray();

    const otherAchievements = await db
      .getDb()
      .collection("Achievements")
      .find({ email: { $ne: userEmail } }) // Exclude the current staff member's achievements
      .toArray();

    res.render("staff/staff-ach", {
      staffAchievements: staffAchievements,
      otherAchievements: otherAchievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/staff-achadd", async function (req, res) {
  res.render("staff/staff-achadd");
});

router.post(
  "/staff-achadd",
  uploadAchievementPhoto.single("certificate"),
  async function (req, res) {
    try {
      const email = req.session.user.email;
      const staffMember = await db
        .getDb()
        .collection("StaffMembers")
        .findOne({ email: email });

      if (!staffMember) {
        return res.status(404).send("Staff member not found");
      }

      const { title, date, description } = req.body;
      const certificate = req.file.filename;

      const achievement = {
        name: staffMember.firstname, 
        title: title,
        date: date,
        description: description,
        certificate: certificate,
      };

      await db.getDb().collection("Achievements").insertOne(achievement);

      res.redirect("/staff/staff-ach");
    } catch (error) {
      console.error("Error adding achievement:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);




router.get("/staff-event", async function (req, res) {
try {
  const events = await db.getDb().collection("Events").find().toArray();

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

      res.redirect("/staff/staff-dashboard"); 
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send("Internal server error");
    }
  }
);
router.get("/staff-leave", async function (req, res) {
  try {
    const userEmail = req.session.user.email;

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
   
    if (!req.session || !req.session.user || !req.session.user.email) {
      return res.status(401).send("Unauthorized");
    }

    const userEmail = req.session.user.email;

    res.render("staff/staff-leaveapply", { userEmail });
  } catch (error) {
    console.error("Error rendering leave application form:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/staff-leaveapply", async (req, res) => {
  const { title, fromDate, toDate, reason, leaveType } = req.body;
  const userEmail = req.session.user.email;

  try {
    const dept = await db.getDb().collection("StaffMembers").findOne(userEmail)
    await db.getDb().collection("LeaveRequests").insertOne({
      email: userEmail,
      title: title,
      fromDate: fromDate,
      toDate: toDate,

      leaveType: leaveType,
      status: "pending",
      department: dept.department,
    });

    res.redirect("/staff/staff-dashboard"); 
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).send("Internal server error");
  }
});


module.exports = router;
