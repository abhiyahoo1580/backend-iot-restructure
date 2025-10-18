const loginData = require('./model');
const registerUserData = require('./model')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../../config')
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("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");

// async function login(req) {
//     // console.log("login hitt");
//     try {
//         const user = new loginData(req.body);
//         let userData = await loginData.find({$and: [{email_id: req.body.email_id,isDelete : false}]});
//         // let valid = await bcrypt.compare(req.body.password, userData[0]._doc.password);
//         if(userData){
//             const payload = {
//                 emailId: userData[0]._doc.email_id,
//                 companyId: userData[0]._doc.company_id
//             }
//             let response = {
//                 "success": true,
//                 "firstName": userData[0]._doc.first_name,
//                 "lastName": userData[0]._doc.last_name,
//                 "administrator": userData[0]._doc.administrator,
//                 "token": jwt.sign(
//                     payload,
//                     config.SECRET,
//                     { expiresIn: "1h" }
//                 )
//             }
//             return {
//                 msg: 'successfully login',
//                 data: response
//             }
//         } else {
//             return {
//                 msg: 'Invalid  password',
//             }
//         }
//         // }
//     } catch (error) {
//         // console.log("error in login",error);
//         return Promise.reject('error occured in login ');
//     }
// }

async function login(req) {
    // console.log("login hitt");
    try {
        const user = await loginData.findOne({ $and: [{ email_id: req.body.email_id.toLowerCase(), isDelete: false, verify: true }] }).lean();

        if (!user || !user.password) {
            return {
                msg: 'User does not exist',
                data: { success: false }
            }
        }

        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return {
                msg: 'Invalid  password',
                data: { success: false }
            }
        }

        const company = await mongoose.models.companie.findOne({ CompanyId: user.company_id }).lean();
        const payload = {
            emailId: user.email_id,
            companyId: user.company_id
        }
        let response = {
            "success": true,
            "firstName": user.first_name,
            "userId": user._id,
            "companyId": user.company_id,
            "companyName": company ? company.CompanyName : undefined,
            "companyAddress": company ? company.CompanyAddress : undefined,
            "lastName": user.last_name,
            "administrator": user.administrator,
            "defaultDeviceType": user.default_device_type ? user.default_device_type : 1,
            "token": jwt.sign(payload, config.SECRET, { expiresIn: 43200 })
        }
        return {
            msg: 'successfully login',
            data: response
        }
    } catch (error) {
        console.log("error in login", error);
        return Promise.reject('error occured in login ');
    }
}

// postOAuth
async function postOAuth(req) {
    // console.log("login hitt");
    try {

        let key =  req.body.clientId
        const token = req.body.credential; // Get from frontend after login
        // const decoded = jwt.decode(token);
            // Verify the token
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: key, // Make sure it matches your client ID
      });
  
      // Extract user details
      const decoded = ticket.getPayload();
    //   console.log("User Info:", decoded);


        // console.log(decoded)
        const user = await loginData.findOne({ $and: [{ email_id: decoded.email , isDelete: false, verify: true }] }).lean();

        if (!user) {
            return {
                msg: 'User does not exist',
                data: { success: false }
            }
        }
        if (!decoded.email_verified) {
            return {
                msg: 'Email not verified',
                data: { success: false }
            }
        }

        const company = await mongoose.models.companie.findOne({ CompanyId: user.company_id }).lean();
        const payload = {
            emailId: user.email_id,
            companyId: user.company_id
        }
        let response = {
            "success": true,
            "firstName": user.first_name,
            "userId": user._id,
            "companyId": user.company_id,
            "companyName": company ? company.CompanyName : undefined,
            "companyAddress": company ? company.CompanyAddress : undefined,
            "lastName": user.last_name,
            "administrator": user.administrator,
            "defaultDeviceType" : user.default_device_type ? user.default_device_type : 1,
            "token": jwt.sign(payload, config.SECRET, { expiresIn: 43200 })
        }
        return {
            msg: 'successfully login',
            data: response
        }

        // }
    } catch (error) {
        // console.log("error in login", error);
        return Promise.reject('error occured in login ');
    }
}

// async function insertUser(req){
//     // console.log("insertsubject hitt");
//     try{
//         const user = new registerUserData(req.body);

//         let existuser = await registerUserData.find({$and: [{company_id : req.body.company_id, email_id:req.body.email_id, phone_number:req.body.phone_number}]});
//         if(existuser.length){
//             return {
//                 msg : "user already exist"
//             }
//         }else {
//             const insertedUser = await user.save();
//             return {
//                 msg: 'successfully inserted',
//                 id: insertedUser.id
//             }
//         }
//     }catch(error){
//         console.log("error in insert user",error);
//         return Promise.reject('error occured in insert user method');
//     }
// }

// async function getUser(req){
//     console.log('get user hitt',req);
//     try{
//         const getUser = await registerUserData.find({company_id:req.query.company_id});
//         return {
//             msg: 'successfully Find',
//             data: getUser
//         }
//     }catch (error){
//         console.log('error occure in get user',error);
//         return Promise.reject(error);
//     }
// }


// async function updateUser(req){
//     // console.log('updateUser hitt');
//     try{
//         let UserId = req.params.id
//         // console.log("Update UserId", UserId);
//         const updatedUser = await registerUserData.findByIdAndUpdate(UserId, {$set:{first_name:req.body.first_name,last_name:req.body.last_name, phone_number:req.body.phone_number, administrator:req.body.administrator}});
//         if(updatedUser!=null){
//             return {
//                 msg: 'Updated Successfully ',
//                 data: updatedUser
//             }
//         }else{
//             return {
//                 msg : "User not exist"
//             }
//         }
//     }catch (error){
//         console.log('error occure in update user',error);
//         return Promise.reject('error occure in update user')
//     }
// }


module.exports = {
    login,
    postOAuth
    // insertUser,
    // getUser,
    // updateUser
}