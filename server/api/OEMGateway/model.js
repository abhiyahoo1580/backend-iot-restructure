const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemGatewaySchema = new Schema({
     assetName : {type: String ,required: true },
     assetId : {type: String ,required: true },
    // registeredOn : {type:Number , default : new Date(new Date()), required: true},
     assetTypeId : {type:Number , required: true },
     description: {type:String , required: true },
     companyId : {type:Number , required: true },
     installationDate : {type:Number ,default : new Date(new Date()), required: true },
   
})
oemGatewaySchema.index({ companyId: 1 });
oemGatewaySchema.index({ assetId: 1 });
oemGatewaySchema.index({ assetTypeId: 1 });
var oemGateway = mongoose.model("Gateway",oemGatewaySchema,'gateway');

module.exports = oemGateway;

// module.exports = assetData;



