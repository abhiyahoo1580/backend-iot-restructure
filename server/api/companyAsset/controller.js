const assetData = require('./model');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var _ = require('lodash');
const historicalData = require('../historical/model')
const ShiftData = require('../shifts/model');
const machineTargetData = require('../targetMachine/model');
const { ObjectId } = require("mongodb");


async function getLcdView(req) {
    try {
        let time = Number(req.query.date);
        let fDate = new Date(time).setHours(00, 00, 00, 00);
        let fDate7 = new Date(time).setHours(07, 00, 00, 00);
        let tDate = new Date(time).setHours(23, 59, 59, 00);

        timestamp = new Date(time).setDate(new Date(time).getDate() - 1)
        let fDatePDay = new Date(timestamp).setHours(00, 00, 00, 00);
        let fDatePDay7 = new Date(timestamp).setHours(07, 00, 00, 00);
        let tDatePDay = new Date(timestamp).setHours(23, 59, 59, 00);
        // console.log(new Date(fDate), new Date(tDate),new Date(fDatePDay), new Date(tDatePDay),new Date(fDate7), new Date(fDatePDay7),)
        const getAllAssetLcdView = await assetData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'Gateway': { $not: { $eq: null } }
                }
            },
            {
                '$lookup': {
                    'from': 'lcdcofigs',
                    'localField': 'CompanyId',
                    'foreignField': 'CompanyId',
                    'as': 'lcdConfigData'
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
                    AssetId: 1,
                    AssetName: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    Gateway  : 1,
                    SlaveId : 1,
                    status: 1,
                    CompanyId: 1,
                    lcdconfig: { $filter: { input: "$lcdConfigData", as: "u", cond: { $eq: ["$$u.DeviceTypeId", "$DeviceTypeId"] } } },
                    lcddiffconfig: { $filter: { input: "$lcdDiffConfigData", as: "u", cond: { $eq: ["$$u.DeviceType", "$DeviceTypeId"] } } }
                }
            },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'lcdconfig.ParameterId',
                    'foreignField': 'Parameter',
                    'as': 'registerData'
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
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    Gateway  : 1,
                    SlaveId : 1,
                    lcdconfig: 1,
                    lcddiffconfig: 1,
                    CompanyId: 1,
                    registerAddress: { $filter: { input: "$registerData", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } },
                    diffRegisterAddress: { $filter: { input: "$registerDataDiff", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } }
                }
            },

            {
                $lookup:
                {
                    from: "historicalMeterValues" + Number(req.query.companyId),
                    pipeline: [
                        {
                            $match: {
                                'Date': { '$gte': fDate, '$lte': tDate },
                            },
                        },
                    ],
                    as: "historicalData"
                }
            }
            ,
            {
                $lookup:
                {
                    from: "historicalMeterValues" + Number(req.query.companyId),
                    pipeline: [
                        {
                            $match: {
                                'Date': { '$gte': fDatePDay, '$lte': tDatePDay },
                            },
                        },
                    ],
                    as: "historicalDataPriviousDay"
                }
            },
            {
                $project: {
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    Gateway  : 1,
                    SlaveId : 1,
                    registerAddress: "$registerAddress.RegisterId",
                    registerId: "$registerAddress",
                    diffRegisterAddress: "$diffRegisterAddress.RegisterId",
                    diffRegisterId: "$diffRegisterAddress",
                    historical: { $filter: { input: "$historicalData", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } },
                    historicalPrivious: { $filter: { input: "$historicalDataPriviousDay", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } }
                }
            },
            {
                $project: {
                    "historical": "$historical.Data",
                    "historicalPriviousData": "$historicalPrivious.Data",
                    registerAddress: 1,
                    AssetId: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    diffRegisterAddress: 1,
                    AssetName: 1,
                    Gateway  : 1,
                    SlaveId : 1,

                }
            },
            {
                "$addFields": {
                    "historical": {
                        "$reduce": {
                            "input": "$historical",
                            "initialValue": [],
                            "in": { "$concatArrays": ["$$value", "$$this"] }
                        }
                    },
                }
            },
            {
                "$addFields": {
                    "historicalPriviousData": {
                        "$reduce": {
                            "input": "$historicalPriviousData",
                            "initialValue": [],
                            "in": { "$concatArrays": ["$$value", "$$this"] }
                        }
                    },
                }
            },
            {
                $project: {
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    Gateway  : 1,
                    SlaveId : 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    historical: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$registerAddress']
                            }
                        }
                    },
                    historicalTodayData: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$diffRegisterAddress']
                            }
                        }
                    },
                    historicalPriviousData: {
                        $filter:
                        {
                            input: "$historicalPriviousData",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$diffRegisterAddress']
                            }
                        }
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterData'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'diffRegisterId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterDataDiff'
                }
            },

            {
                '$project': {
                    DeviceTypeId: 1,
                     "data.AssetName": '$AssetName',
                     "data.Gateway": '$Gateway',
                     "data.SlaveId": '$SlaveId',
                      "data.Status": '$status',
                    'data.historical': "$historical", 
                    'data.AssetId': "$AssetId", 
                    'data.parameter': "$parameterData", 
                    'data.historicalTodayData': "$historicalTodayData",
                     'data.historicalPriviousData': "$historicalPriviousData", 
                     'data.parameterDiff': "$parameterDataDiff.Name",
                     "data.diffRegisterId" : "$diffRegisterId",
                     "data.registerId" : "$registerId"
                }
            },
            {
                $group: {
                    _id: "$DeviceTypeId",
                    res: { $push: "$data" },
                }
            },
            { $sort: { "_id": 1 } },
            {
                '$lookup': {
                    'from': 'deviceTypes',
                    'localField': '_id',
                    'foreignField': 'DeviceTypeId',
                    'as': 'deviceTypeData'
                }
            },
            { '$project': { res: 1, deviceTypeName: "$deviceTypeData.Name" } },


        ])
        pf = [4,16,54,55,56,312]
        // console.log(getAllAssetLcdView)
        getAllAssetLcdView.forEach((element, i) => {
            // console.log(element)
            element.res.forEach((ele, k) => {
                // console.log(ele)
                ele.parameter.forEach((element1, j) => {
                    // console.log(element1)
                    const RegisterAdderess = ele.registerId.filter(reg => reg.Parameter == element1._id);
                    if(RegisterAdderess.length > 0){
                        // console.log(RegisterAdderess,ele.historical)
                        // const historical = ele.historical.filter(reg => reg._id ==  RegisterAdderess[0].RegisterId);
                        // console.log(historical[0].ValueReceivedDate.length)
                        const historical = ele.historical.filter(reg => RegisterAdderess.some(objB => objB.RegisterId === reg._id ));
                        // console.log(historical[0].ValueReceivedDate.length)
                        // console.log(historical1)
                        getAllAssetLcdView[i].res[k].valueReceivedDate = historical.length > 0 ? historical[0].ValueReceivedDate[historical[0].ValueReceivedDate.length - 1] : '-'
                        // console.log(historical[0].ActValue[historical[0].ActValue.length - 1])
                        getAllAssetLcdView[i].res[k].parameter[j] = {
                            parameter: element1.Name,
                            ActValue: historical.length > 0 ?
                             pf.indexOf(element1._id) != -1 && historical[0].ActValue[historical[0].ActValue.length - 1] < 0 ?
                              Math.abs(  historical[0].ActValue[historical[0].ActValue.length - 1] ).toFixed(2)+'(Le)' :
                              historical[0].ActValue[historical[0].ActValue.length - 1] != null ?  historical[0].ActValue[historical[0].ActValue.length - 1].toFixed(2) : '-' : '-'
    
                        }
                    }

                })
                ele.parameterDiff.forEach((element1, j) => {
                    if (ele.historicalTodayData.length > 0 && ele.historicalPriviousData.length > 0) {

                        // console.log(
                        //     _.findIndex(ele.historicalTodayData[j].ValueReceivedDate, (e) => {return e > fDate7}, 0)
                        //     ,

                        //     _.findIndex(ele.historicalPriviousData[j].ValueReceivedDate, (e) => {return e > fDatePDay7}, 0)
                        //     )
                        getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                            parameter: element1,
                            value: (ele.historicalTodayData[j].ActValue[_.findIndex(ele.historicalTodayData[j].ValueReceivedDate, (e) => { return e > fDate7 }, 0)==0?0:_.findIndex(ele.historicalTodayData[j].ValueReceivedDate, (e) => { return e > fDate7 }, 0) - 1] - ele.historicalPriviousData[j].ActValue[_.findIndex(ele.historicalPriviousData[j].ValueReceivedDate, (e) => { return e > fDatePDay7 }, 0)])
                        }
                    } else {
                        getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                            parameter: element1,
                            value: '-'
                        }
                    }
                })
            });
        });

        // getAllAssetLcdView.forEach(v => v.res.forEach((e) => { delete e.historical; delete e.historicalPriviousData; delete e.historicalTodayData }));
        // console.log(getAllAssetLcdView)
        return {
            msg: 'successfully Find',
            data: getAllAssetLcdView
        }
    } catch (error) {
        console.log('error occure in get subject', error);
        return Promise.reject('error occure in get subject')
    }
}

