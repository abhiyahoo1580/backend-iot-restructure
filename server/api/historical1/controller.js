const historicalData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash');
const dateFormat = require("dateformat");

async function getHistorical(req){
    // console.log('get historical hitt',req.query);
    try{      
        var historicalDataNew = new historicalData(req.query.companyId);
        let time = Number(req.query.date);
     
        let date = req.query.view == 'table' ?
                   new Date(Number(req.query.fDate)).setHours(00, 00, 00, 00) :
                   new Date(time).setHours(00, 00, 00, 00);
        let fDate = date;
        let tDate = req.query.view == 'table' ? 
                    new Date(Number(req.query.tDate)).setHours(23, 59, 59, 00) :
                    new Date(time).setHours(23, 59, 59, 00)
        let getAllHistorical = req.query.view == 'table' ? await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
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
                    'data.ActValue': "$Data.ActValue",
                    'data.id': "$Data._id",
                    'date': "$Date",
                    'data.ValueReceivedDate': {
                        $map: {
                            input: "$Data.ValueReceivedDate",
                            as: "ts",
                            in: {
                                $dateToString: {
                                    format: "%H:%M",
                                    timezone:"Asia/Kolkata",
                                    date: {
                                        $toDate: {
                                            $multiply: [
                                                "$$ts"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    'data.Name': "$Data.parameterDetails.Name",
                    name : "$Data.parameterDetails.Name",
                    "data.parameterId" : "$Data.parameterDetails._id",
                    "data.registerAddress" :  "$Data.registerDetails.RegisterAddress"
                }
            },
            { $unwind: '$name' },
            { $sort: { name: 1 } },
            {
                $group: {
                    _id: "$date",
                    data: { $push: "$data" },
                }
            },
            { $sort: { _id: 1 } },

         ]) :  req.query.view == 'graph' ?await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
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
                    'as': 'parameterDetails'
                }
            },

            {
                $lookup: {
                    from: "groupparametergraphs",
                    localField: "parameterDetails._id",
                    foreignField: "ParameterId",
                    as: "group"
                }
            },
            { '$project': { '_id': "$_id", 'data.ActValue': "$Data.ActValue" ,'date' : "$Date" ,'data.ValueReceivedDate': "$Data.ValueReceivedDate" ,'data.Name': "$parameterDetails.Name" ,'data.ColorCode': "$parameterDetails.ColorCode",'prameterId': "$parameterDetails._id",'data.RegisterAddress': "$Data.registerDetails.RegisterAddress",
            'group': {$filter: { input: "$group", as: "u", cond: { $eq: [ "$$u.AssetId", req.query.assetId ] } }}
        } },
            { $unwind: '$group' },

            {
                $group: {
                    _id: "$group._id",
                    data: { $push: "$data" },
                }
            },
         ]) : req.query.view == 'realtime' ?await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
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

            { '$project': 
            { 
                 'ActValue':{ $arrayElemAt: [ '$Data.ActValue', -1 ] }  ,'valueReceivedDate':  { $arrayElemAt: [ '$Data.ValueReceivedDate', -1 ] } ,
                 'Name':{ $arrayElemAt: [ '$Data.parameterDetails.Name', -1 ] },'ColorCode': { $arrayElemAt: [ '$Data.parameterDetails.ColorCode', -1 ] },
                 "parameterId" : { $arrayElemAt: [ '$Data.parameterDetails._id', -1 ] },
                 'Maxlimit': { $arrayElemAt: [ '$Data.parameterDetails.Maxlimit', -1 ] } ,
                 'RegisterAddress' : { $arrayElemAt: ["$Data.registerDetails.RegisterAddress", -1 ] }
                }
             },

            // { '$project': { '_id': "$Data._id", 'ActValue': "$Data.ActValue", 'ValueReceivedDate': "$Data.ValueReceivedDate", 'Description': "$metersdata.Name", 'ColorCode': "$metersdata.ColorCode", 'Maxlimit': "$metersdata.Maxlimit", 'Asset.status': 1 } },
            // { '$addFields': { 'ActValue': { '$last': "$ActValue" }, 'ValueReceivedDate': { '$last': "$ValueReceivedDate" } } },
            // {
            //     $group: {
            //         _id: "$date",
            //         data: { $push: "$data" },
            //     }
            // },
            { $sort: { _id: 1 } },

        ]) : "please select view "

        // console.log(getAllHistorical)
        if(Number(req.query.companyId) === 67 && req.query.view == 'table'){
            // Find object by id
                function findObjectById(array, ids) {
                  return array.find(obj =>  ids.indexOf(obj.id) != -1 );
                 }
            if(getAllHistorical.length > 0){
            for(let i = 0 ; i < getAllHistorical.length ; i ++){
               // Usage
            let result = findObjectById(getAllHistorical[i].data, [1344,1419,1435]);
            // console.log(result); 
            if(result != undefined){
                DailyProduction = {Name : ['DAILY PRODUCTION'] , ActValue: Array}
                // DailyProduction.Name = ['DAILY PRODUCTION']
                DailyProduction.ActValue = _.map(result.ActValue, (num) => Math.abs(result.ActValue[0] - num ))
            // console.log(_.map(result.ActValue, (num) => result.ActValue[result.ActValue.length-1] - num ))
            getAllHistorical[i].data.push(DailyProduction)
            if(i == 0){
            let fDate1 = Number(req.query.date)
            fDate1 = new Date(fDate1).setHours(0,0,0,0)
            fDate1 = new Date(fDate1).setDate(1)
            // console.log(new Date(fDate1),new Date(tDate))         
           var getAllHistorical1 =  await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId':req.query.assetId,
                        'Date': { '$gte': fDate1, '$lte': tDate }
                    },
                },
                { $unwind: '$Data' },
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
                        'data.ActValue': "$Data.ActValue",
                'data.id': "$Data._id",
                        'date': "$Date",
                        // 'data.ValueReceivedDate': {
                        //     $map: {
                        //         input: "$Data.ValueReceivedDate",
                        //         as: "ts",
                        //         in: {
                        //             $dateToString: {
                        //                 format: "%H:%M",
                        //                 timezone:"Asia/Kolkata",
                        //                 date: {
                        //                     $toDate: {
                        //                         $multiply: [
                        //                             "$$ts"
                        //                         ]
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        'data.Name': "$Data.parameterDetails.Name"
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        data: { $push: "$data" },
                    }
                },
                { $sort: { _id: 1 } },
                { $limit : 1}
             ])
            }
                    // console.log(getAllHistorical1)
                    if(getAllHistorical1.length > 0){
                    let result1 = findObjectById(getAllHistorical1[0].data, [1344,1419,1435]);
                    if(result1 != undefined){
                        MonthlyProduction = {Name : ['MONTHLY PRODUCTION'] , ActValue: Array}
                    // result1.Name = ['MONTHLY PRODUCTION']
                    MonthlyProduction.ActValue = _.map(result.ActValue, (num) => Math.abs(result1.ActValue[0] - num  ) )
                    // console.log(_.map(result.ActValue, (num) => result.ActValue[result.ActValue.length-1] - num ))
                    getAllHistorical[i].data.push(MonthlyProduction)
                    }
                    }
            }
        }
        }
    }
    
    if(req.query.view == 'table'){
    getAllHistorical.forEach((element,i) => { 
    element.data.forEach((element1,i1) => { 
        pf = [4,16,54,55,56,312]
        // console.log(pf.indexOf(element1.parameterId[0]))
        if(element1.hasOwnProperty('parameterId') && pf.indexOf(element1.parameterId[0]) != -1){
        getAllHistorical[i].data[i1].ActValue = element1.ActValue.map((ele) => { 
            if(ele < 0){
            return Math.abs(ele).toFixed(2)+'(Le)'
            }else if(ele == 0 || ele > 0){
                return  ele.toFixed(2)
            }
         })
    }
    })
})
}
if(req.query.view == 'realtime'){
    getAllHistorical.forEach((element,i) => { 
        pf = [4,16,54,55,56,312]
        // console.log(element,i)
        if(pf.indexOf(element.parameterId) != -1){
            // console.log(element,i)
            getAllHistorical[i].ActValue = element.ActValue  < 0 ? Math.abs(element.ActValue): element.ActValue
            getAllHistorical[i].PostFix = "(Le)"
        }else {
            getAllHistorical[i].PostFix = "" 
        }
    })
}
    // getAllHistorical.map((element,i) => {
    //     console.log(element,i)
    //     element.data.map((element1,i1) => {
    //         console.log(element1,i1)
    //     })
    // })
    // console.log(getAllHistorical)
        return {
            msg: 'successfully Find',
            data: getAllHistorical
        }
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
}

