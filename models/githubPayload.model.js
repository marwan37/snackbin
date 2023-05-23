const mongoose = require("mongoose");

const GithubPayloadSchema = new mongoose.Schema(
  {
    payload: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("GithubPayload", GithubPayloadSchema);
