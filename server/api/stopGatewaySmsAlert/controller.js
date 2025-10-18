const stopGatewayData = require('./model');
const mongoose = require('mongoose');

async function insertStopGatewayAlert(req){
    // console.log("insertRawData hitt");
    try{
        const stopGatewayDataData = new stopGatewayData(req.body);
        let existRawData = await stopGatewayData.find({$and: [{rawDataName : req.body.rawDataName, isDeleted: false }]});
        if(existRawData.length){
            return {
                msg : "RawData already exist"
            }
        }else {
            const insertedRawData = await stopGatewayDataData.save();
            return {
                msg: 'successfully inserted',
                id: insertedRawData.id
            }
        }
    }catch(error){
        console.log("error in insertRawData",error);
        return Promise.reject('error occured in insertEmployee method');
    }
}

// async function getRawData(req){
//     // console.log('get RawData hitt',req);
//     try{
//         const getAllRawData = req.params.id? await rawDataData.find({$and:[{_id:req.params.id},{isDeleted: false}]}): await rawDataData.find({isDeleted: false});
//         return {
//             msg: 'successfully Find',
//             data: getAllRawData
//         }
//     }catch (error){
//         console.log('error occure in get RawData',error);
//         return Promise.reject('error occure in get RawData')
//     }
// }

// async function updateRawData(req){
//     // console.log('updateRawData hitt');
//     try{
//         let rawDataId = req.params.id
//         // console.log("Update RawDataId",RawDataId);
//         const updatedRawData = await rawDataData.findByIdAndUpdate(rawDataId,{$set:{rawDataName:req.body.rawDataName}});
//         if(updateRawData!=null){
//             return {
//                 msg: 'Updated Successfully ',
//                 data: updatedRawData
//             }
//         }else{
//             return {
//                 msg : "RawData not exist"
//             }
//         }
//     }catch (error){
//         console.log('error occure in updateRawData',error);
//         return Promise.reject('error occure in updateRawData')
//     }
// }

// async function deleteRawData(req){
//     // console.log('deleteRawData hitt');
//     try{
//         let rawDataId = req.params.id
//         // console.log("RawDataId",RawDataId);
//         const deletedRawData = await rawDataData.findByIdAndUpdate(rawDataId,{$set:{isDeleted:true}});
//         return {
//             msg: 'Deleted successfully '
//         }
//     }catch (error){
//         console.log('error occure in deleteRawData',error);
//         return Promise.reject('error occure in deleteRawData')
//     }
// }

module.exports = {
    insertStopGatewayAlert,
    // getRawData,
    // updateRawData,
    // deleteRawData
}