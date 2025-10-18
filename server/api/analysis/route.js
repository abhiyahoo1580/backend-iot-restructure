const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

// function post(req,res) {
//     controller.insertSubject(req).then((response) =>{
//         res.status(200).send(response);
//     }).catch((error)=>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'})
//     })
// }

function getParameterOfMeter(req,res) {
    controller.getParameterOfMeter(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}
// getCurrentOfMeter
function getCurrentOfMeter(req,res) {
    controller.getCurrentOfMeter(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}
// function put(req,res){
//     controller.updateSubject(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error)
//         res.status(500).send({msg:'error occured'});
//     })
// }

// function remove(req,res){
//     controller.deleteSubject(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error)
//         res.status(500).send({msg:'error occured'});
//     })
// }

// router.post('/insert',post);
// router.put('/update/:id',put);
router.get('/meter/parameter/get',getParameterOfMeter);
router.get('/meter/current/get',getCurrentOfMeter);
// router.delete('/delete/:id',remove);

module.exports=router
