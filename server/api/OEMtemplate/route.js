const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertOEMTemplate(req).then((response) =>{
        res.status(200).send(response);
    }).catch((error)=>{
        if (error.name === "ValidationError") {
            let errors = {};      
            Object.keys(error.errors).forEach((key) => {
              errors[key] = error.errors[key].message;
            });
      
            return res.status(400).send({msg : "Validation Error",
            errors : errors});
          }
        res.status(500).send({msg:'error occured'})
    })
}

// // getCompoanyDropdown
// function getGatewayDropdown(req,res) {
//     controller.getGatewayDropdown(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }

// function get(req,res) {
//     controller.getOemGateway(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }




router.post('/insert',post);
// router.get('/dropdown/get',getGatewayDropdown);
// router.get('/get',get);

module.exports=router
