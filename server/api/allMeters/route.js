const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function get(req,res) {
    controller.getAllMeterDate(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        if (error.name === "ValidationError") {
            let errors = {};
      
            Object.keys(error.errors).forEach((key) => {
              errors[key] = error.errors[key].message;
            });
            console.log(errors)
            res.status(400).send(errors);
          }
          res.status(500).send({msg:'error occured'});
    })
}

function getGroupData(req,res) {
    controller.getAllGroupsData(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        if (error.name === "ValidationError") {
            let errors = {};
      
            Object.keys(error.errors).forEach((key) => {
              errors[key] = error.errors[key].message;
            });
            console.log(errors)
            res.status(400).send(errors);
          }
          res.status(500).send({msg:'error occured'});
    })
}
// getGroupDailyProductionData

function getGroupDailyProductionData(req,res) {
  controller.getGroupDailyProductionData(req).then((response) => {
      res.status(200).send(response);
  }).catch((error) =>{
      if (error.name === "ValidationError") {
          let errors = {};
    
          Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
          });
          console.log(errors)
          res.status(400).send(errors);
        }
        res.status(500).send({msg:'error occured'});
  })
}
router.get('/daily/get',get);
router.get('/daily/group/get/',getGroupData)
router.get('/daily/production/group/get/',getGroupDailyProductionData)

module.exports=router