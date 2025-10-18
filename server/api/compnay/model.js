const mongoose = require('mongoose');

var companyData = mongoose.model("companie",{
    CompanyId  :{type:Number},
    CompanyName    :{type: String},
    CompanyAddress    :{type: String},
    AdvancedAnalytics    :{type: Boolean},
    GroupAnalytics    :{type: Boolean}
});

module.exports = companyData;