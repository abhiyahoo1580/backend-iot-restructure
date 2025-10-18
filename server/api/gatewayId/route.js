const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function getGatewayId(req, res) {
    controller.getGatewayId(req).then((response) => {
        res.status(200).send(response);
    }).catch((error)=> {
        console.log(error);
        res.status(500).send({msg:error.message});
    })
}

router.get('/get', getGatewayId);

module.exports=router