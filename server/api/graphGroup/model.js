const mongoose = require("mongoose");
const { Schema } = mongoose;
const graphGroupSchema = new Schema({
AssetId : {
  type : String,
  require : [true, "Device is required"]
},
Name : {
  type : String,
  require : [true, "Group name is required"]
},
ParameterId : {
  type : [Number],
  required : [true, "At least one parameter is required"]
}
});
graphGroupSchema.index({ AssetId: 1 });
var graphGroupData = mongoose.model("groupparametergraph", graphGroupSchema);

module.exports = graphGroupData;
