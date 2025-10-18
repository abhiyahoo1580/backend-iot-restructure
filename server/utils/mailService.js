var nodemailer = require('nodemailer');

function mailService( mailService, from, html, to, subject, password,text,fileName,saveFilePath,fileAttachedMultipal){
// console.log( mailService, from, html, to, subject, password,text)
var transporter = nodemailer.createTransport({
    service: mailService,
    auth: {
      user: from,
      pass: password
    }
  });
  
  var mailOptions = {
    from : from,
    to : to,
    subject : subject,
    html : html,
    text : text,
    attachments: fileAttachedMultipal.length > 0 ? fileAttachedMultipal : [
      {   // file on disk as an attachment
        filename: fileName ,
        path: saveFilePath // stream this file
      }],

  };
  return transporter.sendMail(mailOptions);
}

module.exports = mailService