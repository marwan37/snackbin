const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  getRequestsPerSecond: Number,
  postRequestsPerSecond: Number,
  requestsWithBodyPerSecond: Number,
  requestsPerBin: [
    {
      binId: String,
      count: Number
    }
  ],
  popularMethods: [
    {
      method: String,
      count: Number
    }
  ],
  requestsWithContentTypeJson: Number,
  commonPaths: [
    {
      path: String,
      count: Number
    }
  ],
  requestWithQueries: Number,
  requestsWithEmptyBody: Number,
  createdAt: Date
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;
