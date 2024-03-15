// routes/admin/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");

router.get("/admin-dashboard", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return res.status(403).render("403");
  }

  const adminName = user.username;
  const staffCount = await db
    .getDb()
    .collection("users")
    .countDocuments({ role: "staff" });

  res.render("admin/admin-dashboard", { staffCount, adminName });
});

router.get("/staff-member", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

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
router.get("/admin-event", async function (req, res) {
  res.render("admin/admin-event");
});
router.get("/admin-salary", async function (req, res) {
  res.render("admin/admin-salary");
});
module.exports = router;
