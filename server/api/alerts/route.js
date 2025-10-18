const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('./controller');


function get(req, res) {
    controller.getAlerts(req).then((response) =>{
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
    })
}
alertClear

function alertClear(req, res) {
  controller.alertClear(req).then((response) =>{
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
  })
}
// getLatestAndUnReady
function getLatestAndUnReady(req, res) {
  controller.getLatestAndUnReady(req).then((response) =>{
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
  })
}
// function getArchived(req, res) {
//   controller.getArchivedAlerts(req).then((response) =>{
//         res.status(200).send(response);
//     }).catch((error) => {
//         console.warn(error);
//         res.status(500).send({msg: 'error occurred', error: error});
//     })
// }

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

function putArchived(req, res) {
    controller.updateIsArchived(req).then((response) => {
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

router.get('/get', get);
router.get('/get/count/latest', getLatestAndUnReady);
// router.get('/getArchived/', getArchived);
router.put('/isRead/', putRead);
router.put('/isArchived/',putArchived);
router.put('/clear/:AssetId', alertClear);

module.exports = router;