// getGraphHistorical
async function getGraphHistorical(req){
    // console.log('get historical hitt',req.query);
    try{      
        var historicalDataNew = new historicalData(req.query.companyId);
        let time = Number(req.query.date);
     
        let date = new Date(time).setHours(00, 00, 00, 00);
        let fDate = date;
        let tDate =  new Date(time).setHours(23, 59, 59, 00)
        const getAllHistorical =  await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
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
                    'as': 'parameterDetails'
                }
            },

            {
                $lookup: {
                    from: "groupparametergraphs",
                    localField: "parameterDetails._id",
                    foreignField: "ParameterId",
                    as: "group"
                }
            },
            { '$project': { '_id': "$_id", 'data.ActValue': "$Data.ActValue" ,'date' : "$Date" ,'data.ValueReceivedDate': "$Data.ValueReceivedDate" ,'data.Name': "$parameterDetails.Name" ,'data.ColorCode': "$parameterDetails.ColorCode",'prameterId': "$parameterDetails._id",
            'group': {$filter: { input: "$group", as: "u", cond: { $eq: [ "$$u.AssetId", req.query.assetId ] } }}
        } },
            { $unwind: '$group' },

            {
                $group: {
                    _id: "$group._id",
                    data: { $push: "$data" },
                }
            },
         ]) 

        //  console.log(getAllHistorical)
         getAllHistorical.forEach((element, i) => {
        //    console.log(element, i)
           element.data.forEach((element1, i1) => {
            // console.log(element1, i1)
            let obj = {data: [], name: element1.Name[0]}
            obj.data =  _.chunk(element1.ValueReceivedDate,1);
            element1.ActValue.forEach((element2, i2) => {
                obj.data[i2].push(element2)
            })
            // console.log(obj)
            getAllHistorical[i].data[i1] = obj
            obj = {data: [], name: ''}
        })
        //    let result11 = []
        //    for(let i = 0 ; i < result.length;i++){
        //       // console.log(result[i])
        //       let obj = {data: [], name: result[i]._id}
        //     obj.data =  _.chunk(result[i].Date,1);
        //   //   console.log(a)
        //     for(let j = 0 ;j <obj.data.length; j++){
        //       // a[j].push()
        //       obj.data[j].push(result[i].ActValue[j])
        //     }
        //   //   console.log(a)
        //   result11.push(obj)

        //   }

         })
        // console.log( getAllHistorical )
        return {
            msg: 'successfully Find',
            data: getAllHistorical
        }
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
}


