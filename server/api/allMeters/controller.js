const allMeterData = require('./model');
const mongoose = require('mongoose');
const historicalData = require('../historical/model');
const assetData = require('../companyAsset/model');
const _ = require('lodash');
const oeeTableData = require('../oeeTable/model');

async function getAllMeterDate(req) {
    try {
// var date = new Date()
// let fDate = new Date(date).setDate(1);
fDate = new Date( Number(req.query.sDate)).setHours(0, 0, 0, 0)
tDate =new Date(Number(req.query.eDate)).setHours(23, 59, 59, 0);
// console.log(new Date(fDate),new Date(tDate))
var historicalDataNew = new historicalData(Number(req.query.companyId));




var getAllMeterData = await assetData.aggregate([
    {
        '$match': {
            'CompanyId': Number(req.query.companyId),
            'Gateway': { $not: { $eq: null } },
            'DeviceTypeId' : Number(req.query.deviceTypeId)
        }
    },   
    {
        '$lookup': {
            'from': 'lcdviewdiffconfiguration1',
            'localField': 'CompanyId',
            'foreignField': 'CompanyId',
            'as': 'lcdDiffConfigData'
        }
    },
    {
        $project: {
            // Gateway:1,
            // SlaveId:1,
            AssetId: 1,
            AssetName: 1,
            AssetTypeId: 1,
            DeviceTypeId: 1,
            status: 1,
            // CompanyId: 1,
            lcddiffconfig: { $filter: { input: "$lcdDiffConfigData", as: "u", cond: { $eq: ["$$u.DeviceType", "$DeviceTypeId"] } } }
        }
    },
    {
        '$lookup': {
            'from': 'allRegisters',
            'localField': 'lcddiffconfig.ParameterId',
            'foreignField': 'Parameter',
            'as': 'registerDataDiff'
        }
    },
    {
        $project: {
            // Gateway:1,
            // SlaveId:1,
            AssetId: 1,
            AssetName: 1,
            // status: 1,
            // AssetTypeId: 1,
            // DeviceTypeId: 1,
            // lcdconfig: 1,
            // lcddiffconfig: 1,
            CompanyId: 1,
            diffRegisterAddress: { $filter: { input: "$registerDataDiff", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } }
        }
    },
    {$unwind : "$diffRegisterAddress"},
    {
        $group: {
            _id: null,
            RegIds: { $push: "$diffRegisterAddress.RegisterId" },
            RegAddress: { $push: "$diffRegisterAddress.RegisterAddress" },
            AssetIds: { $push: "$AssetId" },
        }
    },
    // {
    //     $lookup:
    //     {
    //         from: "historicalMeterValues" + Number(req.query.companyId),           
    //         pipeline: [
    //             {
    //                 $match: {                        
    //                     'Date': { '$gte': fDate, '$lte': tDate },
    //                 },
                    
    //             },
              
    //         ],
    //         as: "historicalData"
    //     }
    // },
    // {
    //     $project: {
    //         AssetId: 1,
    //         Gateway:1,
    //         SlaveId:1,
    //         AssetName: 1,
    //         status: 1,
    //         DeviceTypeId: 1,
    //         diffRegisterAddress: "$diffRegisterAddress.RegisterId",
    //         diffRegisterId: "$diffRegisterAddress",
    //         historical: { $filter: { input: "$historicalData", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } },

    //     }
    // },
    // {
    //     $project: {
    //         "historical": "$historical.Data",
    //         "Date": "$historical.Date",
    //         // "historicalPriviousData": "$historicalPrivious.Data",
    //         registerAddress: 1,
    //         AssetId: 1,
    //         Gateway:1,
    //         SlaveId:1,
    //         status: 1,
    //         DeviceTypeId: 1,
    //         registerId: 1,
    //         diffRegisterId: 1,
    //         diffRegisterAddress: 1,
    //         AssetName: 1,

    //     }
    // },
    // {
    //     "$addFields": {
    //         "historical": {
    //             "$reduce": {
    //                 "input": "$historical",
    //                 "initialValue": [],
    //                 "in": { "$concatArrays": ["$$value", "$$this"] }
    //             }
    //         },
    //     }
    // },
    // {
    //     "$addFields": {
    //         "DifferenceValue": [],
    //     }
    // },
    // {
    //     "$addFields": {
    //         "Name": '',
    //         "Total": 0,
    //     }
    // },
    // {
    //     $project: {
    //         Gateway:1,
    //         DifferenceValue:1,
    //         Name: 1,
    //         Total: 1,
    //         SlaveId:1,
    //         AssetId: 1,
    //         AssetName: 1,
    //         status: 1,
    //         Date:1,
    //         DeviceTypeId: 1,
    //         // registerId: 1,
    //         diffRegisterId: 1,
    //         // historical: {
    //         //     $filter:
    //         //     {
    //         //         input: "$historical",
    //         //         as: "h",
    //         //         cond: {
    //         //             $in: ['$$h._id', '$registerAddress']
    //         //         }
    //         //     }
    //         // },
    //         historicalDiff: {
    //             $filter:
    //             {
    //                 input: "$historical",
    //                 as: "h",
    //                 cond: {
    //                     $in: ['$$h._id', '$diffRegisterAddress']
    //                 }
    //             }
    //         },

    //     }
    // },
    // {
    //     '$lookup': {
    //         'from': 'parameters',
    //         'localField': 'diffRegisterId.Parameter',
    //         'foreignField': '_id',
    //         'as': 'parameterDataDiff'
    //     }
    // },
    // {
    //     '$project': {
    //         // DeviceTypeId: 1, 
    //         Date:1,
    //         "data.AssetName": '$AssetName',
    //         // 'data.historical': "$historical", 
    //         'data.AssetId': "$AssetId", 
    //         // 'data.parameter': "$parameterData.Name",
    //          'data.historicalDiff': "$historicalDiff", 
    //          'data.parameterDiff': "$parameterDataDiff.Name", 
    //           "data.Gateway":"$Gateway",
    //           "data.SlaveId":"$SlaveId",
    //           DifferenceValue:1,
    //           Name: "$AssetName",
    //           "_id" :"$AssetId" ,
    //           Total: 1,
    //     }
    // },
 
    // // {
    // //     $group: {
    // //         _id: "$DeviceTypeId",
    // //         res: { $push: "$data" },
    // //     }
    // // },
    // // //  { $unwind: '$data.historicalDiff' },
    // // { $sort: { "_id": 1 } },
    // // // {
    // // //     $group: {
    // // //         _id: "$DeviceTypeId",
    // // //         res: { $push: "$data" },
    // // //     }
    // // // },
    // // // {
    // // //     '$lookup': {
    // // //         'from': 'deviceTypes',
    // // //         'localField': '_id',
    // // //         'foreignField': 'DeviceTypeId',
    // // //         'as': 'deviceTypeData'
    // // //     }
    // // // },
    // // // { '$project': { res: 1, deviceTypeName: "$deviceTypeData.Name" } },
]) 
if(getAllMeterData != undefined && getAllMeterData.length > 0){
var data =  await historicalDataNew.aggregate([
    {
        '$match': {
            'AssetId':  { $in: getAllMeterData[0].AssetIds },
            'Date': { '$gte': fDate, '$lte': tDate },
            // 'Data._id' : { $in : getAllMeterData[0].RegIds}
        },
    },
    { $sort: { Date: 1 } },

    { $unwind: '$Data' },
    {
      '$match': {
          'Data._id':  { $in: getAllMeterData[0].RegIds},
          
      },
  },
    {
        '$lookup': {
            'from': 'allRegisters',
            'localField': 'Data._id',
            'foreignField': 'RegisterId',
            'as': 'Data.registerDetails'
        }
    },
    {
        '$lookup': {
            'from': 'parameters',
            'localField': 'Data.registerDetails.Parameter',
            'foreignField': '_id',
            'as': 'Data.parameterDetails'
        }
    },      
    {
        '$project': {
            '_id': "$_id",
            'data.actValue': "$Data.ActValue",
            'data.valueReceivedDate': "$Data.ValueReceivedDate",
            'date': "$Date",               
            'data.name': "$Data.parameterDetails.Name",
            'assetId' : "$AssetId"                   
        }
    },
       {
      $group: {
          _id: "$assetId",                
          'actValue': { $push: "$data.actValue" },  
        //   'Name': { $last: "$data.name" }, 
          'valueReceivedDate' : { $push : "$data.valueReceivedDate"},          
      }
  },
  {
    '$lookup': {
        'from': 'companyAssets',
        'localField': '_id',
        'foreignField': 'AssetId',
        'as': 'AssetDetails'
    }
},
{ $project : { 
    valueReceivedDate:1,
    actValue: 1,
    Name : "$AssetDetails.AssetName",
    Date :[],
    DifferenceValue : []

}

}
 ]) 
//  console.log(data)
if(data != undefined && data.length > 0){
 for(let i =new Date(fDate).getDate() ; i <= new Date(tDate).getDate() ; i ++){
    let time = new Date(Number(req.query.sDate));
    let fDate11 = new Date(time).setHours(0, 0, 0, 0);
    let tDate11 = new Date(time).setHours(23, 59, 59,0);
    let fDate12 = new Date(fDate11).setDate(i); 
    let tDate12 = new Date(tDate11).setDate(i); 
    // console.log(i,new Date(fDate12),new Date(tDate12))
    for(let i = 0 ; i < data.length;i++){
                    let index =  _.findIndex(data[i].valueReceivedDate, obj => obj[0] < tDate12 && obj[0] >= fDate12)
                    // console.log(index,index >=0 ? data[i].actValue[index][data[i].actValue[index].length-1] - data[i].actValue[index][0]:null)
                    if(index >= 0){
                    data[i].DifferenceValue.push(data[i].actValue[index][data[i].actValue[index].length-1] - data[i].actValue[index][0])
                    data[i].Date.push(fDate12)
                }else{
                    data[i].DifferenceValue.push(null)
                    data[i].Date.push(fDate12)
                }
                    // data[i].ActValue = 
    }
    
 }
 data.forEach((e) => { delete e.actValue; delete e.valueReceivedDate;});
 for(let i = 0 ; i < data.length ; i ++){
    data[i].Date.push('Total KWH Consumption')
    data[i].DifferenceValue.push( data[i].DifferenceValue.reduce((accumulator, currentValue) => {
        // Check if currentValue is not null before adding it to the accumulator
        return currentValue !== null ? accumulator + currentValue : accumulator;
      }, 0))
 }
}
}   
// // console.log(data)
if(data != undefined && data.length > 0){
    const arrays = data.map(obj => obj.DifferenceValue);
// Using _.zipWith() to sum corresponding elements from each array
const sumArray = _.zipWith(...arrays, (...DifferenceValue) => _.sum(DifferenceValue));
// Creating the output array
data = [...data, { Name: ["Total"], DifferenceValue: sumArray }];
// console.log(data);
}
//     data =   data.map(item => {
//         // Pushing a new value (e.g., 10) into the numbers array within each object
//         item.Date.push('Total KWH Consumption'); 
//         item.DifferenceValue .push(_.sum(item.DifferenceValue.filter(num => num !== null)))     
//         // Returning the modified object
//         return item;
//       });
//       const a = [
//         { value: [1, 2, 3, 4, 5, 6] },
//         { value: [1, 2, 3, 4, 5, 6] },
//         { value: [1, 2, 3, 4, 5, 6] }
//       ];
      
//       // Extracting arrays from 'value' property of each object
//       const arrays = data.map(obj => obj.DifferenceValue);
//       console.log(arrays,...arrays)
//       // Using _.zipWith() to sum corresponding elements from each array
//       const sumArray = _.zipWith(...arrays, (...DifferenceValue) => _.sum(DifferenceValue));
//       console.log(sumArray)
//       // Creating the output array
//       const output = [...data, { value: sumArray }];
      
//       console.log(output);
// }
// console.log(data)
        return {
            msg: 'successfully Find',
            data: data != undefined && data.length > 0 ? data : []
        }

    } catch (error) {
        console.log("error in insert alert Config", error);
        return Promise.reject(error);
    }
}


