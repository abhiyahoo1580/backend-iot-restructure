const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertOEMMapAssetType(req).then((response) =>{
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
    controller.getOEMMapAssetType(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function getParameterList(req,res) {
    controller.getParameterList(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// // getDeiceByuser
// function getDeiceByuser(req,res) {
//     controller.getUosplDeiceByuser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }
// function put(req,res){
//     controller.updateOEMUser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         // res.status(500).send({msg:'error occured'});
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

// function remove(req,res){
//     controller.deleteOEMUser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error)
//         res.status(500).send({msg:'error occured'});
//     })
// }

router.post('/insert',post);
// router.put('/update/:id',put);
router.get('/get',get);
// // router.get('/get/device/:id',getDeiceByuser);
router.get('/parameter/List/get',getParameterList);
// router.delete('/delete/:id',remove);

module.exports=router
