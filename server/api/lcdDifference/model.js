const mongoose = require('mongoose');
const { Schema } = mongoose;
const lcdDiffrenceSchema = new Schema({
    CompanyId  :{type:Number, required: [true, "Company name is required"]},
    DeviceType    :{type:Number,required: [true, "Device name is required"]},
    ParameterId:{type:Number, required: [true, "Parameter name is required"] }
});
lcdDiffrenceSchema.index({ CompanyId: 1 });
lcdDiffrenceSchema.index({ CompanyId: 1 ,DeviceType: 1});
var lcdDiffrenceData = mongoose.model("lcdViewDiffConfiguration1",lcdDiffrenceSchema);


module.exports = lcdDiffrenceData;