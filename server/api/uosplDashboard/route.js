const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');


function getAdminDashoard(req,res) {
    controller.getAdminDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getOEMAdminDashoard

function getOEMAdminDashoard(req,res) {
    controller.getOEMAdminDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getOEMAdminReNewDashoard
function getOEMAdminReNewDashoard(req,res) {
    controller.getOEMAdminReNewDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getuserDashoard(req,res) {
    controller.getuserDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

//getOEMUserDashoard
 function getOEMUserDashoard(req,res) {
    controller.getOEMUserDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


// getOEMUserInformationDashoard
function getOEMUserInformationDashoard(req,res) {
    controller.getOEMUserInformationDashoard(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// function getOEMLcdDashoard(req,res) {
function getOEMLcdDashoard(req,res) {
    controller.getOEMLcdDashoard(req).then((response) => {
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




router.get('/admin/get',getAdminDashoard);
router.get('/user/get',getuserDashoard);
router.get('/oem/admin/get',getOEMAdminDashoard);
router.get('/oem/admin/renew/get',getOEMAdminReNewDashoard);
router.get('/oem/user/information/get',getOEMUserInformationDashoard);
router.get('/oem/user/get',getOEMUserDashoard);
router.get('/oem/user/lcd/get/:id',getOEMLcdDashoard);
// router.get('/user/get',getUserAlert);
// router.get('/device/get',getdeviceAlert);


module.exports=router
