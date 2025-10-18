const mongoose = require("mongoose");
const { Schema } = mongoose;
const groupSchema = new Schema({
CompanyId : {
  type : Number,
  require : [true, "Company Name is required"]
},
Name : {
  type : String,
  require : [true, "Area  name is required"]
},
AssetId : {
  type : [String],
  required : [true, "At least one Asset is required"]
}
});
groupSchema.index({ CompanyId: 1 });
var groupData = mongoose.model("metergroup", groupSchema);



module.exports = groupData;