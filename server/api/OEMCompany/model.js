const mongoose = require('mongoose');
const { Schema } = mongoose;
const usplUserDataSchema = new Schema({
    firstName: {type:String, required: true},
    lastName  :{type:String, required: true}, 
    companyName  :{type:String, required: true},
    emailId:{type:String, required: true},
    // email_id2:{type:String, required: true},
    phoneNumber : {type:Number, required: true},
    address : {type:String, required: true},
    companyId : {type:Number , required: true },
    isDelete: {type: Boolean, default: false, required: true},
    isOEM: {type: Boolean, default: false, required: true},
    registeredOn : {type:Number , default : new Date(new Date()), required: true}

});
usplUserDataSchema.index({ companyId: 1 });
usplUserDataSchema.index({ companyId: 1 ,emailId: 1}, { unique: true });
var usplUserData = mongoose.model("companieOEM",usplUserDataSchema,'companies');

module.exports = usplUserData;

// module.exports = assetData;

