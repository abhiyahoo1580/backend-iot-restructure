const oeeTableData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash');
const historicalData = require('../historical/model')
const dateFormat = require("dateformat");
// const historicalData = require('../historical/model');

async function insertOee(req) {
    try {
        req.body.Date = new Date(Number(req.body.Date)).setHours(12, 00, 00, 00);

        const oeeTable = new oeeTableData(req.body);
        let updatedoee = await oeeTableData.updateOne({ "AssetId": req.body.AssetId, "Date": req.body.Date },
            {
                $set: {
                    "BreakDownTime": req.body.BreakDownTime,
                    "PlannedDownTime": req.body.PlannedDownTime,
                    "RejectJob": req.body.RejectJob,
                    "Date": req.body.Date,
                    "MachineJobPerMinute": req.body.MachineJobPerMinute,


                }
            },
            { upsert: true })
        return {
            msg: 'successfully inserted',
            id: updatedoee
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getOeeTable(req) {

    try {
        const getOee = await oeeTableData.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': Number(req.query.fDate), '$lte': Number(req.query.tDate) },
                },
            },
            {
                '$sort': { 'Date': -1 }
            }
        ])
        return {
            msg: 'successfully Find',
            data: getOee
        }
    } catch (error) {
        console.log('error occure in get oee', error);
        return Promise.reject('error occure in get oee')
    }
}
// calculatedOeeGet
async function calculatedOeeGet(req) {
    try {

        let fDate = new Date(Number(req.query.date))
        fDate = new Date(fDate).setHours(7, 00, 00, 00);
        let tDate = new Date(Number(req.query.date)).setDate(new Date(Number(req.query.date)).getDate() + 1);
        tDate = new Date(tDate).setHours(7, 00, 00, 00)
        let fDate1 = new Date(fDate).setHours(00, 00, 00, 00);
        let tDate1 = new Date(tDate).setHours(23, 59, 59, 00);

        var historicalDataNew = new historicalData(req.query.companyId);
        getData = []
        try {
            getData = await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': fDate1, '$lte': tDate1 },
                    },
                },
                { $unwind: '$Data' },
                {
                    '$match': {
                        'Data._id': { $in: [1343, 1344] }
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
                        ActValue1: 1,
                        ValueReceivedDate1: 1,
                        ValueReceivedDate11: {
                            $filter: {
                                input: "$ValueReceivedDate1",
                                as: "u",
                                cond: { $and: [{ $gte: ["$$u", fDate] }, { $lte: ["$$u", tDate] }] }
                            }
                        }
                    }
                },
                {
                    "$project": {
                        // ActValue : 1,
                        // ValueReceivedDate : 1,
                        ActValue1: 1,
                        ValueReceivedDate1: 1,
                        ValueReceivedDate11: 1,
                        first: { $indexOfArray: ["$ValueReceivedDate1", { $arrayElemAt: ["$ValueReceivedDate11", 0] }] },
                        last: { $indexOfArray: ["$ValueReceivedDate1", { $arrayElemAt: ["$ValueReceivedDate11", -1] }] },
                        // diff: { $subtract: ["$last","$first"]}
                    }
                },
                {
                    "$project": {
                        // ActValue : 1,
                        // ValueReceivedDate : 1,
                        ActValue1: 1,
                        ValueReceivedDate1: 1,
                        // ValueReceivedDate11 : 1,
                        first: 1,
                        diff: { $subtract: ["$last", "$first"] }
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
                        ActValue: 1,
                        ValueReceivedDate: 1,
                        // ValueReceivedDate11 : 1,
                        // first: 1,                   
                        // diff: { $subtract: ["$last","$first"]}
                    }
                },
                {
                    "$project": {
                        "data.id": "$_id",
                        "data.ActValue": "$ActValue",
                        "data.ValueReceivedDate": "$ValueReceivedDate",
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
                        "lengthParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1344] } } },
                        "statusParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1343] } } }
                    }
                },
                {
                    "$project": {
                        "data": 0,


                    }
                },
            ])
        } catch (err) {
            // console.log(err)
        }

        if (getData.length > 0) {
            if (getData[0].lengthParameter.length > 0 && getData[0].statusParameter.length > 0) {

                totalProduction = (getData[0].lengthParameter[0].ActValue[getData[0].lengthParameter[0].ActValue.length - 1]) - getData[0].lengthParameter[0].ActValue[0]

                const getOee = await oeeTableData.aggregate([{
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': fDate, '$lt': tDate },
                    },
                },

                ])

                // Quality = (Total production - Rejection Qty) / Total Production
                quality = (totalProduction - (getOee.length > 0 ? getOee[0].RejectJob : 0)) / totalProduction
                totalRunTime = 0;
                totalAvailableTime = 1335;
                allIndex = []
                if (getData[0].statusParameter.length > 0) {
                    await getData[0].statusParameter[0].ActValue.filter((value, index) => {
                        if (value === 0) {
                            allIndex.push(index)
                        }
                    });
                    for (let i = 1; i < allIndex.length; i++) {
                        if ((allIndex[i] - 1) != allIndex[i - 1]) {

                            totalRunTime = totalRunTime + getData[0].statusParameter[0].ValueReceivedDate[allIndex[i]] - getData[0].statusParameter[0].ValueReceivedDate[allIndex[i - 1]]
                        }
                    }
                    totalRunTime = (totalRunTime / 1000) / 60
                }
                // Availability = (Total available time - BreakDownTime)/Total available time
                availability = (totalAvailableTime - (getOee.length > 0 ? getOee[0].BreakDownTime : 0)) / totalAvailableTime
                // Speed Efficiency = Total production/(Machine running time x 80)                    
                speedEfficiency = totalProduction / (totalRunTime * (getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80))
                //  Machine Run efficiency = Machine running time / (Total available time- (Breakdown Time+Planned down Time))
                machineRunEfficiency = totalRunTime / (totalAvailableTime - ((getOee.length > 0 ? getOee[0].BreakDownTime : 0) + (getOee.length > 0 ? getOee[0].PlannedDownTime : 0)))
                //  Performance = Running Eff x speed Eff
                performance = speedEfficiency * machineRunEfficiency
                // OEE = Performance x Availability X Quality
                oEE = performance * availability * quality
                // console.log("totalProduction ===>",totalProduction ,"totalRunTime ==>",totalRunTime,"totalAvailableTime ==>",totalAvailableTime,"quality = >" ,quality ,"availability = > ",availability,"speedEfficiency = > ",speedEfficiency,"machineRunEfficiency =>",machineRunEfficiency,"performance = > ",performance,"oEE = >",oEE)


            }
        } else {
            quality = 0;
            availability = 0;
            speedEfficiency = 0;
            machineRunEfficiency = 0;
            performance = 0;
            oEE = 0;
            totalProduction = 0;
            totalRunTime = 0;
        }



        return {
            msg: 'successfully Find',
            data: {
                quality: { value: quality * 100, Name: "Quality" },
                availability: { value: availability * 100, Name: "Availability" },
                speedEfficiency: { value: speedEfficiency * 100, Name: "Speed Efficiency" },
                machineRunEfficiency: { value: machineRunEfficiency * 100, Name: "Run Efficiency" },
                performance: { value: performance * 100, Name: "Performance" },
                oEE: { value: oEE * 100, Name: "OEE" },
                totalProduction: { value: totalProduction, Name: "Total Production" },
                totalRunTime: { value: totalRunTime, Name: "Total Run Time" },
                fDate: { value: new Date(fDate).toDateString() + ' ' + new Date(fDate).toLocaleTimeString() },
                tDate: { value: new Date(tDate).toDateString() + ' ' + new Date(tDate).toLocaleTimeString() }

            }
        }
    } catch (error) {
        console.log('error occure in get oee', error);
        return Promise.reject('error occure in get oee')
    }
}
// getHistoricalOee
async function getHistoricalOee(req) {

    try {
        const getOee = await oeeTableData.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': Number(req.query.fDate), '$lte': Number(req.query.tDate) },
                },
            },
            {
                '$sort': { 'Date': -1 }
            }
        ])

        if (getOee.length > 0) {
            totalAvailableTime = 1335;
            for (let i = 0; i < getOee.length; i++) {
                getOee[i].Quality = ((getOee[i].TotalProduction - (getOee.length > 0 ? getOee[i].RejectJob : 0)) / getOee[i].TotalProduction) * 100

                getOee[i].Availability = ((totalAvailableTime - (getOee.length > 0 ? getOee[i].BreakDownTime : 0)) / totalAvailableTime) * 100

                if(req.query.assetId == "fjkjjl98LM" || req.query.assetId == "ZODA4i" ||  req.query.assetId == "S8AbcVX" || req.query.assetId == "UZ5Xu2f")   {                   
                 //   console.log(  avgRpm )
                   speedEfficiency = getOee[i].AvgRpm/1100        
                 }else{
                         speedEfficiency = getOee[i].TotalProduction / (getOee[i].TotalRunTime * (getOee.length > 0 ? getOee[i].MachineJobPerMinute : 80))
                   }

                machineRunEfficiency = getOee[i].TotalRunTime / (totalAvailableTime - ((getOee.length > 0 ? getOee[i].BreakDownTime : 0) + (getOee.length > 0 ? getOee[i].PlannedDownTime : 0)))

                getOee[i].Performance = (speedEfficiency * machineRunEfficiency) * 100
                getOee[i].OEE = (getOee[i].Performance / 100) * (getOee[i].Quality / 100) * (getOee[i].Availability / 100) * 100

            }
        }

        performance = { ActValue: [], Date: [], _id: 'Performance' }
        oee = { ActValue: [], Date: [], _id: 'OEE' }
        availability = { ActValue: [], Date: [], _id: 'Availability' }
        quality = { ActValue: [], Date: [], _id: 'Quality' }
        totalProduction = { ActValue: [], Date: [], _id: 'Total Production(Meter)' }
        totalRunTime = { ActValue: [], Date: [], _id: 'Total Run Time(MIN)' }
        for (let i = 0; i < getOee.length; i++) {

            performance.ActValue.push(getOee[i].Performance)
            performance.Date.push(getOee[i].Date)
            availability.ActValue.push(getOee[i].Availability)
            availability.Date.push(getOee[i].Date)
            oee.ActValue.push(getOee[i].OEE)
            oee.Date.push(getOee[i].Date)
            quality.ActValue.push(getOee[i].Quality)
            quality.Date.push(getOee[i].Date)
            totalProduction.ActValue.push(getOee[i].TotalProduction)
            totalProduction.Date.push(getOee[i].Date)
            totalRunTime.ActValue.push(getOee[i].TotalRunTime)
            totalRunTime.Date.push(getOee[i].Date)

        }
        let result = []
        if (performance.ActValue.length > 0 || oee.ActValue.length > 0, availability.ActValue.length > 0, quality.ActValue.length > 0, totalProduction.ActValue.length > 0, totalRunTime.ActValue.length > 0)
            result.push(performance, oee, availability, quality, totalProduction, totalRunTime)
        // _.chunk(['a', 'b', 'c', 'd'], 2);
        // => [['a', 'b'], ['c', 'd']]
        let result11 = []
        for (let i = 0; i < result.length; i++) {

            let obj = { data: [], name: result[i]._id }
            obj.data = _.chunk(result[i].Date, 1);

            for (let j = 0; j < obj.data.length; j++) {
                // a[j].push()
                obj.data[j].push(result[i].ActValue[j])
            }

            result11.push(obj)

        }
        let result2 = JSON.parse(JSON.stringify(result));
        for (let i = 0; i < result.length; i++) {

            value = _.filter(result[i].ActValue, v => !isNaN(v) && v !== Infinity)

            if (result[i]._id == 'Total Production(Meter)') {

                result[i].ActValue.push(_.sum(value))
                result[i].Date.push('Total')
                result[i].ActValue.push((_.sum(value)) / value.length)
                result[i].Date.push("Average")
            } else {
                const safeSum = arr => _.sum(_.filter(arr, _.isFinite));
                // Calculate sum
                result[i].ActValue.push('-')
                result[i].Date.push('Total')
                result[i].ActValue.push((safeSum(value)) / value.length)
                result[i].Date.push("Average")
            }
        }

        return {
            msg: 'successfully Find',
            data: result,
            graph: result11,
            graph1: result2
        }
    } catch (error) {
        console.log('error occure in get oee', error);
        return Promise.reject('error occure in get oee')
    }
}

