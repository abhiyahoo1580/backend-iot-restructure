const SCHEDULE = require('node-schedule');
const historicalData = require('../api/historical/model');
const _ = require('lodash');
// const  = require('../api/oeeTable/model')
const oeeTableShiftData = require('../api/oeeTableShift/model')
// const excoeeTableDatael = require('exceljs');
const excel = require('exceljs');
const dateFormat = require("dateformat");
var mail = require('./mailService');
const shiftData = require("../api/shifts/model");
const { compact } = require('lodash');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
RULE.hour = 14;
RULE.minute = 30;
RULE.second = 0;
async function dd(data, ManualEntry,assetId) {
// console.log(data,assetId)
    obj = {
        quality: 0, availability: 0, speedEfficiency: 0, machineRunEfficiency: 0,
        performance: 0, oEE: 0, totalProduction: 0, totalRunTime: 0
    }
    if (data.totalProduction != 0 && data.totalRunTime != 0) {
        // console.log(data)
        // console.log(ManualEntry)
        quality = (data.totalProduction - (ManualEntry != undefined ? ManualEntry.RejectJob : 0)) / data.totalProduction
        totalAvailableTime = data.shiftInfo.totalAvailableTime
        availability = (totalAvailableTime - (ManualEntry != undefined ? ManualEntry.BreakDownTime : 0)) / totalAvailableTime
  if("fjkjjl98LM" == assetId || assetId == "ZODA4i" ||  assetId == "S8AbcVX" || assetId == "UZ5Xu2f"){
    speedEfficiency = data.avgRpm/1100     
  }else{
      speedEfficiency = data.totalProduction / (data.totalRunTime * (ManualEntry != undefined ? ManualEntry.MachineJobPerMinute : 80))
  }
        machineRunEfficiency = data.totalRunTime / (totalAvailableTime - ((ManualEntry != undefined ? ManualEntry.BreakDownTime : 0) + (ManualEntry != undefined ? ManualEntry.PlannedDownTime : 0)))
        performance = speedEfficiency * machineRunEfficiency
        oEE = performance * availability * quality
        obj.quality = quality * 100
        // console.log("totalAvailableTime =",totalAvailableTime )
        obj.availability = availability * 100
        obj.speedEfficiency = speedEfficiency * 100
        obj.machineRunEfficiency = machineRunEfficiency * 100
        obj.performance = performance * 100
        obj.oEE = oEE * 100
        obj.totalProduction = data.totalProduction
        obj.totalRunTime = data.totalRunTime
    }
    return obj
}
async function cc(statusParameter, index) {
    // console.log(index)
    totalRunTime = 0;
    const subArray = await _.slice(statusParameter.ActValue, index[0], index[(index.length - 1)]);
    // console.log(subArray)
    const indicesOfOnes = subArray.reduce((acc, value, i) => {
        if (value === 0 || i == 0 || i == (subArray.length - 1)) {
            acc.push(index[i]);
        }
        return acc;
    }, []);
    //  console.log( indicesOfOnes)
    const time = indicesOfOnes.reduce((acc, value, i) => {
        if (i > 0 && ((value - 1) !== indicesOfOnes[i - 1])) {
            totalRunTime = totalRunTime + (statusParameter.ValueReceivedDate[value] - statusParameter.ValueReceivedDate[indicesOfOnes[i - 1]])
        }
        return acc;
    }, []);

    return totalRunTime > 0 ? (totalRunTime / 1000) / 60 : 0;
}

