const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemGraphsSchema = new Schema({
userId : {type: Schema.Types.ObjectId ,required: true },
assetId : {
  type : String,
  require : [true, "Device is required"]
},
name : {
  type : String,
  require : [true, "Group name is required"]
},
parameterId : {
  type : [Number],
  required : [true, "At least one parameter is required"]
},
   date : {type:Number , default : new Date(new Date()), required: true}
});
oemGraphsSchema.index({ userId: 1 });
oemGraphsSchema.index({ assetId: 1 });
var oemGraphs = mongoose.model("oemGraphConfigs",oemGraphsSchema,'oemGraphConfigs');

module.exports = oemGraphs;

// module.exports = assetData;

