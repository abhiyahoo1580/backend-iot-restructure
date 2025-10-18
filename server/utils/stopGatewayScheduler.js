const SCHEDULE = require('node-schedule');
const historicalData = require('../api/historical/model');
const rawDataData =require('../api/RawData/model')
const companyAssetData = require('../api/companyAsset/model')
const stopGatewayData = require('../api/stopGatewaySmsAlert/model')
const user = require('../api/login/model')
const _ = require('lodash');
// const oeeTableData = require('../api/oeeTable/model')

var mail = require('./mailService');
const { json } = require('body-parser');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
// RULE.hour = 7;
RULE.minute = 20;
RULE.second = 0;

const RULE1 = {}
RULE1.dayOfWeek = new SCHEDULE.Range(0, 7);
// RULE.hour = 7;
RULE1.minute = 50;
RULE1.second = 0;

// async function aa() {
let DAY = SCHEDULE.scheduleJob(RULE, async () => {
// new Date(tDate11).setDate(new Date(time).getDate()+1); 
try{
var date = new Date()
let tDate = new Date(date)
// fDate = new Date(fDate).setHours(0, 0, 0, 0)
let fDate =new Date((tDate - (30 * 60*1000)))
tDate = new Date(tDate).setDate(tDate.getDate(), 0, 0, 0)
fDate = new Date(fDate).setDate(fDate.getDate(), 0, 0, 0)
// console.log(fDate,tDate,new Date(fDate),new Date(tDate))
const allGateway = await companyAssetData.aggregate([
    {
        $match: {
            'CompanyId': { $not: { $eq: 27 } },
            Gateway:  null 
        }
    },
    {
      $group: {
          _id: null,
          AssetId: {
              $push: "$AssetId"
          },    
      }
  },
  ])
  const AllDatewayCall = await rawDataData.aggregate([
    {
        $match: {
            'Id': {$in : allGateway[0].AssetId},
            "data.time": {
                '$gte': fDate,
                '$lte': tDate
            }
        }
    },
    // {$sort : {"data.time" : -1}},
    {
        $group: {
            _id: "$Id",
            // data: {
            //     $last: "$data"
            // },    
        }
    },
    {
        $group: {
            _id: null,
            AssetId: {
                $push: "$_id"
            },   
            // data: {
            //     $push: "$data"
            // },  
        }
    },
  ])
//   console.log(allGateway,AllDatewayCall)
  if(allGateway.length > 0 ){
    // console.log(_.difference(allGateway[0].AssetId, AllDatewayCall[0].AssetId))
    const stopDateways = AllDatewayCall.length > 0 ? await _.difference(allGateway[0].AssetId, AllDatewayCall[0].AssetId) :allGateway[0].AssetId
    for(let i = 0 ; i < stopDateways.length ; i++){
        
        const lastGateWayCall = await rawDataData.aggregate([
            {
                $match: {
                    'Id': stopDateways[i],
                    
                }
            },
            {$sort : {"data.time" : -1}},
            {$limit : 1},
            {
                $lookup: {
                    from: "companyAssets",
                    localField: "Id",
                    foreignField: "AssetId",
                    as: "GatewayInfo"
                }
            },
            {
                $unwind:"$GatewayInfo"
            }, 
          ])
            // console.log(lastGateWayCall)
          if(lastGateWayCall.length > 0){
            const lastMsg = await  stopGatewayData.aggregate([
                {
                    $match: {
                        'assetId': stopDateways[i]                        
                    }
                },
                {$sort : {stopDate : -1}},
                {$limit : 1}
            ])
            //  console.log(lastMsg)
           if(lastMsg.length == 0 || lastMsg[0].stopDate != lastGateWayCall[0].data.time){
            //   console.log(stopDateways[i])
          
              msg = "Elliot Systems Notification"+
                     "\nGateway" + " Offline" +
                     "\nGateway " + stopDateways[i]+ " has gone" + " offline."+
                    "\nDate: " + new Date(lastGateWayCall[0].data.time);
                // console.log(msg)
                const users = await  user.aggregate([
                    {
                    $match: {
                        "company_id" : lastGateWayCall[0].GatewayInfo.CompanyId,
                        // "administrator" : true
                        "subscription.email.alert" : true
                    }
                },
                {
                    $group: {
                        _id: null,
                        email: {
                            $push: "$email_id"
                        }                                    
                    }
                }
                ]);
                const stopGatewayAlertData = new stopGatewayData({  assetId  :stopDateways[i]  ,
                    msg  :msg,
                    stopDate : lastGateWayCall[0].data.time});
                const insertedRawData = await stopGatewayAlertData.save();
                arrayName = users.length > 0 ? users[0].email : []
                // arrayName = []
                arrayName.push('shubhamholdandage@elliotsystems.com' )
                await mail('gmail','notification@elliotsystems.com',
                '',arrayName.join(', '),
                'Gateway Stop Alert ',
                'rfqh lwfy pvxa wbiv',
                msg,
                 '',
                 '',[])
          }
        }

    }
  }}
  catch(err){
    console.log(err)
  }
})
// }
// aa()

