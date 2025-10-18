const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var deviceData = mongoose.model("companyassetoem",{
    AssetId: {type:String,required:true},
    AssetName  :{type:String,required:true}, 
    Description  :{type:String},
    Gateway:{type:String, default: null},
    AssetType : {type:String} ,
    AssetTypeId : {type:Number,required:true},
    ManufacturingId: {type:String,required:true},
    CompanyId : {type:Number, required:true},
    SlaveId: {type:Number,required:true,default: 1},
    InstallationDate : {type:Number , default : new Date(new Date())},
    reNewDate : {type:Number ,default : new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
    status : {type: Boolean, default: false},
    MapCustomer :{type: Schema.Types.ObjectId , default: null},
    MapDate: {type:Number, default: null },
    Topic : {type:String, default: null },
   
},'companyAssets');

module.exports = deviceData;

// module.exports = assetData;