const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  mongoReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GithubPayload'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Queue", QueueSchema);
