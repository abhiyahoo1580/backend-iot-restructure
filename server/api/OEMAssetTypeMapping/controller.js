const { ObjectID, ObjectId } = require('bson');
const oemMappedAssetTypeData = require('./model');
const mongoose = require('mongoose');


async function insertOEMMapAssetType(req) {
    try {

        let existUser = await oemMappedAssetTypeData.find({ $and: [{ companyId: req.body.companyId, assetTypeId: req.body.assetTypeId }] });
        if (existUser.length) {
            return {
                msg: "already exist"
            }
        } else {
            const oemMappedAssetType = new oemMappedAssetTypeData(req.body);
            // 
            const mappedAssetType = await oemMappedAssetType.save();
            // // console.log(insertedUser.length,insertedUser.email_id,password)
            // await mail('gmail',
            //     'notification@elliotsystems.com',
            //     '',
            //     insertedUser.email_id,
            //     'Login Detail ',
            //     'rfqh lwfy pvxa wbiv',
            //     `         

            //      Dear  Customer,\n 
            //      Your login details is following` +`\n` +' user name : ' + insertedUser.email_id + `\n` + ` password : ` + password + `\n`+

            //      `Assuring you of our best service at all times.

            //      Warm Regards,
            //      Customer Service

            //      *************************************** 
            //      This is a system generated notification. Replies to this message will not be answered.
            //      "This e-mail is confidential and may also be privileged. if you are not the intended recipient, please notify us immediately; you should not copy or use it for any purpose, nor disclose its contents to any other person" 
            //      ***************************************`,
            //      '',
            //      '',
            //      '')

            return {
                msg: 'successfully inserted',
                id: mappedAssetType.id
            }
        }
    } catch (error) {
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

async function getOEMMapAssetType(req) {
    // console.log('get subject hitt',req);
    try {
        const getAllAssetTypeMapped = await oemMappedAssetTypeData.aggregate([{
            '$match': {
                'companyId': Number(req.query.companyId),

            },
        },
        { "$sort": { "registeredOn": 1 } },
        {
            '$lookup': {
                'from': 'assetTypes',
                'localField': 'assetTypeId',
                'foreignField': 'AssetTypeId',
                'as': 'assetType'
            }
        },
        {
            "$project": {
                _id: 1,
                assetTypeId: 1,
                companyId: 1,
                AssetTypeName: "$assetType.Name"
            }
        },
        {
            $unwind: "$AssetTypeName"
        },
        ]);
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllAssetTypeMapped
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getParameterList
async function getParameterList(req) {
    // console.log('get subject hitt',req);
    try {
        const getAllAssetTypeMapped = await oemMappedAssetTypeData.aggregate([{
            '$match': {
                'assetTypeId': Number(req.query.assetTypeId),

            },
        },
        {
            '$lookup': {
                'from': 'allRegisters',
                'localField': 'assetTypeId',
                'foreignField': 'AssetTypeId',
                'as': 'assetType'
            }
        },
        {
            '$lookup': {
                'from': 'parameters',
                'localField': 'assetType.Parameter',
                'foreignField': '_id',
                'as': 'parameterDetails'
            }
        },
        {
            "$project": {
                // _id:0,
                // assetTypeId:1,
                parameterDetails: 1,
                // "parameterName" : "$parameterDetails.Name"
            }
        },
        //   {
        //     '$lookup': {
        //         'from': 'oemParametrConfigs',
        //         'localField': 'parameterDetails._id',
        //         'foreignField': 'parameterId',
        //         'as': 'parameterDetails.configDetails'
        //     }
        // },
        {
            $unwind: "$parameterDetails"
        },
        {
            $lookup: {
                from: "oemParametrConfigs",
                let: {
                    pi: "$parameterDetails._id",
                    ui: ObjectId(req.query.userId)
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$parameterId", "$$pi"] },
                                    { $eq: ["$userId", "$$ui"] }
                                ]
                            }
                        }
                    }
                ],
                as: "matcheddata"
            }
        },
        {
            $addFields: {
                config: {
                    $gt: [{ $size: "$matcheddata" }, 0]
                }
            }
        },
        {
            "$project": {
                matcheddata: 0,
            }
        },


        ]);
        // console.log(getAllAssetTypeMapped)      
        return {
            msg: 'successfully Find',
            data: getAllAssetTypeMapped
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}



module.exports = {
    insertOEMMapAssetType,
    getOEMMapAssetType,
    getParameterList
  
}



