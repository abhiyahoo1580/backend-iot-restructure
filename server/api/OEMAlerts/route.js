const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

// function post(req,res) {
//     controller.insertOemAlerts(req).then((response) =>{
//         res.status(200).send(response);
//     }).catch((error)=>{
//         if (error.name === "ValidationError") {
//             let errors = {};      
//             Object.keys(error.errors).forEach((key) => {
//               errors[key] = error.errors[key].message;
//             });
      
//             return res.status(400).send({msg : "Validation Error",
//             errors : errors});
//           }
//         res.status(500).send({msg:'error occured'})
//     })
// }

function get(req,res) {
    controller.getOemAlerts(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getAlerts(req,res) {
    controller.getNewOemAlerts(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getUnReadCount(req,res) {
    controller.getUnReadCount(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function putRead(req, res) {
    controller.updateIsRead(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) => {
        if (error.name === "ValidationError") {
            let errors = {};
      
            Object.keys(error.errors).forEach((key) => {
              errors[key] = error.errors[key].message;
            });
            console.log(errors)
            res.status(400).send(errors);
          }
          res.status(500).send({msg:'error occured'});
    });
}

// router.post('/insert',post);
router.get('/get/:id',get)
router.get('/new/get/:id',getAlerts)
router.put('/isRead', putRead);
router.get('/count/get/:id',getUnReadCount)
module.exports=router