// getProduction
async function getProduction(req) {
    try {

        req.query.fDate = new Date(Number(req.query.fDate)).setHours(7, 00, 00, 00);
        req.query.tDate = new Date(Number(req.query.tDate)).setHours(7, 00, 00, 00);

        var historicalDataNew = new historicalData(req.query.companyId);
        getData = await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': req.query.fDate, '$lte': req.query.tDate },
                    // 'Data._id': 1344 

                },
            },
            { $unwind: '$Data' },
            {
                '$match': {
                    'Data._id': { $in: [1344,1419,1435,1458] }
                }
            },
            { $sort: { 'Date': 1 } },
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
            // { $addFields: { last : { $last: "$ActValue" } } }
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
                    _id: "$ParameterName",
                    ActValue: {
                        $push: "$ActValue"
                    },
                    Date: {
                        $push: "$Date"
                    }
                }
            }
        ])

        const convertedArray = getData.map(item => ({
            _id: item._id,
            data: _.zipWith(item.ActValue, item.Date, (ActValue, Date) => [Date,ActValue])
        }));
        

        let getData1 = JSON.parse(JSON.stringify(getData));
        for(let i = 0 ; i < getData1.length ; i ++){
            // console.log(getData[i])
            value = getData1[i].ActValue
            sum = _.sum(value)
            avg = sum/value.length
            // console.log(value,value.length,_.sum(value)/value.length,)
            getData1[i].ActValue.push(sum)
            getData1[i].Date.push('Total')
            getData1[i].ActValue.push(avg)
            getData1[i].Date.push("Average")
        }
        // console.log(convertedArray);
    //  console.log(convertedArray)
        return {
            msg: 'successfully Find',
            data: getData1,
            graph : convertedArray,
            graph1 : getData
        }

    } catch (error) {
        return Promise.reject(error);
    }
}

