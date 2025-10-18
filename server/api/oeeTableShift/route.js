const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');



function post(req,res) {
    controller.insertOeeShift(req).then((response) =>{
        res.status(200).send(response);
    }).catch((error)=>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

function get(req,res) {
    controller.getOeeTable(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

// calculatedOeeGet
function calculatedOeeGet(req,res) {
    controller.calculatedOeeGet(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

function getProduction(req,res) {
    controller.getProduction(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

router.get('/get',get);
router.post('/insert',post);
router.get('/calculated/get',calculatedOeeGet);
router.get('/production/get',getProduction);
module.exports=router