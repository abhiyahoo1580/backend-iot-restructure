const companyData = require('./model');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');

async function getCompanyDetail(req){
    try{
        // Get company ID from authenticated user (set by tokenVerification middleware)
        // Also support direct token access for backward compatibility
        let companyId;
        
        if (req.user && req.user.companyId) {
            // From tokenVerification middleware (preferred)
            companyId = req.user.companyId;
        } else if (req.headers.authorization) {
            // Fallback: decode from Authorization header
            let token = req.headers.authorization.split(" ")[1];
            var decoded = JWT.decode(token);
            companyId = decoded.companyId;
        } else {
            throw new Error('No authentication found');
        }

        const getCompanyDetailted =await companyData.aggregate([
            {$match : {
                CompanyId : companyId
            }
        },
        {
            $project : {
                CompanyAddress : 1,
                CompanyId:1,
                CompanyName : 1,
            }
        }
        ])
        // console.log(getCompanyDetailted)
       
        return {
            data :getCompanyDetailted.length > 0 ? getCompanyDetailted[0] : null,
            msg: 'successfully Find',
     
        }
    }catch (error){
        console.log('error occure in get subject',error);
        return Promise.reject('error occure in get subject')
    }
}



module.exports = {
    getCompanyDetail
}