async function getProductionByMonth(req) {
    try {

        result = { _id: String, Date: [], ActValue: [] }
        var historicalDataNew = new historicalData(req.query.companyId);
        for (let i = 0; i < 12; i++) {

            fDate = new Date(Number(req.query.year), i, 1).setHours(0, 00, 00, 00)

            tDate = new Date(Number(req.query.year), i + 1, 0).setHours(23, 59, 59, 59)

            getData = await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': fDate, '$lte': tDate },
                        // 'Data._id': 1344 

                    },
                },
                { $unwind: '$Data' },
                {
                    '$match': {
                        'Data._id': { $in: [1344,1419,1435,1458] }
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
                        _id: "$ParameterName",
                        ActValue: {
                            $push: "$ActValue"
                        },
                        Date: {
                            $push: "$Date"
                        }
                    }
                }
            ])

            if (getData.length > 0) {
                result._id = getData[0]._id;
                // let gfg = _.sum([5, 10, 15, 20, 25]);
                result.Date.push(fDate)
                result.ActValue.push(_.sum(getData[0].ActValue))
                result._id = getData[0]._id
            } else {
                result.Date.push(fDate)
                result.ActValue.push(0)
                result._id = getData.length > 0 ? getData[0]._id : "TOTAL LENGTH"
            }

        }
        // getData =await historicalDataNew.aggregate([
        //     {
        //         '$match': {
        //             'AssetId': req.query.assetId,
        //             'Date': { '$gte': req.query.fDate, '$lte': req.query.tDate},
        //             // 'Data._id': 1344 

        //         },
        //     },
        //     { $unwind: '$Data' },
        //     {'$match': {
        //       'Data._id': { $in: [1344]}
        //     }
        // },
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
        // {
        //     '$lookup': {
        //         'from': 'allRegisters',
        //         'localField': 'RegId',
        //         'foreignField': 'RegisterId',
        //         'as': 'registerDetails'
        //     }
        // },
        // {
        //     '$lookup': {
        //         'from': 'parameters',
        //         'localField': 'registerDetails.Parameter',
        //         'foreignField': '_id',
        //         'as': 'parameterDetails'
        //     }
        // },
        // // { $addFields: { last : { $last: "$ActValue" } } }
        // {
        //     $project: {
        //         AssetId : 1,
        //         Date : 1,                   
        //         Last: 1,
        //         First: 1,
        //         ActValue : { $subtract: ["$Last","$First"]},
        //         "ParameterName" : "$parameterDetails.Name"
        //         // 'data.Name': "$parameterDetails.Name"

        //     }
        // },
        // { $unwind: '$ParameterName' },
        // {
        //     $group: {
        //         _id: "$ParameterName",
        //         Actvalue: {
        //             $push: "$ActValue"
        //         },
        //         Date: {
        //             $push: "$Date"
        //         }
        //     }
        // }
        // ])
     let final = [result]
     const convertedArray = final.map(item => ({
        _id: item._id,
        data: _.zipWith(item.ActValue, item.Date, (ActValue, Date) => [Date,ActValue])
    }));
    let final2 = JSON.parse(JSON.stringify(final));
    for(let i = 0 ; i < final2.length ; i ++){
        // console.log(final[i])
        value = final2[i].ActValue.filter(num => num !== 0)
        // const nonZeroArray = final2[i].ActValue.filter(num => num !== 0);
        sum = _.sum(value)
        avg = sum/value.length
        // console.log(value,value.length,_.sum(value)/value.length,)
        final2[i].ActValue.push(sum)
        final2[i].Date.push('Total')
        final2[i].ActValue.push(avg)
        final2[i].Date.push("Average")
    }
        return {
            msg: 'successfully Find',
            data: final2,
            graph : convertedArray,
            graph1 : final
        }

    } catch (error) {
        return Promise.reject(error);
    }
}


