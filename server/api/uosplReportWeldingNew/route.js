const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');


function getWeldingReport(req,res) {
    controller.getWeldingReport(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


function getWeldingNumbers(req,res) {
    controller.getWeldingNumbers(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}
// function getUserAlert(req,res) {
//     controller.getUserAlert(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }

// function getdeviceAlert(req,res) {
//     controller.getdeviceAlert(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }




router.get('/report/get',getWeldingReport);
router.get('/number/get',getWeldingNumbers);
// router.get('/user/get',getuserDashoard);
// router.get('/user/get',getUserAlert);
// router.get('/device/get',getdeviceAlert);


module.exports=router
