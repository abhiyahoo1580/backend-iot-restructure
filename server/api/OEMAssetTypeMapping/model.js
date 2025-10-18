const mongoose = require('mongoose');
const { Schema } = mongoose;
const oemMappedAssetTypeSchema = new Schema({
    companyId : {type:Number , required: true },
    registeredOn : {type:Number , default : new Date(new Date()), required: true},
     assetTypeId : {type:Number , required: true },

},{ timestamps: true })
oemMappedAssetTypeSchema.index({ companyId: 1 });
oemMappedAssetTypeSchema.index({ companyId: 1 ,assetTypeId: 1}, { unique: true });
var oemMappedAssetType = mongoose.model("oemAssetTypeMap",oemMappedAssetTypeSchema,'oemAssetTypeMap');

module.exports = oemMappedAssetType;

// module.exports = assetData;