// You can achieve the desired output in JavaScript by iterating through the input array, extracting the Total and Length values from each object, and then formatting them accordingly. Here's a function to do that:

// javascript
// Copy code
function formatData(input) {
    let totalArray = [];
    let lengthArray = [];
    
    // Extracting Total and Length values
    input.forEach((item,i) => {
        totalArray.push(item.Totalkwh);
        lengthArray.push('Batch '+(i+1)+' ('+ item.ValueReceivedDate[0] + '-' + item.ValueReceivedDate[item.ValueReceivedDate.length - 1] +')'+' ('+item.Totalkwh +')');
    });
    
    // Formatting the output
    let output = [{
        ActValue :totalArray,
        Lable: lengthArray
    }];

    return output;
}
// getBatchForShree
async function getBatchForShree(req){
  ;
    try{      
    var historicalDataNew = new historicalData(req.query.companyId);
    let time = Number(req.query.date);
    let date = new Date(time).setHours(00, 00, 00, 00);
    let fDate = date;       
    let tDate = new Date(time).setHours(23, 59, 59, 00)   
    let time0 = Number(req.query.date);
    let fDate0 = new Date(time0).setDate(new Date(time0).getDate()-1);
        fDate0 = new Date(fDate0).setHours(00, 00, 00, 00);
    let tDate0 = new Date(fDate0).setHours(23, 59, 59, 00)  
    const getAllBatch0 = await historicalDataNew.aggregate([
        {
            '$match': {
                'AssetId':req.query.assetId,
                'Date': { '$gte': fDate0, '$lte': tDate0 }
            },
        },
        { $unwind: '$Data' },
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

        { '$project': {  
         'data.id': "$Data._id",
        'data.ActValue':{ $arrayElemAt: [ '$Data.ActValue', -1 ] }  ,
        'data.valueReceivedDate':  { $arrayElemAt: [ '$Data.ValueReceivedDate', -1 ] } ,
        'data.Name':{ $arrayElemAt: [ '$Data.parameterDetails.Name', -1 ] },
        'data.ColorCode': { $arrayElemAt: [ '$Data.parameterDetails.ColorCode', -1 ] },
        'data.Maxlimit': { $arrayElemAt: [ '$Data.parameterDetails.Maxlimit', -1 ] },
        'date' : "$Date" 
    } ,        
    },
        {
            $group: {
                _id: "$date",
                data: { $push: "$data" },
            }
        },
        {
            $addFields: {
               "batchParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 95] } } },
               "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 105] } } }
            }
         }
        

    ])
    const getAllBatch =await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },  

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
            { '$project': { '_id': "$_id",'data.id': "$Data._id", 'data.ActValue': "$Data.ActValue" ,'date' : "$Date" ,'data.ValueReceivedDate': "$Data.ValueReceivedDate" ,'data.Name': "$Data.parameterDetails.Name" } },
            {
                $group: {
                    _id: "$date",
                    data: { $push: "$data" },
                }
            },
            {
                $addFields: {
                   "batchParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 95] } } },
                   "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 105] } } }
                }
             }
            
       
         ])   

        let allIndex = []
        allBatch = [];
         if(getAllBatch.length > 0){
        
          if(getAllBatch[0].batchParameter.length > 0){
            
            if(getAllBatch0[0].batchParameter[0].ActValue ==0 &&getAllBatch[0].batchParameter[0].ActValue[0]!=0){
                allIndex.push(0)
            }
            await getAllBatch[0].batchParameter[0].ActValue.filter((value, index) => {
                if (value === 0 ) {
                    allIndex.push(index)
                }
            });
      
            for (let i = 1; i < allIndex.length; i++) {
                if ((allIndex[i] - 1) != allIndex[i - 1]) {
             
                  let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                  for (let j = 0; j <= getAllBatch[0].data.length; j++) {
              
                    if (j == getAllBatch[0].data.length) {
                 
                     Totalkwh = _.slice(getAllBatch[0].totalParameter[0].ActValue, (allIndex[i - 1] == 0 ? 0 :allIndex[i - 1]+1), allIndex[i])
                     temp1.Totalkwh = Totalkwh[Totalkwh.length - 1] - Totalkwh[0]
                     await _.slice(getAllBatch[0].data[0].ValueReceivedDate, allIndex[i - 1] == 0 ? allIndex[i - 1] : (allIndex[i - 1] + 1), allIndex[i]).filter((value, index) => {
                        temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                    }
                    );

                  }else{
                    let obj = {};
                    obj.ActValue = _.slice(getAllBatch[0].data[j].ActValue, allIndex[i - 1] == 0 ? allIndex[i - 1] : (allIndex[i - 1] + 1), allIndex[i])
                    obj._id = getAllBatch[0].data[j].id
                    obj.Name = getAllBatch[0].data[j].Name[0]
                    temp1.data.push(obj)
                  }
                }
                allBatch.push(temp1)
            
            }
          }
         } 
        }
       
        if(getAllBatch.length > 0){
            if(getAllBatch[0].batchParameter.length > 0 && (getAllBatch[0].batchParameter[0].ActValue[getAllBatch[0].batchParameter[0].ActValue.length-1]) !=0){
                let date1 = new Date(date).setDate(new Date(date).getDate()+1);
                let fDate1 = date1;       
                let tDate1 = new Date(date1).setHours(23, 59, 59, 00)             
                const getAllBatch1 =await historicalDataNew.aggregate([
                    {
                        '$match': {
                            'AssetId':req.query.assetId,
                            'Date': { '$gte': fDate1, '$lte': tDate1 }
                        },
                    },
                    { $unwind: '$Data' },  
        
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
                    { '$project': { '_id': "$_id",'data.id': "$Data._id", 'data.ActValue': "$Data.ActValue" ,'date' : "$Date" ,'data.ValueReceivedDate': "$Data.ValueReceivedDate" ,'data.Name': "$Data.parameterDetails.Name" } },
                    {
                        $group: {
                            _id: "$date",
                            data: { $push: "$data" },
                        }
                    },
                    {
                        $addFields: {
                           "batchParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 95] } } },
                           "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 105] } } }
                        }
                     }
                    
               
                 ]) 
                
                 if(getAllBatch1.length > 0){        
                    if(getAllBatch1[0].batchParameter.length > 0 && getAllBatch1[0].batchParameter[0].ActValue.indexOf(0) != 0){
                        let lastIndex = getAllBatch1[0].batchParameter[0].ActValue.indexOf(0)
                        let firstIndex = allIndex[allIndex.length-1]                      
                        let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                        for (let j = 0; j <= getAllBatch[0].data.length; j++) {

                        if (j == getAllBatch[0].data.length) {
                            temp1.Totalkwh =getAllBatch1[0].totalParameter[0].ActValue[lastIndex-1]-getAllBatch[0].totalParameter[0].ActValue[firstIndex+1]
                            _.concat(_.slice(getAllBatch[0].data[0].ValueReceivedDate, firstIndex+1, getAllBatch[0].batchParameter[0].ActValue.length-1),_.slice(getAllBatch1[0].data[0].ValueReceivedDate, 0,lastIndex-1 )).filter((value, index) => {
                                temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                            }
                            );
                            
                        }else{
                        let obj = {};
                        obj.ActValue = _.concat(_.slice(getAllBatch[0].data[j].ActValue, firstIndex+1, getAllBatch[0].batchParameter[0].ActValue.length-1),_.slice(getAllBatch1[0].data[j].ActValue, 0,lastIndex-1 ))
                      
                        obj._id = getAllBatch[0].data[j].id
                        obj.Name = getAllBatch[0].data[j].Name[0]
                       
                        temp1.data.push(obj)
                    }
                    }
                  
                    allBatch.push(temp1)

                    }
                    else{
                        // console.log("else block")
                        let lastIndex = getAllBatch[0].batchParameter[0].ActValue.length-1
                        let firstIndex = (allIndex[allIndex.length-1]+1)
                        // console.log(firstIndex , lastIndex , getAllBatch,allIndex)

                        let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                        for (let j = 0; j <= getAllBatch[0].data.length; j++) {

                        if (j == getAllBatch[0].data.length) {
                            temp1.Totalkwh =getAllBatch[0].totalParameter[0].ActValue[lastIndex]-getAllBatch[0].totalParameter[0].ActValue[(firstIndex)]
                            _.slice(getAllBatch[0].data[0].ValueReceivedDate, firstIndex, lastIndex).filter((value, index) => {
                                temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                            }
                            );
                            
                        }else{
                        let obj = {};
                        obj.ActValue = _.slice(getAllBatch[0].data[j].ActValue, (firstIndex),lastIndex )
                      
                        obj._id = getAllBatch[0].data[j].id
                        obj.Name = getAllBatch[0].data[j].Name[0]
                    //    console.log(obj)
                        temp1.data.push(obj)
                    }
                    }
                    allBatch.push(temp1)
                    }
                }

            }
        }
        // console.log(allBatch)
        let output = formatData(allBatch);
        // arrays = allBatch.map(obj => {obj.DifferenceValue});
        return {
            msg: 'successfully Find',
            data: allBatch,
            graph : output
        }
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
}

