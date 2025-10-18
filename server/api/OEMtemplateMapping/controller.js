const { template } = require('lodash');
const OEMTemplateMappingData = require('./model');
const mongoose = require('mongoose');


async function insertOEMTemplateMapping(req) {
    try {


        let existTemplateMapping = await OEMTemplateMappingData.find({ $and: [{ assetId: req.body.assetId }] });
        if (existTemplateMapping.length) {
            return {
                msg: "TemplateMapping already exist"
            }
        } else {

            const templateMapping = new OEMTemplateMappingData(req.body);
            const insertedTemplateMapping = await templateMapping.save();
            return {
                msg: 'TemplateMapping successfully inserted',
                id: insertedTemplateMapping.id
            }
        }
    } catch (error) {
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

// getGatewayDropdown
async function getTemplateMappingDropdown(req) {
    // console.log('get subject hitt',req);
    try {
        const getAllTemplateMapping = await OEMTemplateMappingData.aggregate([{
            '$match': {
                'companyId': Number(req.query.companyId)
            },
        },
        { "$sort": { "installationDate": 1 } },
        {
            "$project": {
                // address : 1,
                // firstName:1,
                // lastName:1,
                "template.useCaseName": 1,
                assetName: 1,
                // phoneNumber:1,
                // registeredOn:1,
                // isOEM:1


            }
        }

        ]);
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllTemplateMapping
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

async function getOEMTemplateMapping(req) {
    // console.log('get subject hitt', req.query);
    try {
        // const match  ={'$match': {}}

       
        // console.log(query)
        // const getAllGaways = await OEMGatewayData.aggregate(query)
          const getAllTemplateMapping = await OEMTemplateMappingData.find({_id:req.params.id})
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllTemplateMapping
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

module.exports = {
    insertOEMTemplateMapping,
    getTemplateMappingDropdown,
    getOEMTemplateMapping
}



