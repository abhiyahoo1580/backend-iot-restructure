const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uosplReportSchema = new Schema({
    AssetId : {type: String, required: true},
    Date  :{type:Number, required: true},
    Status  :{type:Array, required: true}  ,
    Time  :{type:Array, required: true}  ,
    LastGatewayStatus : {type:Boolean, required: true}  ,
    LastGatewayCall :{type:Number, required: true},

});

uosplReportSchema.index({ AssetId: 1, Date: 1 }, { unique: true });
uosplReportSchema.index({ AssetId: 1, LastGatewayCall: 1 }, { unique: true });
uosplReportSchema.index({ AssetId: 1});
var uosplReportData = mongoose.model("assetStatusNew",uosplReportSchema,'assetStatusNew');

module.exports = uosplReportData;

// module.exports = assetData;