// getLcdViewForSheela

async function getLcdViewForSheela(req) {
    try {
        let time = Number(req.query.date);
        let fDate = new Date(time).setHours(00, 00, 00, 00);
        let tDate = new Date(time).setHours(23, 59, 59, 00);
        let fDate1 = new Date(fDate).setDate(1); 
        let tDate1 = new Date(tDate).setDate(1); 
        // console.log(new Date(fDate), new Date(tDate),new Date(fDate1),new Date(tDate1),  )
    const getAllAssetLcdView = await assetData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'Gateway': { $not: { $eq: null } }
                }
            },
            {
                '$lookup': {
                    'from': 'lcdcofigs',
                    'localField': 'CompanyId',
                    'foreignField': 'CompanyId',
                    'as': 'lcdConfigData'
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
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    status: 1,
                    CompanyId: 1,
                    lcdconfig: { $filter: { input: "$lcdConfigData", as: "u", cond: { $eq: ["$$u.DeviceTypeId", "$DeviceTypeId"] } } },
                    lcddiffconfig: { $filter: { input: "$lcdDiffConfigData", as: "u", cond: { $eq: ["$$u.DeviceType", "$DeviceTypeId"] } } }
                }
            },

            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'lcdconfig.ParameterId',
                    'foreignField': 'Parameter',
                    'as': 'registerData'
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
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    lcdconfig: 1,
                    lcddiffconfig: 1,
                    CompanyId: 1,
                    registerAddress: { $filter: { input: "$registerData", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } },
                    diffRegisterAddress: { $filter: { input: "$registerDataDiff", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } }
                }
            },

            {
                $lookup:
                {
                    from: "historicalMeterValues" + Number(req.query.companyId),
                    pipeline: [
                        {
                            $match: {
                                'Date': { '$gte': fDate, '$lte': tDate },
                            },
                        },
                    ],
                    as: "historicalData"
                }
            },
            {
                $project: {
                    AssetId: 1,
                    Gateway:1,
                    SlaveId:1,
                    AssetName: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerAddress: "$registerAddress.RegisterId",
                    registerId: "$registerAddress",
                    diffRegisterAddress: "$diffRegisterAddress.RegisterId",
                    diffRegisterId: "$diffRegisterAddress",
                    historical: { $filter: { input: "$historicalData", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } },

                }
            },
            {
                $project: {
                    "historical": "$historical.Data",
                    // "historicalPriviousData": "$historicalPrivious.Data",
                    registerAddress: 1,
                    AssetId: 1,
                    Gateway:1,
                    SlaveId:1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    diffRegisterAddress: 1,
                    AssetName: 1,

                }
            },
            {
                "$addFields": {
                    "historical": {
                        "$reduce": {
                            "input": "$historical",
                            "initialValue": [],
                            "in": { "$concatArrays": ["$$value", "$$this"] }
                        }
                    },
                }
            },
            {
                $project: {
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    historical: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$registerAddress']
                            }
                        }
                    },
                    historicalDiff: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$diffRegisterAddress']
                            }
                        }
                    },

                }
            },


            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterData'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'diffRegisterId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterDataDiff'
                }
            },

            {
                '$project': {
                    DeviceTypeId: 1, 
                    "data.AssetName": '$AssetName', "data.Status": '$status',
                    'data.historical': "$historical", 'data.AssetId': "$AssetId", 'data.parameter': "$parameterData", 'data.historicalDiff': "$historicalDiff", 'data.parameterDiff': "$parameterDataDiff.Name",  "data.Gateway":"$Gateway","data.SlaveId":"$SlaveId",
                    "data.diffRegisterId" : "$diffRegisterId",
                    "data.registerId" : "$registerId"
                    
                }
            },
            {
                $group: {
                    _id: "$DeviceTypeId",
                    res: { $push: "$data" },
                }
            },
            { $sort: { "_id": 1 } },
            {
                '$lookup': {
                    'from': 'deviceTypes',
                    'localField': '_id',
                    'foreignField': 'DeviceTypeId',
                    'as': 'deviceTypeData'
                }
            },
            { '$project': { res: 1, deviceTypeName: "$deviceTypeData.Name" } },
        ])
