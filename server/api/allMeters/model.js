const mongoose = require('mongoose');
const { Schema } = mongoose;
const allMeterSchema = new Schema({
    CompanyId  : {type:Number ,required: [true, "CompanyId is required"]},
    AssetId  :{type:String,required: [true, "AssetId is required"]},
   Date: {type: Number, required: [true, "Date is required"]}
  
})
allMeterSchema.index({ CompanyId: 1 ,AssetId: 1,Date: 1 });
allMeterSchema.index({ CompanyId: 1 ,Date: 1 });
allMeterSchema.index({ CompanyId: 1 });
allMeterSchema.index({ AssetId: 1 });
allMeterSchema.index({ Date: 1 });
var allMeterData = mongoose.model("differenceValue",allMeterSchema, "differenceValue");


module.exports = allMeterData;