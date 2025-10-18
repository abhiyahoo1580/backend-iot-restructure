const mongoose = require('mongoose');

const lcdSchema = new mongoose.Schema({
    CompanyId  : {type:Number ,required: true},
    DeviceTypeId  :{type:Number,required: true},
    ParameterId  :{type:Number,required: true}

});
lcdSchema.index({ CompanyId: 1 });
lcdSchema.index({ CompanyId: 1 ,DeviceTypeId: 1}, { unique: true });
var lcdData = mongoose.model("lcdcofig", lcdSchema);

module.exports = lcdData;