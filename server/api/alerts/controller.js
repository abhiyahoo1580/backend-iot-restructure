const mongoose = require('mongoose');
const alertsData = require('./model');
const client = require('../../core').mqttClient;
const companyAssetData = require('../companyAsset/model')

async function getAlerts(req) {
    try {           
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
            const alerts = await alertsData.aggregate([
                { 
                    $match: { "CompanyId": Number(req.query.companyId), 
                               "Archive": Boolean(Number(req.query.archive))
                            }
                        },
                        { $sort : { Time : -1}},
                        {$lookup : {
                            from : "companyAssets",
                            localField : "Asset_Id",
                            foreignField : "AssetId",
                            as  : "AssetData"
                        }
                        },
                        {$project : {
                            Archive:1,
                            AssetId : "$Asset_Id", 
                            "AssetName" : "$AssetData.AssetName",
                            Category:1,
                            CompanyId:1,
                            Description:1,
                            Read:1,
                            ParameterName : "$Parameter_Name",
                            Threshold:1,
                            Time:1,
                            Value:1

                        }},
                        {$unwind : "$AssetName"}
                ])
            
            // console.log(alerts)
            return {
                msg: "Successfully find the result",
                data: alerts
            }
  
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}
// alertClear
async function alertClear(req) {
    try {           
        const   AssetDetails =    await companyAssetData.aggregate([{
            $match: {
                AssetId: req.params.AssetId
            }},
        ])
        // console.log(AssetDetails)
        if(AssetDetails.length > 0){
            obj ={
                "107" : 0,
                "108" : 0,
                "109" : 0,
                "110" : 0 
            } 
            topic =  "ELLIOT/TMA/"+AssetDetails[0].Gateway + "/ALERT/CLEAR"
            // console.log(temp,humidity,JSON.stringify(obj))
            client.publish(topic, JSON.stringify(obj), (error) => {
                if (error) {
                //   console.log('Error publishing message:', error);
                } else {
                //   console.log(`Message published to topic test111"`);
                }
              });
              return true;
        }
           
     
            return {
                msg: "Successfully find the result",
          
            }
  
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}
// getLatestAndUnReady
async function getLatestAndUnReady(req) {
    try {           
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
            const alerts = await alertsData.aggregate([
                { 
                    $match: { "CompanyId": Number(req.query.companyId), 
                               "Archive": Boolean(Number(req.query.archive)),
                               "Read": false
                            }
                        },
                        { $sort : { Time : -1}},
                        {$lookup : {
                            from : "companyAssets",
                            localField : "Asset_Id",
                            foreignField : "AssetId",
                            as  : "AssetData"
                        }
                        },
                        {$project : {
                            Archive:1,
                            AssetId : "$Asset_Id", 
                            "AssetName" : "$AssetData.AssetName",
                            Category:1,
                            CompanyId:1,
                            Description:1,
                            Read:1,
                            ParameterName : "$Parameter_Name",
                            Threshold:1,
                            Time:1,
                            Value:1

                        }},
                        {$unwind : "$AssetName"},
                        {
                            $facet: {
                              count: [
                                { $count: "total" }
                              ],
                              lastFive: [
                                // { $sort: { _id: -1 } }, // Sort by _id or any other field to get the last documents
                                { $limit: 5 }
                              ]
                            }
                          }
                ])
            
            // console.log(alerts)
            return {
                msg: "Successfully find the result",
                data: alerts
            }
  
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}
async function updateIsRead(req) {
    try {
        const alertsId = req.body.id
        // console.log(alertsId)
        if (req.body.Read === undefined || req.body.Read === null) {
            throw new Error('Check the input value for isRead property')
        } else {
            const isRead = await alertsData.updateMany({ "_id": { $in: alertsId } }, { $set: { "Read": req.body.Read } })


            return {
                msg: "Successfully mark as read",
                modified: isRead.nModified
            }
        }

    } catch (error) {
        console.warn(`Error occurred while updating status of isRead ${error}`);
        return Promise.reject('error occured in updateIsRead method');
    }
}


async function updateIsArchived(req) {
    try {
        const alertsId = req.body.id
        // console.log(alertsId)
        if (req.body.Archive === undefined || req.body.Archive === null) {
            throw new Error('Check the input value for isArchived property')
        } else {
            const isArchived = await alertsData.updateMany({ "_id": { $in: alertsId } }, { $set: { "Archive": req.body.Archive } })
            return {
                msg: "Successfully Archived",
                modified: isArchived.nModified
            }
        }
    } catch (error) {
        console.warn(`Error occurred while updating status of isArchived ${error}`);
        return Promise.reject('error occured in updateIsArchived method');
    }
}


module.exports = {
    getAlerts,
    // getArchivedAlerts,
    updateIsRead,
    updateIsArchived,
    getLatestAndUnReady,
    alertClear
}