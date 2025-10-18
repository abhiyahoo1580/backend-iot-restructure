const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');


function getAll(req,res) {
    controller.getAll(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}
// getNewAll
function getNewAll(req,res) {
    controller.getNewAll(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getUserAlert(req,res) {
    controller.getUserAlert(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getNewUserAlert
function getNewUserAlert(req,res) {
    controller.getNewUserAlert(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getdeviceAlert(req,res) {
    controller.getdeviceAlert(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}




router.get('/admin/get',getAll);
router.get('/user/get',getUserAlert);
router.get('/device/get',getdeviceAlert);
router.get('/admin/new/get',getNewAll);
router.get('/user/new/get/:id',getNewUserAlert);


module.exports=router