// getHistoricalOee
async function getHistoricalCustomeOee(req) {

    try {
        const getOee = await oeeTableData.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': Number(req.query.fDate), '$lte': Number(req.query.tDate) },
                },
            },
            {
                '$sort': { 'Date': -1 }
            }
        ])

        if (getOee.length > 0) {
            totalAvailableTime = 1335;
            for (let i = 0; i < getOee.length; i++) {
                getOee[i].Quality = ((getOee[i].TotalProduction - (getOee.length > 0 ? getOee[i].RejectJob : 0)) / getOee[i].TotalProduction) * 100

                getOee[i].Availability = ((totalAvailableTime - (getOee.length > 0 ? getOee[i].BreakDownTime : 0)) / totalAvailableTime) * 100


                speedEfficiency = getOee[i].TotalProduction / (getOee[i].TotalRunTime * (getOee.length > 0 ? getOee[i].MachineJobPerMinute : 80))

                machineRunEfficiency = getOee[i].TotalRunTime / (totalAvailableTime - ((getOee.length > 0 ? getOee[i].BreakDownTime : 0) + (getOee.length > 0 ? getOee[i].PlannedDownTime : 0)))

                getOee[i].Performance = (speedEfficiency * machineRunEfficiency) * 100
                getOee[i].OEE = (getOee[i].Performance / 100) * (getOee[i].Quality / 100) * (getOee[i].Availability / 100) * 100

            }
        }

        // performance =   { ActValue : [] , Date : [],_id : 'Performance'}
        oee = { ActValue: [], Date: [], _id: 'OEE' }
        // availability = { ActValue : [] , Date : [],_id : 'Availability'}
        // quality = { ActValue : [] , Date : [],_id : 'Quality'}
        totalProduction = { ActValue: [], Date: [], _id: 'Total Production(Meter)' }
        // totalRunTime = { ActValue : [] , Date : [],_id : 'Total Run Time(MIN)'}
        for (let i = 0; i < getOee.length; i++) {

            // performance.ActValue.push(getOee[i].Performance)
            // performance.Date.push(getOee[i].Date)
            // availability.ActValue.push(getOee[i].Availability)
            // availability.Date.push(getOee[i].Date)
            oee.ActValue.push(getOee[i].OEE)
            oee.Date.push(getOee[i].Date)
            // quality.ActValue.push(getOee[i].Quality)
            // quality.Date.push(getOee[i].Date)
            totalProduction.ActValue.push(getOee[i].TotalProduction)
            totalProduction.Date.push(getOee[i].Date)
            // totalRunTime.ActValue.push(getOee[i].TotalRunTime)
            // totalRunTime.Date.push(getOee[i].Date)

        }
        let result = []
        if (totalProduction.ActValue.length > 0 || oee.ActValue.length > 0)
            result.push(oee, totalProduction)
        // _.chunk(['a', 'b', 'c', 'd'], 2);
        // => [['a', 'b'], ['c', 'd']]
        let result11 = []
        for (let i = 0; i < result.length; i++) {

            let obj = { data: [], name: result[i]._id }
            obj.data = _.chunk(result[i].Date, 1);

            for (let j = 0; j < obj.data.length; j++) {

                obj.data[j].push(result[i].ActValue[j])
            }

            result11.push(obj)

        }

        return {
            msg: 'successfully Find',
            data: result,
            // data: result11
        }
    } catch (error) {
        console.log('error occure in get oee', error);
        return Promise.reject('error occure in get oee')
    }
}
// getliveData
async function getliveData(req) {
    try {
        let date1 = new Date(Number(req.query.date))
        let fDate = new Date(Number(req.query.date))
        fDate = new Date(fDate).setHours(0, 0, 0, 0);
        tDate = new Date(fDate).setHours(23, 59, 59, 0)
        // console.log(new Date(fDate), new Date(tDate))

        let date2 = new Date()

        fDate2 = new Date(date2).setHours(7, 0, 0, 0);
        date2 = new Date(date2).setDate(new Date(date2).getDate()+1);
        tDate2 = new Date(date2).setHours(7, 0, 0, 0)
        
        // console.log(new Date(date1),new Date(fDate2), new Date(tDate2))
        var historicalDataNew = new historicalData(req.query.companyId);
        // var historicalDataNew = new historicalData(req.query.companyId);
        // const getAllHistorical = []
        // try{
        const getAllHistorical = await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
            // {
            //     '$match': {
            //         'Data._id': { $in: [1343, 1344] }
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
            {
                "$project": {
                    "data.id": "$Data._id",
                    "data.ActValue": "$Data.ActValue",
                    "data.ValueReceivedDate": "$Data.ValueReceivedDate",
                    'data.Name': "$Data.parameterDetails.Name",
                    'data.ParameterId': "$Data.parameterDetails._id"
                }
            },
            { $unwind: '$data.ParameterId' },
            {
                $group: {
                    _id: null,
                    data: { $push: "$data" },
                }
            },
            {
                $addFields: {
                    "lengthParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.ParameterId", 296] } } },
                    "statusParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.ParameterId", 295] } } },
                    "needleSpeedParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.ParameterId", 347] } } }
                }
            },
        ])
        
