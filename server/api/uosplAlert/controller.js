const alertsData = require('./model');
const mongoose = require('mongoose');
const deviceData = require('../uosplDevice/model')
const { ObjectId } = require('mongodb');


async function getAll(req) {
    try {
        // console.log(req.query,Number(req.query.pageno),Number(req.query.size))
        const getAllAlerts = await alertsData.aggregate([
            {
                '$match': {
                    'RegisterId': { $in: [430, 431, 432, 433, 434, 435] },

                },
            },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'RegisterId',
                    'foreignField': 'RegisterId',
                    'as': 'registerDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerDetails.Parameter',
                    'foreignField': '_id',
                    'as': 'metersdata'
                }
            },

            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'assetDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'assetDetails.MapCustomer',
                    'foreignField': '_id',
                    'as': 'mapUserDetails'
                }
            },
            { $sort: { "StartTime": -1 } },

            { '$project': { 'AssetId': 1, 'ActValue': 1, 'StartTime': 1, 'StopTime': 1, 'fName': "$mapUserDetails.first_name", 'lName': "$mapUserDetails.last_name", 'Name': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode" , } },
            { "$skip": (Number(req.query.size)*(Number(req.query.pageNo)-1)) },
            { "$limit": (Number(req.query.size)) }
        ]);
        const size = await alertsData.aggregate([ {
            $count: 'count'
          }])
        return {
            msg: 'successfully Find',
            data: getAllAlerts,
            size : size
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getNewAll
async function getNewAll(req) {
    try {

            // const searchText = req.query.search || '';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const skip = (page - 1) * limit;
            const order = req.query.order ? Number(req.query.order) : -1;
            const sort = req.query.sort || 'StartTime';
            const sortObj = { [sort]: order };
            const userId = req.query.userId ? ObjectId(req.query.userId) : '';
            const assetId = req.query.AssetId ? req.query.AssetId : '';
            const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
            const toDate = req.query.toDate ? Number(req.query.toDate) : "";
            query = [{
                '$match': {
                    'RegisterId': { $in: [430, 431, 432, 433, 434, 435] },

                },
            },
            {"$sort" :sortObj},
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'assetDetails'
                }
            },
            {$unwind : "$assetDetails"},
             {
                '$lookup': {
                    'from': 'users',
                    'localField': 'assetDetails.MapCustomer',
                    'foreignField': '_id',
                    'as': 'mapUserDetails'
                }
            },

            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'RegisterId',
                    'foreignField': 'RegisterId',
                    'as': 'registerDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerDetails.Parameter',
                    'foreignField': '_id',
                    'as': 'metersdata'
                }
            },
               { '$project': { 'AssetId': 1, 'ActValue': 1, 'StartTime': 1, 'StopTime': 1, 'fName': "$mapUserDetails.first_name", 'lName': "$mapUserDetails.last_name", 'Name': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode" , } },
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
        ]
         if(userId){
        // query.$match.MapCompanyId = userId
         query.splice(4, 0, {
                '$match': {
                    'assetDetails.MapCustomer': { $eq: userId },

                },
            })
        }if(assetId){
        query[0].$match.AssetId = assetId
        } 
        if(fromDate && toDate){
            query[0].$match.StartTime =   { '$gte': fromDate, '$lte': toDate }
        } 
        const getAllAlerts = await alertsData.aggregate(query);
        // console.log(getAllAlerts)
              return {
            msg: 'successfully Find',
            // data: getAllDevice
            data: getAllAlerts.length > 0 ? getAllAlerts[0].data.length ? getAllAlerts[0].data : []:[],
            total: getAllAlerts.length > 0 ? getAllAlerts[0].totalCount.length > 0 ? getAllAlerts[0].totalCount[0].count : 0 : 0
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

async function getUserAlert(req) {
    try {

        const getAllAlerts = await deviceData.aggregate([
            {
                '$match': {
                    'MapCustomer': ObjectId(req.query.userId),

                },
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'MapCustomer',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            },
            // {
            //     '$unwind': '$userDetails'
            // },

            {
                '$lookup': {
                    'from': 'alertsMaa',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'alertsDetails'
                }
            },
            { $unwind: "$alertsDetails" },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'alertsDetails.RegisterId',
                    'foreignField': 'RegisterId',
                    'as': 'registerDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerDetails.Parameter',
                    'foreignField': '_id',
                    'as': 'pametersdata'
                }
            },
            { $sort: { "StartTime": -1 } },
            {
                '$project': {
                    'AssetId': 1,
                    'ActValue': '$alertsDetails.Value',
                    'StartTime': '$alertsDetails.StartTime',
                    'StopTime': '$alertsDetails.StopTime',
                    'Name': "$pametersdata.Name",
                    'ColorCode': "$pametersdata.ColorCode",
                    'fName': '$userDetails.first_name',
                    'lName': '$userDetails.last_name',
                }
            },
            { "$skip": (Number(req.query.size)*(Number(req.query.pageNo)-1)) },
            { "$limit": (Number(req.query.size)) }
        ])
        const size = await deviceData.aggregate([           
            {
                '$match': {
                    'MapCustomer': ObjectId(req.query.userId),

                },
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'MapCustomer',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'alertsMaa',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'alertsDetails'
                }
            },
            { $unwind: "$alertsDetails" },
            {
            $count: 'count'
          }
        ])
        return {
            msg: 'successfully Find',
            data: getAllAlerts,
            size : size
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getNewUserAlert
async function getNewUserAlert(req) {
    try {
          // const searchText = req.query.search || '';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const skip = (page - 1) * limit;
            const order = req.query.order ? Number(req.query.order) : -1;
            const sort = req.query.sort || 'StartTime';
            const sortObj = { [sort]: order };
            const userId = ObjectId(req.params.id) ? ObjectId(req.params.id) : '';
            const assetId = req.query.AssetId ? req.query.AssetId : '';
            const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
            const toDate = req.query.toDate ? Number(req.query.toDate) : "";
            query = [{
                '$match': {
                    'RegisterId': { $in: [430, 431, 432, 433, 434, 435] },

                },
            },
            {"$sort" :sortObj},
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'assetDetails'
                }
            },
            {$unwind : "$assetDetails"},
             {
                '$match': {
                    'assetDetails.MapCustomer': { $eq: userId },

                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'assetDetails.MapCustomer',
                    'foreignField': '_id',
                    'as': 'mapUserDetails'
                }
            },

            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'RegisterId',
                    'foreignField': 'RegisterId',
                    'as': 'registerDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerDetails.Parameter',
                    'foreignField': '_id',
                    'as': 'metersdata'
                }
            },
               { '$project': { 'AssetId': 1, 'ActValue': 1, 'StartTime': 1, 'StopTime': 1, 'fName': "$mapUserDetails.first_name", 'lName': "$mapUserDetails.last_name", 'Name': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode" , } },
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
        ]
        //  if(userId){
        // query.$match.MapCompanyId = userId
        //  query.splice(4, 0, {
        //         '$match': {
        //             'assetDetails.MapCustomer': { $eq: userId },

        //         },
        //     })
        
        if(assetId){
        query[0].$match.AssetId = assetId
        } 
        if(fromDate && toDate){
            query[0].$match.StartTime =   { '$gte': fromDate, '$lte': toDate }
        } 
        const getAllAlerts = await alertsData.aggregate(query);
        // console.log(getAllAlerts)
              return {
            msg: 'successfully Find',
            // data: getAllDevice
            data: getAllAlerts.length > 0 ? getAllAlerts[0].data.length ? getAllAlerts[0].data : []:[],
            total: getAllAlerts.length > 0 ? getAllAlerts[0].totalCount.length > 0 ? getAllAlerts[0].totalCount[0].count : 0 : 0
        }
       
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

async function getdeviceAlert(req) {

    try {
        fDate = new Date(Number(req.query.date)).setHours(0, 0, 0, 0)
        tDate = new Date(Number(req.query.date)).setHours(23, 59, 59, 0);
        //    console.log(new Date(fDate),new Date(tDate))
        const getAllAlerts = await alertsData.aggregate([
            {
                '$match': {
                    'AssetId': req.query.deviceId,
                    'StartTime': { '$gte': fDate, '$lte': tDate }

                },
            },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'RegisterId',
                    'foreignField': 'RegisterId',
                    'as': 'registerDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerDetails.Parameter',
                    'foreignField': '_id',
                    'as': 'metersdata'
                }
            },

            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'assetDetails'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'assetDetails.MapCustomer',
                    'foreignField': '_id',
                    'as': 'mapUserDetails'
                }
            },
            { $sort: { "StartTime": -1 } },

            { '$project': { 'AssetId': 1, 'ActValue': 1, 'StartTime': 1, 'StopTime': 1, 'Name': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode", 'fName': "$mapUserDetails.first_name", 'lName': "$mapUserDetails.last_name" } },
            { "$skip": (Number(req.query.size)*(Number(req.query.pageNo)-1)) },
            { "$limit": (Number(req.query.size)) }
        ]);

        const size = await alertsData.aggregate([
            {
                '$match': {
                    'AssetId': req.query.deviceId,
                    'StartTime': { '$gte': fDate, '$lte': tDate }

                },
            },
            {
                $count: 'count'
              }
        ])
        return {
            msg: 'successfully Find',
            data: getAllAlerts,
            size:size
        }
    } catch (error) {

        return Promise.reject('error occure in get lcd Config')
    }
}


module.exports = {
    getAll,
    getUserAlert,
    getdeviceAlert,
    getNewAll,
    getNewUserAlert
}


