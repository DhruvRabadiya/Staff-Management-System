const express = require("express");
const router = express.Router();



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

module.exports = router;