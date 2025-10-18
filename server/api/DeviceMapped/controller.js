const deviceMappedData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');




async function insertDeiceMapped(req){
    try{
        const DeviceMapped = new deviceMappedData(req.body);     
         let existdeviceMapped = await deviceMappedData.find({$and: [{CompanyId : req.body.CompanyId, UserId : req.body.UserId }]});
         if(existdeviceMapped.length){
            return {
                msg : "Device Mapped already exist"
            }
        }else {
            const insertedDeviceMapped = await DeviceMapped.save();
            return {
                msg: 'Device Mapped successfully inserted',
                id: insertedDeviceMapped.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getDeiceMapped(req){
    try{
        // req.query.companyId ? 
        const getAllDeiceMapped = await deviceMappedData.aggregate([
            {
                $match: {
                    'CompanyId': Number(req.query.companyId ),                 
                }
            },
            {
                $lookup: {
                  from: "companyAssets",
                  localField: "AssetIds",
                  foreignField: "AssetId",
                  as: "AssetDetails"
                }
              },
              {
                $lookup: {
                  from: "users",
                  localField: "UserId",
                  foreignField: "email_id",
                  as: "userDetails"
                }
              },
              {
                $project: {
                    "AssetDetails.AssetId" : 1,
                    "AssetDetails.AssetName" : 1,
                    "firstName" : "$userDetails.first_name",
                    "lastName" : "$userDetails.last_name",
                    UserId : 1
                }
              },
              {$unwind : "$firstName"},
              {$unwind : "$lastName"}
        ])
        return {
            msg: 'successfully Find',
            data: getAllDeiceMapped
        }
    }catch (error){
        console.log('error occure in get Deice Mapped',error);
        return Promise.reject('error occure in get Deice Mapped')
    }
}

async function updateDeiceMapped(req){
    try{
        // const graphGroup = new graphGroupData(req.body);
        let deiceMappedId = req.params.id
        // let existgraphGroup = await graphGroupData.find({$and: [{AssetId : req.body.AssetId, Name : req.body.Name }]});
        // if(existgraphGroup.length){
        //     return {
        //         msg : "group Name already exist"
        //     }
        // }else {
        const updatedDeviceMapped = await deviceMappedData.findByIdAndUpdate(deiceMappedId,{$set:{AssetIds:req.body.AssetIds}});
        if(updatedDeviceMapped!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedDeviceMapped
            }
        // }else{
        //     return {
        //         msg : "graph group not exist"
        //     }
        // }
    }
    }catch (error){
        console.log('error occure in updatedDeviceMapped',error);
        return Promise.reject('error occure in updatedDeviceMapped')
    }
}

async function deleteDeviceMapped(req){
    try{
        const deviceMappedId = req.params.id
        // console.log("graphGroupId",graphGroupId);
        const deletedgDeviceMapped = await deviceMappedData.findByIdAndDelete(deviceMappedId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteDeviceMapped',error);
        return Promise.reject('error occure in deleteDeviceMapped')
    }
}

module.exports = {
    insertDeiceMapped,
    getDeiceMapped,
    updateDeiceMapped,
    deleteDeviceMapped
}

