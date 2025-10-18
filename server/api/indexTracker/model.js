const mongoose = require('mongoose');

var IndexTrackerData = mongoose.model("indextracker",{
    CollectionName  :{type:String},    
    Index  :{type:Number}
    
    // isDeleted    :{type: Boolean, default: false}
});

module.exports = IndexTrackerData;