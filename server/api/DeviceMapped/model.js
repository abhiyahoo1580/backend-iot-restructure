const mongoose = require("mongoose");

var deviceMappedData = mongoose.model("devicemapped", {
CompanyId : {
  type : Number,
  require : [true, "company is required"]
},
UserId : {
  type : String,
  require : [true, "User id is required"]
},
AssetIds : {
  type : [String],
  required : [true, "At least one Asset is required"]
}
});

module.exports = deviceMappedData;
