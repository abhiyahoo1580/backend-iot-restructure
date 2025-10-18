// const SCHEDULE = require('node-schedule');
// const historicalData1 = require('../api/historical1/model');
// const RULE = {}
// RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
// // RULE.hour = 7;
// // RULE.minute = 30;
// RULE.second = 0;


// // Data  : [{_id : [], ValueReceivedDate:[] , ActValue: []},{_id : [], ValueReceivedDate:[] , ActValue: []}]
// // async function generateRandom(from, to) {
//     //   const min = Math.ceil(from);
//     //   const max = Math.floor(to);
//     //   return Math.floor(Math.random() * (max - min + 1)) + min;
//     // }
    
    
//     function generateRandomFloat(from, to) {
//         return Math.random() * (to - from) + from;
//     }
    
    
//     let DAY = SCHEDULE.scheduleJob(RULE, async () => {
//         // async function aa(data){
//             // console.log("aa calling")
//             try{
//                 const data = [{AssetId : "Shorepet01", min : 3 ,max:6 , Data  : [{_id : 1512, ValueReceivedDate:[] , ActValue: []},{_id : 1513, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet02", min : 60 ,max:90,Data  : [{_id : 1514, ValueReceivedDate:[] , ActValue: []},{_id : 1515, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet03", min : 0 ,max:10,Data  : [{_id : 1516, ValueReceivedDate:[] , ActValue: []},{_id : 1517, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet04", min : 1700 ,max:1900,Data  : [{_id : 1518, ValueReceivedDate:[] , ActValue: []},{_id : 1519, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet05", min : 60 ,max:80,Data  : [{_id : 1520, ValueReceivedDate:[] , ActValue: []},{_id : 1521, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet06", min : 80 ,max:110,Data  : [{_id : 1522, ValueReceivedDate:[] , ActValue: []},{_id : 1523, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet08", min : 1 ,max:1,Data  : [{_id : 1526, ValueReceivedDate:[] , ActValue: []},{_id : 1527, ValueReceivedDate:[] , ActValue: [0]}],Date:Number},
//                     {AssetId : "Shorepet07", min : 60 ,max:85,Data  : [{_id : 1524, ValueReceivedDate:[] , ActValue: [1]},{_id : 1525, ValueReceivedDate:[] , ActValue: [0]}],Date:Number}
//                 ]
//                 let date = new Date()
// let timeStamp = new Date(date).setDate(new Date(date).getDate())
// let fDate =  new Date(date).setHours(0, 0, 0, 0) 
// let tDate =  new Date(date).setHours(23, 59, 59, 59) 
// // console.log(timeStamp,fDate,tDate,new Date(timeStamp),new Date(fDate),new Date(tDate))
// for(let i = 0 ; i < data.length ; i++){
// //   console.log(await generateRandomFloat(data[i].min,data[i].max),i)
//   data[i].Data[0].ValueReceivedDate.push(timeStamp)
//   data[i].Data[1].ValueReceivedDate.push(timeStamp)
//   data[i].Data[0].ActValue.push(await generateRandomFloat(data[i].min,data[i].max))
//   data[i].Date = timeStamp;
//           let getData =  await historicalData1.aggregate([
//             {
//                 '$match': {
//                     'AssetId':data[i].AssetId,
//                     'Date': { '$gte': fDate, '$lte': tDate }
//                 },
//             }])
//             if(getData.length == 0){
//                 const company = new historicalData1(data[i]);
//                 const inserted = await company.save(); 
//             }else{

//                 // console.log(getData)
//                 let bulkOperations =   [
//                 {updateOne: {
//                   filter: { _id: getData[0]._id , "Data._id": data[i].Data[0]._id },
//                   update: {
//                     $push: {
//                       "Data.$.ActValue": data[i].Data[0].ActValue[0],
//                       "Data.$.ValueReceivedDate": data[i].Data[0].ValueReceivedDate[0]
//                     }
//                   }
//                 }},
//                 {updateOne: {
//                   filter: { _id: getData[0]._id , "Data._id": data[i].Data[1]._id },
//                   update: {
//                     $push: {
//                       "Data.$.ActValue": data[i].Data[1].ActValue[0],
//                       "Data.$.ValueReceivedDate": data[i].Data[1].ValueReceivedDate[0]
//                     }
//                   }
//                 }}

//             ]

//             const result = await historicalData1.bulkWrite(bulkOperations, { ordered: true })
//             console.log(result)
//             }
// }
// // console.log(data)
//     }catch (error){
//         console.log('error occure in get historical',error);
//         return Promise.reject('error occure in get historical')
//     }
// })

// // aa(data)

const SCHEDULE = require('node-schedule');
const historicalData1 = require('../api/historical1/model');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
// RULE.hour = 7;
// RULE.minute = 30;
RULE.second = 0;


