// routes/staff/staffRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../data/database");

router.get("/staff-dashboard", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return res.status(403).render("403");
  }

  const userName = user.username;

  res.render("staff/staff-dashboard", { userName });
});
router.get("/staff-salary", async function (req, res) {
  // if (!req.session.isAuthenticated) {
  //   return res.status(401).render("401");
  // }

  res.render("staff/staff-salary");
});
// Add more routes for staff functionalities

module.exports = router;
