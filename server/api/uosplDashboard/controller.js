const mongoose = require("mongoose");
const alertsData = require("../uosplAlert/model");
const deviceData = require("../uosplDevice/model");
const userData = require("../uosplUser/model");
const lcdData = require("../lcdConfig/model");
const gatewayData = require("../OEMGateway/model");
const companyData = require("../OEMCompany/model");
const { ObjectId } = require("mongodb");
const historicalData = require("../historical/model");
const _ = require("lodash");

async function getAdminDashoard(req) {
  try {
    const AllAlertsCount = await alertsData.aggregate([
      {
        $count: "Count",
      },
    ]);
    const AllUserCount = await userData.aggregate([
      {
        $match: {
          company_id: Number(req.query.companyId),
        },
      },
      {
        $count: "Count",
      },
    ]);
    const AllDeviceCount = await deviceData.aggregate([
      {
        $match: {
          CompanyId: Number(req.query.companyId),
        },
      },
      {
        $facet: {
          totalDevice: [{ $count: "count" }],
          threeDaysOfflineDevice: [
            { $match: { status: false } },
            { $count: "count" },
          ],
          onlineDevice: [{ $match: { status: true } }, { $count: "count" }],
          offlineDevice: [{ $match: { status: false } }, { $count: "count" }],
          unmappedDevice: [
            { $match: { MapCustomer: null } },
            { $count: "count" },
          ],
          mappedDevice: [
            { $match: { MapCustomer: { $ne: null } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const adminDashboard = {
      toatlAlert: AllAlertsCount[0]?.Count || 0,
      toatlUser: AllUserCount[0]?.Count || 0,
      totalDevice: AllDeviceCount[0]?.totalDevice[0]?.count || 0,
      threeDaysOfflineDevice:
        AllDeviceCount[0]?.threeDaysOfflineDevice[0]?.count || 0,
      mappedDevice: AllDeviceCount[0]?.mappedDevice[0]?.count || 0,
      offlineDevice: AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
      onlineDevice: AllDeviceCount[0]?.onlineDevice[0]?.count || 0,
      unmappedDevice: AllDeviceCount[0]?.unmappedDevice[0]?.count || 0,
    };
    return {
      msg: "successfully Find",
      data: adminDashboard,
    };
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getOEMAdminDashoard
async function getOEMAdminDashoard(req) {
  try {
    // const AllAlertsCount = await alertsData.aggregate([
    //     {
    //         $count: "Count"
    //       },
    // ])
    const AllGatewayCount = await gatewayData.aggregate([
      {
        $match: {
          companyId: Number(req.query.companyId),
        },
      },
      {
        $count: "Count",
      },
    ]);
    const AllCompanyCount = await companyData.aggregate([
      {
        $match: {
          companyId: Number(req.query.companyId),
          isOEM: false,
          isDelete: false,
        },
      },
      {
        $count: "Count",
      },
    ]);
    const AllUserCount = await userData.aggregate([
      {
        $match: {
          company_id: Number(req.query.companyId),
          isDelete: false,
          administrator: false,
        },
      },
      {
        $count: "Count",
      },
    ]);
    const AllDeviceCount = await deviceData.aggregate([
      {
        $match: {
          CompanyId: Number(req.query.companyId),
        },
      },
      {
        $facet: {
          totalDevice: [{ $count: "count" }],
          threeDaysOfflineDevice: [
            { $match: { status: false } },
            { $count: "count" },
          ],
          onlineDevice: [{ $match: { status: true } }, { $count: "count" }],
          offlineDevice: [{ $match: { status: false } }, { $count: "count" }],
          unmappedDevice: [
            { $match: { MapCustomer: null } },
            { $count: "count" },
          ],
          mappedDevice: [
            { $match: { MapCustomer: { $ne: null } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const adminDashboard = {
      toatlAlert: 0,
      toatlUser: AllUserCount[0]?.Count || 0,
      totalDevice: AllDeviceCount[0]?.totalDevice[0]?.count || 0,
      threeDaysOfflineDevice:
        AllDeviceCount[0]?.threeDaysOfflineDevice[0]?.count || 0,
      mappedDevice: AllDeviceCount[0]?.mappedDevice[0]?.count || 0,
      offlineDevice: AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
      onlineDevice: AllDeviceCount[0]?.onlineDevice[0]?.count || 0,
      unmappedDevice: AllDeviceCount[0]?.unmappedDevice[0]?.count || 0,
      toatlCompany: AllCompanyCount[0]?.Count || 0,
      toatlGateway: AllGatewayCount[0]?.Count || 0,
    };
    return {
      msg: "successfully Find",
      data: adminDashboard,
    };
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getOEMAdminReNewDashoard
async function getOEMAdminReNewDashoard(req) {
  try {
    fDate = new Date().setHours(0, 0, 0, 0);
    const AllDeviceCount = await deviceData.aggregate([
      {
        $match: {
          CompanyId: Number(req.query.companyId),
          reNewDate: { $gte: fDate },
        },
      },
      { $sort: { reNewDate: 1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "MapCustomer",
          foreignField: "_id",
          as: "userinfo",
        },
      },
      {
        $project: {
          _id: 0,
          AssetName: 1,
          InstallationDate: 1,
          reNewDate: 1,
        },
      },
    ]);

    // console.log(AllDeviceCount)
    return {
      msg: "successfully Find",
      data: AllDeviceCount,
    };
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getuserDashoard
async function getuserDashoard(req) {
  try {
    const AllAlertsCount = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.query.userId),
        },
      },
      {
        $lookup: {
          from: "alertsMaa",
          localField: "AssetId",
          foreignField: "AssetId",
          as: "alerts",
        },
      },
      {
        $unwind: "$alerts",
      },
      {
        $count: "Count",
      },
    ]);
    const AllDeviceCount = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.query.userId),
        },
      },
      {
        $facet: {
          totalDevice: [{ $count: "count" }],
          threeDaysOfflineDevice: [
            { $match: { status: false } },
            { $count: "count" },
          ],
          onlineDevice: [{ $match: { status: true } }, { $count: "count" }],
          offlineDevice: [{ $match: { status: false } }, { $count: "count" }],
          // unmappedDevice : [
          //   { $match: { MapCustomer: null } },
          //   { $count: "count" }
          // ],
          // mappedDevice: [
          //   { $match: { MapCustomer: { $ne: null } } },
          //   { $count: "count" }
          // ]
        },
      },
    ]);

    const adminDashboard = {
      toatlAlert: AllAlertsCount[0]?.Count || 0,
      totalDevice: AllDeviceCount[0]?.totalDevice[0]?.count || 0,
      threeDaysOfflineDevice:
        AllDeviceCount[0]?.threeDaysOfflineDevice[0]?.count || 0,
      offlineDevice: AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
      onlineDevice: AllDeviceCount[0]?.onlineDevice[0]?.count || 0,
    };
    return {
      msg: "successfully Find",
      data: adminDashboard,
    };
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getOEMUserDashoard
async function getOEMUserDashoard(req) {
  try {
    const AllAlertsCount = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.query.userId),
        },
      },
      {
        $lookup: {
          from: "oemAlerts",
          localField: "AssetId",
          foreignField: "assetId",
          as: "alerts",
        },
      },
      {
        $unwind: "$alerts",
      },
      {
        $count: "Count",
      },
    ]);

    const AllDeviceCount = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.query.userId),
        },
      },
      {
        $facet: {
          totalDevice: [{ $count: "count" }],
          threeDaysOfflineDevice: [
            { $match: { status: false } },
            { $count: "count" },
          ],
          // onlineDevice : [
          //   { $match: { status: true } },
          //   { $count: "count" }
          // ],
          // offlineDevice : [
          //   { $match: { status: false } },
          //   { $count: "count" }
          // ],
          // unmappedDevice : [
          //   { $match: { MapCustomer: null } },
          //   { $count: "count" }
          // ],
          // mappedDevice: [
          //   { $match: { MapCustomer: { $ne: null } } },
          //   { $count: "count" }
          // ]
        },
      },
    ]);

    const adminDashboard = {
      toatlAlert: AllAlertsCount[0]?.Count || 0,
      totalDevice: AllDeviceCount[0]?.totalDevice[0]?.count || 0,
      threeDaysOfflineDevice:
        AllDeviceCount[0]?.threeDaysOfflineDevice[0]?.count || 0,
      // offlineDevice: AllDeviceCount[0]?.offlineDevice[0]?.count || 0,
      // onlineDevice: AllDeviceCount[0]?.onlineDevice[0]?.count || 0,
    };
    return {
      msg: "successfully Find",
      data: adminDashboard,
    };
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getOEMUserInformationDashoard
async function getOEMUserInformationDashoard(req) {
  try {
    console.log("GET_FULL_USER request for userId:", req.query.userId);
    const user = await userData.aggregate([
      {
        $match: {
          _id: ObjectId(req.query.userId),
          isDelete: false,
          administrator: false,
        },
      },
      {
        $lookup: {
          from: "lcdcofigs",
          localField: "_id",
          foreignField: "userId",
          as: "lcdParameter",
        },
      },
      {
        $lookup: {
          from: "parameters",
          localField: "lcdParameter.ParameterId",
          foreignField: "_id",
          as: "Parameter",
        },
      },
      {
        $project: {
          _id: 1,
          userId: "$_id",
          address: 1,
          company_id: 1,
          company_name: 1,
          first_name: 1,
          last_name: 1,
          Parameter: 1,
          registeredOn: 1,
          email_id: 1,
        },
      },
    ]);
    console.log(
      "GET_FULL_USER response:",
      user.length > 0 ? "User found" : "User not found",
      user.length > 0 ? user[0]._id : null
    );
    return {
      msg: "successfully Find",
      data: user.length > 0 ? user[0] : null,
    };
    // console.log(user)
  } catch (error) {
    return Promise.reject("error occure in get lcd Config");
  }
}

// getOEMLcdDashoard
async function getOEMLcdDashoard(req) {
  try {
    // console.log(req.params.id)
    asset = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.params.id),
        },
      },
      { $limit: 1 },
      // { $replaceRoot: { newRoot: "$$ROOT" } }
    ]);
    time = new Date(Number(req.query.date)).toLocaleString("en-US", {
      timeZone: asset.length > 0 ? asset[0].timeZone : "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "long",
    });
    fromTime = time.split(" ");
    fromTime.splice(3, 2, "00:00:00", "AM");
    timefrom = fromTime.join(" ");
    fromTime.splice(3, 2, "11:59:59", "PM");
    timeto = fromTime.join(" ");
    // console.log(new Date(timefrom), new Date(timeto))
    fDate = Date.parse(timefrom);
    tDate = Date.parse(timeto);
    // console.log(timefrom, timeto, fDate, tDate)
    const AllDeviceLCDView = await deviceData.aggregate([
      {
        $match: {
          MapCustomer: ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "oemParametrConfigs",
          let: {
            mid: "$MapCustomer",
            lid: "$AssetId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$mid"] },
                    { $eq: ["$assetId", "$$lid"] },
                  ],
                },
              },
            },
          ],
          as: "liveParameter",
        },
      },
      // // //  {
      // // //     $lookup: {
      // // //       from: "allRegisters",
      // // //       let: {
      // // //         mid: "$liveParameter.parameterId",
      // // //         lid: "$liveParameter.assetTypeId"
      // // //       },
      // // //       pipeline: [
      // // //         {
      // // //           $match: {
      // // //             $expr: {
      // // //               $and: [
      // // //                 { $eq: ["$Parameter", "$$mid"] },
      // // //                 { $eq: ["$AssetTypeId", "$$lid"] }
      // // //               ]
      // // //             }
      // // //           }
      // // //         },
      // // //       ],
      // // //       as: "liveRegister"
      // // //     }
      // // //   },
      {
        $lookup: {
          from: "historicalMeterValues" + Number(req.query.companyId),
          let: { assetId: "$AssetId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$AssetId", "$$assetId"] },
                    { $gte: ["$Date", fDate] },
                    { $lte: ["$Date", tDate] },
                  ],
                },
              },
            },
          ],
          as: "historicalData",
        },
      },
      {
        $unwind: { path: "$historicalData", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "allRegisters",
          localField: "historicalData.Data._id",
          foreignField: "RegisterId",
          as: "registerData",
        },
      },
      {
        $addFields: {
          liveParamIds: {
            $map: {
              input: "$liveParameter",
              as: "lp",
              in: "$$lp.parameterId",
            },
          },
        },
      },
      {
        $project: {
          AssetId: 1,
          timeZone: 1,
          liveParameter: 1,
          Gateway: 1,
          AssetName: 1,
          // CompanyId: 1,
          registerData: 1,
          status: 1,
          SlaveId: 1,
          AssetTypeId: 1,
          // MapCustomer: 1,
          filteredHistWithParam: {
            $map: {
              input: {
                $filter: {
                  input: "$historicalData.Data",
                  as: "hd",
                  cond: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$registerData",
                            as: "reg",
                            cond: {
                              $and: [
                                { $eq: ["$$reg.RegisterId", "$$hd._id"] },
                                { $in: ["$$reg.Parameter", "$liveParamIds"] },
                              ],
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
              as: "entry",
              in: {
                _id: "$$entry._id",
                ActValue: "$$entry.ActValue",
                ValueReceivedDate: "$$entry.ValueReceivedDate",
                parameterId: {
                  $first: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$registerData",
                          as: "reg",
                          cond: { $eq: ["$$reg.RegisterId", "$$entry._id"] },
                        },
                      },
                      as: "matchedReg",
                      in: "$$matchedReg.Parameter",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "parameters",
          localField: "liveParameter.parameterId",
          foreignField: "_id",
          as: "ParamneterData",
        },
      },
      {
        $lookup: {
          from: "oemAlertsConfig",
          localField: "AssetId",
          foreignField: "assetId",
          as: "AlertsData",
        },
      },
      {
        $lookup: {
          from: "oemParameterSequenceConfig",
          localField: "AssetId",
          foreignField: "assetId",
          as: "ParameterSequenceData",
        },
      },
      {
        $project: {
          liveParameter: 0,
        },
      },
      {
        $lookup: {
          from: "oemAlerts",
          let: {
            // mid: "$MapCustomer",
            lid: "$AssetId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // { $eq: ["$userId", "$$mid"] },
                    { $eq: ["$assetId", "$$lid"] },
                  ],
                },
              },
            },
            { $sort: { time: -1 } },
            { $limit: 1 },
          ],
          as: "latestAlert",
        },
      },
    ]);
    // console.log(AllDeviceLCDView)

    const transformedData = _.map(AllDeviceLCDView, (item) => {
      const paramMap = _.map(item.ParamneterData, (param) => {
        const lastHist = _.last(
          _.filter(item.filteredHistWithParam, { parameterId: param._id })
        );
        const register = _.last(
          _.filter(item.registerData, { Parameter: param._id })
        );
        const alert = _.last(
          _.filter(item.AlertsData, { parameter: param._id })
        );
        const parameterSequence = _.last(
          _.filter(item.ParameterSequenceData, { parameterId: param._id })
        );
        return {
          _id: param._id,
          Name: param.Name,
          sequence: parameterSequence ? parameterSequence.sequence : 999999,
          RegisterAddress: register ? register.RegisterAddress : null,
          LowerThresholdValue: alert ? alert.lowerThresholdValue : null,
          UpperThresholdValue: alert ? alert.upperThresholdValue : null,
          LowerThresholdWarning: alert ? alert.lowerThresholdWarning : null,
          UpperThresholdWarning: alert ? alert.upperThresholdWarning : null,
          lastActValue: lastHist
            ? {
                ActValue: _.last(lastHist.ActValue),
                ValueReceivedDate: _.last(lastHist.ValueReceivedDate),
              }
            : {},
        };
      });

      return {
        _id: item._id,
        AssetId: item.AssetId,
        TimeZone: item.timeZone,
        AssetName: item.AssetName,
        Gateway: item.Gateway,
        status: item.status,
        SlaveId: item.SlaveId,
        AssetTypeId: item.AssetTypeId,
        latestAlert: item.latestAlert.length > 0 ? item.latestAlert[0] : null,
        // filteredHistWithParam: item.filteredHistWithParam,
        ParameterData: _.sortBy(paramMap, "sequence"),
      };
    });
    // console.log(transformedData)
    // const array1 =
    return {
      msg: "successfully Find",
      data: transformedData,
    };
    // const user = await userData.aggregate([  {
    //     '$match': {
    //         _id : ObjectId(req.query.userId),
    //         "isDelete" : false,
    //         "administrator" : false
    //     },
    // },
    //    {
    //             $lookup: {
    //                 from: "lcdcofigs",
    //                 localField: "_id",
    //                 foreignField: "userId",
    //                 as: "lcdParameter"
    //             }
    //   },
    //       {
    //             $lookup: {
    //                 from: "parameters",
    //                 localField: "lcdParameter.ParameterId",
    //                 foreignField: "_id",
    //                 as: "Parameter"
    //             }
    //   },
    //       {
    //             $project: {
    //                 address : 1,
    //                 company_id : 1,
    //                 company_name : 1,
    //                 first_name : 1,
    //                 last_name :1,
    //                 Parameter  :1,
    //                 registeredOn  :1,
    //                 email_id  :1

    //                 }
    //   },
    // ]);
    //      return {
    //     msg: 'successfully Find',
    //     data: user.length > 0 ? user[0] : null
    // }
    // console.log(user)
  } catch (error) {
    console.log("error occure in get lcd Config", error);
    return Promise.reject("error occure in get lcd Config", error);
  }
}

module.exports = {
  getAdminDashoard,
  getuserDashoard,
  getOEMAdminDashoard,
  getOEMAdminReNewDashoard,
  getOEMUserInformationDashoard,
  getOEMUserDashoard,
  getOEMLcdDashoard,
};
