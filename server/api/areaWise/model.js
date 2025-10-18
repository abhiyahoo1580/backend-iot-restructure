const mongoose = require("mongoose");
const { Schema } = mongoose;
const areaWiseSchema = new Schema( {
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
})
areaWiseSchema.index({ CompanyId: 1 });
var areaWiseData = mongoose.model("areawise",areaWiseSchema);

module.exports = areaWiseData;