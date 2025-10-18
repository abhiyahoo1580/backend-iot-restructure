const lcdData = require('./model');
const mongoose = require('mongoose');

async function insertLcdConfig(req){
    // console.log("insertsubject hitt");
    try{
        const lcd = new lcdData(req.body);
        // console.log("lcd",lcd)
        let existLcdConfig = await lcdData.find({$and: [{CompanyId : req.body.CompanyId, DeviceTypeId : req.body.DeviceTypeId,ParameterId : req.body.ParameterId }]});
        if(existLcdConfig.length){
            return {
                msg : "lcd already exist"
            }
        }else {
            const insertedlcdConfig = await lcd.save();
            return {
                msg: 'successfully inserted',
                id: insertedlcdConfig.id
            }
        }
    }catch(error){
        console.log("error in insert lcd Config",error);
        return Promise.reject('error occured in insert lcd config  method');
    }
}

async function getLcdConfig(req){
    // console.log('get subject hitt',req);
    try{

        const getAllLcdConfig = req.params.id? await lcdData.find({$and:[{_id:req.params.id}]}):
        req.query. companyId? await lcdData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
              
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'ParameterId',
                    'foreignField': '_id',
                    'as': 'parameterData'
                }
            },
            {
                '$lookup': {
                    'from': 'deviceTypes',
                    'localField': 'DeviceTypeId',
                    'foreignField': 'DeviceTypeId',
                    'as': 'deviceTypeData'
                }
            },
            {
                $group: {
                    _id: "$DeviceTypeId",
                    DeviceTypeName: { $last: "$deviceTypeData.Name" },
                    ids :  { $push: "$_id" },
                    parameterIds :  { $push: "$ParameterId" },
                    parameterNames :  { $push: "$parameterData.Name" },
                }
            }
        ]):
        await lcdData.find();

        // console.log(getAllLcdConfig)
        return {
            msg: 'successfully Find',
            data: getAllLcdConfig
        }
    }catch (error){
        console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}
// // getByCompanyId
// async function getByCompanyId(req){
//     // console.log('get subject hitt',req);
//     try{
//         const getAllLcdConfig =  await lcdData.find({$and:[{_id:req.params.id}]});
//         return {
//             msg: 'successfully Find',
//             data: getAllLcdConfig
//         }
//     }catch (error){
//         console.log('error occure in get lcd Config',error);
//         return Promise.reject('error occure in get lcd Config')
//     }
// }

async function updateLcdConfig(req){
    // console.log('updateSubject hitt');
    try{
        let LcdConfigId = req.params.id
        // console.log("Update LcdConfigId",LcdConfigId);
        const updatedLcdConfig = await lcdData.findByIdAndUpdate(LcdConfigId,{$set:{DeviceTypeId:req.body.DeviceTypeId,ParameterId:req.body.ParameterId}});
        if(updatedLcdConfig!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedLcdConfig
            }
        }else{
            return {
                msg : "Lcd Config not exist"
            }
        }
    }catch (error){
        console.log('error occure in update Lcd Config',error);
        return Promise.reject('error occure in update Lcd Config')
    }
}

async function deleteLcdConfig(req){
    // console.log('deleteSubject hitt');
    try{
        let LcdConfigId = req.params.id
        // console.log("LcdConfigId",LcdConfigId);
        const deletedLcdConfig = await lcdData.findByIdAndDelete(LcdConfigId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertLcdConfig,
    getLcdConfig,
    updateLcdConfig,
    deleteLcdConfig,
}