// console.log(getAllAssetLcdView)
        getAllAssetLcdView.forEach((element, i) => {
            // console.log(element)
            element.res.forEach(async(ele, k) => {
                // console.log(ele)
              


                ele.parameter.forEach((element1, j) => {
                    // console.log(element1)
                    const RegisterAdderess = ele.registerId.filter(reg => reg.Parameter == element1._id);
                    if(RegisterAdderess.length > 0){
                        // console.log(RegisterAdderess)
                        const historical = ele.historical.filter(reg => reg._id == RegisterAdderess[0].RegisterId);
                        // console.log(historical[0].ValueReceivedDate.length)
                        getAllAssetLcdView[i].res[k].valueReceivedDate = historical.length > 0 ? historical[0].ValueReceivedDate[historical[0].ValueReceivedDate.length - 1] : '-'
                        // console.log(historical[0].ActValue[historical[0].ActValue.length - 1])
                        getAllAssetLcdView[i].res[k].parameter[j] = {
                            parameter: element1.Name,
                            ActValue: historical.length > 0 ? historical[0].ActValue[historical[0].ActValue.length - 1]  :  '-'
    
                        }
                    }
                    // console.log(ele)
                    // getAllAssetLcdView[i].res[k].valueReceivedDate = ele.historical.length > 0 ? ele.historical[0].ValueReceivedDate[ele.historical[0].ValueReceivedDate.length - 1] : '-'
                    // getAllAssetLcdView[i].res[k].parameter[j] = {
                    //     parameter: element1,
                    //     ActValue: ele.historical.length > 0 ? ele.historical[j].ActValue[ele.historical[j].ActValue.length - 1] : '-'

                    // }
                })
                ele.parameterDiff.forEach(async(element1, j) => {
                    if(ele.historicalDiff.length > 0 ){  
                        
                        
                    getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                        parameter: element1 ,
                     value : (ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]-ele.historicalDiff[j].ActValue[0]),
                     FirstValue: ele.historicalDiff[j].ActValue[0],
                     LastValue : ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]
                    }
                
                getAllAssetLcdView[i].res[k].parameterDiffMonth = []
                // getAllAssetLcdView[i].res[k].parameterDiffMonth[j] = {
                //     parameter: element1 ,
                //      value : (ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]-getData[0].First),
                //      FirstValue: getData[0].First,
                //      LastValue : ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]
                //     }
                   }else{
                    getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                        parameter: element1 ,
                    value : '-'
                    }
                   }
                   })
            });
        });

        // 


        for(let i = 0 ; i < getAllAssetLcdView.length;i++){
            for(let j = 0 ; j < getAllAssetLcdView[i].res.length;j++){
                // console.log(i,j,getAllAssetLcdView[i].res[j])
                
                var historicalDataNew = new historicalData(req.query.companyId);
               
                getData = await historicalDataNew.aggregate([
                    {
                        '$match': {
                            'AssetId': getAllAssetLcdView[i].res[j].AssetId,
                            'Date': { '$gte': fDate1, '$lte': tDate},
                            // 'Data._id': 1344 
                
                        },
                    },
                    { $unwind: '$Data' },
                    {'$match': {
                      'Data._id': { $in: [1344,1419,1435]}
                    }
                },
                {$sort : {'Date' : 1}},
                {$limit : 1},
                {
                    $project: {
                        AssetId : 1,
                        Date : 1,
                        "RegId" : "$Data._id", 
                        // Last: { $arrayElemAt: [ "$Data.ActValue", -1 ] },
                        First: { $arrayElemAt: [ "$Data.ActValue", 0 ] }
                        // 'data.Name': "$parameterDetails.Name"
                        
                    }
                },
                
                ])
                // console.log(getData)
            getAllAssetLcdView[i].res[j].parameterDiffMonth = []
            const getShift = await ShiftData.aggregate([
                {
               '$match': {
                   'companyId': Number(req.query.companyId),
                   
               },
           }, 
           {
           '$unwind' : "$shifts"
           } 
       ])
    //    console.log(getShift)
            if(getData.length>0){
                getAllAssetLcdView[i].res[j].parameterDiffMonth[0] =   {
                        parameter: getAllAssetLcdView[i].res[j].parameterDiff[0].parameter ,
                         value : (getAllAssetLcdView[i].res[j].parameterDiff[0].LastValue-getData[0].First),
                         FirstValue: getData[0].First,
                         LastValue :getAllAssetLcdView[i].res[j].parameterDiff[0].LastValue
                        }
            }else{
                getAllAssetLcdView[i].res[j].parameterDiffMonth[0] =  {
                    parameter: getAllAssetLcdView[i].res[j].parameterDiff.length > 0 ?getAllAssetLcdView[i].res[j].parameterDiff[0].parameter  : '-',
                value : '-'
                }
            }
            getAllAssetLcdView[i].res[j].parameterDiffShift = []
            if(getAllAssetLcdView[i].res[j].historicalDiff.length>0 &&getShift.length > 0){
              for(let z= 0 ; z < getShift.length ; z++){
                let object = { parameter : String , value : Number,parameterName : "TOTAL LENGTH"}
                object.parameter = getShift[z].shifts.name                
                object.information =getShift[z].shifts
                // console.log(getShift[z].shifts)
                fDate11 = new Date(time).setHours(getShift[z].shifts.start.hour, getShift[z].shifts.start.min, 00, 00);
                tDate11 = new Date(time).setHours(getShift[z].shifts.end.hour, getShift[z].shifts.end.min, 00, 00);
                if(fDate11>tDate11){
                    tDate11 =  new Date(tDate11).setDate(new Date(time).getDate()+1); 
                 }
                //  console.log(getAllAssetLcdView[i].res[j].historical[0])
                 ValueReceivedDate = getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.filter((x,index) => fDate11 <= x  && x < tDate11)
                //  console.log(new Date(fDate11),new Date(tDate11))
                 
                 if(getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0]) >= 0 &&getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1]) >= 0){
                    object.value =  getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1])]-getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0])]
                    object.LastValue =  getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1])]
                    object.FirstValue = getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0])]
                    // console.log(Production)
                }else{
                    object.value =  0
                    object.LastValue =  0
                    object.FirstValue =  0
                    // console.log(Production)
                }
                getAllAssetLcdView[i].res[j].parameterDiffShift.push(object)
               
              }
            }
            }   
        }

        getAllAssetLcdView.forEach(v => v.res.forEach((e) => {delete e.historical,delete e.historicalDiff} ));
        // console.log(getAllAssetLcdView)

        return {
            msg: 'successfully Find',
            data: getAllAssetLcdView
        }
    } catch (error) {
        console.log('error occure in get subject', error);
        return Promise.reject('error occure in get subject')
    }
}

