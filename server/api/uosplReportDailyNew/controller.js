const uosplReportData = require('./model');
const uosplWeldingData = require('../uosplReportWeldingNew/model');
const alertsData = require('../uosplAlert/model')



async function getDailyReport(req) {
  try {

    sendData = { noOFWelding: { Value: String, Name: String }, totalWorkingTime: { Value: String, Name: String }, numberOfFault: { Value: String, Name: String }, idleTime: { Value: String, Name: String }, WorkingTime: { Value: String, Name: String } }
    fDate = new Date(Number(req.query.Date)).setHours(0, 0, 0, 0)
    tDate = new Date(Number(req.query.Date)).setHours(23, 59, 59, 0);
    // console.log(new Date(fDate),new Date(tDate))    
    const data = await uosplReportData.aggregate([
      {
        '$match': {
          'AssetId': req.query.AssetId,
          'Time': { '$gt': fDate, '$lte': tDate },
        },
      },
      {
        '$sort': {
          '_id': 1,

        }
      }
    ])
    // console.log(data)
    indexs = data[0].Status.reduce((acc, curr, index) => {
      if (curr === true) {
        acc.push(index);
      }
      return acc;
    }, []);
    // console.log(indexs)
    totalTimeDetails = 0
    if (indexs.length > 0) {
      firstIndex = indexs[0]
      for (let i = 1; i <= indexs.length; i++) {
        if (i == indexs.length && indexs[i] != firstIndex) {
          // console.log("match ",indexs[i-1] , firstIndex)
          // console.log(data[0].Time[indexs[i-1]] - data[0].Time[firstIndex] )
          totalTimeDetails = totalTimeDetails + (data[0].Time[indexs[i - 1]] - data[0].Time[firstIndex])
        } else if (indexs[i] != (indexs[i - 1] + 1)) {
          // console.log("match ",indexs[i-1] , firstIndex)
          totalTimeDetails = totalTimeDetails + (data[0].Time[indexs[i - 1]] - data[0].Time[firstIndex])
          // console.log(data[0].Time[indexs[i-1]] - data[0].Time[firstIndex] )
          firstIndex = indexs[i]
        }
      }
    }
    // console.log(totalTimeDetails)
    // console.log()

    const Weldingdata = await uosplWeldingData.aggregate([
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
      }
    ])
    produtionTime = 0;
    for (let i = 0; i < Weldingdata.length; i++) {
      if (Weldingdata[i].StopTime >= Weldingdata[i].StartTime) {
        produtionTime = produtionTime + (Weldingdata[i].StopTime - Weldingdata[i].StartTime)
      }
    }
    // console.log()
    idalTime = totalTimeDetails - produtionTime
    // console.log()
    // console.log(Weldingdata, Weldingdata.length)
    // 'AssetId': req.query.AssetId,
    // 'Time': { '$gt': fDate, '$lte':  tDate },
    const getAllAlerts = await alertsData.aggregate([
      {
        '$match': {
          'AssetId': req.query.AssetId,
          'StartTime': { '$gte': fDate, '$lte': tDate }

        },
      }, {
        '$count': "Count"
      },
    ])
    // console.log(getAllAlerts)
    sendData.WorkingTime.Value = (parseInt((produtionTime / 60000) / 60) >= 10 ? parseInt((produtionTime / 60000) / 60) : '0' + parseInt((produtionTime / 60000) / 60)) + ":" + (parseInt((produtionTime / 60000) % 60) >= 10 ? parseInt((produtionTime / 60000) % 60) : '0' + parseInt((produtionTime / 60000) % 60))
    sendData.WorkingTime.Name = "Welding Time"
    sendData.totalWorkingTime.Value = (parseInt((totalTimeDetails / 60000) / 60) >= 10 ? parseInt((totalTimeDetails / 60000) / 60) : '0' + parseInt((totalTimeDetails / 60000) / 60)) + ':' + (parseInt((totalTimeDetails / 60000) % 60) >= 10 ? parseInt((totalTimeDetails / 60000) % 60) : '0' + parseInt((totalTimeDetails / 60000) % 60))
    sendData.totalWorkingTime.Name = "Total Welding Time"
    sendData.idleTime.Value = (parseInt((idalTime / 60000) / 60) >= 10 ? parseInt((idalTime / 60000) / 60) : '0' + parseInt((idalTime / 60000) / 60)) + ':' + (parseInt((idalTime / 60000) % 60) >= 10 ? parseInt((idalTime / 60000) % 60) : '0' + parseInt((idalTime / 60000) % 60))
    sendData.idleTime.Name = "Idle Time"
    sendData.numberOfFault.Value = getAllAlerts.length > 0 ? getAllAlerts[0].Count : 0
    sendData.numberOfFault.Name = "Number Of Faults"
    sendData.noOFWelding.Value = Weldingdata.length
    sendData.noOFWelding.Name = "Number Of Weldings"
    return {
      msg: 'successfully Find',
      data: sendData
    }
  } catch (error) {

    return Promise.reject('error occure in get lcd Config')
  }
}
getDailyReportDate

async function getDailyReportDate(req) {
  try {

    const data = await uosplReportData.aggregate([
      {
        '$match': {
          'AssetId': req.query.AssetId,
          // 'Time': { $size: 0 }
          // 'Time': { '$gt': fDate, '$lte': tDate },
        },
      },
      // {  "investments" : {$size: : { $gte: 5 } } }  },
      {
        '$group': {
          '_id': "$AssetId",
          'Date' : { '$push' : '$Date'}
 
        }
      }

    ])
    const dataOffline = await uosplReportData.aggregate([
      {
        '$match': {
          'AssetId': req.query.AssetId,
          'Time': { $size: 0 }
          // 'Time': { '$gt': fDate, '$lte': tDate },
        },
      },
      // {  "investments" : {$size: : { $gte: 5 } } }  },
      {
        '$group': {
          '_id': "$AssetId",
          'Date' : { '$push' : '$Date'}
 
        }
      }

    ])
    // console.log(data)
    if(data.length > 0){
      data[0].DateString =  data[0].Date.map( ele => {
        const date = new Date(ele);
        const options = { timeZone: 'Asia/Kolkata', hour12: false };
        return  date.toLocaleString('en-IN', options);
      })
    }
    if(dataOffline.length > 0){
      dataOffline[0].DateString =  dataOffline[0].Date.map( ele => {
        const date = new Date(ele);
        const options = { timeZone: 'Asia/Kolkata', hour12: false };
        return  date.toLocaleString('en-IN', options);
      })
    }
    
    return {
      msg: 'successfully Find',
      data: data.length > 0 ? data[0]  : [],
      offlineDates : dataOffline.length > 0 ? dataOffline[0]  : [],
    }
  } catch (error) {

    return Promise.reject('error occure in get lcd Config')
  }
}
module.exports = {
  getDailyReport,
  getDailyReportDate
}


