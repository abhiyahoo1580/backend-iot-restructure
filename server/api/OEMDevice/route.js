const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertUosplDevice(req).then((response) =>{
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
    controller.getUosplDevice(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


// getForDropDown
function getForDropDown(req,res) {
    controller.getForDropDown(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getByGatewayId
function getByGatewayId(req,res) {
    controller.getByGatewayId(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


function getMap(req,res) {
    controller.getDeviceMapped(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getUnMap
function getUnMap(req,res) {
    controller.getDeviceUnMapped(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

function put(req,res){
    controller.updateDevice(req).then((response) => {
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

// putDecice
function putDeciceGateway(req,res){
    controller.putDeciceGateway(req).then((response) => {
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

// // putMapDecice
// function deleteMapDecice(req,res){
//     controller.deleteUosplDeviceMapping(req).then((response) => {
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

function remove(req,res){
    controller.deleteDevice(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error)
        res.status(500).send({msg:'error occured'});
    })
}

router.post('/insert',post);
router.put('/update/:id',put);
router.put('/update/gateway/:id',putDeciceGateway);
router.get('/get/:id?',get);
router.get('/map/get',getMap);
router.get('/unmap/get',getUnMap);
router.delete('/delete/:id',remove);
router.get('/dropdown/get',getForDropDown);
// router.delete('/delete/map/:id',deleteMapDecice);
router.get('/asset/by/gateway/get/:id',getByGatewayId );

module.exports=router
