const mongoose = require('mongoose');

var loginData = mongoose.model("User",{
    email_id  : {type:String , required: true, lowercase: true, unique: true},
    // password  :{type:String , required: true},
   

}, 'users');

// var registerUserData = mongoose.model("registerUser", {
//     company_id  : {type:Number , required: true},
//     first_name  :{type:String , required: true},
//     last_name  :{type:String , required: true},
//     phone_number  :{type:String , required: true},
//     isDelete  :{type:Boolean, required: true},
//     address  :{type:String , required: true},
//     email_id: {type:String , required: true},
//     administrator:{type:Boolean , required: true}

// }, 'users');


module.exports = loginData;
// module.exports = registerUserData;