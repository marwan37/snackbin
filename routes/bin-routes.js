const express = require("express");
const binControllers = require("../controllers/bin-controllers");

const router = express.Router();

// Route create new request bin
router.post("/api/bin/new", binControllers.createRequestBin);
// Save request to a bin

router.get("/api/bin/:id", binControllers.getBinForId);

router.get("/test/bin/:id", binControllers.createRequest);

// Delete a request from a bin
router.delete("/api/bin/:id/:rid", binControllers.deleteRequest);

// Route to create request
router.post("/bin/:id", binControllers.createRequest);

// Route to handle GitHub webhook payloads
router.post("/bin/:id/github-webhook", binControllers.getGihubtPayload);

module.exports = router;
