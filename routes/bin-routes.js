const express = require("express");
const binControllers = require("../controllers/bin-controllers");

const router = express.Router();

// Middleware: Route to handle requests to the bins & stores requests in the respective bin
router.use("/bin/:id", binControllers.extractRequestData);

// Route to view bin's content
router.get("/bin/:id", binControllers.getBinForId);

router.post("/bin", binControllers.createRequest);

module.exports = router;
