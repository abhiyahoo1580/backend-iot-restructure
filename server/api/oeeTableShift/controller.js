const oeeTableData = require('./model');
const oeeTableDataDaily = require('../oeeTable/model');
const mongoose = require('mongoose');
const _ = require('lodash');
const historicalData = require('../historical/model')
const dateFormat = require("dateformat");
const {ObjectId} = require('mongodb');
const ShiftData = require('../shifts/model');
// const historicalData = require('../historical/model');

async function insertOeeShift(req) {
    try {         
        req.body.Date= new Date(Number(req.body.Date)).setHours(12, 0, 0, 0);
        // console.log(new Date(req.body.Date))
        const oeeTable = new oeeTableData(req.body);          
        let updatedoee = await oeeTableData.updateOne({ "AssetId": req.body.AssetId ,"Date":req.body.Date,ShiftId : req.body.ShiftId} ,
        { $set: {
            "BreakDownTime": req.body.BreakDownTime,
            "PlannedDownTime": req.body.PlannedDownTime,
            "RejectJob": req.body.RejectJob,
            "Date" :  req.body.Date,
            "MachineJobPerMinute" : req.body.MachineJobPerMinute,

            
          }},
          {upsert : true})   
          
          let fDate2 = new Date(Number(req.body.Date)).setHours(00, 00, 00, 00);     
          let tDate2 = new Date(Number(req.body.Date)).setHours(23, 59, 59, 00);
        //   console.log(new Date(fDate2),new Date(tDate2))
          const getOee =await oeeTableData.aggregate([
            {
                '$match': {
                    'AssetId': req.body.AssetId,
                    'Date': { '$gte': fDate2, '$lte': tDate2 },
                },
            },
        ])  
        let object = {"AssetId": req.body.AssetId ,
        "Date": req.body.Date  ,
        "BreakDownTime": 0,
        "PlannedDownTime": 0,
        "RejectJob": 0,
        "MachineJobPerMinute": 80 }
        for(let i = 0 ; i < getOee.length ; i ++){
            object.BreakDownTime = object.BreakDownTime + getOee[i].BreakDownTime
            object.PlannedDownTime = object.PlannedDownTime + getOee[i].PlannedDownTime
            object.RejectJob = object.RejectJob + getOee[i].RejectJob
            object.MachineJobPerMinute = object.MachineJobPerMinute + getOee[i].MachineJobPerMinute          
        }
        if(getOee.length > 0){
        object.MachineJobPerMinute = (object.MachineJobPerMinute-80)/getOee.length
        }
        
        let updatedoeeDaily = await oeeTableDataDaily.updateOne({ "AssetId": object.AssetId, "Date": object.Date },
        {
            $set: {
                "BreakDownTime": object.BreakDownTime,
                "PlannedDownTime": object.PlannedDownTime,
                "RejectJob": object.RejectJob,
                "Date": object.Date,
                "MachineJobPerMinute": object.MachineJobPerMinute,


            },
            $setOnInsert: {
                // Additional fields to insert if document doesn't exist
                "TotalRunTime" : 0,
                "TotalProduction" : 0,
                // More fields to insert if needed
            }
        },

        { upsert: true })
        // console.log(getOee,object,updatedoeeDaily)
            return {
                msg: 'successfully inserted',
                id: updatedoee
            }         
    }catch (error) {
        return Promise.reject(error);
    }
    }

    async function getOeeTable(req){
      
        try{    
            const getOee =await oeeTableData.aggregate([
                {
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': Number(req.query.fDate), '$lte': Number(req.query.tDate) },
                    },
                },
                {
                '$sort' :{ 'Date' : -1 ,'ShiftId' : 1}    
                },
                {'$lookup' : {
                    from : "companyAssets",
                    localField : "AssetId",
                    foreignField : "AssetId",
                    as  : "AssetData"
                },
            },
            {
                '$unwind' : '$AssetData'
            },
            {'$lookup' : {
                from : "shifts",
                localField : "AssetData.CompanyId",
                foreignField : "companyId",
                as  : 'ShiftData'
            },            
        },
        {
            '$unwind' : '$ShiftData'
        },
        {
            $project: {
                AssetId: 1,
                BreakDownTime: 1,
                Date: 1,
                MachineJobPerMinute: 1,
                PlannedDownTime: 1,
                RejectJob: 1,
                ShiftId: 1,
                AssetName: '$AssetData.AssetName',
                CompanyId:'$AssetData.CompanyId',
                // ShiftData: '$ShiftData.shifts',               
                Shift: { $filter: { input: "$ShiftData.shifts", as: "u", cond: { $eq: ["$$u._id", "$ShiftId"] } } },
            
            }
        },   
     ])  

            // for(let i = 0 ; i < getOee.length ; i++){
            //     console.log(new Date(getOee[i].Date),getOee[i].ShiftName[0].name)
            // }
            // console.log(getOee)      
            return {
                msg: 'successfully Find',
                data: getOee
            }
        }catch (error){
            console.log('error occure in get oee',error);
            return Promise.reject('error occure in get oee')
        }
    }

    async function calculatedOeeGet(req){      
        try{             
            // console.log(req.query)
 
            const getShift = await ShiftData.aggregate([
                     {
                    '$match': {
                        'companyId': Number(req.query.companyId),
                        
                    },
                },
                {$project: {                                    
                        Shift: { $filter: { input: "$shifts", as: "u", cond: { $eq: ["$$u._id", ObjectId(req.query.shiftId)] } } },
                    }
                },  
                {
                '$unwind' : "$Shift"
                } 
            ])
     
if(getShift.length > 0){
    // console.log(getShift[0].Shift)

    var fDate = new Date(Number(req.query.date)).setHours(getShift[0].Shift.start.hour,getShift[0].Shift.start.min,0,0)
    var tDate =new Date(Number(req.query.date)).setHours(getShift[0].Shift.end.hour,getShift[0].Shift.end.min,0,0)
    // console.log(new Date(fDate),new Date(tDate))
    if(fDate>tDate){
       tDate =  new Date(tDate).setDate(new Date(Number(req.query.date)).getDate()+1); 
    }
    let fDate1 = new Date(fDate).setHours(00, 00, 00, 00);     
    let tDate1 = new Date(tDate).setHours(23, 59, 59, 00);
    let fDate2 = new Date(Number(req.query.date)).setHours(00, 00, 00, 00);     
    let tDate2 = new Date(Number(req.query.date)).setHours(23, 59, 59, 00);
    // console.log(new Date(fDate),'\n',new Date(tDate),'\n',new Date(fDate1),'\n',new Date(tDate1),'\n',new Date(fDate2),'\n',new Date(tDate2))
    var historicalDataNew = new historicalData(req.query.companyId);
    getData = []
 try{
     getData =await historicalDataNew.aggregate([
        {
            '$match': {
                'AssetId': req.query.assetId,
                'Date': { '$gte': fDate1, '$lte': tDate1},
            },
        },
        { $unwind: '$Data' },
        {'$match': {
          'Data._id': { $in: [1343,1344,1417,1433,1419,1435,1420]}
        }
        },
        { '$project': { 'Data': 1, _id: 0 } },
        {
            $group: {
                _id: "$Data._id",
                // Name:{$last:"$Name"},
                ActValue: { $push: "$Data.ActValue" },
                ValueReceivedDate: { $push: "$Data.ValueReceivedDate" },
            }
        },
        {
            "$addFields": {
                "ActValue1": {
                    "$reduce": {
                        "input": "$ActValue",
                        "initialValue": [],
                        "in": { "$concatArrays": ["$$value", "$$this"] }
                    }
                },
                "ValueReceivedDate1": {
                    "$reduce": {
                        "input": "$ValueReceivedDate",
                        "initialValue": [],
                        "in": { "$concatArrays": ["$$value", "$$this"] }
                    }
                },
            }
        },
        {
            "$project": {
                // ActValue : 1,
                // ValueReceivedDate : 1,
                ActValue1 : 1,
                ValueReceivedDate1 : 1,
                ValueReceivedDate11 : { $filter: {
                        input: "$ValueReceivedDate1", 
                        as: "u", 
                        cond: { $and: [{$gte: ["$$u",fDate]},{$lte: ["$$u",tDate]} ] } } }
            }
        },
        {
            "$project": {
                // ActValue : 1,
                // ValueReceivedDate : 1,
                ActValue1 : 1,
                ValueReceivedDate1 : 1,
                ValueReceivedDate11 : 1,
                first: { $indexOfArray :["$ValueReceivedDate1",{ $arrayElemAt: [ "$ValueReceivedDate11", 0 ] }]},
                last:{ $indexOfArray :["$ValueReceivedDate1", { $arrayElemAt: [ "$ValueReceivedDate11", -1 ] }]},
                // diff: { $subtract: ["$last","$first"]}
            }
        },               
        {
            "$project": {
                // ActValue : 1,
                // ValueReceivedDate : 1,
                ActValue1 : 1,
                ValueReceivedDate1 : 1,
                // ValueReceivedDate11 : 1,
                first: 1,                   
                diff: { $subtract: ["$last","$first"]}
            }
        },        
        {
            "$addFields": {
                "ActValue": {
                     $slice: ["$ActValue1", "$first", "$diff"] 
                },
                "ValueReceivedDate": {
                    $slice: ["$ValueReceivedDate1", "$first", "$diff"] 
               },
            }
        },
        {
            "$project": {
                // ActValue : 1,
                // ValueReceivedDate : 1,
                ActValue : 1,
                ValueReceivedDate : 1,
                // ValueReceivedDate11 : 1,
                // first: 1,                   
                // diff: { $subtract: ["$last","$first"]}
            }
        },   
        {
            "$project": {
                "data.id" : "$_id",
                "data.ActValue" : "$ActValue",
                "data.ValueReceivedDate" : "$ValueReceivedDate",
                'data.Name': "$parameterDetails.Name"
                
            }
        },
        {
            $group: {
                _id: null,
                data: { $push: "$data" },
            }
        },
        {
            $addFields: {
               "lengthParameter": { $filter: { input: "$data", as: "u", cond: { $in: ["$$u.id", [1344,1419,1435]] } } },
               "statusParameter": { $filter: { input: "$data", as: "u", cond: { $in: ["$$u.id", [1343,1417,1433]]} } },
               "needleSpeedParameter": { $filter: { input: "$data", as: "u", cond: { $in: ["$$u.id", [1420]]} } }
            }
         } ,
         {
            "$project": {
                "data" : 0,
              
                
            }
        },     
    ])
 }catch(err){
// console.log(err)
 }

    //   const getData =await historicalDataNew.aggregate([
    //             {
    //                 '$match': {
    //                     'AssetId': req.query.assetId,
    //                     'Date': { '$gte': fDate1, '$lte': tDate1},
    //                 },
    //             },
    //             { $unwind: '$Data' },
    //             {'$match': {
    //               'Data._id': { $in: [1343,1344]}
    //             }
    //             },
    //             { '$project': { 'Data': 1, _id: 0 } },
    //             {
    //                 $group: {
    //                     _id: "$Data._id",
    //                     // Name:{$last:"$Name"},
    //                     ActValue: { $push: "$Data.ActValue" },
    //                     ValueReceivedDate: { $push: "$Data.ValueReceivedDate" },
    //                 }
    //             },
    //             {
    //                 "$addFields": {
    //                     "ActValue1": {
    //                         "$reduce": {
    //                             "input": "$ActValue",
    //                             "initialValue": [],
    //                             "in": { "$concatArrays": ["$$value", "$$this"] }
    //                         }
    //                     },
    //                     "ValueReceivedDate1": {
    //                         "$reduce": {
    //                             "input": "$ValueReceivedDate",
    //                             "initialValue": [],
    //                             "in": { "$concatArrays": ["$$value", "$$this"] }
    //                         }
    //                     },
    //                 }
    //             },
    //             {
    //                 "$project": {
    //                     // ActValue : 1,
    //                     // ValueReceivedDate : 1,
    //                     ActValue1 : 1,
    //                     ValueReceivedDate1 : 1,
    //                     ValueReceivedDate11 : { $filter: {
    //                             input: "$ValueReceivedDate1", 
    //                             as: "u", 
    //                             cond: { $and: [{$gte: ["$$u",fDate]},{$lte: ["$$u",tDate]} ] } } }
    //                 }
    //             },
    //             {
    //                 "$project": {
    //                     // ActValue : 1,
    //                     // ValueReceivedDate : 1,
    //                     ActValue1 : 1,
    //                     ValueReceivedDate1 : 1,
    //                     ValueReceivedDate11 : 1,
    //                     first: { $indexOfArray :["$ValueReceivedDate1",{ $arrayElemAt: [ "$ValueReceivedDate11", 0 ] }]},
    //                     last:{ $indexOfArray :["$ValueReceivedDate1", { $arrayElemAt: [ "$ValueReceivedDate11", -1 ] }]},
    //                     // diff: { $subtract: ["$last","$first"]}
    //                 }
    //             },               
    //             {
    //                 "$project": {
    //                     // ActValue : 1,
    //                     // ValueReceivedDate : 1,
    //                     ActValue1 : 1,
    //                     ValueReceivedDate1 : 1,
    //                     // ValueReceivedDate11 : 1,
    //                     first: 1,                   
    //                     diff: { $subtract: ["$last","$first"]}
    //                 }
    //             },        
    //             {
    //                 "$addFields": {
    //                     "ActValue": {
    //                          $slice: ["$ActValue1", "$first", "$diff"] 
    //                     },
    //                     "ValueReceivedDate": {
    //                         $slice: ["$ValueReceivedDate1", "$first", "$diff"] 
    //                    },
    //                 }
    //             },
    //             {
    //                 "$project": {
    //                     // ActValue : 1,
    //                     // ValueReceivedDate : 1,
    //                     ActValue : 1,
    //                     ValueReceivedDate : 1,
    //                     // ValueReceivedDate11 : 1,
    //                     // first: 1,                   
    //                     // diff: { $subtract: ["$last","$first"]}
    //                 }
    //             },   
    //             {
    //                 "$project": {
    //                     "data.id" : "$_id",
    //                     "data.ActValue" : "$ActValue",
    //                     "data.ValueReceivedDate" : "$ValueReceivedDate",
    //                     'data.Name': "$parameterDetails.Name"
                        
    //                 }
    //             },
    //             {
    //                 $group: {
    //                     _id: null,
    //                     data: { $push: "$data" },
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                    "lengthParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1344] } } },
    //                    "statusParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1343] } } }
    //                 }
    //              } ,
    //              {
    //                 "$project": {
    //                     "data" : 0,
                      
                        
    //                 }
    //             },     
    //         ])

            // console.log(getData)
            if(getData.length>0 ){
                if(getData[0].lengthParameter.length > 0 &&getData[0].statusParameter.length >0){
           totalProduction = (getData[0].lengthParameter[0].ActValue[getData[0].lengthParameter[0].ActValue.length-1])-getData[0].lengthParameter[0].ActValue[0]
         var getOee =await oeeTableData.aggregate([                        {
                        '$match': {
                            'AssetId': req.query.assetId,
                            'Date': { '$gte': fDate2, '$lte': tDate2 },
                            'ShiftId' : ObjectId(req.query.shiftId)
                        },
                    },
                    
                ]) 
              
                // console.log(getOee)
                        // quality = getOee.length > 0 ? (totalProduction- getOee[0].RejectJob)/totalProduction : 0

                        // Quality = (Total production - Rejection Qty) / Total Production
                        quality =  (totalProduction - (getOee.length > 0 ? getOee[0].RejectJob : 0))/totalProduction 
                    // quality = getOee.length > 0 ? (totalProduction- getOee[0].RejectJob)/totalProduction : 0
                    totalRunTime = 0;
                    nonZeroArr = []
                    // console.log(getShift[0].Shift.totalAvailableTime)
                    // totalAvailableTime = Math.abs((getShift[0].Shift.start.hour*60+ getShift[0].Shift.start.min)-
                    // (getShift[0].Shift.end.hour*60+getShift[0].Shift.end.min))-45; 
                    let date1 =  new Date()
                    //  console.log(new Date(date1),new Date(fDate), new Date(tDate))
                    if(fDate <= date1 && date1 < tDate){
                        totalAvailableTime =  ((date1-fDate)/1000)/60
                    }else{
                    
                        // totalAvailableTime = 1335;
                        totalAvailableTime =  getShift[0].Shift.totalAvailableTime
                    }
                    // console.log(Math.abs((getShift[0].Shift.start.hour*60+ getShift[0].Shift.start.min)-
                    //             (getShift[0].Shift.end.hour*60+getShift[0].Shift.end.min))-45)
                    allIndex = []               
                    if(getData[0].statusParameter.length > 0){     
                        await getData[0].statusParameter[0].ActValue.filter((value, index) => {
                            if (value === 0 || index == 0 || (index == getData[0].statusParameter[0].ActValue.length-1 && value == 1)) {
                                allIndex.push(index)
                            }
                        });
                        if(allIndex.length != 0 &&getData[0].statusParameter[0].ValueReceivedDate.length > 0){
                        for (let i = 1; i < allIndex.length; i++) {
                            if ((allIndex[i] - 1) != allIndex[i - 1]) {
                            // console.log( allIndex[i - 1],(allIndex[i] ))
                            totalRunTime = totalRunTime + getData[0].statusParameter[0].ValueReceivedDate[allIndex[i] ] -getData[0].statusParameter[0].ValueReceivedDate[allIndex[i - 1] ]
                            }
                        }
                    }else{
                        totalRunTime = getData[0].statusParameter[0].ValueReceivedDate[(getData[0].statusParameter[0].ValueReceivedDate.length-1)]-getData[0].statusParameter[0].ValueReceivedDate[0]
                    }
                        totalRunTime = (totalRunTime/1000)/60
                        totalRunTimeSec =((totalRunTime/1000)%60)*60
                    }                   
                    // Availability = (Total available time - BreakDownTime)/Total available time
                    //   availability =getOee.length > 0 ? (totalAvailableTime-(getOee.length > 0 ?  getOee[0].BreakDownTime : 0 ))/totalAvailableTime : 0
                    availability = (totalAvailableTime-(getOee.length > 0 ?  getOee[0].BreakDownTime : 0 ))/totalAvailableTime 
                    // Speed Efficiency = Total production/(Machine running time x 80)   
                    if(req.query.assetId == "fjkjjl98LM" || req.query.assetId == "ZODA4i" ||  req.query.assetId == "S8AbcVX" || req.query.assetId == "UZ5Xu2f")   {                   
                        //   console.log(  avgRpm )
                        if( getData[0].needleSpeedParameter.length > 0 ){
                            nonZeroArr = _.filter(getData[0].needleSpeedParameter[0].ActValue, num => num !== 0);
                            if (_.isEmpty(nonZeroArr)) {
                                avgRpm =   0; // To handle the case when all elements are zero
                            }else{
                                avgRpm =   _.sum(nonZeroArr) / nonZeroArr.length;
                            }
                        }
                        //   console.log(  avgRpm )
                          speedEfficiency = avgRpm/1100     
                        }else{
                            speedEfficiency = totalProduction/(totalRunTime *( getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80))
                            //  speedEfficiency = totalProduction/(totalRunTime *( getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80))
                          }
                    
                    //  Machine Run efficiency = Machine running time / (Total available time- (Breakdown Time+Planned down Time))
                     machineRunEfficiency = totalRunTime / ( totalAvailableTime -  ( (getOee.length > 0 ? getOee[0].BreakDownTime : 0 )+ (getOee.length > 0 ? getOee[0].PlannedDownTime : 0)))
                    //  Performance = Running Eff x speed Eff
                    performance = speedEfficiency * machineRunEfficiency
                    // OEE = Performance x Availability X Quality
                    oEE = performance * availability * quality  
                    // console.log("totalProduction ===>",totalProduction ,"totalRunTime ==>",totalRunTime,"totalAvailableTime ==>",totalAvailableTime,"quality = >" ,quality ,"availability = > ",availability,"speedEfficiency = > ",speedEfficiency,"machineRunEfficiency =>",machineRunEfficiency,"performance = > ",performance,"oEE = >",oEE)

                
            }
            }else{
                // console.log("dfvsdfgsdfhb")
                quality = 0;
                availability = 0;
                speedEfficiency  = 0;
                machineRunEfficiency = 0;
                performance = 0;
                oEE = 0;
                totalProduction  = 0;
                totalRunTime = 0;

            }

}
        
         


            return {
                msg: 'successfully Find',
                data: { quality : {value : quality *100 , Name  : "Quality"}, 
                     availability : {value : availability *100 , Name  : "Availability"},
                     speedEfficiency : {value : speedEfficiency *100  ,Name  : "Speed Efficiency"},
                     machineRunEfficiency : { value : machineRunEfficiency *100 ,Name  : "Run Efficiency"},
                     performance : {value : performance *100 ,Name  : "Performance"},
                     oEE :{value : oEE *100 ,Name  : "OEE"},
                     totalProduction :{value : totalProduction  ,Name  : "Total Production",firstValue :getData.length > 0 ? getData[0].lengthParameter[0].ActValue[0] : 0,lastValue :getData.length > 0 ? getData[0].lengthParameter[0].ActValue[getData[0].lengthParameter[0].ActValue.length-1] : 0},
                     totalAvailableTime:{value : totalAvailableTime,Name:"Total Available Time"},
                     totalRunTime :{value : totalRunTime ,Name  : "Total Run Time" , lastrunTime: getData.length > 0 ? getData[0].statusParameter[0].ValueReceivedDate[getData[0].statusParameter[0].ValueReceivedDate.length-1] : 0 ,totalRunTimeSec : totalRunTimeSec},
                     fDate: { value: new Date(fDate).toDateString() + ' ' + new Date(fDate).toLocaleTimeString() },
                     tDate: { value: new Date(tDate).toDateString() + ' ' + new Date(tDate).toLocaleTimeString() },
                     RejectJob : {value: (getOee.length > 0 ? getOee[0].RejectJob : 0) , Name : "Reject Job"},
                     BreakDownTime : {value: (getOee.length > 0 ? getOee[0].BreakDownTime : 0) , Name : "Break Down Time"},
                     MachineJobPerMinute : {value:  (getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80) , Name : "Machine Job PerMinute"},
                     PlannedDownTime : {value: (getOee.length > 0 ? getOee[0].PlannedDownTime : 0), Name : "Planned Down Time"},
                     needleRpm :{ total : nonZeroArr.length > 0? _.sum(nonZeroArr)  : 0, Number : nonZeroArr.length > 0? nonZeroArr.length  : 0 ,avgRpm : nonZeroArr.length > 0 ? avgRpm : 0}
                }
            }
        }catch (error){
            // console.log('error occure in get oee',error);
            return Promise.reject('error occure in get oee')
        }
    }

    async function getProduction(req) {
        try {      
           
            let result = []
            req.query.fDate= new Date(Number(req.query.fDate)).setHours(7, 00, 00, 00);
            req.query.tDate= new Date(Number(req.query.tDate)).setHours(7, 00, 00, 00);
            // console.log(new Date(req.query.fDate),new Date(req.query.tDate))
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
            var historicalDataNew = new historicalData(req.query.companyId);
            getData =await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': req.query.fDate, '$lte': req.query.tDate},
                     

                    },
                },
                { $unwind: '$Data' },
                {'$match': {
                  'Data._id': { $in: [1344,1419,1435,1458]}
                }
            },
            { $sort : { 'Date' : 1}}, 
            // {
            //     $project: {
            //         AssetId : 1,
            //         Date : 1,
            //         "RegId" : "$Data._id", 
            //         Last: { $arrayElemAt: [ "$Data.ActValue", -1 ] },
            //         First: { $arrayElemAt: [ "$Data.ActValue", 0 ] }
            //         // 'data.Name': "$parameterDetails.Name"
                    
            //     }
            // },
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
            ])
            // console.log(getData)
            getData.forEach((ele,index) => {
      
                getShift.forEach((shift) => {
                    obj = {Name :String ,Date : Number,Production : Number}
                    obj.Name  = shift.shifts.name
                    obj.Date  = ele.Date
                   
                    fDate1 = new Date(ele.Date).setHours(shift.shifts.start.hour, shift.shifts.start.min, 00, 00);
                    tDate1 = new Date(ele.Date).setHours(shift.shifts.end.hour, shift.shifts.end.min, 00, 00);
                    if(fDate1>tDate1){
                        tDate1 =  new Date(tDate1).setDate(new Date(ele.Date).getDate()+1); 
                     }
                   
                    ValueReceivedDate = ele.Data.ValueReceivedDate.filter((x,index) => fDate1 <= x  && x < tDate1)
                   
                  if(ele.Data.ValueReceivedDate.indexOf(ValueReceivedDate[0]) >= 0 &&ele.Data.ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1]) >= 0){
                    obj.Production =  ele.Data.ActValue[ele.Data.ValueReceivedDate.indexOf(ValueReceivedDate[ValueReceivedDate.length-1])]-ele.Data.ActValue[ele.Data.ValueReceivedDate.indexOf(ValueReceivedDate[0])]
                }else{
                    obj.Production = 0
                }
                    result.push(obj)               
                });
               
                });
              
                let final1 = []
                final  =  _.groupBy(result, 'Name')
               const key = Object.keys(final)
                // console.log(result,key);
                for(let i = 0 ; i < key.length ; i++){
                obj = {_id : key[i] ,ValueReceivedDate : [],ActValue: []} 
                for(let j = 0 ; j < final[key[i]].length ; j++){
                    obj.ValueReceivedDate.push(final[key[i]][j].Date) 
                    obj.ActValue.push(final[key[i]][j].Production) 
                }
                final1.push(obj)
            }
            // console.log(final1)
            let result11 = []
            for(let i = 0 ; i < final1.length;i++){
               // console.log(result[i])
               let obj = {data: [], name: final1[i]._id}
             obj.data =  _.chunk(final1[i].ValueReceivedDate,1);
           //   console.log(a)
             for(let j = 0 ;j <obj.data.length; j++){
               // a[j].push()
            //    console.log(final1[i].ActValue[j]== NaN || final1[i].ActValue[j]== null ? 0 : final1[i].ActValue[j])
               obj.data[j].push(final1[i].ActValue[j])
             }
           //   console.log(a)
           result11.push(obj)

           }
           let final2 = JSON.parse(JSON.stringify(final1));
           for(let i = 0 ; i < final1.length ; i++){
            value = final1[i].ActValue
            sum = _.sum(value)
            avg = sum/value.length
            // console.log(value,value.length,_.sum(value)/value.length,)
            final1[i].ActValue.push(sum)
            final1[i].ValueReceivedDate.push('Total')
            final1[i].ActValue.push(avg)
            final1[i].ValueReceivedDate.push("Average")
        }
        //    console.log(final1,final2)
            return {
                msg: 'successfully Find',
                data: final1,
                graph: result11,
                graph1:final2
            }
                   
        }catch (error) {
            return Promise.reject(error);
        }
        }

module.exports = {
    insertOeeShift,
      getOeeTable,
      calculatedOeeGet,
      getProduction
}