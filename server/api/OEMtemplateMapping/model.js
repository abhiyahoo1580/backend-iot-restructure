const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var oemGateway = mongoose.model("oemTemplateMap",{
     useCaseName : {type: String ,required: true },
     description : {type: String ,required: true },
     template : {type: Object ,required: true },
     registeredOn : {type:Number ,default : new Date(new Date()), required: true }
   
},'oemTemplateMap');

module.exports = oemGateway;

// module.exports = assetData;



