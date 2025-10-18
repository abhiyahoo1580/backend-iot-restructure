const SCHEDULE = require('node-schedule');
const historicalData = require('../api/historical/model');
const companyAssetData = require('../api/companyAsset/model')
const lcdDifferenceData = require('../api/lcdDifference/model');
const _ = require('lodash');
// const oeeTableData = require('../api/oeeTable/model')
const excel = require('exceljs');
const dateFormat = require("dateformat");
var mail = require('./mailService');
const { json } = require('body-parser');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
RULE.hour = 10;
RULE.minute = 20;
RULE.second = 0;
// async function aa() {
let DAY = SCHEDULE.scheduleJob(RULE, async () => {
    try{
var date = new Date()
let fDate = date.getDate() != 1 ?  new Date(date).setDate(1) : new Date(date).setMonth(date.getMonth()-1);
fDate = new Date(fDate).setHours(7, 0, 0, 0)
let tDate =new Date(date).setHours(7, 0, 0, 0);
// console.log(new Date(fDate),new Date(tDate))
const previousDate = new Date(date);
previousDate.setDate(date.getDate() - 1);
// console.log(new Date(previousDate))
const allMeters = await companyAssetData.aggregate([
  {
      $match: {
          'CompanyId': 20,
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
        AssetName : { $push : "$AssetName"}
       

    }
},
])
AllDeviceTypeId = []
const getAllLcdDiffConfig = await lcdDifferenceData.aggregate([
  {
      '$match': {
          'CompanyId':20,
    
      }
  },
  {
      '$lookup': {
          'from': 'parameters',
          'localField': 'ParameterId',
          'foreignField': '_id',
          'as': 'parameterData'
      }
  },
  {
      '$lookup': {
          'from': 'deviceTypes',
          'localField': 'DeviceType',
          'foreignField': 'DeviceTypeId',
          'as': 'deviceTypeData'
      }
  },
  {
      $group: {
          _id: "$DeviceType",
          DeviceTypeName: { $last: "$deviceTypeData.Name" },
          ids :  { $push: "$_id" },
          parameterIds :  { $push: "$ParameterId" },
          parameterNames :  { $push: "$parameterData.Name" },
      }
  },
  {
    '$lookup': {
        'from': 'allRegisters',
        'localField': 'parameterIds',
        'foreignField': 'Parameter',
        'as': 'registerData'
    }
},  
])

var historicalDataNew = new historicalData(20);
let workbook = new excel.Workbook(); //creating workbook
for(let i = 0 ; i < allMeters.length ; i ++){
//   console.log("allMeters[i]" ,allMeters[i])

  value = _.filter(getAllLcdDiffConfig, v => v._id == allMeters[i]._id) 
if(value.length > 0){
  regIds = []  
  value[0].registerData.forEach((element) => {
    regIds.push(element.RegisterId)
  });
       const data =  await historicalDataNew.aggregate([
          {
              '$match': {
                  'AssetId':  { $in: allMeters[i].AssetId },
                  'Date': { '$gte': fDate, '$lte': tDate }
              },
          },
          { $sort: { Date: 1 } },

          { $unwind: '$Data' },
          {
            '$match': {
                'Data._id':  { $in: regIds},
                
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
                  'actValue': "$Data.ActValue",
                  'date': "$Date",               
                  'name': "$Data.parameterDetails.Name",
                  'assetId' : "$AssetId"                   
              }
          },
        //      {
        //     $group: {
        //         _id: "$assetId",                
        //         'Data.actValue': {
        //             $push: "$actValue"
        //         }, 
        //         'Data.Date' : { $push : "$date"},          
        //     }
        // },
       ]) 
    //    console.log("data",data)
       let worksheet = workbook.addWorksheet(value[0].DeviceTypeName[0]);
        //creating worksheet
       let columns = [{ header: 'Name', key: '0', width: 30 }];
       for (let p = 1; p <=  previousDate.getDate(); p++) {
        let date2 = new Date(previousDate)
         let obj2 = {
           header:  dateFormat((new Date(date2).setDate(p)), "dd, mmmm, yy"),
           key: (p).toString(),
           width: 30
         };
         columns.push(obj2);
       } 
    //    columns.push({ header: 'MINIMUM', key: columns.length.toString(), width: 30 });
    //    columns.push({ header: 'MAXIMUM', key: columns.length.toString(), width: 30 });
    //    columns.push({ header: 'AVERAGE', key: columns.length.toString(), width: 30 });
       columns.push({ header: 'TOTAL', key: columns.length.toString(), width: 30 });
    //    console.log(columns)
         //  WorkSheet Header
         worksheet.columns = columns;
         for(let j = 0 ;  j  <  allMeters[i].AssetId.length ; j++){
             date1 = new Date(previousDate)
            obj= []
            for(let z = 1 ;  z  <= previousDate.getDate() ; z++){
                // console.log(z,z+1)
                let fDate1 = new Date(date1).setDate(z);
                fDate1 = new Date(fDate1).setHours(7, 0, 0, 0)
                let tDate1 = new Date(date1).setDate(z+1);
                tDate1 =new Date(tDate1).setHours(7, 0, 0, 0);       
                valuetestMatch = _.filter(data, v => v.assetId == allMeters[i].AssetId[j] && (fDate1 <= v.date && v.date < tDate1) )
                obj.push(valuetestMatch.length > 0 ? parseFloat((valuetestMatch[0].actValue[(valuetestMatch[0].actValue.length-1)] - valuetestMatch[0].actValue[0]).toFixed(2)) :'-')  

            }
            // console.log(obj)
            const sumNumbers = obj.reduce((acc, num) => num != '-' ? acc + num :acc , 0);
            // const minNumber = _.min(obj);
            // const maxNumber = _.max(obj);
            // const avgNumber = sumNumbers/obj.length;
            obj.unshift(allMeters[i].AssetName[j]);
            obj.push(sumNumbers)

    worksheet.addRows([Object.assign({}, obj)])   
    obj = []         

         }   
        }
        }   

        if(allMeters.length > 0 && getAllLcdDiffConfig.length > 0){   
        await workbook.xlsx.writeFile("uploads/DailyConsumptionReport.xlsx")
         .then(function () {
        //    console.log("file saved!");     
         });
        //  arrayName = ["shubhamholdandage@elliotsystems.com"]
        
        arrayName = ['kishor.talele@llproducts.com','Bhavesh.vishe@llproducts.com','Vinod.sharma@llproducts.com','Mahendra.patil@llproducts.com','shubhamsarwade@elliotsystems.com']
          arrayName.push('shubhamholdandage@elliotsystems.com')
 await mail('gmail','notification@elliotsystems.com',
 '',
 arrayName.join(', '),
 'Daily Consumption Report',
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
  'DailyConsumptionReport.xlsx',
  'uploads/DailyConsumptionReport.xlsx',[])
        }
    }
    catch(err){
      console.log(err)
    }
    })
// }
// aa()