async function getAllGroupsData(req) {
    try {
        // console.log(new Date(Number(req.query.sDate)),new Date(Number(req.query.eDate)))
        const getAllAssetId = await mongoose.models.metergroup.find({ _id: req.query.id })
        if (getAllAssetId.length) {
            let fDate =  new Date(Number(req.query.sDate)).setHours(00, 00, 00, 00) 
            let tDate =   new Date(Number(req.query.eDate)).setHours(23, 59, 59, 00) 
            // console.log(getAllAssetId[0].AssetId ,new Date(fDate),new Date(tDate))
            var historicalDataNew = new historicalData(Number(req.query.companyId));
            // var allGroupData = await allMeterData.aggregate([
            //     {
            //         $match: {
            //             AssetId: { $in: getAllAssetId[0].AssetId },
            //             Date: {
            //                 '$gt': sDate,
            //                 '$lt': eDate
            //             }
            //         }
            //     },
            //     {
            //         $sort: { "Date": 1 }
            //     },
            //     {
            //         $group: {
            //             _id: "$AssetId",
            //             Dates: {
            //                 $push: "$Date"
            //             },
            //             Values: {
            //                 $push: "$DifferenceValue"
            //             }
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "companyAssets",
            //             localField: "_id",
            //             foreignField: "AssetId",
            //             as: "Name"
            //         }
            //     },
            //     {
            //         $unwind: "$Name"
            //     },
            //     {
            //         $project: {
            //             Dates: 1,
            //             Values: 1,
            //             Name: "$Name.AssetName",
            //             Total: { $sum: "$Values" }
            //         }
            //     }
            // ])
            var getAllMeterData = await assetData.aggregate([
                {
                    '$match': {
                        // 'CompanyId': Number(req.query.companyId),
                        AssetId: { $in: getAllAssetId[0].AssetId },
                        // 'Gateway': { $not: { $eq: null } },
                        // 'DeviceTypeId' : Number(req.query.deviceTypeId)
                    }
                },   
                {
                    '$lookup': {
                        'from': 'lcdviewdiffconfiguration1',
                        'localField': 'CompanyId',
                        'foreignField': 'CompanyId',
                        'as': 'lcdDiffConfigData'
                    }
                },
                {
                    $project: {
                        // Gateway:1,
                        // SlaveId:1,
                        AssetId: 1,
                        AssetName: 1,
                        AssetTypeId: 1,
                        DeviceTypeId: 1,
                        status: 1,
                        // CompanyId: 1,
                        lcddiffconfig: { $filter: { input: "$lcdDiffConfigData", as: "u", cond: { $eq: ["$$u.DeviceType", "$DeviceTypeId"] } } }
                    }
                },
                {
                    '$lookup': {
                        'from': 'allRegisters',
                        'localField': 'lcddiffconfig.ParameterId',
                        'foreignField': 'Parameter',
                        'as': 'registerDataDiff'
                    }
                },
                {
                    $project: {
                        // Gateway:1,
                        // SlaveId:1,
                        AssetId: 1,
                        AssetName: 1,
                        // status: 1,
                        // AssetTypeId: 1,
                        // DeviceTypeId: 1,
                        // lcdconfig: 1,
                        // lcddiffconfig: 1,
                        CompanyId: 1,
                        diffRegisterAddress: { $filter: { input: "$registerDataDiff", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } }
                    }
                },
                {$unwind : "$diffRegisterAddress"},
                {
                    $group: {
                        _id: null,
                        RegIds: { $push: "$diffRegisterAddress.RegisterId" },
                        RegAddress: { $push: "$diffRegisterAddress.RegisterAddress" },
                        AssetIds: { $push: "$AssetId" },
                    }
                },
                // {
                //     $lookup:
                //     {
                //         from: "historicalMeterValues" + Number(req.query.companyId),           
                //         pipeline: [
                //             {
                //                 $match: {                        
                //                     'Date': { '$gte': fDate, '$lte': tDate },
                //                 },
                                
                //             },
                          
                //         ],
                //         as: "historicalData"
                //     }
                // },
                // {
                //     $project: {
                //         AssetId: 1,
                //         Gateway:1,
                //         SlaveId:1,
                //         AssetName: 1,
                //         status: 1,
                //         DeviceTypeId: 1,
                //         diffRegisterAddress: "$diffRegisterAddress.RegisterId",
                //         diffRegisterId: "$diffRegisterAddress",
                //         historical: { $filter: { input: "$historicalData", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } },
            
                //     }
                // },
                // {
                //     $project: {
                //         "historical": "$historical.Data",
                //         "Date": "$historical.Date",
                //         // "historicalPriviousData": "$historicalPrivious.Data",
                //         registerAddress: 1,
                //         AssetId: 1,
                //         Gateway:1,
                //         SlaveId:1,
                //         status: 1,
                //         DeviceTypeId: 1,
                //         registerId: 1,
                //         diffRegisterId: 1,
                //         diffRegisterAddress: 1,
                //         AssetName: 1,
            
                //     }
                // },
                // {
                //     "$addFields": {
                //         "historical": {
                //             "$reduce": {
                //                 "input": "$historical",
                //                 "initialValue": [],
                //                 "in": { "$concatArrays": ["$$value", "$$this"] }
                //             }
                //         },
                //     }
                // },
                // {
                //     "$addFields": {
                //         "DifferenceValue": [],
                //     }
                // },
                // {
                //     "$addFields": {
                //         "Name": '',
                //         "Total": 0,
                //     }
                // },
                // {
                //     $project: {
                //         Gateway:1,
                //         DifferenceValue:1,
                //         Name: 1,
                //         Total: 1,
                //         SlaveId:1,
                //         AssetId: 1,
                //         AssetName: 1,
                //         status: 1,
                //         Date:1,
                //         DeviceTypeId: 1,
                //         // registerId: 1,
                //         diffRegisterId: 1,
                //         // historical: {
                //         //     $filter:
                //         //     {
                //         //         input: "$historical",
                //         //         as: "h",
                //         //         cond: {
                //         //             $in: ['$$h._id', '$registerAddress']
                //         //         }
                //         //     }
                //         // },
                //         historicalDiff: {
                //             $filter:
                //             {
                //                 input: "$historical",
                //                 as: "h",
                //                 cond: {
                //                     $in: ['$$h._id', '$diffRegisterAddress']
                //                 }
                //             }
                //         },
            
                //     }
                // },
                // {
                //     '$lookup': {
                //         'from': 'parameters',
                //         'localField': 'diffRegisterId.Parameter',
                //         'foreignField': '_id',
                //         'as': 'parameterDataDiff'
                //     }
                // },
                // {
                //     '$project': {
                //         // DeviceTypeId: 1, 
                //         Date:1,
                //         "data.AssetName": '$AssetName',
                //         // 'data.historical': "$historical", 
                //         'data.AssetId': "$AssetId", 
                //         // 'data.parameter': "$parameterData.Name",
                //          'data.historicalDiff': "$historicalDiff", 
                //          'data.parameterDiff': "$parameterDataDiff.Name", 
                //           "data.Gateway":"$Gateway",
                //           "data.SlaveId":"$SlaveId",
                //           DifferenceValue:1,
                //           Name: "$AssetName",
                //           "_id" :"$AssetId" ,
                //           Total: 1,
                //     }
                // },
             
                // // {
                // //     $group: {
                // //         _id: "$DeviceTypeId",
                // //         res: { $push: "$data" },
                // //     }
                // // },
                // // //  { $unwind: '$data.historicalDiff' },
                // // { $sort: { "_id": 1 } },
                // // // {
                // // //     $group: {
                // // //         _id: "$DeviceTypeId",
                // // //         res: { $push: "$data" },
                // // //     }
                // // // },
                // // // {
                // // //     '$lookup': {
                // // //         'from': 'deviceTypes',
                // // //         'localField': '_id',
                // // //         'foreignField': 'DeviceTypeId',
                // // //         'as': 'deviceTypeData'
                // // //     }
                // // // },
                // // // { '$project': { res: 1, deviceTypeName: "$deviceTypeData.Name" } },
            ]) 
            if(getAllMeterData != undefined && getAllMeterData.length > 0){
                var data =  await historicalDataNew.aggregate([
                    {
                        '$match': {
                            'AssetId':  { $in: getAllMeterData[0].AssetIds },
                            'Date': { '$gte': fDate, '$lte': tDate },
                            // 'Data._id' : { $in : getAllMeterData[0].RegIds}
                        },
                    },
                    { $sort: { Date: 1 } },
                
                    { $unwind: '$Data' },
                    {
                      '$match': {
                          'Data._id':  { $in: getAllMeterData[0].RegIds},
                          
                      },
                  },
                    {
                        '$lookup': {
                            'from': 'allRegisters',
                            'localField': 'Data._id',
                            'foreignField': 'RegisterId',
                            'as': 'Data.registerDetails'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'parameters',
                            'localField': 'Data.registerDetails.Parameter',
                            'foreignField': '_id',
                            'as': 'Data.parameterDetails'
                        }
                    },      
                    {
                        '$project': {
                            '_id': "$_id",
                            'data.actValue': "$Data.ActValue",
                            'data.valueReceivedDate': "$Data.ValueReceivedDate",
                            'date': "$Date",               
                            'data.name': "$Data.parameterDetails.Name",
                            'assetId' : "$AssetId"                   
                        }
                    },
                       {
                      $group: {
                          _id: "$assetId",                
                          'actValue': { $push: "$data.actValue" },  
                        //   'Name': { $last: "$data.name" }, 
                          'valueReceivedDate' : { $push : "$data.valueReceivedDate"},          
                      }
                  },
                  {
                    '$lookup': {
                        'from': 'companyAssets',
                        'localField': '_id',
                        'foreignField': 'AssetId',
                        'as': 'AssetDetails'
                    }
                },
                { $project : { 
                    valueReceivedDate:1,
                    actValue: 1,
                    Name : "$AssetDetails.AssetName",
                    Date :[],
                    DifferenceValue : []
                
                }
                
                }
                 ]) 
                //  console.log(data)
                if(data != undefined && data.length > 0){
                 for(let i =new Date(fDate).getDate() ; i <= new Date(tDate).getDate() ; i ++){
                    let time = new Date(fDate);
                    let fDate11 = new Date(time).setHours(0, 0, 0, 0);
                    let tDate11 = new Date(time).setHours(23, 59, 59,0);
                    let fDate12 = new Date(fDate11).setDate(i); 
                    let tDate12 = new Date(tDate11).setDate(i); 
                    // console.log(i,new Date(fDate12),new Date(tDate12))
                    for(let i = 0 ; i < data.length;i++){
                                    let index =  _.findIndex(data[i].valueReceivedDate, obj => obj[0] < tDate12 && obj[0] >= fDate12)
                                    // console.log(index,index >=0 ? data[i].actValue[index][data[i].actValue[index].length-1] - data[i].actValue[index][0]:null)
                                    if(index >= 0){
                                    data[i].DifferenceValue.push(data[i].actValue[index][data[i].actValue[index].length-1] - data[i].actValue[index][0])
                                    data[i].Date.push(fDate12)
                                }else{
                                    data[i].DifferenceValue.push(null)
                                    data[i].Date.push(fDate12)
                                }
                                    // data[i].ActValue = 
                    }
                    
                 }
                 data.forEach((e) => { delete e.actValue; delete e.valueReceivedDate;});
                 for(let i = 0 ; i < data.length ; i ++){
                    data[i].Date.push('Total KWH Consumption')
                    data[i].DifferenceValue.push(data[i].DifferenceValue.reduce((accumulator, currentValue) => {
                        // Check if currentValue is not null before adding it to the accumulator
                        return currentValue !== null ? accumulator + currentValue : accumulator;
                      }, 0))
                 }
                }
                } 
            //  console.log(getAllMeterData,data)
        }
  
        if(data != undefined && data.length > 0){
            const arrays = data.map(obj => obj.DifferenceValue);
            // Using _.zipWith() to sum corresponding elements from each array
            const sumArray = _.zipWith(...arrays, (...DifferenceValue) => _.sum(DifferenceValue));
            // Creating the output array
            data = [...data, { Name: ["Total"], DifferenceValue: sumArray }];
        }
        // console.log(data)
        return {
            msg: 'successfully Find',
           data: data != undefined && data.length > 0 ? data : []
        }

    } catch (error) {
        console.log("error in insert alert Config", error);
        return Promise.reject(error);
    }
}
// getGroupDailyProductionData
async function getGroupDailyProductionData(req) {
    try {
        
        // console.log(new Date(Number(req.query.sDate)),new Date(Number(req.query.eDate)))
        const getAllAssetId = await mongoose.models.metergroup.find({ _id: req.query.id })
        if (getAllAssetId.length) {
            let fDate =  new Date(Number(req.query.fDate)).setHours(00, 00, 00, 00) 
            let tDate =   new Date(Number(req.query.tDate)).setHours(23, 59, 59, 00) 
            // console.log(new Date(fDate),new Date(tDate),getAllAssetId[0].AssetId )
            // const historicalDataNew = new historicalData(getAllAssetId[0].CompanyId);
            const getOee = await oeeTableData.aggregate([
                {
                    '$match': {
                        'AssetId':{ $in: getAllAssetId[0].AssetId },
                        'Date': { '$gte': fDate, '$lte': tDate },
                    },
                },
                {
                    '$sort': { 'Date': -1 }
                },
                    {
                    '$lookup': {
                        'from': 'companyAssets',
                        'localField': 'AssetId',
                        'foreignField': 'AssetId',
                        'as': 'AssetDetails'
                    }
                },
                { $unwind: '$AssetDetails' },
                        {
                    $project: {
                        "_id" : 0,
                        "data.AssetId": "$AssetDetails.AssetId",
                        "AssetName": "$AssetDetails.AssetName",
                        "data.BreakDownTime":"$BreakDownTime",
                        "data.Date":"$Date",
                        "data.MachineJobPerMinute":"$MachineJobPerMinute",
                        "data.PlannedDownTime":"$PlannedDownTime",
                        "data.RejectJob":"$RejectJob",
                        "data.TotalProduction":"$TotalProduction",
                        "data.TotalRunTime":"$TotalRunTime",
                        "data.AvgRpm":"$AvgRpm"

                        // Date: 1,
                        // "RegId": "$Data._id",
                        // Last: { $arrayElemAt: ["$Data.ActValue", -1] },
                        // First: { $arrayElemAt: ["$Data.ActValue", 0] }
                        // 'data.Name': "$parameterDetails.Name"
    
                    }
                },
           
                     {
                    $group: {
                        _id: "$AssetName",
                        data: {
                            $push: "$data"
                        },
                        // Date: {
                        //     $push: "$Date"
                        // }
                    }
                }
            ])         
            if (getOee.length > 0) {
                totalAvailableTime = 1335;
                for (let j = 0; j < getOee.length; j++) {
                for (let i = 0; i < getOee[j].data.length; i++) {
                    getOee[j].data[i].Quality = ((getOee[j].data[i].TotalProduction - (getOee[j].data.length > 0 ? getOee[j].data[i].RejectJob : 0)) / getOee[j].data[i].TotalProduction) * 100
    
                    getOee[j].data[i].Availability = ((totalAvailableTime - (getOee[j].data.length > 0 ? getOee[j].data[i].BreakDownTime : 0)) / totalAvailableTime) * 100
    // "ZODA4i"
                    if(getOee[j].data[i].AssetId == "fjkjjl98LM" || getOee[j].data[i].AssetId == "ZODA4i" ||  getOee[j].data[i].AssetId == "S8AbcVX" || getOee[j].data[i].AssetId == "UZ5Xu2f"){
                        speedEfficiency = getOee[j].data[i].AvgRpm/1100 
                    }else{
                    speedEfficiency = getOee[j].data[i].TotalProduction / (getOee[j].data[i].TotalRunTime * (getOee[j].data.length > 0 ? getOee[j].data[i].MachineJobPerMinute : 80))
                    }
                    machineRunEfficiency = getOee[j].data[i].TotalRunTime / (totalAvailableTime - ((getOee[j].data.length > 0 ? getOee[j].data[i].BreakDownTime : 0) + (getOee[j].data.length > 0 ? getOee[j].data[i].PlannedDownTime : 0)))
    
                    getOee[j].data[i].Performance = (speedEfficiency * machineRunEfficiency) * 100
                    getOee[j].data[i].OEE = (getOee[j].data[i].Performance / 100) * (getOee[j].data[i].Quality / 100) * (getOee[j].data[i].Availability / 100) * 100
                }
                }
            } 
              result = {"Total Production" : [],"OEE Meter" :[] ,Parameter : [],"Total Run Time":[]}
            for (let i = 0; i < getOee.length; i++) {
                const Production = {
                    _id: getOee[i]._id,
                    ActValue: getOee[i].data.map(obj => obj.TotalProduction),
                    Date: getOee[i].data.map(obj => obj.Date)
                };
                result["Total Production"].push(Production)

                const OEE = {
                    _id: getOee[i]._id,
                    ActValue: getOee[i].data.map(obj => obj.OEE),
                    Date: getOee[i].data.map(obj => obj.Date)
                };
                result["OEE Meter"].push(OEE)
            

                const Performance = {
                    _id: "Performance("+getOee[i]._id+")",
                    ActValue: getOee[i].data.map(obj => obj.Performance),
                    Date: getOee[i].data.map(obj => obj.Date)
                };              
                result.Parameter.push(Performance)

                const Availability = {
                    _id: "Availability("+getOee[i]._id+")",
                    ActValue: getOee[i].data.map(obj => obj.Availability),
                    Date: getOee[i].data.map(obj => obj.Date)
                };              
                result.Parameter.push(Availability)

                const Quality = {
                    _id: "Quality("+getOee[i]._id+")",
                    ActValue: getOee[i].data.map(obj => obj.Quality),
                    Date: getOee[i].data.map(obj => obj.Date)
                };              
                result.Parameter.push(Quality)

                const runTime = {
                    _id: getOee[i]._id,
                    ActValue: getOee[i].data.map(obj => obj.TotalRunTime),
                    Date: getOee[i].data.map(obj => obj.Date)
                };              
                result["Total Run Time"].push(runTime)
                
                // console.log(getOee[i],performance)
               
                // performance.ActValue.push(getOee[i].Performance)
                // performance.Date.push(getOee[i].Date)
                // availability.ActValue.push(getOee[i].Availability)
                // availability.Date.push(getOee[i].Date)
                // oee.ActValue.push(getOee[i].OEE)
                // oee.Date.push(getOee[i].Date)
                // quality.ActValue.push(getOee[i].Quality)
                // quality.Date.push(getOee[i].Date)
                // totalProduction.ActValue.push(getOee[i].TotalProduction)
                // totalProduction.Date.push(getOee[i].Date)
                // totalRunTime.ActValue.push(getOee[i].TotalRunTime)
                // totalRunTime.Date.push(getOee[i].Date)
    
            }
            // getData = await historicalDataNew.aggregate([
            //     {
            //         '$match': {
            //             'AssetId': { $in: getAllAssetId[0].AssetId },
            //             'Date': { '$gte': sDate, '$lte': eDate },
            //             // 'Data._id': 1344 
    
            //         },
            //     },
            //     { $unwind: '$Data' },
            //     {
            //         '$match': {
            //             'Data._id': { $in: [1344,1419,1435] }
            //         }
            //     },
            //     { $sort: { 'Date': -1 } },
            //     {
            //         '$lookup': {
            //             'from': 'companyAssets',
            //             'localField': 'AssetId',
            //             'foreignField': 'AssetId',
            //             'as': 'AssetDetails'
            //         }
            //     },
            //     {
            //         $project: {
            //             AssetId: 1,
            //             AssetName : "$AssetDetails.AssetName",
            //             Date: 1,
            //             "RegId": "$Data._id",
            //             Last: { $arrayElemAt: ["$Data.ActValue", -1] },
            //             First: { $arrayElemAt: ["$Data.ActValue", 0] }
            //             // 'data.Name': "$parameterDetails.Name"
    
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'allRegisters',
            //             'localField': 'RegId',
            //             'foreignField': 'RegisterId',
            //             'as': 'registerDetails'
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'parameters',
            //             'localField': 'registerDetails.Parameter',
            //             'foreignField': '_id',
            //             'as': 'parameterDetails'
            //         }
            //     },
            //     // // { $addFields: { last : { $last: "$ActValue" } } }
            //     {
            //         $project: {
            //             AssetId: 1,
            //             AssetName:1,
            //             Date: 1,
            //             Last: 1,
            //             First: 1,
            //             ActValue: { $subtract: ["$Last", "$First"] },
            //             "ParameterName": "$parameterDetails.Name"
            //             // 'data.Name': "$parameterDetails.Name"
    
            //         }
            //     },
            //     { $unwind: '$ParameterName' },
            //     { $unwind: '$AssetName' },
            //     { $sort: { 'Date': -1 } },
            // //        {
            // //     '$lookup': {
            // //         'from': 'companyAssets',
            // //         'localField': 'AssetId',
            // //         'foreignField': 'AssetId',
            // //         'as': 'AssetDetails'
            // //     }
            // // },
            //     {
            //         $group: {
            //             _id: "$AssetName",
            //             ActValue: {
            //                 $push: "$ActValue"
            //             },
            //             Date: {
            //                 $push: "$Date"
            //             }
            //         }
            //     }
            // ])
            //  console.log(getData)
            //  console.log("getData")
            // var allGroupData = await allMeterData.aggregate([
            //     {
            //         $match: {
            //             AssetId: { $in: getAllAssetId[0].AssetId },
            //             Date: {
            //                 '$gt': sDate,
            //                 '$lt': eDate
            //             }
            //         }
            //     },
            //     {
            //         $sort: { "Date": 1 }
            //     },
            //     {
            //         $group: {
            //             _id: "$AssetId",
            //             Dates: {
            //                 $push: "$Date"
            //             },
            //             Values: {
            //                 $push: "$DifferenceValue"
            //             }
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "companyAssets",
            //             localField: "_id",
            //             foreignField: "AssetId",
            //             as: "Name"
            //         }
            //     },
            //     {
            //         $unwind: "$Name"
            //     },
            //     {
            //         $project: {
            //             Dates: 1,
            //             Values: 1,
            //             Name: "$Name.AssetName",
            //             Total: { $sum: "$Values" }
            //         }
            //     }
            // ])
            result1 =   Object.entries(result).map(([name, data]) => ({ name, data }))
            result1.forEach(obj => {
                obj.data1 = obj.data.map(item => ({
                  _id: item._id,
                  Value: item.ActValue.map((value, index) => [item.Date[index], value])
                }));
              });
        }


          
        //   console.log(result1);
        return {
            msg: 'successfully Find',
            data: result1.length > 0 ? result1 : []

        }

    } catch (error) {
        console.log("error in insert alert Config", error);
        return Promise.reject(error);
    }
}
module.exports = {
    getAllMeterDate,
    getGroupDailyProductionData,
    getAllGroupsData
}