const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertUosplJob(req).then((response) =>{
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

function get(req,res) {
    controller.getUosplJob(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


function put(req,res){
    controller.updateUosplJob(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        // res.status(500).send({msg:'error occured'});
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

function remove(req,res){
    controller.deleteUosplJob(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error)
        res.status(500).send({msg:'error occured'});
    })
}

router.post('/insert',post);
router.put('/update/:id',put);
router.get('/get',get);
router.delete('/delete/:id',remove);

module.exports=router
