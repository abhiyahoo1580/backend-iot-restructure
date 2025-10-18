const oemGraphsConfigData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');


async function insertOemGrapgGroupParameters(req){
    try{
        const grapg = new oemGraphsConfigData(req.body);
        const insertedGraph = await grapg.save();     
        return {
            msg: 'graph Config successfully inserted',
             id: insertedGraph.id
        } 
    }catch(error){
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

// getLatestAndUnReady
async function getOemGrapgGroupParameters(req) {
    try {           
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
            const graphConfigs = await oemGraphsConfigData.aggregate([
                { 
                    $match: {  userId : ObjectId(req.params.id), 
                              
                            }
                        },
                        { $sort : { date : -1}},
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'parameterId',
                    'foreignField': '_id',
                    'as': 'parameterData'
                }
            },
                        {$lookup : {
                            from : "companyAssets",
                            localField : "assetId",
                            foreignField : "AssetId",
                            as  : "AssetData"
                        }
                        },
                                    {
                $group: {
                    _id: "$assetId",
                    assetName: { $last: "$AssetData.AssetName" },
                    // SlaveId: { $last: "$SlaveId" },
                    // DeviceTypeId: { $last: "$DeviceTypeId" },
                    groupIds: { $push: "$_id" },
                    names: { $push: "$name" },
                    parameterIds: { $push: "$parameterData._id" },
                    parameterNames: { $push: "$parameterData.Name" },


                }
            }                    
                ])
            
            // console.log(graphConfigs)
            return {
                msg: "Successfully find the result",
                data: graphConfigs
            }
  
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}

async function updateOemGrapgGroupParameters(req){
    // console.log('updateSubject hitt');
    try{
        let graphConfigId = req.params.id      
        // let existCompany = await OEMCompanyData.find({$and: [{emailId : req.body.emailId }]});
        // if(existCompany.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedGraphConfig = await oemGraphsConfigData.findByIdAndUpdate(graphConfigId,{$set:{
                name:req.body.name,    
                 parameterId:req.body.parameterId}});
            if(updatedGraphConfig!=null){
                return {
                    msg: 'Alert Config Updated Successfully ',
                    data: updatedGraphConfig
                }
            }else{
                return {
                    msg : "Alert Config not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteOemGrapgGroupParameters(req){
    // console.log('deleteSubject hitt');
    try{
        let graphConfigId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedOemGraphConfig = await oemGraphsConfigData.findByIdAndDelete(graphConfigId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete alert Config')
    }
}

module.exports = {
    insertOemGrapgGroupParameters,
    getOemGrapgGroupParameters,
    updateOemGrapgGroupParameters,
    deleteOemGrapgGroupParameters

}