let DAY1 = SCHEDULE.scheduleJob(RULE1, async () => {
    // new Date(tDate11).setDate(new Date(time).getDate()+1); 
    try{
    var date = new Date()
    let tDate = new Date(date)
    // fDate = new Date(fDate).setHours(0, 0, 0, 0)
    let fDate =new Date((tDate - (30 * 60*1000)))
    tDate = new Date(tDate).setDate(tDate.getDate(), 0, 0, 0)
    fDate = new Date(fDate).setDate(fDate.getDate(), 0, 0, 0)
    // console.log(fDate,tDate,new Date(fDate),new Date(tDate))
    const allGateway = await companyAssetData.aggregate([
        {
            $match: {
                'CompanyId': { $not: { $eq: 27 } },
                Gateway:  null 
            }
        },
        {
          $group: {
              _id: null,
              AssetId: {
                  $push: "$AssetId"
              },    
          }
      },
      ])
      const AllDatewayCall = await rawDataData.aggregate([
        {
            $match: {
                'Id': {$in : allGateway[0].AssetId},
                "data.time": {
                    '$gte': fDate,
                    '$lte': tDate
                }
            }
        },
        // {$sort : {"data.time" : -1}},
        {
            $group: {
                _id: "$Id",
                // data: {
                //     $last: "$data"
                // },    
            }
        },
        {
            $group: {
                _id: null,
                AssetId: {
                    $push: "$_id"
                },   
                // data: {
                //     $push: "$data"
                // },  
            }
        },
      ])
    //   console.log(allGateway,AllDatewayCall)
      if(allGateway.length > 0 ){
        // console.log(_.difference(allGateway[0].AssetId, AllDatewayCall[0].AssetId))
        const stopDateways = AllDatewayCall.length > 0 ? await _.difference(allGateway[0].AssetId, AllDatewayCall[0].AssetId) :allGateway[0].AssetId
        for(let i = 0 ; i < stopDateways.length ; i++){
            
            const lastGateWayCall = await rawDataData.aggregate([
                {
                    $match: {
                        'Id': stopDateways[i],
                        
                    }
                },
                {$sort : {"data.time" : -1}},
                {$limit : 1},
                {
                    $lookup: {
                        from: "companyAssets",
                        localField: "Id",
                        foreignField: "AssetId",
                        as: "GatewayInfo"
                    }
                },
                {
                    $unwind:"$GatewayInfo"
                }, 
              ])
                // console.log(lastGateWayCall)
              if(lastGateWayCall.length > 0){
                const lastMsg = await  stopGatewayData.aggregate([
                    {
                        $match: {
                            'assetId': stopDateways[i]                        
                        }
                    },
                    {$sort : {stopDate : -1}},
                    {$limit : 1}
                ])
                //  console.log(lastMsg)
               if(lastMsg.length == 0 || lastMsg[0].stopDate != lastGateWayCall[0].data.time){
                //   console.log(stopDateways[i])
              
                  msg = "Elliot Systems Notification"+
                         "\nGateway" + " Offline" +
                         "\nGateway " + stopDateways[i]+ " has gone" + " offline."+
                        "\nDate: " + new Date(lastGateWayCall[0].data.time);
                    // console.log(msg)
                    const users = await  user.aggregate([
                        {
                        $match: {
                            "company_id" : lastGateWayCall[0].GatewayInfo.CompanyId,
                            // "administrator" : true
                            "subscription.email.alert" : true
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            email: {
                                $push: "$email_id"
                            }                                    
                        }
                    }
                    ]);
                    const stopGatewayAlertData = new stopGatewayData({  assetId  :stopDateways[i]  ,
                        msg  :msg,
                        stopDate : lastGateWayCall[0].data.time});
                    const insertedRawData = await stopGatewayAlertData.save();
                    arrayName = users.length > 0 ? users[0].email : []
                    // arrayName = []
                    arrayName.push('shubhamholdandage@elliotsystems.com' )
                    await mail('gmail','notification@elliotsystems.com',
                    '',arrayName.join(', '),
                    'Gateway Stop Alert ',
                    'rfqh lwfy pvxa wbiv',
                    msg,
                     '',
                     '',[])
              }
            }
    
        }
      }}
      catch(err){
        console.log(err)
      }
    })