const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    company_id  : {type:Number , required: true},
    email_id: {type:String , required: true},
    first_name  :{type:String , required: true},
    last_name  :{type:String , required: true},
    password : {type:String , required: true},
    registration_time : {type:Number , required: true ,default : new Date(new Date()) },
    administrator:{type:Boolean , required: true},
    phone_number  :{type:Number , required: true},
    isDelete  :{type:Boolean, required: true,default : false},
    address  :{type:String },
    verify: {type:Boolean, required: true,default : false},
    subscription: {
        email: {
          alert: {type:Boolean , required: true,default : false},
          info: {type:Boolean , required: true,default : false},
          warning: {type:Boolean , required: true,default : false}
        },
        sms: {
          alert: {type:Boolean , required: true,default : false},
          info: {type:Boolean , required: true,default : false},
          warning: {type:Boolean , required: true,default : false}
        },
        report: {
          daily: {type:Boolean , required: true,default : false},
          monthly: {type:Boolean , required: true,default : false}
        }
      },

});
userSchema.index({ company_id: 1 });
userSchema.index({ email_id: 1 });
userSchema.index({ first_name: 1 });  

var registerUserData = mongoose.model("registerUser", userSchema, 'users');
module.exports = registerUserData;
