const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemParametrConfigsSchema = new Schema({
    userId : {type: Schema.Types.ObjectId ,required: true },
    registeredOn : {type:Number , default : new Date(new Date()), required: true},
    //  assetTypeId : {type:Number , required: true },
     assetId : {type:String , required: true },
     parameterId: {type:Number , required: true },

});
oemParametrConfigsSchema.index({ userId: 1 });
oemParametrConfigsSchema.index({ assetTypeId: 1 });
oemParametrConfigsSchema.index({ parameterId: 1 });
var oemParametrConfigs = mongoose.model("oemParametrConfigs",oemParametrConfigsSchema,'oemParametrConfigs');

module.exports = oemParametrConfigs;

// module.exports = assetData;

