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
            // console.log(req.query)
            const searchText = req.query.search || '';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const skip = (page - 1) * limit;
            const order = req.query.order ? Number(req.query.order) : -1;
            const sort = req.query.sort || 'installationDate';
            const sortObj = { [sort]: order };
            const type = req.query.type ? req.query.type : "";
            const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
            const toDate = req.query.toDate ? Number(req.query.toDate) : "";
            const assetTypeId = req.query.assetTypeId ? Number(req.query.assetTypeId) : ""
            // const type = req.query.type ? req.query.type : "";
   query =  {
            '$match': {
                'CompanyId': Number(req.query.companyId),
                "AssetName": { $regex: searchText, $options: 'i' },
            },
        }
        if(fromDate && toDate){
            query.$match.InstallationDate =   { '$gte': fromDate, '$lte': toDate }
        }    
        if (type == "map" || type == "unmap") {
             query.$match.MapCustomer =  type =="unmap" ? { $eq: null } : { $not: { $eq: undefined } }
        }
        if(assetTypeId) {
            query.$match.AssetTypeId = assetTypeId
        }
        const getAllDevice = await deviceData.aggregate([ 
        query,
         {"$sort" :sortObj},
            { '$lookup': { 
            'from': 'users',
            'localField': 'MapCustomer',
            'foreignField': '_id',
            'as': 'userDetails' 
        } },
             { '$lookup': { 
            'from': 'companies',
            'localField': 'userDetails.MapCompanyId',
            'foreignField': '_id',
            'as': 'companyDetails' 
        } },
        { '$lookup': { 
            'from': 'assetTypes',
            'localField': 'AssetTypeId',
            'foreignField': 'AssetTypeId',
            'as': 'assetTypeDetail' 
        } },
        {$project : {
            "AssetId" : 1,
            "AssetName" : 1,
            // "AssetTypeId" : 1,
            "ManufacturingId":1,  
            "Gateway" : 1,
            'Description' : 1,
            'InstallationDate' : 1,
            'reNewDate' : 1,
            'status' : 1,
            'MapCustomer' : 1,      
            'MapDate' : 1,
            // "userDetails._id" : 1,
            "userDetails.first_name" : 1,   
            "userDetails.last_name" : 1,
            "assetTypeDetail.AssetTypeId" : 1,   
            "assetTypeDetail.Name" : 1,
            // "userDetails.email_id" : 1,     
            // "companyDetails._id" : 1,
            "companyDetails.companyName" : 1, 
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
                }
        ]);    
        // console.log("getAllDevice",getAllDevice);    
        return {
            msg: 'successfully Find',
            // data: getAllDevice
            data: getAllDevice.length > 0 ? getAllDevice[0].data.length ? getAllDevice[0].data : []:[],
            total: getAllDevice.length > 0 ? getAllDevice[0].totalCount.length > 0 ? getAllDevice[0].totalCount[0].count : 0 : 0
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


async function getDeviceMapped(req){
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

// getForDropDown
async function getForDropDown(req){

    try{
        const getAllDevice = await deviceData.aggregate([ 
            
            {
                '$match': {
                    'CompanyId':   Number(req.query.companyId),
                    'Gateway' :  null ,                    
                  },
                },
             {"$sort" :{"InstallationDate" : 1}},
             {$project : {
            "AssetId" : 1,
            "AssetName" : 1,
            "Topic" : 1            
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
async function getDeviceUnMapped(req){

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

async function updateDevice(req){
    // console.log('updateSubject hitt');
    try{
        let deviceId = req.params.id      
        let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId, _id: {$ne: ObjectId(deviceId)}}]});
        if(existDevice.length){
            return {
                msg : "side bar already exist"
            }
        }else { 
            const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{Gateway:req.body.Gateway,     AssetType:req.body.AssetType,
                AssetId:req.body.AssetId,
                AssetName:req.body.AssetName,
                Gateway : req.body.Gateway,
                AssetTypeId:req.body.AssetTypeId,
                Description:req.body.Description,
                MapCustomer:req.body.MapCustomer != null ? ObjectId(req.body.MapCustomer) : null,    
                MapDate:req.body.MapDate != null ? req.body.MapDate : null,
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

// putDeciceGateway
async function putDeciceGateway(req){
    // console.log('updateSubject hitt');
    try{
        let deviceId = req.params.id        
            const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{
                Gateway: req.body.Gateway,    
                //  MapDate:req.body.MapDate,
                }});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "device not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

// async function deleteUosplDeviceMapping(req){
//     // console.log('updateSubject hitt');
//     try{
//         let deviceId = req.params.id  
//             const updatedDevice = await deviceData.findByIdAndUpdate(deviceId,{$set:{
//                 MapCustomer:null,    
//                  MapDate:null,
//                 }});
//             if(updatedDevice!=null){
//                 return {
//                     msg: 'Updated Successfully ',
//                     data: updatedDevice
//                 }
//             }else{
//                 return {
//                     msg : "Device not exist"
//                 }
//             }
//         // }
//     }catch (error){
//         // console.log('error occure in update Lcd Config',error);
//         return Promise.reject(error)
//     }
// }

async function deleteDevice(req){
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
    updateDevice,
    deleteDevice,
    putDeciceGateway,
    getForDropDown,
    // deleteUosplDeviceMapping,
    getDeviceMapped,
    getDeviceUnMapped,
    getByGatewayId
    
}



