const mongoose = require("mongoose");

const Schema = mongoose.Schema;

function shiftOverlapCheck(value) {
  if(this.start.hour > value.hour){
    return false;
  }else if(this.start.min > value.min){
    return false;
  }
}

const shiftSchema = new Schema({
  companyId: { type: Number, required: [true, "Company is required"] },
  shifts: [
    {
      name: {type :String,require:[true,"Shift Name is required"]},
      // id: { type: Number, required: [true, "Shift id is required"],default :new Date()},
      start: {
        hour: {
          type: Number,
          required: [true, "Shift start hour is required"],
          min: 0,
          max: 24,
        },
        min: {
          type: Number,
          required: [true, "Shift start minute is required"],
          min: 0,
          max: 59,
        }
      },
      end: {
        hour: {
          type: Number,
          required: [true, "Shift end hour is required"],
          min: 0,
          max: 24,
        },
        min: {
          type: Number,
          required: [true, "Shift end minute is required"],
          min: 0,
          max: 59,
          validate:[shiftOverlapCheck,"Start time must be less than End time"]
        }
      },
    },
  ],
})
var shiftData = mongoose.model("shifts", shiftSchema);




module.exports = shiftData;