// getLcdViewForPai
async function getLcdViewForPai(req) {
    try {
        let time = Number(req.query.date);
        let fDate = new Date(time).setHours(0, 0, 0, 0);
        let tDate = new Date(time).setHours(23, 59, 59, 0);
        let fDate1 = new Date(fDate).setDate(1); 
        let tDate1 = new Date(tDate).setDate(1); 
        // console.log(new Date(fDate), new Date(tDate),new Date(fDate1),new Date(tDate1), fDate,tDate )
    const getAllAssetLcdView = await assetData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'Gateway': { $not: { $eq: null } }
                }
            },
            {
                '$lookup': {
                    'from': 'lcdcofigs',
                    'localField': 'CompanyId',
                    'foreignField': 'CompanyId',
                    'as': 'lcdConfigData'
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
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    status: 1,
                    CompanyId: 1,
                    lcdconfig: { $filter: { input: "$lcdConfigData", as: "u", cond: { $eq: ["$$u.DeviceTypeId", "$DeviceTypeId"] } } },
                    lcddiffconfig: { $filter: { input: "$lcdDiffConfigData", as: "u", cond: { $eq: ["$$u.DeviceType", "$DeviceTypeId"] } } }
                }
            },

            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'lcdconfig.ParameterId',
                    'foreignField': 'Parameter',
                    'as': 'registerData'
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
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    AssetTypeId: 1,
                    DeviceTypeId: 1,
                    lcdconfig: 1,
                    lcddiffconfig: 1,
                    CompanyId: 1,
                    registerAddress: { $filter: { input: "$registerData", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } },
                    diffRegisterAddress: { $filter: { input: "$registerDataDiff", as: "p", cond: { $eq: ["$$p.AssetTypeId", "$AssetTypeId"] } } }
                }
            },

            {
                $lookup:
                {
                    from: "historicalMeterValues" + Number(req.query.companyId),
                    pipeline: [
                        {
                            $match: {
                                'Date': { '$gte': fDate, '$lte': tDate },
                            },
                        },
                    ],
                    as: "historicalData"
                }
            },
            {
                $project: {
                    AssetId: 1,
                    Gateway:1,
                    SlaveId:1,
                    AssetName: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerAddress: "$registerAddress.RegisterId",
                    registerId: "$registerAddress",
                    diffRegisterAddress: "$diffRegisterAddress.RegisterId",
                    diffRegisterId: "$diffRegisterAddress",
                    historical: { $filter: { input: "$historicalData", as: "h", cond: { $eq: ["$$h.AssetId", "$AssetId"] } } },

                }
            },
            {
                $project: {
                    "historical": "$historical.Data",
                    // "historicalPriviousData": "$historicalPrivious.Data",
                    registerAddress: 1,
                    AssetId: 1,
                    Gateway:1,
                    SlaveId:1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    diffRegisterAddress: 1,
                    AssetName: 1,

                }
            },
            {
                "$addFields": {
                    "historical": {
                        "$reduce": {
                            "input": "$historical",
                            "initialValue": [],
                            "in": { "$concatArrays": ["$$value", "$$this"] }
                        }
                    },
                }
            },
            {
                $project: {
                    Gateway:1,
                    SlaveId:1,
                    AssetId: 1,
                    AssetName: 1,
                    status: 1,
                    DeviceTypeId: 1,
                    registerId: 1,
                    diffRegisterId: 1,
                    historical: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$registerAddress']
                            }
                        }
                    },
                    historicalDiff: {
                        $filter:
                        {
                            input: "$historical",
                            as: "h",
                            cond: {
                                $in: ['$$h._id', '$diffRegisterAddress']
                            }
                        }
                    },

                }
            },


            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'registerId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterData'
                }
            },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'diffRegisterId.Parameter',
                    'foreignField': '_id',
                    'as': 'parameterDataDiff'
                }
            },

            {
                '$project': {
                    DeviceTypeId: 1, 
                    "data.AssetName": '$AssetName', "data.Status": '$status',
                    'data.historical': "$historical", 'data.AssetId': "$AssetId", 'data.parameter': "$parameterData", 'data.historicalDiff': "$historicalDiff", 'data.parameterDiff': "$parameterDataDiff.Name",  "data.Gateway":"$Gateway","data.SlaveId":"$SlaveId",
                    "data.diffRegisterId" : "$diffRegisterId",
                    "data.registerId" : "$registerId"
                    
                }
            },
            {
                $group: {
                    _id: "$DeviceTypeId",
                    res: { $push: "$data" },
                }
            },
            { $sort: { "_id": 1 } },
            {
                '$lookup': {
                    'from': 'deviceTypes',
                    'localField': '_id',
                    'foreignField': 'DeviceTypeId',
                    'as': 'deviceTypeData'
                }
            },
            { '$project': { res: 1, deviceTypeName: "$deviceTypeData.Name" } },
        ])
