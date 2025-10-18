const mongoose = require("mongoose");

var todData = mongoose.model("todset", {
  AssetId: { type: String, required: [true, "AssetId is required"] },
  Start: {
    type: Number,
    required: [true, "Start time is required"],
    min: 0,
    max: 23,
  },
  Stop: {
    type: Number,
    required: [true, "Stop time is required"],
    min: 1,
    max: 24,
    validate: [timeValidator, 'Start time must be less than End time']
  },
  Rate: { type: Number, required: [true, "Rate is required"] },
});

function timeValidator(value) {
    return this.Start < value;
  }

module.exports = todData;
