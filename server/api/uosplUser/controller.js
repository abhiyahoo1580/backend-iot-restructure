const userData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash')
var generator = require('generate-password');
const bcrypt = require('bcryptjs');
var mail = require('../../utils/mailService');
const {ObjectId} = require('mongodb');

async function insertUosplUser(req){
    try{
       
        let existUser = await userData.find({$and: [{email_id : req.body.email_id }]});
        if(existUser.length){
            return {
                msg : "User already exist"
            }
        }else {
           var password = generator.generate({
            length: 10,
            numbers: true
        });
        let salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
        const user = new userData(req.body);
        const insertedUser = await user.save();
        // console.log(insertedUser.length,insertedUser.email_id,password)
        await mail('gmail',
            'notification@elliotsystems.com',
            '',
            insertedUser.email_id,
            'Login Detail ',
            'rfqh lwfy pvxa wbiv',
            `         
           
             Dear  Customer,\n 
             Your login details is following` +`\n` +' user name : ' + insertedUser.email_id + `\n` + ` password : ` + password + `\n`+
                         
             `Assuring you of our best service at all times.
                         
             Warm Regards,
             Customer Service
                         
             *************************************** 
             This is a system generated notification. Replies to this message will not be answered.
             "This e-mail is confidential and may also be privileged. if you are not the intended recipient, please notify us immediately; you should not copy or use it for any purpose, nor disclose its contents to any other person" 
             ***************************************`,
             '',
             '',
             '')
            
        return {
            msg: 'successfully inserted',
             id: insertedUser.id
        }
        }
    }catch(error){
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

async function getUosplUser(req){
    // console.log('get subject hitt',req);
    try{
        const getAllUsers = await userData.aggregate([  {
            '$match': {
                'company_id': Number(req.query.companyId),
                "isDelete" : false,
                "administrator" : false
               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
         {"$project" : {
            address : 1,
            first_name:1,
            last_name:1,
            email_id:1, 
            email_id2: 1,           
            company_name:1,
            phone_number:1,
            registeredOn:1


         }}
        
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllUsers
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}
// getUosplDeiceByuser
async function getUosplDeiceByuser(req){
    // console.log('get subject hitt',req);
    try{
        const User = await userData.aggregate([  {
            '$match': {
               _id : ObjectId(req.params.id),               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        //  {"$project" : {
        //     // address : 1,
        //     first_name:1,
        //     last_name:1,
        //     email_id:1, 
        //     // email_id2: 1,           
        //     // company_name:1,
        //     // phone_number:1,
        //     // registeredOn:1
        //  }},
         { '$lookup': { 
            'from': 'companyAssets',
            'localField': '_id',
            'foreignField': 'MapCustomer',
            'as': 'assetDetails' 
        } },
        {"$project" : {
            first_name:1,
            last_name:1,
            email_id:1, 
            "assetDetails._id" : 1,
            "assetDetails.AssetId" : 1,
            "assetDetails.AssetName" : 1,
            "assetDetails.AssetType" : 1,
            "assetDetails.Gateway" : 1,
            
            
         }},
        ]);  
         
        return {
            msg: 'successfully Find',
            data: User
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}
// getUosplUserList
async function getUosplUserList(req){
    // console.log('get subject hitt',req);
    try{
        const getAllUsers = await userData.aggregate([  {
            '$match': {
                'company_id': Number(req.query.companyId),
                "isDelete" : false,
            },
        },
         {"$sort" :{"registeredOn" : 1}},
         {"$project" : {
            // address : 1,
            first_name:1,
            last_name:1,
            email_id:1, 
            // email_id2: 1,           
            company_name:1,
            // phone_number:1,
            // registeredOn:1


         }}
        
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllUsers
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}
async function updateUosplUser(req){
    // console.log('updateSubject hitt');
    try{
        let userId = req.params.id      
        // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
        // if(existDevice.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
                first_name:req.body.first_name,    
                 last_name:req.body.last_name,
                company_name:req.body.company_name,
                email_id2:req.body.email_id2,
                phone_number:req.body.phone_number,
                address:req.body.address}});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "Lcd Config not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteUosplUser(req){
    // console.log('deleteSubject hitt');
    try{
        let userId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedUser = await userData.findByIdAndUpdate(userId,{$set:{isDelete:true}});
        return {
            msg: 'Deleted successfully '
        }
       
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertUosplUser,
    getUosplUser,
    updateUosplUser,
    deleteUosplUser,
    getUosplUserList,
    getUosplDeiceByuser
}



