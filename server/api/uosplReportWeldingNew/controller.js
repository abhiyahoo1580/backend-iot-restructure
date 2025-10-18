const uosplReportData = require('./model');
const { ObjectId } = require('mongodb');

async function getWeldingReport(req) {
    try {
        // console.log(req.query.ids)
        if (typeof req.query.ids === 'string') {
            ids = req.query.ids.split(',').map(ObjectId); // Convert to an array of numbers
            // console.log(ids)
        }

        if (ids.length > 0) {
            var data = await uosplReportData.aggregate([
                {
                    '$match': {
                        '_id': { $in: ids },
                        //   'Time': { '$gt': 1708367408000, '$lte':  1708414148000 },
                    },
                },
                {
                    '$sort': {
                        '_id': 1,

                    }
                },
                {
                    $lookup: {
                        from: "companyAssets",
                        localField: "AssetId",
                        foreignField: "AssetId",
                        as: "AssetData"
                    }
                },
                // {
                //     $unwind: "$AssetData"
                // },
                {
                    $lookup: {
                        from: "machineJobDetails",
                        localField: "AssetData._id",
                        foreignField: "assetId",
                        as: "jobDetail"
                    }
                },
                {
                    $lookup: {
                        from: "operators",
                        localField: "AssetData._id",
                        foreignField: "machineId",
                        as: "operatorDetail"
                    }
                },
            ])
            // console.log(data)
let sendData = []
            for (let i = 0; i < data.length; i++) {
                // console.log(data[i])
                let final = { data : [], download : []}
                final.data[0] = {Value :data[i].jobDetail.length > 0 ? data[i].jobDetail[0].projectDoneBy : '-' ,Name : "PROJECT DONE BY" }
                final.data[1] = {Value :data[i].jobDetail.length > 0 ? data[i].jobDetail[0].customerName : '-' ,Name : "CLIENT NAME" }
                final.data[2] = {Value :data[i].operatorDetail.length > 0 ? data[i].operatorDetail[0].name : '-' ,Name : "OPERATOR NAME" }
                final.data[3] = {Value :data[i].AssetData.length > 0 ? data[i].AssetData[0].AssetType : '-' ,Name : "CONTROLLER TYPE" }
                final.data[4] =  {Value :data[i].jobDetail.length > 0 ? data[i].jobDetail[0].orientedHeadType : '-' ,Name : "WELD HEAD TYPE" }
                final.data[5] = {Value :data[i].AssetData.length > 0 ? data[i].AssetData[0].AssetName :  '-' ,Name : "MACHINE SR. NO" }
                final.data[6] = {Value :data[i]?.WeldingNumber ||  '-' ,Name : "WELD NUMBER" }

                final.data[7] = {Value : (data[i].Data.find(o => o.RegisterId ===543) == undefined ? '-' :  data[i].Data.find(o => o.RegisterId ===543).ActValue>10?data[i].Data.find(o => o.RegisterId ===543).ActValue : '0'+data[i].Data.find(o => o.RegisterId ===543).ActValue) +'/' + 
                    (data[i].Data.find(o => o.RegisterId ===542) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===542).ActValue > 10 ?data[i].Data.find(o => o.RegisterId ===542).ActValue : '0'+data[i].Data.find(o => o.RegisterId ===542).ActValue)+'/' + (data[i].Data.find(o => o.RegisterId ===541) == undefined ? '-' :'20'+ data[i].Data.find(o => o.RegisterId ===541).ActValue) ,Name : "DATE(DD/MM/YYYY)" }

                final.data[8] = {Value : (data[i].Data.find(o => o.RegisterId ===544) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===544).ActValue>10 ?data[i].Data.find(o => o.RegisterId ===544).ActValue : '0'+data[i].Data.find(o => o.RegisterId ===544).ActValue) +':' + (data[i].Data.find(o => o.RegisterId ===545) == undefined ? '-' :data[i].Data.find(o => o.RegisterId ===545).ActValue>10 ?data[i].Data.find(o => o.RegisterId ===545).ActValue : '0'+data[i].Data.find(o => o.RegisterId ===545).ActValue)+':' + (data[i].Data.find(o => o.RegisterId ===546) == undefined ? '-' :data[i].Data.find(o => o.RegisterId ===546).ActValue>10 ?data[i].Data.find(o => o.RegisterId ===546).ActValue : '0'+data[i].Data.find(o => o.RegisterId ===546).ActValue) ,Name : "TIME(HH:MM:SS)" }

                final.data[9] = {Value :(data[i].Data.find(o => o.RegisterId ===549) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===549).ActValue/10)  ,Name : "TUBE DIA(MM)" }

                final.data[10] = {Value :(data[i].Data.find(o => o.RegisterId ===550) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===550).ActValue/10)  ,Name : "TUBE THICK(MM)" }

                final.data[11] = {Value :(data[i].Data.find(o => o.RegisterId ===554) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===554).ActValue/10)  ,Name : "PRE HEAT(S)" }

                final.data[12] = {Value :(data[i].Data.find(o => o.RegisterId ===552) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===552).ActValue/10)  ,Name : "POST GAS(S)" }
                
                final.data[13] = {Value :(data[i].Data.find(o => o.RegisterId ===551) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===551).ActValue/10)  ,Name : "PRE GAS(S)" }

                final.data[14] = {Value :(data[i].Data.find(o => o.RegisterId ===555) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===555).ActValue/100)  ,Name : "HIGH PULSE(S)"  }
             
                final.data[15] = {Value :(data[i].Data.find(o => o.RegisterId ===556) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===556).ActValue/100)  ,Name : "LOW PULSE(S)"  }

                final.data[16] = {Value :(data[i].Data.find(o => o.RegisterId ===553) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===553).ActValue)  ,Name : "BASE CURRENT(A)" }


                final.download[0] = {Value :['A','B','C','D','E','F','G','H','I'] ,Name : "LEVEL NO." }
                
                final.download[1] = {Value :[
                    (data[i].Data.find(o => o.RegisterId ===574) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===574).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===577) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===577).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===580) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===580).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===583) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===583).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===586) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===586).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===589) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===589).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===592) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===592).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===595) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===595).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===599) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===599).ActValue)] ,Name : "TRAVEL DEG" }

                 final.download[2] ={Value :[
                    (data[i].Data.find(o => o.RegisterId ===575) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===575).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===578) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===578).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===581) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===581).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===584) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===584).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===587) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===587).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===590) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===590).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===593) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===593).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===596) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===596).ActValue),
                    (data[i].Data.find(o => o.RegisterId === 600) == undefined ? '-' : data[i].Data.find(o => o.RegisterId === 600).ActValue)] ,Name : "SPEED(%)" }
                final.download[3] = {Value :[
                    (data[i].Data.find(o => o.RegisterId ===576) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===576).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===579) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===579).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===582) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===582).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===585) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===585).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===588) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===588).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===591) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===591).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===594) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===594).ActValue),
                    (data[i].Data.find(o => o.RegisterId ===597) == undefined ? '-' : data[i].Data.find(o => o.RegisterId ===597).ActValue),
                    (data[i].Data.find(o => o.RegisterId === 601) == undefined ? '-' : data[i].Data.find(o => o.RegisterId === 601).ActValue)] ,Name : "CURRENT(A)" }
                    
                    
                    
                    let table = final.download[0].Value.map((Level, index) => {
                    return {
                        Level: Level,
                        TravelDegree : final.download[1].Value[index],
                        Speed: final.download[2].Value[index],
                        Current : final.download[3].Value[index]
                    };
                });
                final.data[17] = {Value :table }
                sendData[i] =final
                // console.log(final)
               
            
                // sendData = {
                //     AssetName: { Name: String, Value: String },
                //     ProjectDoneBy: { Name: String, Value: String },
                //     CustomerName: { Name: String, Value: String },
                //     AssetType: { Name: String, Value: String },
                //     OrientedHeadType: { Name: String, Value: String },
                //     operatorName: { Name: String, Value: String },
                //     tubeDiameter: { Name: String, Value: String },
                //     TubeThickness: { Name: String, Value: String },
                //     preHeatTime: { Name: String, Value: String },
                //     postFlowTime: { Name: String, Value: String },
                //     preFlowTime: { Name: String, Value: String },
                //     highPulseTime: { Name: String, Value: String },
                //     lowPulseTime: { Name: String, Value: String },
                //     baseCurrent: { Name: String, Value: String },
                //     WeldNumber: { Name: String, Value: String },
                //     table: [],
                //     level: { Name: String, Value: Array },
                //     Speed: { Name: String, Value: Array },
                //     degree: { Name: String, Value: Array },
                //     Current: { Name: String, Value: Array },
                //     Date: { Name: String, Value: String },
                //     Time: { Name: String, Value: String }
                // }
            }
            return {
                msg: 'successfully Find',
                data: sendData
            }
        } else {
            return {
                msg: 'successfully Find',
                data: []
            }
        }
    } catch (error) {

        return Promise.reject('error occure in get lcd Config')
    }
}

async function getWeldingNumbers(req) {
    try { 
        fDate = new Date(Number(req.query.Date)).setHours(0, 0, 0, 0)
        tDate = new Date(Number(req.query.Date)).setHours(23, 59, 59, 0);
        const Weldingdata = await uosplReportData.aggregate([
            {
              '$match': {
                'AssetId': req.query.AssetId,
                'StartTime': { '$gte': fDate, '$lte': tDate },
              },
            },
            {
              '$sort': {
                'StartTime': 1,
      
              }
            },
            {
                '$project': {
                  'StartTime': 0,
                  'StopTime': 0,
                  'Data': 0,
        
                }
              }
          ])

          return {
            msg: 'successfully Find',
            data: Weldingdata
          }
    } catch (error) {

        return Promise.reject('error occure in get lcd Config')
      }
    }

module.exports = {
    getWeldingReport,
    getWeldingNumbers

}


