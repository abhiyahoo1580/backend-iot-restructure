const mongoose = require('mongoose');
const { Schema } = mongoose;
const oeeTableSchema = new Schema({
    BreakDownTime: { type:Number, required:true},
    PlannedDownTime: { type:Number, required:true},
    RejectJob: { type:Number, required:true},
    AssetId: { type:String, required:true},
    Date :  { type:Number, required:true},
    MachineJobPerMinute :  { type:Number, default : 80},
    TotalRunTime : { type:Number, default : 0},
    TotalProduction : { type:Number, default : 0},
    AvgRpm : { type:Number, default : 0}

});
oeeTableSchema.index({ AssetId: 1 });
oeeTableSchema.index({ AssetId: 1 ,Date: 1}, { unique: true }); 
var oeeTableData = mongoose.model("oeetable",oeeTableSchema);

module.exports = oeeTableData;