const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemAlertsSchema = new Schema({
    userId : {type: Schema.Types.ObjectId ,required: true },
    assetId : {type:String , required: true },
    date : {type:Number , default : new Date(new Date()), required: true},
    parameter: { type: Number, required: [true, "Parameter is required"] },
    registerId: { type: Number, required: [true, "RegisterId is required"] },
    // message : {type:String , required: true },
   upperThresholdValue: { type: Number ,  default : null },
   upperThresholdWarning: { type: Number, default : null},
   lowerThresholdValue: { type: Number,default : null},
   lowerThresholdWarning: { type: Number,default : null},
   frequency : {type: Number, default : 0}, // in minutes
   
},{ timestamps: true })
oemAlertsSchema.index({ assetId: 1 });
oemAlertsSchema.index({ assetId: 1 ,parameter: 1, registerId: 1}, { unique: true });
oemAlertsSchema.index({ userId : 1});
var oemAlerts = mongoose.model("oemAlertsConfig",oemAlertsSchema,'oemAlertsConfig');

module.exports = oemAlerts;

// module.exports = assetData;

