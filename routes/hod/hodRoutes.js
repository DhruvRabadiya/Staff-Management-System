const express = require("express");
const router = express.Router();

router.get("/hod-dashboard", async function (req, res) {
  res.render("hod/hod-dashboard");
});
router.get("/HOD-profile", async function (req, res) {
  res.render("hod/HOD-profile");
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

module.exports = router;
