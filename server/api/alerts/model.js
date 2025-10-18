const mongoose = require('mongoose');
const { Schema } = mongoose;
const alertsDataSchema = new Schema({
    CompanyId: { type: Number },
    Asset_Id: { type: String},
    Time: { type: Number },
    Read: { type: Boolean, default: false },
    Archive: { type: Boolean, default: false}
})
alertsDataSchema.index({ CompanyId: 1 });
alertsDataSchema.index({ Asset_Id: 1 });
alertsDataSchema.index({ Time: 1 });
var alertsData = mongoose.model('alerts',alertsDataSchema ,"alerts")

module.exports = alertsData;