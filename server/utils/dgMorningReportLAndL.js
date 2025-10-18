const SCHEDULE = require('node-schedule');
const historicalData = require('../api/historical/model');
const companyAssetData = require('../api/companyAsset/model')
const dgDiselManulEntryData = require('../api/dgDiselManulEntry/controller');
const _ = require('lodash');
// const oeeTableData = require('../api/oeeTable/model')
const excel = require('exceljs');
const dateFormat = require("dateformat");
var mail = require('./mailService');
// const { json } = require('body-parser');
const RULE = {}
RULE.dayOfWeek = new SCHEDULE.Range(0, 7);
RULE.hour = 10;
RULE.minute = 30;
RULE.second = 0;
// async function aa() {
    let DAY = SCHEDULE.scheduleJob(RULE, async () => {
    try {
        var date = new Date()
        let fDate = date.getDate() != 1 ? new Date(date).setDate(1) : new Date(date).setMonth(date.getMonth() - 1);
        fDate = new Date(fDate).setHours(7, 0, 0, 0)
        let tDate = new Date(date).setHours(7, 0, 0, 0);
        // console.log(new Date(fDate), new Date(tDate))
        const previousDate = new Date(date);
        previousDate.setDate(date.getDate() - 1);
        // console.log(new Date(previousDate))
        const allMeters = await companyAssetData.aggregate([
            {
                $match: {
                    'CompanyId': 20,
                    Gateway: { $not: { $eq: null } },
                    DeviceTypeId: 13

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
                    AssetId: 1,
                    DeviceTypeId: 1

                }
            },
            //   {   $group: { _id: "$DeviceTypeId",AssetId: { $push: "$AssetId"}}},
        ])
        AllDeviceTypeId = []

        var historicalDataNew = new historicalData(20);
        let workbook = new excel.Workbook(); //creating workbook
        // let xlsReportData = [] 
        dataXLS = []
        for (let i = 0; i < allMeters.length; i++) {
            const data = await historicalDataNew.aggregate([
                {
                    '$match': {
                        'AssetId': allMeters[i].AssetId,
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
                        'data.ValueReceivedDate': "$Data.ValueReceivedDate",
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
                        'data.Name': "$Data.parameterDetails.Name",
                        name: "$Data.parameterDetails.Name",
                        "data.parameterId": "$Data.parameterDetails._id"
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
            ])

            if (allMeters[i].AssetId === "lldg01") {
                finalArray = { assetName: String, data: [] }
                finalArray.assetName = allMeters[i].AssetName;
                for (let j = 0; j < data.length; j++) {
                    details = { date: Number, groups: [] }
                    details.date = data[j]._id
                    const rpm = _.find(data[j].data, { id: 1413 });
                    indexes = _.reduce(rpm.ActValue, (result, value, index) => {
                        if (value > 1000) result.push(index);
                        return result;
                    }, []);
                    // console.log(indexes)
                    const grouped = _.reduce(indexes, (result, value) => {
                        if (result.length === 0 || value !== _.last(_.last(result)) + 1) {
                            result.push([value]); // Start a new group
                        } else {
                            _.last(result).push(value); // Add to the last group
                        }
                        return result;
                    }, []);
                    // console.log(grouped)
                    for (let z = 0; z < grouped.length; z++) {
                        obj = { date: Number, startTime: Number, stopTime: Number, diselLevel: Number, diselLevelInLeter: Number, battryVoltage: Number, runningHour: Number, kwh: Number }
                        obj.date = data[j]._id
                        // console.log("first",grouped[z][0],"last",grouped[z][grouped[z].length-1])
                        const dieselLevel = _.find(data[j].data, { id: 1410 });
                        // console.log("strt time ", new Date(dieselLevel.ValueReceivedDate[grouped[z][0]]))
                        // console.log("end time ", new Date(dieselLevel.ValueReceivedDate[grouped[z][grouped[z].length-1]]))
                        obj.startTime = dieselLevel.ValueReceivedDate[grouped[z][0]]
                        obj.stopTime = dieselLevel.ValueReceivedDate[grouped[z][grouped[z].length - 1]]
                        // console.log("desial level",dieselLevel.ActValue[grouped[z][grouped[z].length-1]])
                        obj.diselLevel = dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] <100 && dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] >= 0 ? dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] : 100
                        // console.log("desial level(Liters)",((dieselLevel.ActValue[grouped[z][grouped[z].length-1]]/100))*800)
                        obj.diselLevelInLeter = (((dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] <100 && dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] >= 0 ? dieselLevel.ActValue[grouped[z][grouped[z].length - 1]] : 100) / 100)) * 800
                        // console.log("*")
                        const battryVoltage = _.find(data[j].data, { id: 1412 });
                        // console.log(grouped[z].length)
                        // console.log("start and length index",grouped[z][0],( grouped[z][grouped[z].length-1]))
                        // console.log("battryVoltage Min value ",grouped[z].length > 1 ? _.min(_.slice(battryVoltage.ActValue,grouped[z][0], (grouped[z][grouped[z].length-1]))) :battryVoltage.ActValue[grouped[z][0]])
                        obj.battryVoltage = grouped[z].length > 1 ? (_.min(_.slice(battryVoltage.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1])))/10) : (battryVoltage.ActValue[grouped[z][0]]/10)
                        // console.log("**")
                        const runningHour = _.find(data[j].data, { id: 1452 });
                        const runningHourSubArray = _.slice(runningHour.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1]))
                        // console.log(runningHourSubArray)
                        // console.log(_.last(runningHourSubArray) -_.first(runningHourSubArray))
                        obj.runningHour = runningHourSubArray.length > 0 ? _.last(runningHourSubArray) - _.first(runningHourSubArray) : 0
                        // console.log("***")
                        const kwh = _.find(data[j].data, { id: 1453 });
                        const kwhSubArray = _.slice(kwh.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1]))
                        // console.log(_.last(kwhSubArray) -_.first(kwhSubArray))
                        // console.log(kwhSubArray)
                        obj.kwh = kwhSubArray.length > 0 ?(_.last(kwhSubArray) - _.first(kwhSubArray))/1000 : 0
                        // console.log("****")
                        // console.log(obj)
                        details.groups.push(obj);
                        // console.log("**")
                    }
                    //    console.log(details)
                    //     console.log("*****")
                    finalArray.data.push(details)

                }
                // console.log(finalArray)
                dataXLS.push(finalArray)


            }
            if (allMeters[i].AssetId === "lldg02") {
                finalArray1 = { assetName: String, data: [] }
                finalArray1.assetName = allMeters[i].AssetName;
                manualentry = await dgDiselManulEntryData.getDiselManulEntryForReport(allMeters[i].AssetId, fDate, tDate)
                for (let j = 0; j < data.length; j++) {
                    details = { date: Number, groups: [] }
                    // console.log(new Date(data[j]._id))
                    details.date = data[j]._id
                    const rpm = _.find(data[j].data, { id: 1404 });
                    // console.log(rpm)
                    indexes = _.reduce(rpm.ActValue, (result, value, index) => {
                        if (value > 1000) result.push(index);
                        return result;
                    }, []);
                    // console.log(indexes)
                    const grouped = _.reduce(indexes, (result, value) => {
                        if (result.length === 0 || value !== _.last(_.last(result)) + 1) {
                            result.push([value]); // Start a new group
                        } else {
                            _.last(result).push(value); // Add to the last group
                        }
                        return result;
                    }, []);
                    // console.log("=>",grouped)
                    for (let z = 0; z < grouped.length; z++) {
                        obj = { date: Number, startTime: Number, stopTime: Number, diselLevel: Number, diselLevelInLeter: Number, battryVoltage: Number, runningHour: Number, kwh: Number }
                        obj.date = data[j]._id
                        const battryVoltage = _.find(data[j].data, { id: 1401 });
                        obj.battryVoltage = _.min(_.slice(battryVoltage.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1])))
                        obj.startTime = battryVoltage.ValueReceivedDate[grouped[z][0]]
                        obj.stopTime = battryVoltage.ValueReceivedDate[grouped[z][grouped[z].length - 1]]
                        const dieselLevel = _.find(manualentry.data, { 'date': data[j]._id });
                        obj.diselLevel = dieselLevel != undefined ? dieselLevel.diselLevel : "-";
                        obj.diselLevelInLeter = dieselLevel != undefined ? (dieselLevel.diselLevel / 100) * 1000 : "-";
                        obj.diselRecived = dieselLevel != undefined ? dieselLevel.diselRecived : "-";
                        const runningHour = _.find(data[j].data, { id: 1511 });
                        const runningHourSubArray = _.slice(runningHour.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1]))
                        obj.runningHour = runningHourSubArray.length > 0 ? _.last(runningHourSubArray) - _.first(runningHourSubArray) : 0
                        const kwh = _.find(data[j].data, { id: 1454 });
                        const kwhSubArray = _.slice(kwh.ActValue, grouped[z][0], (grouped[z][grouped[z].length - 1]))
                        // console.log(_.last(kwhSubArray) -_.first(kwhSubArray))
                        obj.kwh = kwhSubArray.length > 0 ?_.last(kwhSubArray) - _.first(kwhSubArray) : 0
                        //   console.log(obj)
                        details.groups.push(obj);
                    }
                    finalArray1.data.push(details)
                }

                dataXLS.push(finalArray1)
            }


        }
        // console.log("data", dataXLS)

        for (let i = 0; i < dataXLS.length; i++) {
            let worksheet = workbook.addWorksheet(dataXLS[i].assetName);
            let columns = [{ header: 'Date', key: '0', width: 20 },
            { header: 'Start Time', key: '1', width: 18, bold: true },
            { header: 'Stop Time', key: '2', width: 18 },
            { header: 'Diesel Level(%)', key: '3', width: 20 },
            { header: 'Diesel Level(lit)', key: '4', width: 20 },
            { header: 'Diesel Receive', key: '5', width: 20 },
            { header: 'Battery VOLT', key: '6', width: 20 },
            { header: 'Running hours', key: '7', width: 20 },
            { header: 'KWH', key: '8', width: 20 }

            ];

            worksheet.columns = columns;
            for (let j = 0; j < dataXLS[i].data.length; j++) {
                // console.log(dataXLS[i].data[j].date)
                obj = []
                if (dataXLS[i].data[j].groups.length) {
                    for (let k = 0; k < dataXLS[i].data[j].groups.length; k++) {
                        if (k == 0) {

                            obj.push(dateFormat((new Date(dataXLS[i].data[j].date)), "dd-mmmm-yyyy"))
                        } else {
                            obj.push("")
                        }
                        obj.push(dateFormat(dataXLS[i].data[j].groups[k].startTime, 'HH:MM'))
                        obj.push(dateFormat(dataXLS[i].data[j].groups[k].stopTime, 'HH:MM'))
                        obj.push(dataXLS[i].data[j].groups[k].diselLevel)
                        obj.push(dataXLS[i].data[j].groups[k].diselLevelInLeter)
                        obj.push(dataXLS[i].data[j].groups[k].diselRecived != undefined ? dataXLS[i].data[j].groups[k].diselRecived : '-')
                        obj.push(dataXLS[i].data[j].groups[k].battryVoltage)
                        obj.push(dataXLS[i].data[j].groups[k].runningHour)
                        obj.push(dataXLS[i].data[j].groups[k].kwh)
                        // console.log(dataXLS[i].data[j].groups[k])
                        worksheet.addRows([Object.assign({}, obj)])
                        obj = []
                    }
                }
                else {
                    obj.push(dateFormat((new Date(dataXLS[i].data[j].date)), "dd-mmmm-yyyy"), "-", "-", "-", "-", "-", "-", "-")
                    worksheet.addRows([Object.assign({}, obj)])
                    obj = []
                }
            }
            const headerRow = worksheet.getRow(1);
            headerRow.height = 40; // Set to any height you prefer (in points)
            headerRow.commit(); // Important: apply the changes
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 12 };
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
            });
        }

        await workbook.xlsx.writeFile("uploads/DailyDGReport.xlsx")
            .then(function () {
                console.log("file saved!");
            });

             arrayName = ["shubhamholdandage@elliotsystems.com",'kishor.talele@llproducts.com',"siddheshbhor@elliotsystems.com"]

                // arrayName = ['kishor.talele@llproducts.com','Bhavesh.vishe@llproducts.com','Vinod.sharma@llproducts.com','Mahendra.patil@llproducts.com','shubhamsarwade@elliotsystems.com']
                //   arrayName.push('shubhamholdandage@elliotsystems.com')
         await mail('gmail','notification@elliotsystems.com',
         '',
         arrayName.join(', '),
         'Daily diesel generator report',
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
          'DailyDGReport.xlsx',
          'uploads/DailyDGReport.xlsx',[])
                // }


    }
    catch (err) {
        console.log(err)
    }
    })
// }
// aa()

