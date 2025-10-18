const registerUserData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const BCRYPT = require('bcryptjs');


async function insertUser(req){
    const registerUser = new registerUserData(req.body);  
   
    let existUser = await registerUserData.find({$and: [{email_id : req.body.email_id }]});
        if(existUser.length){
            return {
                msg : "user already exist"
            }
        }else {
           // console.log(sideBar)
           let salt = await BCRYPT.genSalt(10);
           registerUser.password =  await BCRYPT.hash(registerUser.password, salt)
            const insertedUser = await registerUser.save();
            return {
                msg: 'successfully inserted',
                id: insertedUser.id
            }
        }
}

async function updateUser(req){
    try{
        const registerUser = new registerUserData(req.body);   
        let userId = req.params.id
        // let salt = await BCRYPT.genSalt(10);  
        // registerUser.hasOwnProperty('password')  ?  registerUser.password =  await BCRYPT.hash(registerUser.password, salt)  : ''; 
        let updatedUser = await registerUserData.updateOne({ "_id": userId },
        {
            $set: {
                "first_name": registerUser.first_name,
                "last_name": registerUser.last_name,
                "administrator": registerUser.administrator,
                "phone_number": registerUser.phone_number,
                "address": registerUser.address,
                "subscription.email.alert": registerUser.subscription.email.alert,
                "subscription.email.info": registerUser.subscription.email.info,
                "subscription.email.warning": registerUser.subscription.email.warning,
                "subscription.sms.alert": registerUser.subscription.sms.alert,
                "subscription.sms.info": registerUser.subscription.sms.info,
                "subscription.sms.warning": registerUser.subscription.sms.warning,
                "subscription.report.daily": registerUser.subscription.report.daily,
                "subscription.report.monthly": registerUser.subscription.report.monthly


            }
        })       
            return {
                msg: 'user successfully updateded' ,
                id: updatedUser.id
            }
        // }
    }catch(error){
        console.log(error)
        return Promise.reject(error);
    }
}

async function getUsersList(req){
    try{
        const getUsersLists =  await registerUserData.aggregate([
            {
                '$match': {
                    'company_id': Number(req.query.companyId),
                    isDelete : false
                    // 'Gateway': { $not: { $eq: null } }
                }
            },
            {
             '$project' : {
                'userId' : '$email_id',
                'firstName' : "$first_name",
                'lastName' : "$last_name",
                "subscription" : "$subscription",
                "administrator" : "$administrator",
                "phoneNumber" : "$phone_number"
                
             }
            }
        ])
        return {
            msg: 'successfully Find',
            data: getUsersLists
        }
    }catch (error){
        console.log('error occure in get Deice Mapped',error);
        return Promise.reject('error occure in get Deice Mapped')
    }
}



async function deleteUser(req){
    try{
        const deviceUserId = req.params.id
        const deletedUser = await registerUserData.findByIdAndUpdate(deviceUserId,{$set:{isDelete:true}});
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteDeviceMapped',error);
        return Promise.reject('error occure in deleteDeviceMapped')
    }
}

module.exports = {
    insertUser,
    getUsersList,
    updateUser,
    deleteUser
}

