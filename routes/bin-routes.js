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
router.delete("/api/bin/:id/github/:rid", binControllers.deleteGithubRequest);
router.delete("/api/bin/:id/basecamp/:rid", binControllers.deleteBasecampRequest);

// Route to create request
router.post("/bin/:id", binControllers.createRequest);

// Route to handle GitHub webhook payloads
router.post("/bin/:id/github-webhook", binControllers.getGithubPayload);

// Route to handle GitHub webhook payloads
router.post("/bin/:id/basecamp", binControllers.createBasecampPayload);
//https://a73f-50-231-155-26.ngrok-free.app/bin/ZDGuvtsu/basecamp

router.get("/api/bin/basecamp/:id", binControllers.getBasecampPayloads);

https: module.exports = router;