function formatDataWeldingApi(input) {
    let totalArray = [];
    let lengthArray = [];
    
    // Extracting Total and Length values
    input.forEach((item,i) => {
        totalArray.push(item.Totalkwh);
        lengthArray.push('Welding '+(i+1)+' ('+ item.ValueReceivedDate[0] + '-' + item.ValueReceivedDate[item.ValueReceivedDate.length - 1] +')'+' ('+(item.Totalkwh.toFixed(3)) +')');
    });
    
    // Formatting the output
    let output = [{
        ActValue :totalArray,
        Lable: lengthArray
    }];

    return output;
}
// getWeldingReportGet
async function getWeldingReportGet(req){
      try{   
        var historicalDataNew = new historicalData(req.query.companyId);
        let time = Number(req.query.date);
        let date = new Date(time).setHours(0, 0, 0, 0);
        let fDate = date;       
        let tDate = new Date(time).setHours(23, 59, 59, 0)   
        // console.log(new Date(fDate),new Date(tDate))
        const getAllWelding =await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId':req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },  

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
            { '$project': { '_id': "$_id",'data.id': "$Data._id", 'data.ActValue': "$Data.ActValue" ,'date' : "$Date" ,'data.ValueReceivedDate': "$Data.ValueReceivedDate" ,'data.Name': "$Data.parameterDetails.Name" } },
            {
                $group: {
                    _id: "$date",
                    data: { $push: "$data" },
                }
            },
            {
                $addFields: {
                   "weldingParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1505] } } },
                   "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 1509] } } }
                }
             }
            
       
         ])   
        // console.log(getAllWelding)
        allWeldings = [];
        if(getAllWelding.length > 0){
      
            indexes = _.reduce(getAllWelding[0].weldingParameter[0].ActValue , (result, value, index) => {
                if (value != 0) result.push(index);
                return result;
              }, []);
            //   console.log(indexes)
              const grouped = _.reduce(indexes, (result, value) => {
                if (result.length === 0 || value !== _.last(_.last(result)) + 1) {
                  result.push([value]); // Start a new group
                } else {
                  _.last(result).push(value); // Add to the last group
                }
                return result;
              }, []);
            //   console.log(grouped)
              for(let i = 0 ; i < grouped.length ; i++){
                let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                for(let j = 0 ; j <= getAllWelding[0].data.length ; j++){
                    if(j == getAllWelding[0].data.length){
                        temp1.Totalkwh =getAllWelding[0].totalParameter[0].ActValue[ (grouped[i][grouped[i].length-1])]-getAllWelding[0].totalParameter[0].ActValue[(grouped[i][0])]

                        _.slice(getAllWelding[0].data[0].ValueReceivedDate, grouped[i][0], (grouped[i][grouped[i].length-1]+1)).filter((value, index) => {
                            temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                        }
                        );
                    }else{
                    let obj = {};
                    // console.log( grouped[i][0],grouped[i][grouped[i].length-1])
                    obj.ActValue = _.slice(getAllWelding[0].data[j].ActValue, grouped[i][0],(grouped[i][grouped[i].length-1]+1) )                      
                    obj._id = getAllWelding[0].data[j].id
                    obj.Name = getAllWelding[0].data[j].Name[0]
                    // console.log(i , obj)
                    temp1.data.push(obj)
                }
            }
                // console.log(i , temp1)
                allWeldings.push(temp1)
              }
            //   console.log(allWeldings)
        }
      graph =   formatDataWeldingApi(allWeldings)
    //   console.log(graph)
      return {
        msg: 'successfully Find',
        data: allWeldings,
        graph : graph
    }
        console.log("getAllWelding")
      }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
} 

