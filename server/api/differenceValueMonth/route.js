const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');



// getAdvanceByCompanyId
function getAdvanceByCompanyId(req,res) {
    controller.getAdvanceByCompanyId(req).then((response) => {
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


router.get('/month/get',getAdvanceByCompanyId);

module.exports=router
