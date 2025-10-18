const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usplAlertsSchema = new Schema({
    AssetId : {type: String, required: true},
    RegisterId  :{type:Number, required: true},
    Value:{type:Number, required: true},
    StartTime : {type:Number ,  required: true},
    StopTime : {type:Number ,  required: true},

});

usplAlertsSchema.index({ AssetId: 1 });
usplAlertsSchema.index({ RegisterId: 1 });
var usplAlertsData = mongoose.model("alertsMaa",usplAlertsSchema,'alertsMaa');

module.exports = usplAlertsData;

// module.exports = assetData;

