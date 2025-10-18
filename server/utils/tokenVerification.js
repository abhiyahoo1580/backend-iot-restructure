// const user = require('../api/user/model');
const jwt = require('jsonwebtoken');
const config  = require('../../config')

const  tokenVerify = async (req,res,next)=>{
    try{
    // Check for token in cookies first, then fall back to Authorization header
    let token;
    
    if (req.cookies && req.cookies.token) {
        // Token from cookie
        token = req.cookies.token;
    } else if (req.headers.authorization) {
        // Token from Authorization header (for backward compatibility)
        let headerToken = req.headers.authorization.split(" ");
        token = headerToken[1];
    } else {
        return res.status(401).send({msg: 'No authentication token provided'});
    }
    
    jwt.verify(token, config.SECRET, function(err, decoded) {
        if (err) {
            console.log(err)
            res.status(401).send({msg:err.message});
        }else{
            req.user = decoded; // Attach decoded user info to request
            next()
        }
      });
}
catch(error){
    console.log("error in token verify",error);
    res.status(401).send({msg: 'Authentication failed'});
}
}

module.exports = tokenVerify