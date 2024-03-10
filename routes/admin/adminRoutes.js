// routes/admin/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");

router.get("/admin-dashboard", async function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

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
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || user.role !== "admin") {
    return res.status(403).render("403");
  }
  // Handle admin contact information functionality
  res.render("admin/staff-member");
});

// Add more routes for admin functionalities
// ...

module.exports = router;