// console.log(getAllAssetLcdView)
        getAllAssetLcdView.forEach((element, i) => {
            // console.log(element)
            element.res.forEach(async(ele, k) => {
                // console.log(ele)
              


                ele.parameter.forEach((element1, j) => {
                    // console.log(element1)
                    const RegisterAdderess = ele.registerId.filter(reg => reg.Parameter == element1._id);
                    if(RegisterAdderess.length > 0){
                        // console.log(RegisterAdderess)
                        const historical = ele.historical.filter(reg => reg._id == RegisterAdderess[0].RegisterId);
                        // console.log(historical[0].ValueReceivedDate.length)
                        getAllAssetLcdView[i].res[k].valueReceivedDate = historical.length > 0 ? historical[0].ValueReceivedDate[historical[0].ValueReceivedDate.length - 1] : '-'
                        // console.log(historical[0].ActValue[historical[0].ActValue.length - 1])
                        getAllAssetLcdView[i].res[k].parameter[j] = {
                            parameter: element1.Name,
                            ActValue: historical.length > 0 ? historical[0].ActValue[historical[0].ActValue.length - 1]  :  '-'
    
                        }
                    }
                    // console.log(ele)
                    // getAllAssetLcdView[i].res[k].valueReceivedDate = ele.historical.length > 0 ? ele.historical[0].ValueReceivedDate[ele.historical[0].ValueReceivedDate.length - 1] : '-'
                    // getAllAssetLcdView[i].res[k].parameter[j] = {
                    //     parameter: element1,
                    //     ActValue: ele.historical.length > 0 ? ele.historical[j].ActValue[ele.historical[j].ActValue.length - 1] : '-'

                    // }
                })
                ele.parameterDiff.forEach(async(element1, j) => {
                    if(ele.historicalDiff.length > 0 ){  
                        
                        
                    getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                        parameter: element1 ,
                     value : (ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]-ele.historicalDiff[j].ActValue[0]),
                     FirstValue: ele.historicalDiff[j].ActValue[0],
                     LastValue : ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]
                    }
                
                getAllAssetLcdView[i].res[k].parameterDiffMonth = []
                // getAllAssetLcdView[i].res[k].parameterDiffMonth[j] = {
                //     parameter: element1 ,
                //      value : (ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]-getData[0].First),
                //      FirstValue: getData[0].First,
                //      LastValue : ele.historicalDiff[j].ActValue[ele.historicalDiff[j].ActValue.length-1 ]
                //     }
                   }else{
                    getAllAssetLcdView[i].res[k].parameterDiff[j] = {
                        parameter: element1 ,
                    value : '-'
                    }
                   }
                   })
            });
        });

        // 


        for(let i = 0 ; i < getAllAssetLcdView.length;i++){
            for(let j = 0 ; j < getAllAssetLcdView[i].res.length;j++){
                // console.log(i,j,getAllAssetLcdView[i].res[j])
                
                var historicalDataNew = new historicalData(req.query.companyId);
               
                getData = await historicalDataNew.aggregate([
                    {
                        '$match': {
                            'AssetId': getAllAssetLcdView[i].res[j].AssetId,
                            'Date': { '$gte': fDate1, '$lte': tDate},
                            // 'Data._id': 1344 
                
                        },
                    },
                    { $unwind: '$Data' },
                    {'$match': {
                      'Data._id': { $in: [1344,1419,1435,1458]}
                    }
                },
                {$sort : {'Date' : 1}},
                {$limit : 1},
                {
                    $project: {
                        AssetId : 1,
                        Date : 1,
                        "RegId" : "$Data._id", 
                        // Last: { $arrayElemAt: [ "$Data.ActValue", -1 ] },
                        First: { $arrayElemAt: [ "$Data.ActValue", 0 ] }
                        // 'data.Name': "$parameterDetails.Name"
                        
                    }
                },
                
                ])
                // console.log(getData)
            getAllAssetLcdView[i].res[j].parameterDiffMonth = []
            const getShift = await ShiftData.aggregate([
                {
               '$match': {
                   'companyId': Number(req.query.companyId),
                   
               },
           }, 
           {
           '$unwind' : "$shifts"
           } 
       ])
    //    console.log(getShift)
            if(getData.length>0){
                getAllAssetLcdView[i].res[j].parameterDiffMonth[0] =   {
                        parameter: getAllAssetLcdView[i].res[j].parameterDiff[0].parameter ,
                         value : (getAllAssetLcdView[i].res[j].parameterDiff[0].LastValue-getData[0].First),
                         FirstValue: getData[0].First,
                         LastValue :getAllAssetLcdView[i].res[j].parameterDiff[0].LastValue
                        }
            }else{
                getAllAssetLcdView[i].res[j].parameterDiffMonth[0] =  {
                    parameter: getAllAssetLcdView[i].res[j].parameterDiff.length > 0 ?getAllAssetLcdView[i].res[j].parameterDiff[0].parameter  : '-',
                value : '-'
                }
            }
            getAllAssetLcdView[i].res[j].parameterDiffShift = []
            if(getAllAssetLcdView[i].res[j].historicalDiff.length>0 &&getShift.length > 0){
              for(let z= 0 ; z < getShift.length ; z++){
                let object = { parameter : String , value : Number,parameterName : "TOTAL LENGTH"}
                object.parameter = getShift[z].shifts.name                
                object.information =getShift[z].shifts
                // console.log(getShift[z].shifts)
                fDate11 = new Date(time).setHours(getShift[z].shifts.start.hour, getShift[z].shifts.start.min, 00, 00);
                tDate11 = new Date(time).setHours(getShift[z].shifts.end.hour, getShift[z].shifts.end.min, 00, 00);
                if(fDate11>tDate11){
                    tDate11 =  new Date(tDate11).setDate(new Date(time).getDate()+1); 
                 }
                //  console.log(getAllAssetLcdView[i].res[j].historical[0])
                 ValueReceivedDate = getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.filter((x,index) => fDate11 <= x  && x < tDate11)
                //  console.log(new Date(fDate11),new Date(tDate11))
                 
                 if(getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0]) >= 0 &&getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1]) >= 0){
                    object.value =  getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1])]-getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0])]
                    object.LastValue =  getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1])]
                    object.FirstValue = getAllAssetLcdView[i].res[j].historicalDiff[0].ActValue[getAllAssetLcdView[i].res[j].historicalDiff[0].ValueReceivedDate.indexOf(ValueReceivedDate[0])]
                    // console.log(Production)
                }else{
                    object.value =  0
                    object.LastValue =  0
                    object.FirstValue =  0
                    // console.log(Production)
                }
                getAllAssetLcdView[i].res[j].parameterDiffShift.push(object)
               
              }
            }

            getAllAssetLcdView[i].res[j].parameterTarget = []
            getAllAssetLcdView[i].res[j].parameterPending = []
            getTargetData = await machineTargetData.aggregate([
                {
                    '$match': {
                        'machineId': getAllAssetLcdView[i].res[j].AssetId,
                        'date': { '$gte': fDate, '$lte': tDate},
                        // 'Data._id': 1344 
            
                    },
                },            
            ])
            if(getTargetData.length>0){
                // console.log("------------>>>>>>>>",getAllAssetLcdView[i].res[j].parameterDiff,getTargetData)
                getAllAssetLcdView[i].res[j].parameterPending[0] =   {
                    parameter: 'pending' ,
                     value : getTargetData[0].value - (getAllAssetLcdView[i].res[j].parameterDiff.length > 0 ? getAllAssetLcdView[i].res[j].parameterDiff[0].value : 0),
                 
                    }
                    getAllAssetLcdView[i].res[j].parameterTarget[0] =   {
                        parameter: 'target' ,
                         value : getTargetData[0].value 
                     
                        }
            }else{
                // console.log("------------>>>>>>>>",getTargetData)
                getAllAssetLcdView[i].res[j].parameterPending[0] =   {
                    parameter: 'pending' ,
                     value : '-',
                 
                    }
                    getAllAssetLcdView[i].res[j].parameterTarget[0] =   {
                        parameter: 'target' ,
                         value : '-'
                     
                        }
             }
            }   

        }

        getAllAssetLcdView.forEach(v => v.res.forEach((e) => {delete e.historical,delete e.historicalDiff} ));
        // console.log(getAllAssetLcdView)

        return {
            msg: 'successfully Find',
            data: getAllAssetLcdView
        }
    } catch (error) {
        console.log('error occure in get subject', error);
        return Promise.reject('error occure in get subject')
    }
}

