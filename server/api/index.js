const express = require("express");
const router = express.Router({ mergeParams: true });
const tokenVerification = require('../utils').tokenVerify
// const scheduler = require('../utils/oeeScheduler')
// const oeeReportScheduler = require('../utils/oeeReportScheduler')
// const morningDifferenceReportMonth = require('../utils/morningDifferenceReportMonth')
// const uoStopMeter = require('../utils/uoStopMeter')


/** subject**/
const subject = require('./subject');
router.use('/subject', tokenVerification,subject.router );

/** lcd Config**/
const lcdConfig = require('./lcdConfig');
router.use('/lcdconfig',tokenVerification, lcdConfig.router);

/** lcd Diffrence**/
const lcdDifference = require('./lcdDifference');
router.use('/lcdDifference', tokenVerification, lcdDifference.router);

/** login**/
const loginConfig = require('./login');
router.use('/login', loginConfig.router);   


/** tod Config**/
const todConfig = require('./tod');
router.use('/tod', tokenVerification, todConfig.router);

/** alert Config**/
const alertConfig = require('./alertConfig');
router.use('/alertConfig', tokenVerification, alertConfig.router);
/** groups**/
const groups = require('./groups');
router.use('/group/meter', tokenVerification, groups.router);


/** historical**/
const historical = require('./historical');
router.use('/historical', tokenVerification, historical.router );


/** Asset**/
const companyAsset = require('./companyAsset');
router.use('/asset', companyAsset.router);

/** Machine Target**/
const machineTarget = require('./targetMachine');
router.use('/machine/target', machineTarget.router);


/** shift Config**/
const shiftConfig = require('./shifts');
router.use('/shift',  tokenVerification, shiftConfig.router);

/** graph group Config**/
const graphGroupConfig = require('./graphGroup');
router.use('/graph/group', tokenVerification, graphGroupConfig.router);

/** alerts**/
const alert = require('./alerts');
router.use('/alert', tokenVerification, alert.router);

/* group analytics all meters */
const allMeters =  require('./allMeters');
router.use('/allmeters/difference',  tokenVerification,  allMeters.router);

/** areaWise**/
const areaWise = require('./areaWise');
router.use('/area/wise', tokenVerification, areaWise.router);


/** areaWise**/
const differenceValueMonth = require('./differenceValueMonth');
router.use('/area/wise/difference', tokenVerification,  differenceValueMonth.router);

/* OEE */
const oeeTable = require('./oeeTable');
router.use('/oee',tokenVerification, oeeTable.router);

/* OEE Shift */
const oeeTableShift = require('./oeeTableShift');
router.use('/oee/shift',tokenVerification, oeeTableShift.router);
/** comapny**/
const company = require('./compnay');
router.use('/company', tokenVerification,company.router);

/** side bar**/
const sideBar = require('./sideBar');
router.use('/sidebar',tokenVerification, sideBar.router);

/** side bar**/
const sideBarConfig = require('./sideBarConfig');
router.use('/sidebar/config', tokenVerification,sideBarConfig.router);

/* GatewayId */
const gatewayId = require('./gatewayId');
router.use('/gatewayId',tokenVerification, gatewayId.router);

/* GatewayId */
const RawData = require('./RawData');
router.use('/raw/rata',tokenVerification, RawData.router);

/* GatewayId */
const StopGateway = require('./stopGatewaySmsAlert');
router.use('/stop/gateway',tokenVerification, StopGateway.router);

/* Device mapped */
const DeviceMapped = require('./DeviceMapped')
router.use('/map/device', tokenVerification, DeviceMapped.router);

/* Device mapped */
const User = require('./users')
router.use('/user', tokenVerification,User.router);

/* MSEB Reading*/
const MSEBReading = require('./MSEBReading')
router.use('/MSEB/reading', MSEBReading.router);

/* analysis api*/
const analysis = require('./analysis')
router.use('/analysis', analysis.router);

/* uospl device api */
const uosplDevice = require('./uosplDevice')
router.use('/UOSPL/device', uosplDevice.router);

/* uospl user api */
const uosplUser= require('./uosplUser')
router.use('/UOSPL/user', uosplUser.router);

/* uospl user api */
const uosplOperator= require('./uosplOperator')
router.use('/UOSPL/operator', uosplOperator.router);

/* uospl user api */
const uosplMachineJob= require('./uosplMachineJob')
router.use('/UOSPL/machine/job', uosplMachineJob.router);

/* uospl alerts  api */
const uosplAlerts= require('./uosplAlert')
router.use('/UOSPL/alerts', uosplAlerts.router);

/* uospl dashboard  api */
const uosplDashboard= require('./uosplDashboard')
router.use('/UOSPL/dashboard', uosplDashboard.router);

/* uospl dashboard  api */
const uosplDailyReport = require('./uosplReportDailyNew')
router.use('/UOSPL/daily', uosplDailyReport.router);

/* uospl dashboard  api */
const uosplWeldingReport = require('./uosplReportWeldingNew')
router.use('/UOSPL/welding', uosplWeldingReport.router);



/* OEM user api */
const oemUser= require('./OEMUser')
router.use('/OEM/user', oemUser.router);

/* OEM comany api */
const oemCompany= require('./OEMCompany')
router.use('/OEM/company', oemCompany.router);

/* assettype map user api */
const oEMAssetTypeMapping= require('./OEMAssetTypeMapping')
router.use('/OEM/assetType/map', oEMAssetTypeMapping.router);

/* lcd parameter api */
const oEMLiveParameter= require('./OEMLiveParameter')
router.use('/OEM/Lcd', oEMLiveParameter.router);

/* lcd parameter api */
const oEMGateway= require('./OEMGateway')
router.use('/OEM/Gateway', oEMGateway.router);


/* oem device  api */
const oEMDevice= require('./OEMDevice')
router.use('/OEM/Device', oEMDevice.router);

/* oem device  api */
const oEMAlerts= require('./OEMAlerts')
router.use('/OEM/Alert', oEMAlerts.router);

/* oem alerts config  api */
const oEMAlertsConfig = require('./OEMAlertsConfig')
router.use('/OEM/Config/Alert', oEMAlertsConfig.router);

/* oem alerts config  api */
const oEMParameterSequenceConfig = require('./OEMParameterSequence')
router.use('/OEM/Config/parameter/Sequence', oEMParameterSequenceConfig.router);

/* oem alerts config  api */
const oEMGraphGroupParameters = require('./OEMGraphGroupParameters')
router.use('/OEM/Config/graph', oEMGraphGroupParameters.router);


/* oem alerts config  api */
const oEMTemplates= require('./OEMtemplate')
router.use('/templates', oEMTemplates.router);

/* oem alerts config  api */
const oEMTemplateMapping = require('./OEMtemplateMapping')
router.use('/OEM/Map/template', oEMTemplateMapping.router);

/* assettype map user api */
const dgMeterManulEntry= require('./dgDiselManulEntry')
router.use('/dg/entry', dgMeterManulEntry.router);

module.exports = {
    router
}