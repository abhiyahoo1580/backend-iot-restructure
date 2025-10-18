const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');


function getDailyReport(req,res) {
    controller.getDailyReport(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


function getDailyReportDate(req,res) {
    controller.getDailyReportDate(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

router.get('/report/get',getDailyReport);
router.get('/report/date/get',getDailyReportDate);



module.exports=router