async function bb(lengthParameter, statusParameter, startDate, endDate, shift,needleSpeedParameter) {
    obj = { totalProduction: 0, index: [], totalRunTime: 0, shiftInfo: shift , avgRpm : 0}
    // console.log(shift)
    // console.log(new Date(startDate), new Date(endDate))
    // console.log(lengthParameter, statusParameter)
    lengthParameter.ValueReceivedDate.forEach((length, k) => {
        if (startDate <= length && length < endDate) {
            obj.index.push(k)
        }
    })
    if (obj.index.length > 1) {
        //    console.log(lengthParameter.ActValue[obj.index[obj.index.length-1]] , lengthParameter.ActValue[obj.index[0]])
        obj.totalProduction = lengthParameter.ActValue[obj.index[obj.index.length - 1]] - lengthParameter.ActValue[obj.index[0]]
        obj.totalRunTime = await cc(statusParameter, obj.index)
        if(needleSpeedParameter.length > 0){
            // sub = _.slice(needleSpeedParameter[0].ActValue, obj.index[0], obj.index[obj.index.length - 1])
            nonZeroArr = _.filter(_.slice(needleSpeedParameter[0].ActValue, obj.index[0], obj.index[obj.index.length - 1]), num => num !== 0);
            if (_.isEmpty(nonZeroArr)) {
               obj.avgRpm =   0; // To handle the case when all elements are zero
            }else{
                obj.avgRpm =   _.sum(nonZeroArr) / nonZeroArr.length;
            }
            // console.log(needleSpeedParameter,nonZeroArr)
        }

    }
    // console.log(obj)
    return obj
}

