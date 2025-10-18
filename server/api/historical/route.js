const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function get(req,res) {
    controller.getHistorical(req).then((response) => {
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

// getGraph
function getGraph(req,res) {
  controller.getGraphHistorical(req).then((response) => {
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

// getGraphReange
function getGraphReange(req,res) {
  controller.getGraphHistoricalRange(req).then((response) => {
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

function getBatch(req,res) {
    controller.getBatchForShree(req).then((response) => {
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

function getWeldingReportGet(req,res) {
  controller.getWeldingReportGet(req).then((response) => {
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
function getShiftBatch(req,res) {
    controller.getShiftBatchForShree(req).then((response) => {
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

// getAvailableDateByAssetId
function getAvailableDateByAssetId(req,res) {
    controller.getAvailableDateByAssetId(req).then((response) => {
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

// getGraphforMobile
function getGraphForMobile(req, res) {
  controller.getGraphForMobileApp(req).then((response) => {
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

router.get('/get',get);
router.get('/graph/get',getGraph);
router.get('/graph/range/get',getGraphReange);
router.get('/batch/get',getBatch);
router.get('/shift/batch/get',getShiftBatch);
router.get('/available/date/get',getAvailableDateByAssetId);
router.get('/mobile/graph/get',getGraphForMobile)
router.get('/welding/report/get',getWeldingReportGet);

module.exports=router
