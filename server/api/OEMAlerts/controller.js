const oemAlertsData = require('./model');
const userData = require('../users/model');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const deviceData = require('../OEMDevice/model');

// async function insertOemAlerts(req){
//     try{
//         const alert = new oemAlertsData(req.body);
//         const insertedAlert = await alert.save();     
//         return {
//             msg: 'Company successfully inserted',
//              id: insertedAlert.id
//         } 

//         // }
//     }catch(error){
//         // console.log("error in",error);
//         return Promise.reject(error);
//     }
// }



async function getNewOemAlerts(req) {
    try {
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
        const searchText = req.query.search || '';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const order = req.query.order ? Number(req.query.order) : -1;
        const sort = req.query.sort || 'time';
        const sortObj = { [sort]: order };
        const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
        const toDate = req.query.toDate ? Number(req.query.toDate) : "";
        const assetId = req.query.assetId ? req.query.assetId : ""
        const read = req.query.read ? Boolean(req.query.read) : ""
        const alerts = await userData.aggregate([
            {
                $match: {
                    _id: ObjectId(req.params.id),
                    // isRead: false
                }
            },
            {
                $lookup: {
                    from: "companyAssets",
                    localField: "_id",
                    foreignField: "MapCustomer",
                    as: "AssetData"
                }
            },
            { $unwind: "$AssetData" },
            { $match: assetId ? { "AssetData.AssetId": assetId } : {} },
            { $match:  { "AssetData.AssetName": { $regex: searchText, $options: "i" } }  },
            {
                $lookup: {
                    from: "oemAlerts",
                    localField: "AssetData.AssetId",
                    foreignField: "assetId",
                    as: "OemAlerts"
                }
            },
            { $unwind: "$OemAlerts" },
            { $match: fromDate && toDate ? { "OemAlerts.time": { $gte: fromDate, $lte: toDate } } : fromDate ? { "OemAlerts.time": { $gte: fromDate } } : toDate ? { "OemAlerts.time": { $lte: toDate } } : {} },
            { $match: read ? { "OemAlerts.read": read } : {} },
            {
                $lookup: {
                    from: "parameters",
                    localField: "OemAlerts.parameterId",
                    foreignField: "_id",
                    as: "parameterDetails"
                }
            },
            {
                $project: {
                    _id: "$OemAlerts._id",
                    category: "$OemAlerts.category",
                    assetName: "$AssetData.AssetName",
                    timeZone: "$AssetData.timeZone",
                    description: "$OemAlerts.description",
                    parameterName: "$parameterDetails.Name",
                    lowerThreshold: "$OemAlerts.lowerThreshold",
                    upperThreshold: "$OemAlerts.upperThreshold",
                    value: "$OemAlerts.value",
                    time: "$OemAlerts.time",
                    read: "$OemAlerts.read"
                }
            },
            { $sort: sortObj },
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
        ])

    //    console.log(alerts) 
        // console.log(alerts)
        return {
            msg: 'successfully Find',
            // data: getAllDevice
            data: alerts.length > 0 ? alerts[0].data.length ? alerts[0].data : [] : [],
            total: alerts.length > 0 ? alerts[0].totalCount.length > 0 ? alerts[0].totalCount[0].count : 0 : 0
        }

    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}

// getUnReadCount
async function getUnReadCount(req) {
    try {
      const AllAlertsCount = await deviceData.aggregate([ 
        {
          $match  : {
            MapCustomer : ObjectId(req.params.id)
          }
      },
      {
      $lookup: {
        from: "oemAlerts",
        localField: "AssetId",
        foreignField: "assetId",
        as: "alerts"
      }
      },
      {
        $unwind:"$alerts"
    }, 
{
          $match  : {
            "alerts.read" : false
          }
      },
      {
          $count: "Count"
        },
      ])
        return {
            msg: 'successfully Find',
            data:  AllAlertsCount
        }
    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}

// getLatestAndUnReady
async function getOemAlerts(req) {
    try {
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
        const alerts = await oemAlertsData.aggregate([
            {
                $match: {
                    userId: ObjectId(req.params.id),

                }
            },
            { $sort: { date: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "companyAssets",
                    localField: "assetId",
                    foreignField: "AssetId",
                    as: "AssetData"
                }
            },
            {
                $project: {
                    assetId: "$Asset_Id",
                    "assetName": "$AssetData.AssetName",
                    date: 1,
                    message: 1,
                    type: 1
                }
            },

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
        const isRead = await oemAlertsData.updateMany({ "_id": { $in: alertsId } }, { $set: { "read": true } })
        return {
            msg: "Successfully mark as read",
            modified: isRead.nModified
        }
    } catch (error) {
        console.warn(`Error occurred while updating status of isRead ${error}`);
        return Promise.reject('error occured in updateIsRead method');
    }
}

module.exports = {
    // insertOemAlerts,
    getOemAlerts,
    getNewOemAlerts,
    updateIsRead,
    getUnReadCount

}



