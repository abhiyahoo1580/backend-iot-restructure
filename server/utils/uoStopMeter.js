const SCHEDULE = require('node-schedule');
const companyAssetStatusData =require('../api/uosplReportDailyNew/model')
const companyAssetData = require('../api/uosplDevice/model')
const userData = require('../api/uosplUser/model')
const _ = require('lodash');
var IO;

// const RULE = {}
// RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
// // RULE.hour = 1;
// // RULE.minute = 44;
// RULE.second = 0;

async function socketConnection(io) {
  IO = io;
  IO.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);

    socket.on('register', (userId) => {
      socket.join(userId);
      // console.log('User registered:', userId, 'with socket ID:', socket.id);
      IO.to(userId).emit('receive_message', "Hello "+ userId );
    });

    socket.on('disconnect', () => {
      // console.log('A user disconnected:', socket.id);
    });
  })
}

// // async function dd() {
// let DAY = SCHEDULE.scheduleJob(RULE, async () => {

// var date = new Date()
// let tDate = new Date(date)
// let fDate =new Date((tDate - (2 * 60*1000)))
// tDate = new Date(tDate).setDate(tDate.getDate(), 0, 0, 0)
// fDate = new Date(fDate).setDate(fDate.getDate(), 0, 0, 0)
// // fDateNew = new Date(fDate).setDate(fDate.getDate(), 0, 0, 0)
// // tDateNew = new Date(tDate).setDate(tDate.getDate(), 0, 0, 0)
// fDateNew = new Date(fDate).setHours(0, 0, 0, 0)
// tDateNew =new Date(tDate).setHours(23, 59, 59, 0);
// // console.log(new Date(fDateNew),new Date(tDateNew))
// // console.log(new Date(fDate),new Date(tDate),tDate,fDate)
// const Device = await companyAssetData.aggregate([
//   {
//       $match: {
//           'CompanyId' :  71 ,
//           'MapCustomer': { $not: { $eq: null } }
//           // "status" :  true 
//       }
//   },
//   {
//     $group: {
//         _id: null,
//         AssetId: {
//             $push: "$AssetId"
//         },    
//     }
// },
// ])
// // console.log(Device)
// if(Device.length > 0){
//   const AllDeviceLastCall = await companyAssetStatusData.aggregate([
//     {
//         $match: {
//             'AssetId': {$in : Device[0].AssetId},
//             "Date" : {
//               '$gte': fDateNew,
//                 '$lte': tDateNew
//             },
//             "LastGatewayCall": {
//                 '$gte': fDate,
//                 '$lte': tDate
//             }         

//         }
//     },
//     {
//       $group: {
//           _id: null,
//           AssetId: {
//               $push: "$AssetId"
//           },    
//       }
//   },
//   ])

//   // console.log("AllDeviceLastCall====>", AllDeviceLastCall)
//   if(AllDeviceLastCall.length === 0 ){
//     // = await User.updateMany(
//     const updatedDevicesMany = await companyAssetData.updateMany({AssetId : {$in : Device[0].AssetId}},
//       {$set:{status:false}});
//       const result =   await companyAssetStatusData.updateMany(
//         {AssetId : {$in : Device[0].AssetId} ,LastGatewayStatus : true , "Date" : {'$gte': fDateNew,'$lte': tDateNew },},
//         { $push: { Status: false , Time : tDate },  $set: { LastGatewayStatus :false ,LastGatewayCall : tDate } },
//         // {$set: {LastGatewayStatus :false }}
//       );
  
