const oemAlertsConfigData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');


async function insertOemAlertsConfig(req){
    try{
        let existAlertsConfig = await oemAlertsConfigData.find({$and: [{assetId : req.body.assetId ,userId : req.body.userId ,parameter : req.body.parameter}]});
        if(existAlertsConfig.length){
            return {
                msg : "Alert Config  already exist"
            }
        }else {
        const alert = new oemAlertsConfigData(req.body);
        const insertedAlert = await alert.save();     
        return {
            msg: 'Alert Config successfully inserted',
             id: insertedAlert.id
        } 
        }
        // }
    }catch(error){
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

// getLatestAndUnReady
async function getOemAlertsConfig(req) {
    try {           
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
            const alertConfigs = await oemAlertsConfigData.aggregate([
                { 
                    $match: {  userId : ObjectId(req.params.id), 
                              
                            }
                        },
                        { $sort : { date : -1}},
                        {$lookup : {
                            from : "companyAssets",
                            localField : "assetId",
                            foreignField : "AssetId",
                            as  : "AssetData"
                        }
                        },
                           {$lookup : {
                            from : "parameters",
                            localField : "parameter",
                            foreignField : "_id",
                            as  : "ParameterData"
                        }
                        },
                        {$project : {
                            assetId : 1, 
                            "assetName" : "$AssetData.AssetName",
                            assetId : 1, 
                            "parameterName" : "$ParameterData.Name",
                            date : 1,
                            message : 1,
                            type : 1  ,
                            parameter:1,
                            upperThresholdValue: 1,
                            upperThresholdWarning: 1,
                            lowerThresholdValue: 1,
                            lowerThresholdWarning: 1,
                            frequency: 1
                        }},
                     
                ])
            
            // console.log(alertConfigs)
            return {
                msg: "Successfully find the result",
                data: alertConfigs
            }
  
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}

async function updateOemAlertsConfig(req){
    // console.log('updateSubject hitt');
    try{
        let alertConfigId = req.params.id      
        // let existCompany = await OEMCompanyData.find({$and: [{emailId : req.body.emailId }]});
        // if(existCompany.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedAlertConfig = await oemAlertsConfigData.findByIdAndUpdate(alertConfigId,{$set:{
                upperThresholdValue:req.body.upperThresholdValue,    
                 upperThresholdWarning:req.body.upperThresholdWarning,
                lowerThresholdValue:req.body.lowerThresholdValue,
                lowerThresholdWarning:req.body.lowerThresholdWarning,
                frequency:req.body.frequency
            }});
            if(updatedAlertConfig!=null){
                return {
                    msg: 'Alert Config Updated Successfully ',
                    data: updatedAlertConfig
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

async function deleteOemAlertsConfig(req){
    // console.log('deleteSubject hitt');
    try{
        let alertConfigId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedOemAlertsConfig = await oemAlertsConfigData.findByIdAndDelete(alertConfigId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete alert Config')
    }
}
module.exports = {
    insertOemAlertsConfig,
    getOemAlertsConfig,
    updateOemAlertsConfig,
    deleteOemAlertsConfig

}



