const mongoose = require("mongoose");
const { Schema } = mongoose;
const DiselManulEntrySchema = new Schema({    
assetId : {
  type : String,
  require : [true, "Asset Name is required"]
},
diselLevel : {
  type : Number,
  require : [true, "Disel level value is required"]
},
diselRecived : {
  type : Number,
  required : [true, "Disel recived value is required"]
},
date : {
  type : Number,
  required : [true, "Date is required"]
}
})
DiselManulEntrySchema.index({ assetId: 1 });
DiselManulEntrySchema.index({ assetId: 1 ,date: 1}, { unique: true });
var DiselManulEntryData = mongoose.model("DiselManulEntry",DiselManulEntrySchema);



module.exports = DiselManulEntryData;