//     const updatedDevicesManyToPublish = await companyAssetStatusData.aggregate([
//       {
//           $match: {
//               'AssetId': {$in : Device[0].AssetId},
//               LastGatewayCall : {'$gte': fDate}
//           }
//       },
//       {
//         $lookup: {
//             from: "companyAssets",
//             localField: "AssetId",
//             foreignField: "AssetId",
//             as: "AssetData"
//         }
//     },
//     {
//       $lookup: {
//           from: "users",
//           localField: "AssetData.MapCustomer",
//           foreignField: "_id",
//           as: "userDetails"
//       }
//     },
//     {
//       $unwind:"$userDetails"
//     },
//     {
//       $lookup: {
//           from: "companyAssets",
//           localField: "userDetails._id",
//           foreignField: "MapCustomer",
//           as: "MapDetails"
//       }
//     },
//     {
//       $project : {
//         _id : "$userDetails._id",
//         "MapDetails.AssetId" : 1,
//         // MapCustomer  : "$userDetails._id",
//         "MapDetails.status"  : 1
//       }
//     },
//     {
//       $unwind: "$MapDetails"
//     },
//     {
//       $group: {
//         _id: {
//           id: "$_id",
//           name: "$MapDetails.AssetId"
//         },
//         status: { $first: "$MapDetails.status" }
//       }
//     },
//     {
//       $group: {
//         _id: "$_id.id",
//         "onlineDevice": {
//           $sum: {
//             $cond: [{ $eq: ["$status", true] }, 1, 0]
//           }
//         },
//        "offlineDevice": {
//           $sum: {
//             $cond: [{ $eq: ["$status", false] }, 1, 0]
//           }
//         }
//       }
//     }
//     // {
//     //   $group: {
//     //       _id: "$MapCustomer",
//     //       AssetId: {
//     //           $push: "$data"
//     //       },    
//     //   }
//     // },
//     ])
//       // console.log(updatedDevicesManyToPublish)
//       for(let i = 0 ; i < updatedDevicesManyToPublish.length ; i++){
//         IO.to(updatedDevicesManyToPublish[i]._id.toString()).emit('receive_message', JSON.stringify({offlineDevice :updatedDevicesManyToPublish[i]?.offlineDevice || 0 , onlineDevice :updatedDevicesManyToPublish[i]?.onlineDevice || 0})  );
//       }
//       if(updatedDevicesManyToPublish.length > 0){
//         const AllDeviceCount = await companyAssetData.aggregate([ 
//           {
//               $match  : {
//                   CompanyId : 71
//               }
//           },
//           {
//               $facet: {
//                 // totalDevice : [{ $count: "count" }],
//                 // threeDaysOfflineDevice : [{ $count: "count" }],
//                 onlineDevice : [
//                   { $match: { status: true } },
//                   { $count: "count" }
//                 ],
//                 offlineDevice : [
//                   { $match: { status: false } },
//                   { $count: "count" }
//                 ],
//                 // unmappedDevice : [
//                 //   { $match: { MapCustomer: null } },
//                 //   { $count: "count" }
//                 // ],
//                 // mappedDevice: [
//                 //   { $match: { MapCustomer: { $ne: null } } },
//                 //   { $count: "count" }
//                 // ]
//               }
//             }
     
//       ])
//       const AllUser = await userData.aggregate([
//         {
//           $match  : {
//             company_id : 71,
//             administrator : true
//           }
//       },
//       ])
//       for(let i = 0 ; i < AllUser.length ;i++){
//         IO.to(AllUser[i]._id.toString()).emit('receive_message', JSON.stringify({ "offlineDevice" : AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
//           "onlineDevice" : AllDeviceCount[0]?.onlineDevice[0]?.count || 0})  );
//       // let o =  
//       }
//       // console.log(AllDeviceCount,AllUser)
//       }

//   }else{
// // console.log(AllDeviceLastCall)
// // console.log(_.difference(Device[0].AssetId, AllDeviceLastCall[0].AssetId))
// const stopDevices = _.difference(Device[0].AssetId, AllDeviceLastCall[0].AssetId)
// const updatedDevicesMany = await companyAssetData.updateMany({AssetId : {$in : stopDevices}},
//   {$set:{status:false}});
//   // console.log(updatedDevicesMany)
//   const result =   await companyAssetStatusData.updateMany(
//     {AssetId : {$in : stopDevices} ,LastGatewayStatus : true , "Date" : {'$gte': fDateNew,'$lte': tDateNew },},
//     { $push: { Status: false , Time : tDate },  $set: { LastGatewayStatus :false ,LastGatewayCall : tDate } },
//     // {$set: {LastGatewayStatus :false }}
//   );
//   // console.log(result)
//  const latestUpdatedDevices = await companyAssetStatusData.aggregate([
//   {
//       $match: {
//           'AssetId': {$in : Device[0].AssetId},
//           LastGatewayCall : {'$gte': fDate}
//       }
//   },
//   {
//     $lookup: {
//         from: "companyAssets",
//         localField: "AssetId",
//         foreignField: "AssetId",
//         as: "AssetData"
//     }
// },
// {
//   $lookup: {
//       from: "users",
//       localField: "AssetData.MapCustomer",
//       foreignField: "_id",
//       as: "userDetails"
//   }
// },
// {
//   $unwind:"$userDetails"
// },
// {
//   $lookup: {
//       from: "companyAssets",
//       localField: "userDetails._id",
//       foreignField: "MapCustomer",
//       as: "MapDetails"
//   }
// },
// {
//   $project : {
//     _id : "$userDetails._id",
//     "MapDetails.AssetId" : 1,
//     // MapCustomer  : "$userDetails._id",
//     "MapDetails.status"  : 1
//   }
// },
// {
//   $unwind: "$MapDetails"
// },
// {
//   $group: {
//     _id: {
//       id: "$_id",
//       name: "$MapDetails.AssetId"
//     },
//     status: { $first: "$MapDetails.status" }
//   }
// },
// {
//   $group: {
//     _id: "$_id.id",
//     "onlineDevice": {
//       $sum: {
//         $cond: [{ $eq: ["$status", true] }, 1, 0]
//       }
//     },
//    "offlineDevice": {
//       $sum: {
//         $cond: [{ $eq: ["$status", false] }, 1, 0]
//       }
//     }
//   }
// }
// // {
// //   $group: {
// //       _id: "$MapCustomer",
// //       AssetId: {
// //           $push: "$data"
// //       },    
// //   }
// // },
// ])
// // console.log(latestUpdatedDevices)
// for(let i = 0 ; i < latestUpdatedDevices.length ; i++){
//   IO.to(latestUpdatedDevices[i]._id.toString()).emit('receive_message', JSON.stringify({offlineDevice :latestUpdatedDevices[i]?.offlineDevice || 0 , onlineDevice :latestUpdatedDevices[i]?.onlineDevice || 0})  );
// }
// if(latestUpdatedDevices.length > 0){
//   const AllDeviceCount = await companyAssetData.aggregate([ 
//     {
//         $match  : {
//             CompanyId : 71
//         }
//     },
//     {
//         $facet: {
//           // totalDevice : [{ $count: "count" }],
//           // threeDaysOfflineDevice : [{ $count: "count" }],
//           onlineDevice : [
//             { $match: { status: true } },
//             { $count: "count" }
//           ],
//           offlineDevice : [
//             { $match: { status: false } },
//             { $count: "count" }
//           ]
//         }
//       }