async function getShiftBatchForShree(req){
   
    try{      
    var historicalDataNew = new historicalData(req.query.companyId);
        let fDate = new Date(Number(req.query.fDate)).setHours(00, 00, 00, 00);     
        let tDate = new Date(Number(req.query.tDate)).setHours(23, 59, 59, 00);
    try {
        var getAllBatch =await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate },
                },
            },
            { $unwind: '$Data' },
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
                            cond: { $and: [{$gte: ["$$u",Number(req.query.fDate)]},{$lte: ["$$u",Number(req.query.tDate)]} ] } } }
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
                '$lookup': {
                    'from': 'allRegisters',
                    'localField': '_id',
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
                   "batchParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 95] } } },
                   "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 105] } } }
                }
             }
        
        ])
    }catch(e){
// console.log(e)
    }
    //    console.log(getAllBatch)
        let allIndex = []
        allBatch = [];
        if(getAllBatch != undefined && getAllBatch.length > 0 ){
     
         if(getAllBatch[0].batchParameter.length > 0){
     
           await getAllBatch[0].batchParameter[0].ActValue.filter((value, index) => {
               if (value === 0 ) {
                   allIndex.push(index)
               }
           });
      ;
           for (let i = 1; i < allIndex.length; i++) {
               if ((allIndex[i] - 1) != allIndex[i - 1]) {
                 let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                 for (let j = 0; j <= getAllBatch[0].data.length; j++) {
                   if (j == getAllBatch[0].data.length) {
                    Totalkwh = _.slice(getAllBatch[0].totalParameter[0].ActValue, (allIndex[i - 1] == 0 ? 0 :allIndex[i - 1]+1), allIndex[i])
                    temp1.Totalkwh = Totalkwh[Totalkwh.length - 1] - Totalkwh[0]
                    await _.slice(getAllBatch[0].data[0].ValueReceivedDate, allIndex[i - 1] == 0 ? allIndex[i - 1] : (allIndex[i - 1] + 1), allIndex[i]).filter((value, index) => {
                       temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                   }
                   );

                 }else{
                   let obj = {};
                   obj.ActValue = _.slice(getAllBatch[0].data[j].ActValue, allIndex[i - 1] == 0 ? allIndex[i - 1] : (allIndex[i - 1] + 1), allIndex[i])
                   obj._id = getAllBatch[0].data[j].id
                   obj.Name = getAllBatch[0].data[j].Name[0]
                   temp1.data.push(obj)
                 }
               }
               allBatch.push(temp1)
              
           }
         }

         if(getAllBatch[0].batchParameter[0].ActValue[getAllBatch[0].batchParameter[0].ActValue.length-1] != 0  ){
            // console.log(new Date(fDate),new Date(tDate),new Date(Number(req.query.fDate)) ,new Date(Number(req.query.tDate)))
            let time1 = Number(req.query.tDate);

            let tDate2 =  new Date(time1).setHours(23, 59, 59, 00);
            try{
            var getAllBatch1 =await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': req.query.assetId,
                        'Date': { '$gte': fDate, '$lte': tDate2 },
                    },
                },
                { $unwind: '$Data' },
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
                                cond: { $and: [{$gte: ["$$u",time1]},{$lte: ["$$u",tDate2]} ] } } }
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
                    '$lookup': {
                        'from': 'allRegisters',
                        'localField': '_id',
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
                       "batchParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 95] } } },
                       "totalParameter": { $filter: { input: "$data", as: "u", cond: { $eq: ["$$u.id", 105] } } }
                    }
                 }
            
            ])
        }catch(e){
            // console.log(e)
        }
            // console.log(getAllBatch1)
            if(getAllBatch1 != undefined && getAllBatch1.length > 0 ){
                // console.log(getAllBatch1[0].batchParameter[0].ActValue.indexOf(0)-1)
                  let lastIndex = ( getAllBatch1[0].batchParameter[0].ActValue.indexOf(0) == 0 ? 1 : getAllBatch1[0].batchParameter[0].ActValue.indexOf(0)-1 );
                  let firstIndex =allIndex.length > 0 ? allIndex[allIndex.length-1]   : -1                    
                // console.log(firstIndex,lastIndex)
                let temp1 = { data: [], ValueReceivedDate: [], Totalkwh: Number }
                for (let j = 0; j <= getAllBatch[0].data.length; j++) {

                if (j == getAllBatch[0].data.length) {
                    temp1.Totalkwh =getAllBatch1[0].totalParameter[0].ActValue[lastIndex-1]-getAllBatch[0].totalParameter[0].ActValue[firstIndex+1]
                    _.concat(_.slice(getAllBatch[0].data[0].ValueReceivedDate, firstIndex+1, getAllBatch[0].batchParameter[0].ActValue.length-1),_.slice(getAllBatch1[0].data[0].ValueReceivedDate, 0,lastIndex-1 )).filter((value, index) => {
                        temp1.ValueReceivedDate.push(dateFormat(value, 'hh:MM TT'))
                    }
                    );
                }else{
                        let obj = {};
                        obj.ActValue = _.concat(_.slice(getAllBatch[0].data[j].ActValue, firstIndex+1, getAllBatch[0].batchParameter[0].ActValue.length-1),_.slice(getAllBatch1[0].data[j].ActValue, 0,lastIndex-1 ))
                      
                        obj._id = getAllBatch[0].data[j].id
                        obj.Name = getAllBatch[0].data[j].Name[0]
                       
                        temp1.data.push(obj)
                    }
            }
            allBatch.push(temp1)
            }
         }

        }
         
       }
