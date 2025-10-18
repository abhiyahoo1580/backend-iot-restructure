const deviceData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash')
const {ObjectId} = require('mongodb');

async function insertUosplDevice(req){
    try{
        const device = new deviceData(req.body);
        let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
        if(existDevice.length){
            return {
                msg : "Device already exist"
            }
        }else {
           // console.log(sideBar)
            const insertedDevice = await device.save();
            return {
                msg: 'successfully inserted',
                id: insertedDevice.id
            }
        }
    }catch(error){
        // console.log("error in insert side bar",error);
        return Promise.reject(error);
    }
}

async function getUosplDevice(req){
    // console.log('get subject hitt',req);
    try{
        if(req.params.id){
            const getAllDevice = await deviceData.aggregate([  {
                '$match': {
                    '_id': ObjectId(req.params.id),
                   
                },
            },
             {"$sort" :{"InstallationDate" : 1}}
            
            ]);        
            return {
                msg: 'successfully Find',
                data: getAllDevice
            }
        }else{
        const getAllDevice = await deviceData.aggregate([  {
            '$match': {
                'CompanyId': Number(req.query.companyId),
               
            },
        },
         {"$sort" :{"InstallationDate" : 1}}
        
        ]);        
        return {
            msg: 'successfully Find',
            data: getAllDevice
        }
    }
    
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}
// getByGatewayId
async function getByGatewayId(req){
    // console.log('get subject hitt',req);
    try{
        // if(req.params.id){
            const getDevice = await deviceData.aggregate([  {
                '$match': {
                    'Gateway':  req.params.id,
                   
                },
            },
             {"$sort" :{"InstallationDate" : 1}}
            
            ]);        
            return {
                msg: 'successfully Find',
                data: getDevice
            }
        // }    
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function getUosplDeviceMapped(req){
    // console.log('get subject hitt',req);
    try{
        const getAllDevice = await deviceData.aggregate([ 
            
            {
                '$match': {
                    'CompanyId':   Number(req.query.companyId),
                    'MapCustomer' :{ $not: { $eq: undefined } }  ,
                                      
                  },
                },
                { '$lookup': { 'from': 'users',
                     'localField': 'MapCustomer',
                      'foreignField': '_id',
                       'as': 'cunstomerDetails' } },
         {"$sort" :{"InstallationDate" : 1}},
         {$project : {
            "AssetId" : 1,
            "AssetName" : 1,
            "AssetType" : 1,
            "ManufacturingId":1,          
            "Gateway" : 1,
            'Description' : 1,
            'MapDate'  : 1,
            "cunstomerDetails._id" : 1,
            "cunstomerDetails.first_name" : 1,
            "cunstomerDetails.last_name" : 1,
            "cunstomerDetails.email_id" : 1,
            
         }}
        
        ]);        
        return {
            msg: 'successfully Find',
            data: getAllDevice
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get map device')
    }
}
// getUosplDeviceUnMapped
async function getUosplDeviceUnMapped(req){

    try{
        const getAllDevice = await deviceData.aggregate([ 
            
            {
                '$match': {
                    'CompanyId':   Number(req.query.companyId),
                    'MapCustomer' :  null ,
                //     $or : [
                //     { MapCustomer : { $eq : null} },
                //        { MapCustomer : { $not: { $eq: undefined } }  }
                //     ]
                                      
                  },
                },
             {"$sort" :{"InstallationDate" : 1}},
             {$project : {
            "AssetId" : 1,
            "AssetName" : 1,
            // "AssetType" : 1,
            // "ManufacturingId":1,          
            "Gateway" : 1,
            // "cunstomerDetails._id" : 1,
            // "cunstomerDetails.first_name" : 1,
            // "cunstomerDetails.last_name" : 1,
            // "cunstomerDetails.email_id" : 1,
            
         }}
        
        ]);        
        return {
            msg: 'successfully Find',
            data: getAllDevice
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get map device')
    }
}
async function updateUosplDevice(req){
    // console.log('updateSubject hitt');
    try{
        let deviceId = req.params.id      
        let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId, AssetName : req.body.AssetName ,ManufacturingId:req.body.ManufacturingId}]});
        if(existDevice.length){
            return {
                msg : "side bar already exist"
            }
        }else { 
            const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{Gateway:req.body.Gateway,     AssetType:req.body.AssetType,
                AssetId:req.body.AssetId,
                AssetName:req.body.AssetName,
                Description:req.body.Description,
                ManufacturingId:req.body.ManufacturingId}});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "Device not exist"
                }
            }
        }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

// updateUosplDeviceMapping
async function updateUosplDeviceMapping(req){
    // console.log('updateSubject hitt');
    try{
        let deviceId = req.params.id        
            const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{
                MapCustomer: ObjectId(req.body.MapCustomer),    
                 MapDate:req.body.MapDate,
                }});
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

async function deleteUosplDeviceMapping(req){
    // console.log('updateSubject hitt');
    try{
        let deviceId = req.params.id  
            const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{
                MapCustomer:null,    
                 MapDate:null,
                }});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "Device not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteUosplDevice(req){
    // console.log('deleteSubject hitt');
    try{
        let deviceId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedDevice = await deviceData.findByIdAndDelete(deviceId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertUosplDevice,
    getUosplDevice,
    updateUosplDevice,
    deleteUosplDevice,
    updateUosplDeviceMapping,
    deleteUosplDeviceMapping,
    getUosplDeviceMapped,
    getUosplDeviceUnMapped,
    getByGatewayId
    
}



