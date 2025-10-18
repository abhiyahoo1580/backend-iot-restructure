const GatewayInfo = require('./model');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


async function getGatewayId(req){
    try{
        const getGetwayIdData =  await GatewayInfo.aggregate([ 
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
                    'AssetId': req.query.assetId
              
                }            
            },
            {
                $project :
                {
                    CompanyId : 1 ,
                    Gateway : 1 
                 }
            }
        ]) 
    
        console.log(getGetwayIdData)
        return {
            msg: 'successfully Find',
            data: getGetwayIdData
        }
    }catch (error){
        console.log('error occure in get meterGroup',error);
        return Promise.reject(error)
    }
}

module.exports = {
   
    getGatewayId,
    
}