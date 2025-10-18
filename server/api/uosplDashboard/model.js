const mongoose = require('mongoose');

var uosplAlertsData = mongoose.model("dashboard",{
    AssetId : {type: String, required: true},
    CompanyId  :{type:Number, required: true}   
},'dashboard');

module.exports = uosplAlertsData;

// module.exports = assetData;
