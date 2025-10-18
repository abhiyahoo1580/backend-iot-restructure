const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var oemTemplate = mongoose.model("templates",{
     useCaseName : {type: String ,required: true },
     description : {type: String ,required: true },
    // registeredOn : {type:Number , default : new Date(new Date()), required: true},
     alerts : {type:Array , required: true },
     uiWidgets: {type:Array , required: true },
     registeredOn : {type:Number ,default : new Date(new Date()), required: true }
   
},'templates');

module.exports = oemTemplate;

// module.exports = assetData;



