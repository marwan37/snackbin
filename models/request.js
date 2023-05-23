const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
  {
    binId: String,
    headers: Object,
    body: Object,
    method: String,
    path: String,
    query: Object
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", requestSchema);