//console.log(getAllHistorical)
        nonZeroArr = []
        totalRunTime = 0;
        totalProduction = 0;
        totalRunTimeSec = 0;
        firstValue=0;
        lastValue=0;
        lastrunTime = tDate
        if (getAllHistorical.length > 0) {
            if (getAllHistorical[0].lengthParameter.length > 0 && getAllHistorical[0].statusParameter.length > 0) {
        if(getAllHistorical[0].lengthParameter.length > 0 ){
            firstValue =getAllHistorical[0].lengthParameter[0].ActValue[0]
            lastValue= (getAllHistorical[0].lengthParameter[0].ActValue[getAllHistorical[0].lengthParameter[0].ActValue.length-1])
            totalProduction = (getAllHistorical[0].lengthParameter[0].ActValue[getAllHistorical[0].lengthParameter[0].ActValue.length-1])-getAllHistorical[0].lengthParameter[0].ActValue[0]
        }
        allIndex = []
if(getAllHistorical[0].statusParameter.length >0){
    await getAllHistorical[0].statusParameter[0].ActValue.filter((value, index) => {
        if (value === 0 ) {
            allIndex.push(index)
        }
    });
    // console.log(allIndex.length != 0 , getAllHistorical[0].statusParameter[0].ValueReceivedDate.length > 0)
    if(allIndex.length != 0 && getAllHistorical[0].statusParameter[0].ValueReceivedDate.length > 0){
    for (let i = 1; i < allIndex.length; i++) {
        if ((allIndex[i] - 1) != allIndex[i - 1]) {
        // console.log( allIndex[i - 1],(allIndex[i] ))
        totalRunTime = totalRunTime + getAllHistorical[0].statusParameter[0].ValueReceivedDate[allIndex[i] ] -getAllHistorical[0].statusParameter[0].ValueReceivedDate[allIndex[i - 1]+1 ]
        // totalRunTime = totalRunTime + getAllHistorical[0].statusParameter[0].ValueReceivedDate[allIndex[i] ] -getAllHistorical[0].statusParameter[0].ValueReceivedDate[allIndex[i - 1] ]
        }
    }
}else{
        totalRunTime =  getAllHistorical[0].statusParameter[0].ValueReceivedDate[(getAllHistorical[0].statusParameter[0].ValueReceivedDate.length-1)] -getAllHistorical[0].statusParameter[0].ValueReceivedDate[0]
    }
    totalRunTime = (totalRunTime/1000)/60
    totalRunTimeSec =((totalRunTime/1000)%60)*60
    lastrunTime = getAllHistorical[0].statusParameter[0].ValueReceivedDate[getAllHistorical[0].statusParameter[0].ValueReceivedDate.length-1]
}
}
}
// console.log("lastrunTime",new Date(lastrunTime))

