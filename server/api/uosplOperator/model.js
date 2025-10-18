const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usplOperatorSchema = new Schema({
    userId : {type: String, required: true},
    name   :{type:String, required: true}, 
    mobileNo  :{type:Number, required: true},
    machineName:{type:String, required: true},
    machineId : {type: Schema.Types.ObjectId, required: true},
    registeredOn : {type:Number , default : new Date(new Date()), required: true},
   
});

usplOperatorSchema.index({ userId: 1, mobileNo: 1 }, { unique: true });
usplOperatorSchema.index({ userId: 1, name: 1 }, { unique: true });
usplOperatorSchema.index({ userId: 1, machineId: 1 }, { unique: true });
var usplOperatorData = mongoose.model("operator",usplOperatorSchema,'operators');

module.exports = usplOperatorData;

// module.exports = assetData;

