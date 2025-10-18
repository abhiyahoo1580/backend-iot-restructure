const analysisData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash');


async function getParameterOfMeter(req){
    // console.log('get subject hitt',req);
    try{
        var analysisDataNew = new analysisData(req.query.companyId);
        let time = Number(req.query.date);
     
        let date = new Date(time).setHours(0, 0, 0, 0);
        let fDate = date;
        let tDate =  new Date(time).setHours(23, 59, 59, 0)
        // console.log(new Date(fDate),new Date(tDate))
        const getAllHistorical =  await analysisDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                    // 'ValueReceivedDate': tDate

                },
            },
            { $unwind: '$Data' },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'Data._id',
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
                '$match': {
                    'metersdata._id': Number(req.query.parameter),
                  
                    // 'ValueReceivedDate': tDate

                },
            },
            { '$project': { 'ActValue': "$Data.ActValue", 'ValueReceivedDate':"$Data.ValueReceivedDate" ,'parameterId': "$metersdata._id", 'Description': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode", 'Maxlimit': "$metersdata.Maxlimit" }, },

        ])
        if(getAllHistorical.length > 0){
              //  console.log(getAllHistorical)
         getAllHistorical.forEach((element, i) => {
            //    console.log(element, i)
            //    element.data.forEach((element1, i1) => {
            //     // console.log(element1, i1)
                let obj = {data: [], name: element.Description[0],colorCode : element.ColorCode[0]}
                obj.data =  _.chunk(element.ValueReceivedDate,1);
                element.ActValue.forEach((element2, i2) => {
                    obj.data[i2].push(element2)
                })
            //     // console.log(obj)
                getAllHistorical[i] = obj
                obj = {data: [], name: ''}
            // })
        })
        }
        return {
            msg: 'successfully Find',
            data: getAllHistorical
        }
    }catch (error){
        console.log('error occure in get subject',error);
        return Promise.reject('error occure in get subject')
    }
}

// getCurrentOfMeter
async function getCurrentOfMeter(req){
    // console.log('get subject hitt',req);
    try{
        var analysisDataNew = new analysisData(req.query.companyId);
        let time = Number(req.query.date);
     
        let date = new Date(time).setHours(0, 0, 0, 0);
        let fDate = date;
        let tDate =  new Date(time).setHours(23, 59, 59, 0)
        // console.log(new Date(fDate),new Date(tDate))
        const getAllHistorical =  await analysisDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                    // 'ValueReceivedDate': tDate

                },
            },
            { $unwind: '$Data' },
            {
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': 'Data._id',
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
                '$match': {
                    'metersdata._id':  { '$in': [17,18,19,20] },
                  
                    // 'ValueReceivedDate': tDate

                },
            },
            { '$project': { 'ActValue': "$Data.ActValue", 'ValueReceivedDate':"$Data.ValueReceivedDate" ,'parameterId': "$metersdata._id", 'Description': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode", 'Maxlimit': "$metersdata.Maxlimit" }, },

        ])
        if(getAllHistorical.length > 0){
              //  console.log(getAllHistorical)
         getAllHistorical.forEach((element, i) => {
            //    console.log(element, i)
            //    element.data.forEach((element1, i1) => {
            //     // console.log(element1, i1)
                let obj = {data: [], name: element.Description[0],colorCode : element.ColorCode[0]}
                obj.data =  _.chunk(element.ValueReceivedDate,1);
                element.ActValue.forEach((element2, i2) => {
                    obj.data[i2].push(element2)
                })
            //     // console.log(obj)
                getAllHistorical[i] = obj
                obj = {data: [], name: ''}
            // })
        })
        }
        return {
            msg: 'successfully Find',
            data: getAllHistorical
        }
    }catch (error){
        console.log('error occure in get subject',error);
        return Promise.reject('error occure in get subject')
    }
}
module.exports = {  
    getParameterOfMeter ,
    getCurrentOfMeter
}