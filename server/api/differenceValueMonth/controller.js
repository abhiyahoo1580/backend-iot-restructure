const differenceValueData = require('./model');
const mongoose = require('mongoose');
const historicalData = require('../historical/model');
const { forEach } = require('lodash');
const _ = require('lodash');
// getAdvanceByCompanyId
async function getAdvanceByCompanyId(req) {
    try {
        let timestamp = new Date(Number(req.query.date));
        let tDate = Number(req.query.date);
        var firstDay = new Date(timestamp.getFullYear(), 0, 1);
        let fDate = new Date(firstDay).setHours(0, 0, 0, 0);
        // console.log(new Date(tDate), "====> ",new Date(fDate))

        var getAllAreaAssetId = await mongoose.models.areawise.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    // 'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$AssetId' },
            // {
            //     $group: {
            //         _id:null,
            //         AssetId: { $push: "$AssetId" },
            //         "Data.AssetId":  "$AssetId" ,
            //         // "Data.Date":  [] ,
            //         // "Data.Value": [] ,
            //     }
            // },
            {
                $project: {
                    AssetId: 1,
                    _id: 0,
                    Date: [],
                    Value: [],
                    Name: 1,
                    CompanyId: 1
                }
            }

        ])
      var  result = getAllAreaAssetId
        AssetIds = _.map(getAllAreaAssetId, 'AssetId');

        var historicalDataNew = new historicalData(req.query.companyId);
        for (let i = 0; i < 12; i++) {

          var   fDate1 = new Date(timestamp.getFullYear(), i, 1).setHours(0, 0, 0, 0)
          var   tDate1 = new Date(timestamp.getFullYear(), i + 1, 0).setHours(23, 59, 59, 59)
            // console.log(new Date(fDate1),new Date(tDate1))

            getData = await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': { $in: AssetIds },
                        'Date': { '$gte': fDate1, '$lte': tDate1 },
                        // 'Data._id': 1344 

                    },
                },
                { $unwind: '$Data' },
                {
                    '$match': {
                        'Data._id': { $in: [103, 104, 105, 124, 1388, 1398] }
                    }
                },
                {
                    $project: {
                        AssetId: 1,
                        Date: 1,
                        "RegId": "$Data._id",
                        Last: { $arrayElemAt: ["$Data.ActValue", -1] },
                        First: { $arrayElemAt: ["$Data.ActValue", 0] }
                        // 'data.Name': "$parameterDetails.Name"

                    }
                },
                {
                    '$lookup': {
                        'from': 'allRegisters',
                        'localField': 'RegId',
                        'foreignField': 'RegisterId',
                        'as': 'registerDetails'
                    }
                },
                {
                    '$lookup': {
                        'from': 'parameters',
                        'localField': 'registerDetails.Parameter',
                        'foreignField': '_id',
                        'as': 'parameterDetails'
                    }
                },

                {
                    $project: {
                        AssetId: 1,
                        Date: 1,
                        Last: 1,
                        First: 1,
                        ActValue: { $subtract: ["$Last", "$First"] },
                        "ParameterName": "$parameterDetails.Name"
                        // 'data.Name': "$parameterDetails.Name"

                    }
                },
                { $unwind: '$ParameterName' },
                {
                    $group: {
                        _id: "$AssetId",
                        ActValue: {
                            $push: "$ActValue"
                        },
                        Date: {
                            $push: "$Date"
                        },
                        ParameterName: {
                            $last: "$ParameterName"
                        }
                    }
                }

            ])
            // console.log(getData)
            // /

            result.forEach((e, i) => {
                // console.log(e)
                const index = _.find(getData, { '_id': e.AssetId });
                // console.log(index)
                result[i].Date.push(fDate1)
                index != undefined ? result[i].Value.push(_.sum(index.ActValue)) : result[i].Value.push(0)
            });

        }
        //    const getAllAreaWiseValue = await differenceValueData.aggregate([
        //     {
        //         '$match': {
        //             'AssetId': { $in: AssetIds },
        //             'Date': { '$gt': fDate, '$lte': tDate },
        //         }

        //     },
        //     {$sort : {Date : -1}},
        //     {
        //         '$lookup': {
        //             'from': 'areawises',
        //             'localField': 'AssetId',
        //             'foreignField': 'AssetId',
        //             'as': 'areaData'
        //         }
        //     },
        //     { $project : {
        //         AssetId : 1,_id : 0,Date: 1,Value :1,"Area.Name" : "$areaData.Name"
        //      } },
        //     { $group: {
        //         _id: "$AssetId",
        //         Value: { $push: "$Value" },
        //         Date: { $push: "$Date" },
        //         Name: { $last: "$Area.Name" }
        //     }
        // },
        //      {
        //         $group: {
        //             _id:"$Name",
        //             Date: { $last: "$Date" },
        //             Value1: { $push: "$Value" },
        //         }
        //     }

        //     ])   
        // console.log(result)
        const groupedByName = _.groupBy(result, 'Name');

        const result1 = _.map(groupedByName, (group, name) => {
            const sumData = _.reduce(group, (acc, obj) => {
                obj.Value.forEach((val, index) => {
                    acc[index] = (acc[index] || 0) + val;
                });
                return acc;
            }, []);

            return { name, Value : sumData , Date:group[0].Date};
        });
        return {
            msg: 'successfully Find',
            data: result1
        }
    } catch (error) {
        console.log('error occure in get AreaWise', error);
        return Promise.reject('error occure in get AreaWise')
    }
}
module.exports = {
    getAdvanceByCompanyId
}