const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.insertOEMCompany(req).then((response) =>{
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
    controller.getOEMCompany(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// getCompoanyDropdown
function getCompoanyDropdown(req,res) {
    controller.getCompoanyDropdown(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error);
        res.status(500).send({msg:'error occured'});
    })
}

// // getUserNotification
// function getUserById(req,res) {
//     controller.getUserById(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }

// // function getList(req,res) {
// //     controller.getUosplUserList(req).then((response) => {
// //         res.status(200).send(response);
// //     }).catch((error) =>{
// //         console.log(error);
// //         res.status(500).send({msg:'error occured'});
// //     })
// // }

// // getDeiceByuser
// function getDeiceByuser(req,res) {
//     controller.getOEMDeiceByuser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'});
//     })
// }

function put(req,res){
    controller.updateOEMCompany(req).then((response) => {
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

// // putUser
// function putUser(req,res){
//     controller.putUser(req).then((response) => {
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

// // putUserNotification
// function putUserNotification(req,res){
//     controller.putUserNotification(req).then((response) => {
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

// // putUserChangePassword
// function putUserChangePassword(req,res){
//     controller.putUserChangePassword(req).then((response) => {
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
    controller.deleteOEMCompany(req).then((response) => {
        res.status(200).send(response);
    }).catch((error) =>{
        console.log(error)
        res.status(500).send({msg:'error occured'});
    })
}



router.post('/insert',post);
router.put('/update/:id',put);
// // router.put('/update/info/:id',putUser);
router.get('/get',get);
router.get('/dropdown/get',getCompoanyDropdown);
// // router.get('/get/device/:id',getDeiceByuser);
// // router.get('/get/list',getList);
router.delete('/delete/:id',remove);
// // router.put('/update/notification/:id',putUserNotification);
// // router.get('/get/user/:id',getUserById);
// // router.put('/update/password/:id',putUserChangePassword);


module.exports=router