// Data  : [{_id : [], ValueReceivedDate:[] , ActValue: []},{_id : [], ValueReceivedDate:[] , ActValue: []}]
// async function generateRandom(from, to) {
    //   const min = Math.ceil(from);
    //   const max = Math.floor(to);
    //   return Math.floor(Math.random() * (max - min + 1)) + min;
    // }
    
    
    function generateRandomFloat(from, to) {
        return Math.random() * (to - from) + from;
    }
    
    
    let DAY = SCHEDULE.scheduleJob(RULE, async () => {
        // async function aa(data){
            // console.log("aa calling")
            try{
                const data = [{AssetId : "Shorepet01", min : 2 ,max:7 , Data  : [{_id : 1512, ValueReceivedDate:[] , ActValue: []},{_id : 1513, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :3 ,upper:6},
                    {AssetId : "Shorepet02", min : 50 ,max:90,Data  : [{_id : 1514, ValueReceivedDate:[] , ActValue: []},{_id : 1515, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :60 ,upper:85},
                    {AssetId : "Shorepet03", min : 0 ,max:10,Data  : [{_id : 1516, ValueReceivedDate:[] , ActValue: []},{_id : 1517, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :3 ,upper:9},
                    {AssetId : "Shorepet04", min : 1600 ,max:2000,Data  : [{_id : 1518, ValueReceivedDate:[] , ActValue: []},{_id : 1519, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :1700 ,upper:1900},
                    {AssetId : "Shorepet05", min : 50 ,max:90,Data  : [{_id : 1520, ValueReceivedDate:[] , ActValue: []},{_id : 1521, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :60 ,upper:85},
                    {AssetId : "Shorepet06", min : 60 ,max:120,Data  : [{_id : 1522, ValueReceivedDate:[] , ActValue: []},{_id : 1523, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :70 ,upper:110},
                    {AssetId : "Shorepet08", min : 50 ,max:90,Data  : [{_id : 1526, ValueReceivedDate:[] , ActValue: []},{_id : 1527, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :60 ,upper:85},
                    {AssetId : "Shorepet07", min : 1 ,max:1,Data  : [{_id : 1524, ValueReceivedDate:[] , ActValue: []},{_id : 1525, ValueReceivedDate:[] , ActValue: []}],Date:Number,lowe :1 ,upper:2}
                ]
                let date = new Date()
let timeStamp = new Date(date).setDate(new Date(date).getDate())
let fDate =  new Date(date).setHours(0, 0, 0, 0) 
let tDate =  new Date(date).setHours(23, 59, 59, 59) 
// console.log(timeStamp,fDate,tDate,new Date(timeStamp),new Date(fDate),new Date(tDate))
for(let i = 0 ; i < data.length ; i++){
//   console.log(await generateRandomFloat(data[i].min,data[i].max),i)
  data[i].Data[0].ValueReceivedDate.push(timeStamp)
  data[i].Data[1].ValueReceivedDate.push(timeStamp)
  data[i].Data[0].ActValue.push(await generateRandomFloat(data[i].min,data[i].max))
  data[i].Data[1].ActValue.push(data[i].Data[0].ActValue[0] < data[i].lowe || data[i].Data[0].ActValue[0] > data[i].upper ? 1 : 0 )
  data[i].Date = timeStamp;
          let getData =  await historicalData1.aggregate([
            {
                '$match': {
                    'AssetId':data[i].AssetId,
                    'Date': { '$gte': fDate, '$lte': tDate }
                },
            }])
            // console.log(data[i])
            if(getData.length == 0){
                const company = new historicalData1(data[i]);
                const inserted = await company.save(); 
            }else{

                // console.log(getData)
                let bulkOperations =   [
                {updateOne: {
                  filter: { _id: getData[0]._id , "Data._id": data[i].Data[0]._id },
                  update: {
                    $push: {
                      "Data.$.ActValue": data[i].Data[0].ActValue[0],
                      "Data.$.ValueReceivedDate": data[i].Data[0].ValueReceivedDate[0]
                    }
                  }
                }},
                {updateOne: {
                  filter: { _id: getData[0]._id , "Data._id": data[i].Data[1]._id },
                  update: {
                    $push: {
                      "Data.$.ActValue": data[i].Data[1].ActValue[0],
                      "Data.$.ValueReceivedDate": data[i].Data[1].ValueReceivedDate[0]
                    }
                  }
                }}

            ]

            const result = await historicalData1.bulkWrite(bulkOperations, { ordered: true })
            // console.log(result)
            }
}
// console.log(data)
    }catch (error){
        console.log('error occure in get historical',error);
        return Promise.reject('error occure in get historical')
    }
})

// aa(data)