const OEMCompanyData = require('./model');
const mongoose = require('mongoose');
// const _ = require('lodash')
// var generator = require('generate-password');
// const bcrypt = require('bcryptjs');
// var mail = require('../../utils/mailService');
const {ObjectId} = require('mongodb');
// const bcrypt = require('bcryptjs');

async function insertOEMCompany(req){
    try{
       
        let existCompany = await OEMCompanyData.find({$and: [{emailId : req.body.emailId }]});
        if(existCompany.length){
            return {
                msg : "company already exist"
            }
        }else {
    
        const company = new OEMCompanyData(req.body);
        const insertedCompany = await company.save();     
        return {
            msg: 'Company successfully inserted',
             id: insertedCompany.id
        }
        }
    }catch(error){
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

async function getOEMCompany(req){
    
    
    try{
        // console.log('get subject hitt',req.query);
        const searchText = req.query.search || '';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'registeredOn';
        const order = req.query.order ? Number(req.query.order) : 1;
        const sortObj = { [sort]: order };
        const getAllUsers = await OEMCompanyData.aggregate([  {
            '$match': {
                "companyName": { $regex: searchText, $options: 'i' },
                'companyId': Number(req.query.companyId),
                "isDelete" : false,
                'isOEM' : false
               
            },
        },
         {"$sort" : sortObj },
         {"$project" : {
            address : 1,
            firstName:1,
            lastName:1,
            emailId:1,           
            companyName:1,
            phoneNumber:1,
            registeredOn:1,
            // isOEM:1


         }},
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    },
        ]);  
        // getAllUsers = await getAllUsers.skip(15)
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data : getAllUsers.length > 0 ? getAllUsers[0].data.length > 0 ? getAllUsers[0].data : [] : [],
            total :  getAllUsers.length > 0 ? getAllUsers[0].totalCount.length > 0 ?  getAllUsers[0].totalCount[0].count : 0 : 0
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


// getCompoanyDropdown
async function getCompoanyDropdown(req){
    // console.log('get subject hitt',req);
    try{
        const getAllUsers = await OEMCompanyData.aggregate([  {
            '$match': {
                'companyId': Number(req.query.companyId),
                "isDelete" : false,
                'isOEM' : false
               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
         {"$project" : {
            // address : 1,
            // firstName:1,
            // lastName:1,
            emailId:1,           
            companyName:1,
            // phoneNumber:1,
            // registeredOn:1,
            // isOEM:1


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


// // getUserNotification
// async function getUserById(req){
//     // console.log('get subject hitt',req);
//     try{
//         const getAllUsers = await userData.aggregate([  {
//             '$match': {
//                 _id : ObjectId(req.params.id),
//                 "isDelete" : false,
//                 "administrator" : false
               
//             },
//         },
//         //  {"$sort" :{"registeredOn" : 1}},
//          {"$project" : {
//             address : 1,
//             first_name:1,
//             last_name:1,
//             email_id:1, 
//             // email_id2: 1,           
//             company_name:1,
//             phone_number:1,
//             registeredOn:1,
//             emailNotifications :1,
//             smslNotifications : 1


//          }}
        
//         ]);  
//         // console.log(getAllUsers)      
//         return {
//             msg: 'successfully Find',
//             data: getAllUsers
//         }
//     }catch (error){
//         // console.log('error occure in get lcd Config',error);
//         return Promise.reject('error occure in get lcd Config')
//     }
// }

// // getOEMDeiceByuser
// async function getOEMDeiceByuser(req){
//     // console.log('get subject hitt',req);
//     try{
//         const User = await userData.aggregate([  {
//             '$match': {
//                _id : ObjectId(req.params.id),               
//             },
//         },
//          {"$sort" :{"registeredOn" : 1}},
//         //  {"$project" : {
//         //     // address : 1,
//         //     first_name:1,
//         //     last_name:1,
//         //     email_id:1, 
//         //     // email_id2: 1,           
//         //     // company_name:1,
//         //     // phone_number:1,
//         //     // registeredOn:1
//         //  }},
//          { '$lookup': { 
//             'from': 'companyAssets',
//             'localField': '_id',
//             'foreignField': 'MapCustomer',
//             'as': 'assetDetails' 
//         } },
//         {"$project" : {
//             first_name:1,
//             last_name:1,
//             email_id:1, 
//             "assetDetails._id" : 1,
//             "assetDetails.AssetId" : 1,
//             "assetDetails.AssetName" : 1,
//             "assetDetails.AssetType" : 1,
//             "assetDetails.Gateway" : 1,
//             "assetDetails.InstallationDate":1,
//             "assetDetails.status":1,
//            "assetDetails.ManufacturingId":1
            
            
//          }},
//         ]);  
         
//         return {
//             msg: 'successfully Find',
//             data: User
//         }
//     }catch (error){
//         // console.log('error occure in get lcd Config',error);
//         return Promise.reject('error occure in get lcd Config')
//     }
// }

// // getUosplUserList
// async function getUosplUserList(req){
//     // console.log('get subject hitt',req);
//     try{
//         const getAllUsers = await userData.aggregate([  {
//             '$match': {
//                 'company_id': Number(req.query.companyId),
//                 "isDelete" : false,
//             },
//         },
//          {"$sort" :{"registeredOn" : 1}},
//          {"$project" : {
//             // address : 1,
//             first_name:1,
//             last_name:1,
//             email_id:1, 
//             // email_id2: 1,           
//             company_name:1,
//             // phone_number:1,
//             // registeredOn:1


//          }}
        
//         ]);  
//         // console.log(getAllUsers)      
//         return {
//             msg: 'successfully Find',
//             data: getAllUsers
//         }
//     }catch (error){
//         // console.log('error occure in get lcd Config',error);
//         return Promise.reject('error occure in get lcd Config')
//     }
// }

async function updateOEMCompany(req){
    // console.log('updateSubject hitt');
    try{
        let companyId = req.params.id      
        // let existCompany = await OEMCompanyData.find({$and: [{emailId : req.body.emailId }]});
        // if(existCompany.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedCompany = await OEMCompanyData.findByIdAndUpdate(companyId,{$set:{
                firstName:req.body.firstName,    
                 lastName:req.body.lastName,
                companyName:req.body.companyName,
                phoneNumber:req.body.phoneNumber,
                address:req.body.address}});
            if(updatedCompany!=null){
                return {
                    msg: 'company Updated Successfully ',
                    data: updatedCompany
                }
            }else{
                return {
                    msg : "Company not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

// // putUser
// async function putUser(req){
//     // console.log('updateSubject hitt');
//     try{
//         let userId = req.params.id      
//         // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
//         // if(existDevice.length){
//         //     return {
//         //         msg : "user already exist"
//         //     }
//         // }else { 
//             const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
//                 first_name:req.body.first_name,    
//                  last_name:req.body.last_name,
//                 // company_name:req.body.company_name,
//                 phone_number:req.body.phone_number
//                 // address:req.body.address
//             }});
//             if(updatedDevice!=null){
//                 return {
//                     msg: 'Updated Successfully ',
//                     data: updatedDevice
//                 }
//             }else{
//                 return {
//                     msg : "Lcd Config not exist"
//                 }
//             }
//         // }
//     }catch (error){
//         // console.log('error occure in update Lcd Config',error);
//         return Promise.reject(error)
//     }
// }

// // putUserNotification
// async function putUserNotification(req){
//     // console.log('updateSubject hitt');
//     try{
//         let userId = req.params.id      
//         // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
//         // if(existDevice.length){
//         //     return {
//         //         msg : "user already exist"
//         //     }
//         // }else { 
//             const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
//                 emailNotifications:req.body.emailNotifications,    
//                  smslNotifications:req.body.smslNotifications}});
//             if(updatedDevice!=null){
//                 return {
//                     msg: 'Updated Successfully ',
//                     data: updatedDevice
//                 }
//             }else{
//                 return {
//                     msg : "User not exist"
//                 }
//             }
//         // }
//     }catch (error){
//         // console.log('error occure in update Lcd Config',error);
//         return Promise.reject(error)
//     }
// }


// // putUserChangePassword
// async function putUserChangePassword(req){
//     // console.log('updateSubject hitt');
//     try{
//         let userId = req.params.id      
//         // console.log(req.body)
        
//            const user = await userData.aggregate([  {
//             '$match': {
//                 _id : ObjectId(req.params.id),
//                 "isDelete" : false,
//                 "administrator" : false
               
//             },
//         },
//         //  {"$sort" :{"registeredOn" : 1}},
//         //  {"$project" : {
//         //     address : 1,
//         //     first_name:1,
//         //     last_name:1,
//         //     email_id:1, 
//         //     // email_id2: 1,           
//         //     company_name:1,
//         //     phone_number:1,
//         //     registeredOn:1,
//         //     emailNotifications :1,
//         //     smslNotifications : 1


//         //  }}
        
//         ]);  

//         // console.log(user)
//         let valid = await bcrypt.compare(req.body.oldPassword , user[0].password);
//         // console.log(valid)
//          if (valid && req.body.newPassword === req.body.conformPassword ) {
//         let salt = await bcrypt.genSalt(10);
//         req.body.password = await bcrypt.hash(req.body.newPassword, salt);
//         // console.log(req.body)
//          const updatedUser = await userData.findByIdAndUpdate(userId,{$set:{
//                 password:req.body.password}});
//             if(updatedUser!=null){
//                 return {
//                     msg: 'Updated Successfully ',
//                     data: updatedUser
//                 }
//          }
//         }else{
//                let response = { "success": false }
//             // console.warn('res:', response)
//             return {
//                 msg: 'Invalid  password',
//                 data: response
//             }
//          }
         
      
//     }catch (error){
//         // console.log('error occure in update Lcd Config',error);
//         return Promise.reject(error)
//     }
// }


async function deleteOEMCompany(req){
    // console.log('deleteSubject hitt');
    try{
        let companyId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedCompany = await OEMCompanyData.findByIdAndUpdate(companyId,{$set:{isDelete:true}});
        return {
            msg: 'Deleted successfully '
        }
       
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertOEMCompany,
    updateOEMCompany,
    getOEMCompany,
    deleteOEMCompany,
    getCompoanyDropdown
    // // getUosplUser,
    // // updateUosplUser,
    // // deleteUosplUser,
    // // getUosplUserList,
    // getOEMDeiceByuser,
    // putUserNotification,
    // getUserById,
    // putUserChangePassword,
    // putUser
}