const getOee = await oeeTableData.aggregate([{
    '$match': {
        'AssetId': req.query.assetId,
        'Date': { '$gte': fDate, '$lt': tDate },
    },
},

])
totalAvailableTime = 0;
// console.log(new Date(date1),new Date(fDate2), new Date(tDate2))
if(fDate2 <= date1 && date1 < tDate2){
    totalAvailableTime =  ((date1-fDate2)/1000)/60
}else{

    totalAvailableTime = 1335;
}

quality = (totalProduction - (getOee.length > 0 ? getOee[0].RejectJob : 0)) / totalProduction
  // Availability = (Total available time - BreakDownTime)/Total available time
  availability = (totalAvailableTime - (getOee.length > 0 ? getOee[0].BreakDownTime : 0)) / totalAvailableTime
  // Speed Efficiency = Total production/(Machine running time x 80)
  if(req.query.assetId == "fjkjjl98LM" || req.query.assetId == "ZODA4i" ||  req.query.assetId == "S8AbcVX" || req.query.assetId == "UZ5Xu2f")   {  
   if( getAllHistorical[0].needleSpeedParameter.length > 0 ){
     nonZeroArr = _.filter(getAllHistorical[0].needleSpeedParameter[0].ActValue, num => num !== 0);
    if (_.isEmpty(nonZeroArr)) {
        avgRpm =   0; // To handle the case when all elements are zero
    }else{
        avgRpm =   _.sum(nonZeroArr) / nonZeroArr.length;
    }
}
//   console.log(  avgRpm )
  speedEfficiency = avgRpm/1100

    // speedEfficiency = totalProduction / (totalRunTime * (getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80))               
}else{
        speedEfficiency = totalProduction / (totalRunTime * (getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80))
  }
  //  Machine Run efficiency = Machine running time / (Total available time- (Breakdown Time+Planned down Time))
  machineRunEfficiency = totalRunTime / (totalAvailableTime - ((getOee.length > 0 ? getOee[0].BreakDownTime : 0) + (getOee.length > 0 ? getOee[0].PlannedDownTime : 0)))
  //  Performance = Running Eff x speed Eff
  performance = speedEfficiency * machineRunEfficiency
  // OEE = Performance x Availability X Quality
  oEE = performance * availability * quality
