const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertAreaWise(req).then((response) =>{
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
    controller.getAreaWise(req).then((response) => {
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
    controller.updateAreaWise(req).then((response) => {
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
    controller.deleteAreaWise(req).then((response) => {
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


module.exports=router
