const express = require("express");
const queueControllers = require("../controllers/queue-controllers");

const router = express.Router();

router.get("/getall", queueControllers.getAll);
router.post("/dequeue", queueControllers.dequeue);

module.exports = router;