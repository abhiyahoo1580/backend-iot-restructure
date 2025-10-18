const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertMSEBReading(req).then((response) =>{
        res.status(200).send(response);
    }).catch((error)=>{
        console.log(error);
        res.status(500).send({msg:'error occured'})
    })
}

function get(req,res) {
    controller.getMSEBReading(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}


function put(req,res){
    controller.updateMSEBReading(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error)
        res.status(500).send({msg:'error occured'});
    })
}

// function remove(req,res){
//     controller.deleteMSEBReading(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error)
//         res.status(500).send({msg:'error occured'});
//     })
// }

router.post('/insert',post);
router.put('/update/:id',put);
router.get('/get/:id?',get);
// router.delete('/delete/:id',remove);

module.exports=router
