const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    AssetId: {type:String},
    AssetName  :{type:String}, 
    Description  :{type:String},
    Gateway:{type:String},
    AssetType : {type:String} ,
    AssetTypeId : {type:Number,default: 65} ,
    ManufacturingId: {type:String},
    CompanyId : {type:Number,default: 27 } ,
    InstallationDate : {type:Number , default : new Date(new Date())},
    reNewDate : {type:Number ,default : new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
    status : {type: Boolean, default: false},
    MapCustomer :{type: Schema.Types.ObjectId , default: null},
    MapDate: {type:Number, default: null },
});
deviceSchema.index({ AssetId: 1 });
deviceSchema.index({ CompanyId: 1 });
deviceSchema.index({ MapCustomer: 1 });
var deviceData = mongoose.model("companyasset11",deviceSchema,'companyAssets');

module.exports = deviceData;

// module.exports = assetData;