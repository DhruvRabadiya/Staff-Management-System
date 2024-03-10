// routes/admin/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");

router.get("/admin-dashboard",  async function (req, res) {
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
  const staffCount = await db
    .getDb()
    .collection("users")
    .countDocuments({ role: "staff" }); 
    const adminName = user.username;

  res.render("admin/admin-dashboard" ,{ staffCount ,adminName });
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
