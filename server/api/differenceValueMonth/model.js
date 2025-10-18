const mongoose = require('mongoose');
const { Schema } = mongoose;
const differenceValueSchema = new Schema({
    AssetId  :{type:String},
    Date  :{type:Number},
    Value  :{type:Number},
});
differenceValueSchema.index({ AssetId: 1 });
differenceValueSchema.index({ AssetId: 1 ,Date: 1}, { unique: true });
var differenceValueData = mongoose.model("differencevaluemonth",differenceValueSchema,'differenceValueMonth');

module.exports = differenceValueData;