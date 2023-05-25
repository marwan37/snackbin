const express = require("express");
const Analytics = require("../models/analytics");
const router = express.Router();

router.get("/", async (req, res) => {
  const analytics = await Analytics.find().sort({ createdAt: -1 }).limit(10);
  res.json(analytics);
});

module.exports = router;
