const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var usplMachineTargetData = mongoose.model("machineTarget",{
    // userId : {type: String, required: true},
    // name   :{type:String, required: true}, 
    value  :{type:Number, required: true},
    // machineName:{type:String, required: true},
    machineId : {type: String, required: true},
    date : { type:Number , required: true},
   
},'machineTarget');

module.exports = usplMachineTargetData;

// module.exports = assetData;