//   console.log("totalProduction ===>",totalProduction ,"totalRunTime ==>",totalRunTime,"totalAvailableTime ==>",totalAvailableTime,"quality = >" ,quality ,"availability = > ",availability,"speedEfficiency = > ",speedEfficiency,"machineRunEfficiency =>",machineRunEfficiency,"performance = > ",performance,"oEE = >",oEE)

// console.log(getAllHistorical,totalRunTime,totalProduction,totalRunTimeSec,getOee)

return {
    msg: 'successfully Find',
    data: {
        quality: { value: quality * 100, Name: "Quality" },
        availability: { value: availability * 100, Name: "Availability" },
        speedEfficiency: { value: speedEfficiency * 100, Name: "Speed Efficiency" },
        machineRunEfficiency: { value: machineRunEfficiency * 100, Name: "Run Efficiency" },
        performance: { value: performance * 100, Name: "Performance" },
        oEE: { value: oEE * 100, Name: "OEE" },
        totalProduction: { value: totalProduction, Name: "Total Production" ,firstValue :firstValue,lastValue :lastValue },
        totalAvailableTime:{value : totalAvailableTime,Name:"Total Available Time"},
        totalRunTime: { value: totalRunTime, Name: "Total Run Time" ,lastrunTime : lastrunTime ,totalRunTimeSec : totalRunTimeSec},
        fDate: { value: new Date(fDate2).toDateString() + ' ' + new Date(fDate2).toLocaleTimeString() },
        tDate: { value: new Date(tDate2).toDateString() + ' ' + new Date(tDate2).toLocaleTimeString() },
        RejectJob : {value: (getOee.length > 0 ? getOee[0].RejectJob : 0) , Name : "Reject Job"},
        BreakDownTime : {value: (getOee.length > 0 ? getOee[0].BreakDownTime : 0) , Name : "Break Down Time"},
        MachineJobPerMinute : {value:  (getOee.length > 0 ? getOee[0].MachineJobPerMinute : 80) , Name : "Machine Job PerMinute"},
        PlannedDownTime : {value: (getOee.length > 0 ? getOee[0].PlannedDownTime : 0), Name : "Planned Down Time"}, 
        needleRpm :{ total :nonZeroArr.length > 0? _.sum(nonZeroArr)  : 0, Number : nonZeroArr.length > 0? nonZeroArr.length  : 0 ,avgRpm : nonZeroArr.length > 0 ? avgRpm : 0}

    }
}
        // }catch(err){
        //     // console.log(err)
        //      }
    } catch (error) {
        console.log('error occure in get oee', error);
        return Promise.reject('error occure in get oee')
    }
}
module.exports = {
    insertOee,
    getOeeTable,
    calculatedOeeGet,
    getProduction,
    getProductionByMonth,
    getHistoricalOee,
    getHistoricalCustomeOee,
    getliveData
}