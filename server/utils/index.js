module.exports = {
  mailService: require("./mailService"),
  emailTemplateProvider: require("./emailTemplateProvider"),
  fileUpload: require("./fileupload"),
  tokenVerify: require("./tokenVerification"),
  Dailyreport: require("./dailyReport"),
  StopGatewayAlertsScheduler: require("./stopGatewayScheduler"),
  uoStopMeter: require("./uoStopMeter"),
  dgReport: require("./dgMorningReportLAndL"),
  // scheduler : require('./oeeScheduler'), // File not tracked in git
  oeeReportScheduler: require("./oeeReportScheduler"),
  morningDifferenceReportMonth: require("./morningDifferenceReportMonth"),
  // uoStopMeter : require('./uoStopMeter')
  // dummy : require('./dummyData')
};
