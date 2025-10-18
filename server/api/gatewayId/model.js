const mongoose = require('mongoose');
const GatewayInfoSchema = new mongoose.Schema({    
    AssetId: {type:String, required:true},    
    CompanyId : {type:Number, required:true}, 

});
// GatewayInfoSchema.index({ CompanyId: 1 });
// GatewayInfoSchema.index({ AssetId: 1 }, { unique: true });
GatewayInfoSchema.index({ Gateway: 1, SlaveId: 1 }, { unique: true });

var GatewayInfo = mongoose.model("gatewayId",GatewayInfoSchema,'companyAssets');

module.exports = GatewayInfo;

