const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usplJobSchema = new Schema({
    userId : {type:  Schema.Types.ObjectId, required: true},
    assetId :  {type:  Schema.Types.ObjectId, required: true},
    customerName   :{type:String, required: true}, 
    projectDoneBy  :{type:String, required: true},
    powerSource:{type:String, required: true},
    orientedHeadType:{type:String, required: true},
    machineCode:{type:String, required: true},
    registeredOn : {type:Number , default : new Date(new Date()), required: true},

});

usplJobSchema.index({ userId: 1, assetId: 1 }, { unique: true });
usplJobSchema.index({ userId: 1, customerName: 1 }, { unique: true });
usplJobSchema.index({ userId: 1, projectDoneBy: 1 }, { unique: true });
usplJobSchema.index({ userId: 1, machineCode: 1 }, { unique: true });
var usplJobData = mongoose.model("job",usplJobSchema,'machineJobDetails');

module.exports = usplJobData;

// module.exports = assetData;

