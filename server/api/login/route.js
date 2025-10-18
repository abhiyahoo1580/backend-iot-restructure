const express = require("express");
const router = express.Router({mergeParams:true});
const controller = require('./controller');

function post(req,res) {
    controller.login(req).then((response) =>{
        // Set JWT token as httpOnly cookie
        if (response.data && response.data.token) {
            res.cookie('token', response.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure in production
                sameSite: 'none', // Required for cross-origin requests
                maxAge: 43200 * 1000 // 12 hours in milliseconds
            });
            // Remove token from response body for security
            delete response.data.token;
        }
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

function postOAuth(req,res) {
  controller.postOAuth(req).then((response) =>{
      // Set JWT token as httpOnly cookie
      if (response.data && response.data.token) {
          res.cookie('token', response.data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'none',
              maxAge: 43200 * 1000 // 12 hours in milliseconds
          });
          // Remove token from response body for security
          delete response.data.token;
      }
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

function logout(req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 0 // Expire immediately
    });
    res.status(200).send({ msg: 'Logged out successfully', success: true });
}

// function get(req,res) {
//     controller.getUser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         if (error.name === 'ValidationError') {
//             console.error(Object.values(error.errors).map(val => val.message))
//             res.status(400).send({msg:Object.values(error.errors).map(val => val.message)[0]})
//         }else{
//             res.status(500).send({msg:'error occured'});
//         }
//     })
// }

// function insertUser(req,res) {
//     controller.insertUser(req).then((response) =>{
//         res.status(200).send(response);
//     }).catch((error)=>{
//         console.log(error);
//         res.status(500).send({msg:'error occured'})
//     })
// }

// function put(req,res){
//     controller.updateUser(req).then((response) => {
//         res.status(200).send(response);
//     }).catch((error) =>{
//         console.log(error)
//         res.status(500).send({msg:'error occured'});
//     })
// }


router.post('/login',post);
router.post('/login/oauth',postOAuth);
router.post('/logout', logout);
// router.post('/save', insertUser);
// router.put('/update/:id?',put);
// router.get('/get/:company_id?', get)

module.exports=router
