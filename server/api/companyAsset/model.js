const mongoose = require('mongoose');
const { Schema } = mongoose;
const assetSchema = new Schema({    
    AssetId: {type:String},
    AssetName  :{type:String},    
    UnitRate : {type:Number,default: 0} ,
    KvaRate : {type:Number ,default: 0} ,
    kwRate : {type:Number,default: 0} ,
    SlaveId : {type:Number} ,
    Description  :{type:String},
    InstallationDate : {type:Number} ,
    CompanyId : {type:Number} ,
    Gateway:{type:String},
    AssetTypeId : {type:Number} ,
    ParentId : {type:String},
    IPAddress : {type:String},
    DeviceTypeId : {type:Number} ,
    status : {type: Boolean, default: false}
})
assetSchema.index({ CompanyId: 1 });
assetSchema.index({ AssetId: 1 });
assetSchema.index({ AssetTypeId: 1 });
assetSchema.index({ DeviceTypeId: 1 });
assetSchema.index({ Gateway: 1, SlaveId: 1 }, { unique: true });

var assetData = mongoose.model("companyasset1",assetSchema,'companyAssets');

module.exports = assetData;

// module.exports = assetData;