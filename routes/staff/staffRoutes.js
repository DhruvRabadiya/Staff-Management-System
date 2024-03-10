// routes/staff/staffRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");

router.get("/staff-dashboard", async function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || user.role !== "staff") {
    return res.status(403).render("403");
  }
  const staffName = user.username;

  res.render("staff/staff-dashboard", { staffName });
});

// Add more routes for admin functionalities


module.exports = router;
