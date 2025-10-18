const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

var subjectData = mongoose.model("stopGateway",{
    assetId  :{type:String},
      msg  :{type: String},
      stopDate : {type :  Number}
},'stopGatewaySmsAlertsTest');

module.exports = subjectData;