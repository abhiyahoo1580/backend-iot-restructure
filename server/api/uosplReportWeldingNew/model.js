const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const uosplWeldingSchema = new Schema({
    AssetId : {type: String, required: true},
    StartTime :{type:Number, required: true} , 
    StopTime: {type:Number, required: true} ,
    WeldingNumber  : {type:Number, required: true} ,
    Data  :{type:Array, required: true}  ,
    // CompanyId  :{type:Number, required: true}   
});
uosplWeldingSchema.index({ AssetId: 1, StartTime: 1 }, { unique: true });
uosplWeldingSchema.index({ AssetId: 1, StopTime: 1 }, { unique: true });
uosplWeldingSchema.index({ AssetId: 1});
var uosplWldingData = mongoose.model("uodata1",uosplWeldingSchema,'uodataNew');

module.exports = uosplWldingData;

// module.exports = assetData;
