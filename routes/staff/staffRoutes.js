// routes/staff/staffRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");


router.get("/staff-dashboard", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  // const user = await db
  //   .getDb()
  //   .collection("users")
  //   .findOne({ _id: req.session.user.id });

  // if (!user || (user.role !== "staff" && user.role !== "admin")) {
  //   return res.status(403).render("403");
  // }

  // const userName = user.username;

  console.log(req.user)
  res.render("staff/staff-dashboard");
});
router.get("/staff-salary", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  res.render("staff/staff-salary");
});
router.get("/staff-profile", async function (req, res) {
  res.render("staff/staff-profile");
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

router.get("/staff-leave", async function (req, res) {
  res.render("staff/staff-leave");
});

router.get("/staff-leaveapply", async function (req, res) {
  res.render("staff/staff-leaveapply");
});
router.get("/staff-event", async function (req, res) {
  res.render("staff/staff-event");
});
router.get("/staff-salary", async function (req, res) {
  res.render("staff/staff-salary");
});
// Add more routes for staff functionalities

module.exports = router;