async function getAllMeters(req) {
    try {
        // console.log('allM>>> ', req.params.CompanyId)
        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMeters = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: 'DeviceTypeId',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },
                {
                    $lookup: {
                        from: 'assetTypes',
                        localField: 'AssetTypeId',
                        foreignField: 'AssetTypeId',
                        as: 'assetTypesName'
                    }
                },
                {
                    $lookup: {
                        from: "alerts",
                        localField: "AssetId",
                        foreignField: "Asset_Id",
                        as: "AlertInfo"
                    }
                },
                {
                    $addFields: {
                        AlertCount: { $size: "$AlertInfo" }
                    }
                },
                { $unwind: '$DeviceTypeName' },
                { $unwind: '$assetTypesName' },
                {$sort  : {DeviceTypeId : 1,_id : 1}},
                {
                    $project: {
                        AssetName: 1,
                        AssetId: 1,
                        AlertCount : 1,
                        status: 1,
                        InstallationDate: 1,
                        DeviceTypeName: '$DeviceTypeName.Name',
                        assetTypesName: '$assetTypesName.Name'

                    }
                },
            ])
            // console.log(allMeters)
            return {
                msg: "successfully find the result",
                data: allMeters

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}
// getAllMetersHirarchi
async function getAllMetersHirarchi(req) {
    try {
        // console.log('allM>>> ', req.params.CompanyId)
        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const  result = {"nodes" : [] , "edges" : []}
            result.nodes = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: 'DeviceTypeId',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },
                {
                    $lookup: {
                        from: 'assetTypes',
                        localField: 'AssetTypeId',
                        foreignField: 'AssetTypeId',
                        as: 'assetTypesName'
                    }
                },
                { $unwind: '$DeviceTypeName' },
                { $unwind: '$assetTypesName' },
                {$sort  : {DeviceTypeId : 1,_id : 1}},
                {
                    $addFields:{ 
                       "x": 0,
                       "y": 0
                    }
                },
                {
                    $project: {
                        _id : 0,
                        "data.label" : "$AssetName",
                        "position.x" :"$x",
                        "position.y" : "$y",
                        // AssetName: 1,
                        id : "$AssetId" ,
                        // AssetId: 1,
                        // status: 1,
                        // InstallationDate: 1,
                        // DeviceTypeName: '$DeviceTypeName.Name',
                        // assetTypesName: '$assetTypesName.Name', 
                        // parentId : { $cond: [{ $ne: ["$ParentId", null] },  "$ParentId" , ""]}
                        parentId : {
                            $cond: {
                              if: { $ne: ["$ParentId", null] }, // Check if field2 is not null
                              then: "$ParentId", // Include field2 if not null
                              else: "$$REMOVE" // Exclude field2 if null
                            }
                          },
                          type: { $cond: [{ $eq: ["$ParentId", null] },  "default" , "default"]}
                        // ParentId : 1

                    }
                },
                // {
                //     $group: {
                //       _id: { $cond: [{ $eq: ["$ParentId", null] }, "nodes", "edges"] 
                //       },
                //       documents: { $push: "$$ROOT" } 
                //     }
                //   }
            ])
        result.edges =  result.nodes.reduce((accumulator, current,index) => {
            // console.log(current.parentId)
            if (current.parentId) {
                accumulator.push({"id" : index, "source" : current.parentId ,"target" : current.id});
            }
            return accumulator;
        }, []);
            return {
                msg: "successfully find the result",
                data: result

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}


async function getSummaryData(req) {
    try {
        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const matchQuery = {
                'CompanyId': Number(req.query.companyId),
            }
           
            if (req.query.deviceTypeId) {
                matchQuery.DeviceTypeId = Number(req.query.deviceTypeId)
                
            }   
            
            if (req.query.status) {
                matchQuery.status = req.query.status == '0'? false : true
            }
            // console.warn('>', matchQuery);
            const summaryData = await assetData.aggregate([
                {
                    $match: matchQuery,
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: 'DeviceTypeId',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceName'
                    }
                }, {
                    $project: {
                        '_id':0,
                        'DeviceName': '$DeviceName.Name',
                        'AssetName': 1,
                        'status': 1
                    }
                }, {
                    $unwind: '$DeviceName'
                }
            ])

            // console.warn(matchQuery)
            return {
                msg: "Successfully find the result",
                data: summaryData
            }
        }

    } catch (error) {
        console.log('error occure in get Status Summary', error);
        return Promise.reject('error occure in get status Summary');
    }
}

// getAllStatus

async function getAllStatus(req) {
    try {

        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMeters = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                // {
                //     $group: {
                //         _id: "$DeviceTypeId",
                //         status:{$push : "$status"}
                //     }
                // },
                {
                    $group: {
                        _id: { DeviceTypeId: "$DeviceTypeId", statusNew: "$status" },
                        status: { $push: "$status" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.DeviceTypeId",
                        statusNew: { $push: "$_id.statusNew" },
                        status: { $push: "$status" }
                    }
                },

                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: '_id',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },

                { $unwind: '$DeviceTypeName' },

                {
                    $project: {
                        _id: 0,
                        DeviceTypeId: '$_id',
                        "Devices.DeviceTypeName": '$DeviceTypeName.Name',
                        "Devices.link": '$DeviceTypeName.link',
                        status: 1,
                        statusNew: 1

                    }
                },
                {
                    $sort : {DeviceTypeId : 1}
                }
            ])
            for (let i = 0; i < allMeters.length; i++) {
                allMeters[i].active = allMeters[i].statusNew.indexOf(true) == -1 ? 0 : allMeters[i].status[allMeters[i].statusNew.indexOf(true)].length
                allMeters[i].inActive = allMeters[i].statusNew.indexOf(false) == -1 ? 0 : allMeters[i].status[allMeters[i].statusNew.indexOf(false)].length
            }
            allMeters.forEach(e => { delete e.statusNew; delete e.status });
            return {
                msg: "successfully find the result",
                data: allMeters

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}

