const mongoose = require('mongoose');

var MSENReadingData = mongoose.model("msebreading",{
    MSCBReading  :{type:Number},
    date  :{type:Number},
    companyId : {type:Number}

    // isDeleted    :{type: Boolean, default: false}
});

module.exports = MSENReadingData;