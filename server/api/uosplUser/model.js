const mongoose = require('mongoose');

var usplUserData = mongoose.model("user",{
    first_name: {type:String, required: true},
    last_name  :{type:String, required: true}, 
    company_name  :{type:String, required: true},
    email_id:{type:String, required: true, lowercase: true, unique: true},
    email_id2:{type:String, required: true, lowercase: true},
    phone_number : {type:Number, required: true},
    address : {type:String, required: true},
    company_id : {type:Number,default: 27 },
    verify: {type: Boolean, default: true, required: true},
    administrator: {type: Boolean, default: false, required: true},
    isDelete: {type: Boolean, default: false, required: true},
    password: {type:String},
    registeredOn : {type:Number , default : new Date(new Date()), required: true},
   
},'users');

module.exports = usplUserData;

// module.exports = assetData;

