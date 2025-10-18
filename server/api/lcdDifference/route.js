const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertlcdDifference(req).then((response) =>{
        res.status(200).send(response);
    }).catch((error)=>{
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

function get(req,res) {
    controller.getlcdDifference(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        if (error.name === 'ValidationError') {
            console.error(Object.values(error.errors).map(val => val.message))
            res.status(400).send({msg:Object.values(error.errors).map(val => val.message)[0]})
        }else{
            res.status(500).send({msg:'error occured'});
        }if (error.name === "ValidationError") {
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


function getCompanyLcdDifference(req,res) {
    controller.getCompanyLcdDifference(req).then((response) => {
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


function put(req,res){
    controller.updatelcdDifference(req).then((response) => {
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

function remove(req,res){
    controller.deletelcdDifference(req).then((response) => {
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

router.post('/insert',post);
router.put('/update/:id',put);
router.get('/get/:id?',get);
router.delete('/delete/:id',remove);
router.get('/companylcddifference/get/:id?', getCompanyLcdDifference)

module.exports=router