// async function aa() {
    let DAY = SCHEDULE.scheduleJob(RULE, async () => {
    try {
        let date = new Date()
        let fDate = new Date(date).setDate(1);
        fDate = new Date(fDate).setHours(7, 0, 0, 0)
        let tDate = new Date(date).setHours(7, 0, 0, 0);
        // console.log(new Date(fDate), new Date(tDate))






        var historicalDataNew = new historicalData(67);
        const getAllHistorical = await historicalDataNew.aggregate([
            {
                '$match': {
                    'AssetId': { $in: ['ML1400', 'ML12500', 'fjkjjl98LM',"ZODA4i","S8AbcVX","UZ5Xu2f"] },
                    'Date': { '$gte': fDate, '$lt': tDate }
                },
            },
            { $unwind: '$Data' },
            {
                '$match': {
                    'Data._id': { $in: [1343, 1344, 1417, 1433, 1419, 1435, 1420] }
                }
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
                "$project": {
                    "data.id": "$Data._id",
                    "data.ActValue": "$Data.ActValue",
                    "data.ValueReceivedDate": "$Data.ValueReceivedDate",
                    'data.Name': "$Data.parameterDetails.Name",
                    "date": "$Date",
                    "AssetId": "$AssetId"

                }
            },
            {
                $group: {
                    _id: "$_id",
                    data: { $push: "$data" },
                    date: { $last: "$date" },
                    AssetId: { $last: "$AssetId" },
                }
            },
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'assetDetail'
                }
            },
            {
                $addFields: {
                    "info.lengthParameter": {
                        $filter: {
                            input: "$data",
                            as: "u",
                            cond: { $in: ["$$u.id", [1344, 1419, 1435]] }
                        }
                    },
                    "info.statusParameter": {
                        $filter: {
                            input: "$data",
                            as: "u",
                            cond: { $in: ["$$u.id", [1343, 1417, 1433]] }
                        }
                    },
                    "info.needleSpeedParameter": {
                        $filter: {
                            input: "$data",
                            as: "u",
                            cond: { $in: ["$$u.id", [1420]] }
                        }
                    },
                    'info.date': "$date",
                    "info.AssetName": "$assetDetail.AssetName",
                    "info.AssetId": "$assetDetail.AssetId",
                }
            },
            { $sort: { date: 1 } },
            {
                $group: {
                    _id: "$AssetId",
                    data: { $push: "$info" },
                    // date: { $last: "$date" },
                    // AssetId : { $last: "$AssetId" },
                }
            },
            // {
            //     '$lookup': {
            //         'from': 'companyAssets',
            //         'localField': '_id',
            //         'foreignField': 'AssetId',
            //         'as': 'assetDetail'
            //     }
            // },
            {
                '$lookup': {
                    'from': 'metergroups',
                    'localField': '_id',
                    'foreignField': 'AssetId',
                    'as': 'groupDetail'
                }
            },
            {
                "$project": {
                    "id": "$groupDetail._id",
                    "groupName": "$groupDetail.Name",
                    'info.data': "$data",
                    // "info.AssetName": "$assetDetail.AssetName",
                    // "date": "$Date",
                    // "AssetId" : "$AssetId"

                }
            },
            {
                $group: {
                    _id: "$id",
                    group: { $push: "$info" },
                    groupName: { $last: "$groupName" },
                    // AssetId : { $last: "$AssetId" },
                }
            },
        ])
        // console.log(getAllHistorical)
        const getOeeShiftManualEntry = await oeeTableShiftData.aggregate([
            {
                '$match': {
                    'AssetId': { $in: ['ML1400', 'ML12500', 'fjkjjl98LM',"ZODA4i","S8AbcVX","UZ5Xu2f"] },
                    'Date': { '$gte': fDate, '$lt': tDate }
                },
            },
            {
                "$project": {
                    "AssetId": "$AssetId",
                    "data.BreakDownTime": "$BreakDownTime",
                    "data.MachineJobPerMinute": "$MachineJobPerMinute",
                    "data.PlannedDownTime": "$PlannedDownTime",
                    'data.RejectJob': "$RejectJob",
                    "data.ShiftId": "$ShiftId",
                    "data.Date": "$Date",

                }
            },
            {
                $group: {
                    _id: "$AssetId",
                    data: { $push: "$data" },
                    // date: { $last: "$date" },
                    // AssetId : { $last: "$AssetId" },
                }
            }
        ])
        // console.log(getOeeShiftManualEntry)

        var getShift = await shiftData.aggregate([
            {
                '$match': {
                    'companyId': 67,
                },
            },
        ])
// console.log(getAllHistorical)
        for (let i = 0; i < getAllHistorical.length; i++) {
            // getAllHistorical[i].shift = []
            for (let l = 0; l < getAllHistorical[i].group.length; l++) {
                for (let k = 0; k < getAllHistorical[i].group[l].data.length; k++) {
                    getAllHistorical[i].group[l].data[k].shift = []
                    for (let j = 0; j < getShift[0].shifts.length; j++) {
                        // console.log("=====>",i,"====>",j)        
                        startDate = new Date(getAllHistorical[i].group[l].data[k].date).setHours(getShift[0].shifts[j].start.hour, getShift[0].shifts[j].start.min, 0, 0)
                        endDate = new Date(getAllHistorical[i].group[l].data[k].date).setHours(getShift[0].shifts[j].end.hour, getShift[0].shifts[j].end.min, 0, 0)
                        if (startDate > endDate) {
                            endDate = new Date(endDate).setDate(new Date(endDate).getDate() + 1);
                        }
                        // console.log(getAllHistorical[i].group[l].data[k])
                        result = await bb(getAllHistorical[i].group[l].data[k].lengthParameter[0], getAllHistorical[i].group[l].data[k].statusParameter[0], startDate, endDate, getShift[0].shifts[j],getAllHistorical[i].group[l].data[k].needleSpeedParameter)
                        getAllHistorical[i].group[l].data[k].shift.push(result)
                    }
                }
            }
        }

        // console.log(getAllHistorical,"after")
        for (let i = 0; i < getAllHistorical.length; i++) {
            // console.log(getAllHistorical[i])
            // getAllHistorical.oee = []
            for (let l = 0; l < getAllHistorical[i].group.length; l++) {
                for (let k = 0; k < getAllHistorical[i].group[l].data.length; k++) {
                    startDate = new Date(getAllHistorical[i].group[l].data[k].date).setHours(0, 0, 0, 0)
                    endDate = new Date(getAllHistorical[i].group[l].data[k].date).setHours(23, 59, 59, 0)
                    // console.log(new Date(startDate), new Date(endDate))
                    for (let j = 0; j < getAllHistorical[i].group[l].data[k].shift.length; j++) {
                        ShiftId = getAllHistorical[i].group[l].data[k].shift[j].shiftInfo._id
                        // console.log(ShiftId)  
                        const findElement = _.filter(getOeeShiftManualEntry, function (num) {
                            return num._id == getAllHistorical[i]._id;
                        });
                        result = await dd(getAllHistorical[i].group[l].data[k].shift[j], await _.find(findElement.length > 0 ? findElement[0].data : [], obj => obj.ShiftId.equals(getAllHistorical[i].group[l].data[k].shift[j].shiftInfo._id) && obj.Date > startDate && obj.Date < endDate),getAllHistorical[i].group[l].data[k].AssetId[0])
                        getAllHistorical[i].group[l].data[k].shift[j].oeeInfo = result
                    }
                }
            }
        }
        // console.log(getAllHistorical, "after", "after")
     
        var workbook = new excel.Workbook(); //creating workbook

        for (let i = 0; i < getAllHistorical.length; i++) {

            let worksheet = workbook.addWorksheet(getAllHistorical[i].groupName[0]); //creating worksheet
            // DAILY PRODUCTION (METER)
            let columns = [{ header: 'DATE', key: '0', width: 30 }];
            columns.push({ header: 'NAME     ', key: '1', width: 30 })
            columns.push({ header: 'SHIFT', key: '2', width: 30 })
            columns.push({ header: 'DAILY PRODUCTION (METER)', key: '3', width: 30 })
            columns.push({ header: 'OEE (%)', key: '4', width: 30 })
            columns.push({ header: 'PERFORMANCE (%)', key: '5', width: 30 })
            columns.push({ header: 'SPEED EFFICIENCY (%)', key: '6', width: 30 })
            columns.push({ header: 'RUN EFFICIENCY (%)', key: '7', width: 30 })
            columns.push({ header: 'QUALITY (%)', key: '8', width: 30 })
            columns.push({ header: 'AVAILABILITY (%)', key: '9', width: 30 })
    
            worksheet.columns = columns;





            const joinedData = _.flatMap(getAllHistorical[i].group, 'data');
            const groupedData = _.groupBy(joinedData, 'date');
            const resultArray = [];
            for (const key in groupedData) {
                if (Object.hasOwnProperty.call(groupedData, key)) {
                    resultArray.push({ date: Number(key), array: groupedData[key] });
                }
            }
            resultArray.sort((a, b) => a.date - b.date);
            // console.log(resultArray);
            for (let p = 0; p < resultArray.length; p++) {             
                // obj = []
                // console.log(obj)
            //     if(p == resultArray.length){
            //     console.log(resultArray[p])
            //     // obj = ['','','TOTAL OF DAY']
            //     // obj.push(resultArray[p].dailyProduction)
            //     // obj.push(Number((resultArray[p].dailyOEE /(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)))
            //     // obj.push(Number((resultArray[p].dailyPerformance/(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)) )
            //     // obj.push(Number((resultArray[p].dailySpeedEfficiency/(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)) )
            //     // obj.push(Number((resultArray[p].dailyMachineRunEfficiency/(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)) )
            //     // obj.push(Number((resultArray[p].dailyQuality /(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)))
            //     // obj.push(Number((resultArray[p].dailyAvailability/(resultArray[p].array.length *resultArray[p].array[q].shift.length)).toFixed(2)) )
            //     // // console.log(obj)
            //     // worksheet.addRows([Object.assign({}, obj)])

            // }else{
                resultArray[p].dailyProduction = 0;
                resultArray[p].dailyOEE = 0
                resultArray[p].dailyPerformance = 0
                resultArray[p].dailySpeedEfficiency = 0
                resultArray[p].dailyMachineRunEfficiency = 0
                resultArray[p].dailyQuality = 0
                resultArray[p].dailyAvailability = 0
                obj = [dateFormat(new Date(resultArray[p].date), "dd/mm/yyyy"),]
                for (let q = 0; q < resultArray[p].array.length; q++) {
                    // console.log(resultArray[p].array[q])
                    resultArray[p].array[q].meterProduction = 0
                    resultArray[p].array[q].meterOEE = 0
                    resultArray[p].array[q].meterPerformance = 0
                    resultArray[p].array[q].meterSpeedEfficiency = 0
                    resultArray[p].array[q].meterMachineRunEfficiency = 0
                    resultArray[p].array[q].meterQuality = 0
                    resultArray[p].array[q].meterAvailability = 0
                    obj.push(resultArray[p].array[q].AssetName[0])
                    for (let j = 0; j <= resultArray[p].array[q].shift.length; j++) {
                        if( j == resultArray[p].array[q].shift.length){
                       
                        obj = ['','','TOTAL']
                        obj.push(resultArray[p].array[q].meterProduction)
                        obj.push(Number((resultArray[p].array[q].meterOEE /j).toFixed(2)))
                        obj.push(Number((resultArray[p].array[q].meterPerformance/j).toFixed(2)) )
                        obj.push(Number((resultArray[p].array[q].meterSpeedEfficiency/j).toFixed(2)) )
                        obj.push(Number((resultArray[p].array[q].meterMachineRunEfficiency/j).toFixed(2)) )
                        obj.push(Number((resultArray[p].array[q].meterQuality /j).toFixed(2)))
                        obj.push(Number((resultArray[p].array[q].meterAvailability/j).toFixed(2)) )
                        // console.log(obj)
                        worksheet.addRows([Object.assign({}, obj)])

                        }
                        else{
                        // console.log(resultArray[p].array[q].shift[j], p, q, j)
                        obj.push(resultArray[p].array[q].shift[j].shiftInfo.name + ' (' + resultArray[p].array[q].shift[j].shiftInfo.start.hour + ':' + resultArray[p].array[q].shift[j].shiftInfo.start.min + ' - ' + resultArray[p].array[q].shift[j].shiftInfo.end.hour + ':' + resultArray[p].array[q].shift[j].shiftInfo.end.min + ')')
                        obj.push(resultArray[p].array[q].shift[j].oeeInfo.totalProduction)
                        resultArray[p].array[q].meterProduction =  resultArray[p].array[q].meterProduction  + resultArray[p].array[q].shift[j].oeeInfo.totalProduction
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.oEE.toFixed(2)))
                        resultArray[p].array[q].meterOEE = resultArray[p].array[q].meterOEE +resultArray[p].array[q].shift[j].oeeInfo.oEE
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.performance.toFixed(2)))
                        resultArray[p].array[q].meterPerformance =resultArray[p].array[q].meterPerformance +resultArray[p].array[q].shift[j].oeeInfo.performance
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.speedEfficiency.toFixed(2)))
                        resultArray[p].array[q].meterSpeedEfficiency =resultArray[p].array[q].meterSpeedEfficiency +resultArray[p].array[q].shift[j].oeeInfo.speedEfficiency
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.machineRunEfficiency.toFixed(2)))
                        resultArray[p].array[q].meterMachineRunEfficiency = resultArray[p].array[q].meterMachineRunEfficiency +resultArray[p].array[q].shift[j].oeeInfo.machineRunEfficiency
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.quality.toFixed(2)))
                        resultArray[p].array[q].meterQuality = resultArray[p].array[q].meterQuality+ resultArray[p].array[q].shift[j].oeeInfo.quality
                        obj.push(Number(resultArray[p].array[q].shift[j].oeeInfo.availability.toFixed(2)))
                        resultArray[p].array[q].meterAvailability = resultArray[p].array[q].meterAvailability + resultArray[p].array[q].shift[j].oeeInfo.availability
                        // console.log("obj", obj)
                        worksheet.addRows([Object.assign({}, obj)])
                        obj = ['', '']
                        }


                    }
                    resultArray[p].dailyProduction = resultArray[p].dailyProduction + resultArray[p].array[q].meterProduction
                    resultArray[p].dailyOEE =  resultArray[p].dailyOEE +resultArray[p].array[q].meterOEE
                    resultArray[p].dailyPerformance = resultArray[p].dailyPerformance +resultArray[p].array[q].meterPerformance
                    resultArray[p].dailySpeedEfficiency =  resultArray[p].dailySpeedEfficiency +resultArray[p].array[q].meterSpeedEfficiency
                    resultArray[p].dailyMachineRunEfficiency =  resultArray[p].dailyMachineRunEfficiency +resultArray[p].array[q].meterMachineRunEfficiency
                    resultArray[p].dailyQuality =  resultArray[p].dailyQuality +resultArray[p].array[q].meterQuality
                    resultArray[p].dailyAvailability = resultArray[p].dailyAvailability +resultArray[p].array[q].meterAvailability
                    obj = ['']
                }
                // worksheet.addRows([Object.assign({}, obj)])
                // console.log(resultArray[p],resultArray[p].array.length,getShift[0].shifts.length)
                           obj = ['','','TOTAL OF DAY']
                obj.push(resultArray[p].dailyProduction)
                obj.push(Number((resultArray[p].dailyOEE/(resultArray[p].array.length*getShift[0].shifts.length) ).toFixed(2)))
                obj.push(Number((resultArray[p].dailyPerformance/(resultArray[p].array.length*getShift[0].shifts.length)).toFixed(2)) )
                obj.push(Number((resultArray[p].dailySpeedEfficiency/(resultArray[p].array.length*getShift[0].shifts.length)).toFixed(2)) )
                obj.push(Number((resultArray[p].dailyMachineRunEfficiency/(resultArray[p].array.length*getShift[0].shifts.length)).toFixed(2)) )
                obj.push(Number((resultArray[p].dailyQuality/(resultArray[p].array.length*getShift[0].shifts.length) ).toFixed(2)))
                obj.push(Number((resultArray[p].dailyAvailability/(resultArray[p].array.length*getShift[0].shifts.length)).toFixed(2)) )
                // console.log(obj)
                worksheet.addRows([Object.assign({}, obj)])
                obj = ['']
                worksheet.addRows([Object.assign({}, obj)])
            // }
            }
            // console.log(resultArray);

            // const dailyAvailability = _.sumBy(resultArray, 'dailyAvailability');
            // const dailyMachineRunEfficiency = _.sumBy(resultArray, 'dailyMachineRunEfficiency');
            // const dailyOEE = _.sumBy(resultArray, 'dailyOEE');
            // const dailyPerformance = _.sumBy(resultArray, 'dailyPerformance');
            // const dailyProduction = _.sumBy(resultArray, 'dailyProduction');
            // const dailyQuality = _.sumBy(resultArray, 'dailyQuality');
            // const dailySpeedEfficiency = _.sumBy(resultArray, 'dailySpeedEfficiency');
            obj = ['','','MONTH END TOTAL']
            obj.push(_.sumBy(resultArray, 'dailyProduction'));
            obj.push((_.sumBy(resultArray, 'dailyOEE'))/(resultArray.length *getShift[0].shifts.length));
            obj.push((_.sumBy(resultArray, 'dailyPerformance'))/(resultArray.length *getShift[0].shifts.length));
            obj.push( ( _.sumBy(resultArray, 'dailySpeedEfficiency'))/(resultArray.length*getShift[0].shifts.length));
            obj.push( (_.sumBy(resultArray, 'dailyMachineRunEfficiency'))/(resultArray.length*getShift[0].shifts.length));
            obj.push((_.sumBy(resultArray, 'dailyQuality'))/(resultArray.length*getShift[0].shifts.length));
            obj.push((_.sumBy(resultArray, 'dailyAvailability'))/(resultArray.length*getShift[0].shifts.length));
          

            worksheet.addRows([Object.assign({}, obj)])

            // console.log(dailyProduction)


            const headerRow = worksheet.getRow(1);
            headerRow.eachCell(cell => {
                cell.font = { bold: true };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                };
    
            });
            // // Set the height for the second row
            // worksheet.getRow(1).height = 30; 
    
            // Set the width for the second column (B)
            worksheet.columns[0].width = 15; // Set the width to 15




            
        }


       
        // Write to File
     
        // MONTH END TOTAL
        await workbook.xlsx.writeFile("uploads/DailyProductionReport.xlsx")
            .then(function () {
                console.log("file saved!");
            });




        // const headerRow = worksheet.getRow(1);
        // headerRow.eachCell(cell => {
        //     cell.font = { bold: true };
        //     cell.alignment = {
        //         vertical: 'middle',
        //         horizontal: 'center',
        //     };

        // });
        // // // Set the height for the second row
        // // worksheet.getRow(1).height = 30; 

        // // Set the width for the second column (B)
        // worksheet.columns[0].width = 15; // Set the width to 15
        // // Write to File

        // await workbook.xlsx.writeFile("uploads/DailyProductionReport.xlsx")
        //     .then(function () {
        //         console.log("file saved!");
        //     });

         await mail('gmail','notification@elliotsystems.com',
         '',
         'ratan@sheelafoam.com',
         'Daily Device Production Report',
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
          'DailyProductionReport.xlsx',
          'uploads/DailyProductionReport.xlsx',[])

    }
    catch (err) {
        console.log(err)
    }
    });
    // }
// }
// aa()