//   console.log(allBatch)
  let output = formatData(allBatch);
        return {
            msg: 'successfully Find',
            data: allBatch,
            graph : output
        }
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
}

// getAvailableDateByAssetId
async function getAvailableDateByAssetId(req){
    
    try{      
        var historicalDataNew = new historicalData(req.query.companyId);
       const getAllDates =  await historicalDataNew.aggregate([
        {
            '$match': {
                'AssetId': req.query.assetId,          
            },
        },
        {
            $group: {
                _id: "$AssetId",           
                Date: { $push: "$Date" },              
            }
        },
        ])
        return {
            msg: 'successfully Find',
            data: getAllDates
        }
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
}

// getGraph for mobile app
async function getGraphForMobileApp(req) {
    try {
        var historicalDataNew = new historicalData(req.query.companyId);
        let time = Number(req.query.date);

        let date = new Date(time).setHours(00, 00, 00, 00);
        let fDate = date;
        let tDate = new Date(time).setHours(23, 59, 59, 00);
        const getAllHistorical = await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId': req.query.assetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            },
            { $unwind: '$Data' },
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
                    'as': 'parameterDetails'
                }
            },

            {
                $lookup: {
                    from: "groupparametergraphs",
                    localField: "parameterDetails._id",
                    foreignField: "ParameterId",
                    as: "group"
                }
            },
            {
                '$project': {
                    '_id': "$_id", 'data.ActValue': "$Data.ActValue", 'date': "$Date", 'data.ValueReceivedDate': "$Data.ValueReceivedDate", 'data.Name': "$parameterDetails.Name", 'data.ColorCode': "$parameterDetails.ColorCode", 'prameterId': "$parameterDetails._id",
                    'group': {
                        $filter: {
                            input: "$group",
                            as: "u",
                            cond: {
                                $eq: [
                                    "$$u.AssetId", req.query.assetId
                                ]
                            }
                        }
                    }
                }
            },
            { $unwind: '$group' },

            {
                $group: {
                    _id: "$group._id",
                    data: { $push: "$data" },
                }
            },
            // {
            //     $unwind: '$data'
            // }
            {
                '$project': {
                    'ActValue': '$data.ActValue',
                    'Name': '$data.Name',
                    'colorCode': '$data.ColorCode',
                    'ValueReceivedDate': { $arrayElemAt: ['$data.ValueReceivedDate', 0] },


                }
            },
            {
                '$sort': {
                    _id: 1
                }
            }

            // {
            //     $unwind: '$data'
            // },

            // {
            //     $unwind: '$ValueReceivedDate'
            // },
        ])
        return {
            msg: 'successfully Find',
            data: getAllHistorical
        }
    } catch (error) {
        console.log('error occure in get graph', error);
        return Promise.reject('error occure in get graph')
    }
}

module.exports = {
    getHistorical,
    getBatchForShree,
    getShiftBatchForShree,
    getAvailableDateByAssetId,
    getGraphHistorical,
    getGraphForMobileApp,
    getWeldingReportGet
}