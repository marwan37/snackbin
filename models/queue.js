const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true
  },
  enqueuedAt: {
    type: Date,
    default: Date.now
  }
});

const Queue = mongoose.model("Queue", queueSchema);

module.exports = Queue;