// getAllStatusOfMappedDevice
async function getAllStatusOfMappedDevice(req) {
    try {

        if (req.params.id    === undefined || req.params.id    === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMeters = await assetData.aggregate([
                {
                    $match: {
                        'MapCustomer': ObjectId(req.params.id),
                        // Gateway: { $not: { $eq: null } }
                    }
                },
                // {
                //     $group: {
                //         _id: "$DeviceTypeId",
                //         status:{$push : "$status"}
                //     }
                // },
                {
                    $group: {
                        _id: { DeviceTypeId: "$DeviceTypeId", statusNew: "$status" },
                        status: { $push: "$status" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.DeviceTypeId",
                        statusNew: { $push: "$_id.statusNew" },
                        status: { $push: "$status" }
                    }
                },

                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: '_id',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },

                { $unwind: '$DeviceTypeName' },

                {
                    $project: {
                        _id: 0,
                        DeviceTypeId: '$_id',
                        "Devices.DeviceTypeName": '$DeviceTypeName.Name',
                        "Devices.link": '$DeviceTypeName.link',
                        status: 1,
                        statusNew: 1

                    }
                },
                {
                    $sort : {DeviceTypeId : 1}
                }
            ])
            for (let i = 0; i < allMeters.length; i++) {
                allMeters[i].active = allMeters[i].statusNew.indexOf(true) == -1 ? 0 : allMeters[i].status[allMeters[i].statusNew.indexOf(true)].length
                allMeters[i].inActive = allMeters[i].statusNew.indexOf(false) == -1 ? 0 : allMeters[i].status[allMeters[i].statusNew.indexOf(false)].length
                allMeters[i].total =allMeters[i].active + allMeters[i].inActive
            }
            allMeters.forEach(e => { delete e.statusNew; delete e.status });
            return {
                msg: "successfully find the result",
                data: allMeters

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}

// getAllAssetDropDown
async function getAllAssetDropDown(req) {
    try {

        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMetersDorpDown = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $group: {
                        _id:  "$DeviceTypeId" ,
                        DeviceList: { $push:{AssetId :  "$AssetId"  , AssetName : "$AssetName"}}
                    }
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: '_id',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },

                {
                    $project: {
                        _id: 1,
                        DeviceList: 1,
                        DeviceTypeName : '$DeviceTypeName.Name'
                        // "Devices.DeviceTypeName": '$DeviceTypeName.Name',
                        // "Devices.link": '$DeviceTypeName.link',
                        // status: 1,
                        // statusNew: 1

                    }
                },
                {
                    $sort : {_id : 1}
                }
            ])
            // console.log(allMetersDorpDown)
            return {
                msg: "successfully find the result",
                data: allMetersDorpDown

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}


async function getAssetByDeviceType(req) {
    try {
        // console.log('allM>>> ', req.params.CompanyId)
        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMeters = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        'DeviceTypeId': Number(req.query.deviceTypeId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: 'DeviceTypeId',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },
                {
                    $lookup: {
                        from: 'assetTypes',
                        localField: 'AssetTypeId',
                        foreignField: 'AssetTypeId',
                        as: 'assetTypesName'
                    }
                },
                { $unwind: '$DeviceTypeName' },
                { $unwind: '$assetTypesName' },
                {
                    $project: {
                        AssetName: 1,
                        status: 1,
                        InstallationDate: 1,
                        DeviceTypeName: '$DeviceTypeName.Name',
                        assetTypesName: '$assetTypesName.Name',
                        AssetTypeId: 1,
                        AssetId: 1,
                        Gateway:1,
                        SlaveId : 1,
                        timeZone : 1
                    }
                },
            ])
            return {
                msg: "successfully find the result",
                data: allMeters

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}

async function getDeviceType(req) {
    try {

        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allMeters = await assetData.aggregate([
                {
                    $match: {
                        'CompanyId': Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $group: {
                        _id: "$DeviceTypeId",
                    }
                },
                {
                    $lookup: {
                        from: 'deviceTypes',
                        localField: '_id',
                        foreignField: 'DeviceTypeId',
                        as: 'DeviceTypeName'
                    }
                },

                { $unwind: '$DeviceTypeName' },

                {
                    $project: {

                        DeviceTypeName: '$DeviceTypeName.Name',


                    }
                },
                { $sort: { _id: 1 } }
            ])
            return {
                msg: "successfully find the result",
                data: allMeters

            }
        }
    } catch (error) {
        console.log('error occure in get All Meters', error);
        return Promise.reject('error occure in get All Meters');
    }
}

async function getDeviceTypes(req) {
    try {
        if (req.query.companyId === undefined || req.query.companyId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allDeviceList = await assetData.aggregate([
                {
                    $match: {
                        CompanyId: Number(req.query.companyId),
                        Gateway: { $not: { $eq: null } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Name: "$AssetName",
                        AssetId: 1,
                        status: 1
                    }
                }
            ])

            return {
                msg: "successfully finf the result",
                data: allDeviceList
            }
        }
    } catch (error) {
        console.log('error occure in get Device Types', error);
        return Promise.reject('error occure in get Device Types');
    }
}

async function getAllDeviceParameters(req) {
    try {
        // console.log('res>>> ', req.query.DeviceTypeId, req.query.CompanyId)
        if (req.query.companyId === undefined || req.query.companyId === null || req.query.deviceTypeId === undefined || req.query.deviceTypeId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allDeviceParameters = await assetData.aggregate([
                {
                    $match: {
                        CompanyId: Number(req.query.companyId),
                        DeviceTypeId: Number(req.query.deviceTypeId)
                    }
                }, {
                    $lookup: {
                        from: "allRegisters",
                        localField: "AssetTypeId",
                        foreignField: "AssetTypeId",
                        as: "ParameterId"
                    }
                }, {
                    $unwind: "$ParameterId"
                }, {
                    $project: {
                        ParameterId: "$ParameterId.Parameter"
                    }
                }, {
                    $lookup: {
                        from: "parameters",
                        localField: "ParameterId",
                        foreignField: "_id",
                        as: "ParameterName"
                    }
                }, {
                    $unwind: "$ParameterName"
                }, {
                    $project: {
                        _id: "$ParameterId",
                        ParameterName: "$ParameterName.Name"
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        ParameterName: {
                            $addToSet: "$ParameterName"
                        }
                    }
                }, {
                    $unwind: "$ParameterName"
                }, {
                    $project: {
                        ParameterName: "$ParameterName"
                    }
                }
            ])
            return {
                msg: "successfully finf the result",
                data: allDeviceParameters
            }
        }

    } catch (error) {
        console.log('error occure in get All Device Parameters', error);
        return Promise.reject('error occure in get All Device Parameters');
    }
}

async function getParameterListByAssetID(req) {
    try {
        // console.log('res>>> ', req.query.AssetTypeId)
        if (req.query.assetId === undefined || req.query.assetId === null) {
            throw new Error('Check the input value for companyId');
        } else {
            const allDeviceParameters = await assetData.aggregate([
                {
                    $match: {
                        AssetId: req.query.assetId
                    }
                },
                {
                    $lookup: {
                        from: "allRegisters",
                        localField: "AssetTypeId",
                        foreignField: "AssetTypeId",
                        as: "ParameterId"
                    }
                },
                {
                    $unwind: "$ParameterId"
                },
                {
                    $project: {
                        ParameterId: "$ParameterId.Parameter",
                        RegisterId : "$ParameterId.RegisterId"
                    }
                },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "ParameterId",
                        foreignField: "_id",
                        as: "ParameterName"
                    }
                },
                {
                    $unwind: "$ParameterName"
                },
                {
                    $project: {
                        _id: "$ParameterId",
                        ParameterName: "$ParameterName.Name",
                        RegisterId : 1
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        RegisterId : { $last : "$RegisterId"},
                        ParameterName: {
                            $addToSet: "$ParameterName"
                        }
                    }
                },
                {
                    $unwind: "$ParameterName"
                },
                {
                    $project: {
                        ParameterName: "$ParameterName",
                        RegisterId: "$RegisterId"
                    }
                }
            ])
            // console.log(allDeviceParameters)
            return {
                msg: "successfully find the result",
                data: allDeviceParameters
            }
        }

    } catch (error) {
        console.log('error occure in get All Device Parameters', error);
        return Promise.reject('error occure in get All Device Parameters');
    }
}
async function getGroupGraph(req) {
    try {
        const getAllAssetGroupGraph = await assetData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'Gateway': { $not: { $eq: null } }
                }
            },
            {
                '$lookup': {
                    'from': 'groupparametergraphs',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'graphGroupData'
                }
            },
            {
                $project: {
                    graphGroupData: 1,
                    AssetId: 1,
                    DeviceTypeId: 1,
                    AssetName: 1,
                    SlaveId: 1

                }
            },
            { $unwind: '$graphGroupData' },
            {
                '$lookup': {
                    'from': 'parameters',
                    'localField': 'graphGroupData.ParameterId',
                    'foreignField': '_id',
                    'as': 'graphGroupData.parameterData'
                }
            },
            {
                $group: {
                    _id: "$AssetId",
                    AssetName: { $last: "$AssetName" },
                    SlaveId: { $last: "$SlaveId" },
                    DeviceTypeId: { $last: "$DeviceTypeId" },
                    GroupId: { $push: "$graphGroupData._id" },
                    Name: { $push: "$graphGroupData.Name" },
                    ParameterId: { $push: "$graphGroupData.parameterData._id" },
                    parameterName: { $push: "$graphGroupData.parameterData.Name" },


                }
            },
            { $sort: { SlaveId: 1 } },
            { $sort: { DeviceTypeId: 1 } },

        ])

        // console.log(getAllAssetGroupGraph)
        return {
            msg: 'successfully Find',
            data: getAllAssetGroupGraph
        }
    } catch (error) {
        console.log('error occure in get subject', error);
        return Promise.reject('error occure in get subject')
    }
}
// getRegiterDetailsAllAsset
async function getRegiterDetailsAllAsset(req) {
    try {
        const getAllAssetRegiterDetails = await assetData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'Gateway': { $not: { $eq: null } },
                    'DeviceTypeId': Number(req.query.deviceTypeId),
                }
            },
            {
                '$project': {
                    AssetId: 1,
                    AssetName: 1,
                    AssetTypeId: 1,
                    Gateway: 1,
                    SlaveId: 1
                }
            },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'AssetTypeId',
                    'foreignField': 'AssetTypeId',
                    'as': 'RegisterDetails'
                }
            },
            {
                $unwind: "$RegisterDetails"
            },
            // {
            //     '$lookup': {
            //         'from': 'allRegisters',
            //         'localField': 'AssetTypeId',
            //         'foreignField': 'AssetTypeId',
            //         'as': 'RegisterDetails'
            //     }
            // },
            {
                $lookup: {
                    from: "parameters",
                    localField: "RegisterDetails.Parameter",
                    foreignField: "_id",
                    as: "ParameterDetails"
                }
            },
            {
                '$project': {
                    AssetId: 1,
                    AssetName: 1,
                    Gateway: 1,
                    SlaveId: 1,
                    'Data.RegisterAddress': '$RegisterDetails.RegisterAddress',
                    'Data.ParameterName': '$ParameterDetails.Name'
                }
            },
            {
                $group: {
                    _id: "$AssetId",
                    Data: {
                        $push: "$Data"
                    },
                    AssetName: {
                        $last: "$AssetName"
                    },
                    Gateway: {
                        $last: "$Gateway"
                    },
                    SlaveId: {
                        $last: "$SlaveId"
                    }
                }
            }


        ])

