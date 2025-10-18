const lcdDifferenceData = require('./model');
const { ObjectId } = require('mongodb');


async function insertlcdDifference(req){
    // console.log("insertexistlcdDifferenceData hitt");
    try{
        const lcdDifference = new lcdDifferenceData(req.body);
        let existlcdDifferenceData = await lcdDifferenceData.find({$and: [{CompanyId : req.body.CompanyId, DeviceType:req.body.DeviceType, ParameterId:req.body.ParameterId}]});
        if(existlcdDifferenceData.length){
            return {
                msg : "lcd Difference already exist"
            }
        }else {
            const insertedexistlcdDifference = await lcdDifference.save();
            return {
                msg: 'successfully inserted',
                id: insertedexistlcdDifference.id
            }
        }
    }catch(error){
        console.log("error in lcdDifference",error);
        return Promise.reject(error);
    }
}


async function getlcdDifference(req){
    // console.log('get lcdDifference hitt',req);
    try{
        const getAlllcdDifference = req.params.id? await lcdDifferenceData.find({$and:[{_id:req.params.id}]}): await lcdDifferenceData.find();
        return {
            msg: 'successfully Find',
            data: getAlllcdDifference
        }
    }catch (error){
        console.log('error occure in get lcdDifference',error);
        return Promise.reject(error);
    }
}

async function getCompanyLcdDifference(req){
    // console.log('get Company lcdDifference hitt',req);
    try{

        const getAllLcdDiffConfig = req.params.id? await lcdDifferenceData.find({$and:[{_id:req.params.id}]}):
        req.query. companyId? await lcdDifferenceData.aggregate([
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
                    'localField': 'DeviceType',
                    'foreignField': 'DeviceTypeId',
                    'as': 'deviceTypeData'
                }
            },
            {
                $group: {
                    _id: "$DeviceType",
                    DeviceTypeName: { $last: "$deviceTypeData.Name" },
                    ids :  { $push: "$_id" },
                    parameterIds :  { $push: "$ParameterId" },
                    parameterNames :  { $push: "$parameterData.Name" },
                }
            }
        ]):
        await lcdDifferenceData.find();

        // console.log(getAllLcdConfig)
        return {
            msg: 'successfully Find',
            data: getAllLcdDiffConfig
        }
    }catch (error){
        console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function updatelcdDifference(req){
    // console.log('Update LCD difference hitt');
    try{
        let lcdDifferenceId = req.params.id
        // console.log("Update lcdDifferenceId",lcdDifferenceId);
        const updatedlcdDifference = await lcdDifferenceData.findByIdAndUpdate(lcdDifferenceId,{$set:{DeviceType:req.body.DeviceType,ParameterId:req.body.ParameterId}});
        if(updatedlcdDifference!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedlcdDifference
            }
        }else{
            return {
                msg : "Lcd difference not exist"
            }
        }
    }catch (error){
        console.log('error occure in update Lcd difference',error);
        return Promise.reject(error);
    }
}

async function deletelcdDifference(req){
    // console.log('lcdDifference hitt');
    try{
        let lcdDifferenceId = req.params.id
        // console.log("lcdDifferenceId", lcdDifferenceId);
        const deletedlcdDifference = await lcdDifferenceData.findByIdAndDelete(lcdDifferenceId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in delete lcdDifference',error);
        return Promise.reject(error);
    }
}



module.exports = {
    insertlcdDifference,
    getlcdDifference,
    updatelcdDifference,
    deletelcdDifference,
    getCompanyLcdDifference

   
}