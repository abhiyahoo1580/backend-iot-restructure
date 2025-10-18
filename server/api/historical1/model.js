var mongoose  =  require('mongoose');

// function dynamicSchema(prefix){  
//     if (!mongoose.models["historicalMeterValues"+prefix]) {
//         return mongoose.model( "historicalMeterValues"+prefix,{
//             companyId :{type:Number},
//             assetId  :{type:String},
//             date  :{type:Number},
//         },'historicalMeterValues' + prefix);
//       }else{
//         return mongoose.models["historicalMeterValues"+prefix]
//       }   
// }

// module.exports = dynamicSchema;
// const mongoose = require("mongoose");

var graphGroupData1212 = mongoose.model("historicalMeterValues75", {
AssetId : {
  type : String
},
Date : {
  type : Number
},
Data : {
  type : Array
}
},"historicalMeterValues75");

module.exports = graphGroupData1212;