// ])
// const AllUser = await userData.aggregate([
//   {
//     $match  : {
//       company_id : 71,
//       administrator : true
//     }
// },
// ])
// for(let i = 0 ; i < AllUser.length ;i++){
//   IO.to(AllUser[i]._id.toString()).emit('receive_message', JSON.stringify({ "offlineDevice" : AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
//     "onlineDevice" : AllDeviceCount[0]?.onlineDevice[0]?.count || 0})  );
// // let o =  
// }
// // console.log(AllDeviceCount,AllUser)
// }
//   }
// }
//  })
// // }
// // dd()





// async function aa() {
// // let DAY = SCHEDULE.scheduleJob(RULE, async () => {

// try{
// var date = new Date()
// let tDate = new Date(date)
// let fDate =new Date((tDate - (60 * 60*1000)))
// fDateNew = new Date(fDate).setDate(fDate.getDate(), 0, 0, 0)
// tDateNew = new Date(tDate).setDate(tDate.getDate(), 0, 0, 0)
// fDateNew = new Date( fDateNew).setHours(0, 0, 0, 0)
// tDateNew =new Date(tDateNew).setHours(23, 59, 59, 0);

// console.log(new Date(fDateNew),new Date(tDateNew))
// console.log(new Date(fDate),new Date(tDate))

// const Device = await companyAssetData.aggregate([
//     {
//         $match: {
//             'CompanyId' :  27 ,
//             "status" :  true 
//         }
//     },
//     {
//       $group: {
//           _id: null,
//           AssetId: {
//               $push: "$AssetId"
//           },    
//       }
//   },
//   ])
//   console.log(Device)

//   const AllDeviceLastCall = await companyAssetStatusData.aggregate([
//     {
//         $match: {
//             'AssetId': {$in : Device[0].AssetId},
//             "Date": {
//                 '$gte': fDateNew,
//                 '$lte': tDateNew
//             }
//         }
//     },
//   //   {
//   //     $match: {
//   //         // 'AssetId': {$in : Device[0].AssetId},
//   //         "lastGatewayCall": {
//   //             '$gte': fDate,
//   //             '$lte': tDate

//   //         }
//   //     }
//   // },
//     // {$sort : {"data.time" : -1}},
//     // {
//     //     $group: {
//     //         _id: "$Id",
//     //         // data: {
//     //         //     $last: "$data"
//     //         // },    
//     //     }
//     // },
//     // {
//     //     $group: {
//     //         _id: null,
//     //         AssetId: {
//     //             $push: "$_id"
//     //         },   
//     //         // data: {
//     //         //     $push: "$data"
//     //         // },  
//     //     }
//     // },


//   ])
//   console.log(AllDeviceLastCall)
//   for(let i = 0 ; i < AllDeviceLastCall.length ; i++){ 
//     if(fDate < AllDeviceLastCall[i].lastGatewayCall &&  AllDeviceLastCall[i].lastGatewayCall < tDate){     
//     }else{    
//       const updatedDevicesasas = await companyAssetData.findOneAndUpdate({AssetId : AllDeviceLastCall[i].AssetId},
//         {$set:{status:false}});
//       const result =   await companyAssetStatusData.updateOne(
//           { _id: AllDeviceLastCall[i]._id },
//           { $push: { Status: false , Time : new Date().getTime() } }
//         );
//        console.log(result,updatedDevicesasas)
//     }
//   }
  
// }
//   catch(err){
//     console.log(err)
//   }
// // })
// }
// // aa()

module.exports = {
  socketConnection
}

