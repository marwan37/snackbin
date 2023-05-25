// models/analytics.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  getRequestsPerSecond: Number,
  postRequestsPerSecond: Number,
  requestsWithBodyPerSecond: Number,
  createdAt: Date
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;
