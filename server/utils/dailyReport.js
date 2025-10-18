const SCHEDULE = require('node-schedule');
const historicalData = require('../api/historical/model');
const companyAssetData = require('../api/companyAsset/model')
const user = require('../api/login/model')
const _ = require('lodash');
// const oeeTableData = require('../api/oeeTable/model')
const excel = require('exceljs');
const dateFormat = require("dateformat");
var mail = require('./mailService');
const { json } = require('body-parser');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
RULE.hour = 7;
RULE.minute = 30;
RULE.second = 0;

// async function aa() {
let DAY = SCHEDULE.scheduleJob(RULE, async () => {
    try{
// new Date(tDate11).setDate(new Date(time).getDate()+1); 
var date = new Date()
let fDate = new Date(date).setDate(date.getDate()-1);
fDate = new Date(fDate).setHours(0, 0, 0, 0)
let tDate =new Date(fDate).setHours(23, 59,59, 0);
// console.log(new Date(fDate),new Date(tDate))

const users = await  user.aggregate([
    {
    $match: {
        "subscription.report.daily" : true
        
    }
},
{
    $group: {
        _id: "$company_id",
        email: {
            $push: "$email_id"
        } 
        
       

    }
}
]);
// console.log(users)

for(let z = 0 ; z < users.length ; z++){
    // if(users._id  == 56){
    const allMeters = await companyAssetData.aggregate([
        {
            $match: {
                'CompanyId': users[z]._id,
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
                AssetId :1,
                DeviceTypeId :1
      
            }
        },
        {
          $group: {
              _id: "$DeviceTypeId",
              AssetId: {
                  $push: "$AssetId"
              }, 
              AssetName : { $push : "$AssetName"},
              DeviceTypeName : {$last :  "$DeviceTypeName"}
             
      
          }
      },
      ])
      if(allMeters.length > 0){
        fileAttached = []
        var historicalDataNew = new historicalData(users[z]._id);
        for(let i = 0 ; i < allMeters.length ; i ++){
            let workbook = new excel.Workbook(); //creating workbook
            const data =  await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId':  { $in: allMeters[i].AssetId },
                        'Date': { '$gte': fDate, '$lte': tDate }
                    },
                },
                { $sort: { Date: 1 } },
      
                { $unwind: '$Data' },
            //     {
            //       '$match': {
            //           'Data._id':  { $in: regIds},
                      
            //       },
            //   },
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
                        'data.parameterId': "$Data.parameterDetails._id",
                        'assetId' : "$AssetId"                   
                    }
                },
                   {
                  $group: {
                      _id: "$assetId",                
                      'ActValue': { $push: "$data.actValue" }, 
                      'Name': { $push: "$data.name" }, 
                      "parameterIds" : { $push: "$data.parameterId" }, 
                      'valueReceivedDate' : { $last : "$data.valueReceivedDate"},          
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
             ]) 
            //  console.log("data",data)
             data.forEach((element) => {
                 let worksheet = workbook.addWorksheet(element.AssetDetails[0].AssetName);
                 let columns = [{ header: element.AssetDetails[0].AssetName, key: '0', width: 30 }];
                 for (let p = 0; p <  element.valueReceivedDate.length; p++) {
                     let obj2 = {
                       header:  dateFormat(element.valueReceivedDate[p], 'HH:MM'),
                       key: (p+1).toString(),
                       width: 30
                     };
                     columns.push(obj2);
                   } 
                //    console.log(columns)
                   worksheet.columns = columns;
                   obj= []
                   pf = [4,16,54,55,56,312]
                   for (let p = 0; p <  element.ActValue.length; p++) {
                    // console.log(element.parameterIds[p][0])
                    if(pf.indexOf(element.parameterIds[p][0]) != -1){
                    // console.log("<======",element.ActValue[p])
                    element.ActValue[p]  = element.ActValue[p].map((ele) => { 
                        if(ele < 0){
                        return Math.abs(ele).toFixed(2)+'(Le)'
                        }else if(ele == 0 || ele > 0){
                            return  ele.toFixed(2)
                        }
                     })
                    //  console.log("====>",element.ActValue[p])
                    }
                    obj = element.ActValue[p]
                    obj.unshift(element.Name[p][0]);
                    // console.log(obj)
                    worksheet.addRows([Object.assign({}, obj)])   
                    obj = [] 

                   }
             })
             await workbook.xlsx.writeFile("uploads/HourlyReport"+allMeters[i].DeviceTypeName+".xlsx")
             .then(function () {
               console.log("file saved!");   
               fileAttached.push ({filename :"HourlyReport"+allMeters[i].DeviceTypeName+".xlsx",path:"uploads/HourlyReport"+allMeters[i].DeviceTypeName+".xlsx"})  
             });
        } 
        
        // for(let g = 0 ; g < users[z].email.length ; g++){
            // console.log(users[z].email)
            arrayName = users[z].email
            arrayName.push('shubhamholdandage@elliotsystems.com')
            // arrayName = ['shubhamholdandage@elliotsystems.com']
        await mail('gmail','notification@elliotsystems.com',
        '',arrayName.join(', '),
        'Device Hourly Report ',
        'rfqh lwfy pvxa wbiv',
        `Dear Elliot Systems Customer,
       
         Attached is your daily report for yesterday. If you choose to stop receiving this report, Please do the following steps.
                     
         1. Please login as a company admin to iot.elliotsystemsonline.com
         2. Navigate to the Profile Icon on the top right and select  "Configuration" from the list
         3. From the list of users, select the "Edit Users" button
         4. Unselect checkbox to stop Daily Reports in the "Subscription" column
                     
                     
         Assuring you of our best service at all times.
                     
         Warm Regards,
         Customer Service
                     
         *************************************** 
         This is a system generated notification. Replies to this message will not be answered.
         "This e-mail is confidential and may also be privileged. if you are not the intended recipient, please notify us immediately; you should not copy or use it for any purpose, nor disclose its contents to any other person" 
         ***************************************`,
         '',
         '',fileAttached)
        }

    //   }
    // }
    }  

// }

}
catch(err){
  console.log(err)
}
})

// aa()