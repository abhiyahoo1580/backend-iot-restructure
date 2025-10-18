const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');



function post(req,res) {
    controller.insertOee(req).then((response) =>{
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
// getLatest
function getProduction(req,res) {
    controller.getProduction(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}
// getProductionByMonth
function getProductionByMonth(req,res) {
    controller.getProductionByMonth(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}
  
// getHistoricalOee
function getHistoricalOee(req,res) {
    controller.getHistoricalOee(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

// getHistoricalOee
function getHistoricalCustomeOee(req,res) {
    controller.getHistoricalCustomeOee(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

// getliveData
function getliveData(req,res) {
    controller.getliveData(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}


router.get('/month/custome/get',getHistoricalCustomeOee);
router.get('/get',get);
router.post('/insert',post);
router.get('/calculated/get',calculatedOeeGet);
// router.put('/update/:id',put);
// router.get('/get',get);
router.get('/production/month/get',getProduction);
router.get('/month/get',getHistoricalOee);
router.get('/production/year/get',getProductionByMonth);
router.get('/live/data/get',getliveData);
// router.delete('/delete/:id',remove);

module.exports=router