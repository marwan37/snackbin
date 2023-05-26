const express = require("express");
const Request = require("../models/request"); // Assuming you have a model named Request
const Analytics = require("../models/analytics");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const requests = await Request.find({}).sort({ createdAt: -1 });

    // ANALYTICS
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000); // 60000 milliseconds = 1 minute

    try {
      const getRequests = await Request.countDocuments({
        createdAt: {
          $gte: oneMinuteAgo,
          $lte: now
        }
      });

      const postRequests = await Request.countDocuments({
        method: "POST",
        createdAt: {
          $gte: oneMinuteAgo,
          $lte: now
        }
      });

      const requestsWithBody = await Request.countDocuments({
        body: { $ne: null },
        createdAt: {
          $gte: oneMinuteAgo,
          $lte: now
        }
      });

      const requestsPerBin = await Request.aggregate([
        { $group: { _id: "$binId", count: { $sum: 1 } } }
      ]);

      const popularMethods = await Request.aggregate([
        { $group: { _id: "$method", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const requestsWithContentTypeJson = await Request.countDocuments({
        "headers.Content-Type": "application/json"
      });

      const commonPaths = await Request.aggregate([
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const requestWithQueries = await Request.countDocuments({
        "query.0": { $exists: true }
      });

      const requestsWithEmptyBody = await Request.countDocuments({
        body: {}
      });

      // Store analytics in MongoDB
      const analytics = new Analytics({
        getRequestsPerSecond: getRequests,
        postRequestsPerSecond: postRequests,
        requestsWithBodyPerSecond: requestsWithBody,
        requestsPerBin: requestsPerBin.map(({ _id, count }) => ({ binId: _id, count })),
        popularMethods: popularMethods.map(({ _id, count }) => ({ method: _id, count })),
        requestsWithContentTypeJson: requestsWithContentTypeJson,
        commonPaths: commonPaths.map(({ _id, count }) => ({ path: _id, count })),
        requestWithQueries: requestWithQueries,
        requestsWithEmptyBody: requestsWithEmptyBody,
        createdAt: now
      });

      await analytics.save();
      console.log("Analytics saved successfully.");
    } catch (error) {
      console.error(`Failed to sync data: ${error}`);
    }

    res.status(201).json({ message: "Analytics updated successfully." });
  } catch (error) {
    console.error("Failed to update analytics:", error);
    res.status(500).json({ message: "Failed to update analytics." });
  }
});

router.get("/api/all", async (req, res) => {
  let analytics = [];
  try {
    analytics = await Analytics.find({}).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
  }
  // req.io.emit("update", analytics);
  res.json(analytics);
});

module.exports = router;
