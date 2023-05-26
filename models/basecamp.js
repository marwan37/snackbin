const mongoose = require("mongoose");

const basecampSchema = new mongoose.Schema(
  {
    binId: String,
    payload: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("BasecampPayload", basecampSchema);
