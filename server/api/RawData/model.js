const mongoose = require('mongoose');

var subjectData = mongoose.model("rawData",{
    Id  :{type:String},
    data    :{type: Object}
},'MmaRaw72022');

module.exports = subjectData;