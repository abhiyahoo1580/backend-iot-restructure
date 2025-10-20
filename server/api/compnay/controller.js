const companyData = require('./model');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');

async function getCompanyDetail(req){
    try{

        let token = req.headers.authorization.split(" ")[1];
        var decoded = JWT.decode(token);
        const getCompanyDetailted =await companyData.aggregate([
            {$match : {
                CompanyId : decoded.companyId
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