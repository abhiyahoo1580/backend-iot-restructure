// const user = require('../api/user/model');
const jwt = require('jsonwebtoken');
const config  = require('../../config')

const  tokenVerify = async (req,res,next)=>{
    try{
        // console.log(req.cookies);

    // let token = req.headers.authorization.split(" ");
    let token;

    // Try to get token from cookie first (new vite app)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    //   console.log("🍪 Token from cookie (new app)");
    }
    // Fallback to Authorization header (legacy app)
    else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      token = parts[1];
    //   console.log("🔑 Token from Authorization header (legacy app)");
    } else {
    //   console.log("❌ No token found in cookie or Authorization header");
      return res.status(401).send({ msg: "No token provided" });
    }

    jwt.verify(token, config.SECRET, function(err, decoded) {
        if (err) {
            // console.log(err)
            res.status(401).send({msg:err.message});
        }else{
         next()
        }
      });


}
catch(error){
    console.log("error in token verify",error);
    return Promise.reject('error occured in token verify');
   
}
}

module.exports = tokenVerify