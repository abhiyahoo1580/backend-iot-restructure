const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var usplUserData = mongoose.model("oemuser",{
    first_name: {type:String, required: true},
    last_name  :{type:String, required: true}, 
    // company_name  :{type:String, required: true},
    email_id:{type:String, required: true, lowercase: true, unique: true},
    // email_id2:{type:String, required: true},
    phone_number : {type:Number, required: true},
    dial_code : {type:Number, required: true , default : 91},
    address : {type:String, required: true},
    company_id : {type:Number , required: true },
    verify: {type: Boolean, default: true, required: true},
    administrator: {type: Boolean, default: false, required: true},
    isDelete: {type: Boolean, default: false, required: true},
    password: {type:String, required: false},
    passwordSetupToken: {type:String, default: null},
    passwordSetupExpires: {type:Date, default: null},
    isPasswordSet: {type: Boolean, default: false, required: true},
    registeredOn : {type:Number , default : new Date(new Date()), required: true},
    emailNotifications :{type:Boolean,default: false, required: true},
    smslNotifications : {type:Boolean,default: false,  required: true},
    MapCompanyId :{type: Schema.Types.ObjectId , default: null},
   
},'users');

module.exports = usplUserData;

// module.exports = assetData;