//         const mappedResult = _.mapValues(getAllAssetRegiterDetails[0].Data, 'RegisterAddress');
//         console.log(getAllAssetRegiterDetails,mappedResult)
//         const resultObject = _.keyBy(getAllAssetRegiterDetails[0].Data, item => item.ParameterName[0]);

// console.log(resultObject);

// const resultObject = _.map(getAllAssetRegiterDetails[0].Data, item => ({ [item.ParameterName[0]]: item.RegisterAddress }));

// console.log(_.merge({}, ...resultObject));


for(let i = 0 ; i < getAllAssetRegiterDetails.length ; i++){

    const resultObject = _.map(getAllAssetRegiterDetails[i].Data, item => ({ [item.ParameterName[0]]: item.RegisterAddress }));
    getAllAssetRegiterDetails[i].Data1 =_.merge({}, ...resultObject)
    // console.log(_.merge({}, ...resultObject));
}

// console.log(getAllAssetRegiterDetails);
        return {
            msg: 'successfully Find',
            data: getAllAssetRegiterDetails
        }
    } catch (error) {
        console.log('error occure in get subject', error);
        return Promise.reject('error occure in get subject')
    }
}

module.exports = {
    getLcdView,
    getAllMeters,
    getDeviceTypes,
    getAllDeviceParameters,
    getParameterListByAssetID,
    getGroupGraph,
    getAssetByDeviceType,
    getDeviceType,
    getAllStatus,
    getLcdViewForSheela,
    getRegiterDetailsAllAsset,
    getSummaryData,
    getAllMetersHirarchi,
    getAllAssetDropDown,
    getLcdViewForPai,
    getAllStatusOfMappedDevice
}