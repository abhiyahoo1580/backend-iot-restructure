const OEMGatewayData = require('./model');
const mongoose = require('mongoose');


async function insertOEMGateway(req) {
    try {


        let existGateway = await OEMGatewayData.find({ $and: [{ assetId: req.body.assetId }] });
        if (existGateway.length) {
            return {
                msg: "Gateway already exist"
            }
        } else {

            const gateway = new OEMGatewayData(req.body);
            const insertedGateway = await gateway.save();
            return {
                msg: 'Gateway successfully inserted',
                id: insertedGateway.id
            }
        }
    } catch (error) {
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

// getGatewayDropdown
async function getGatewayDropdown(req) {
    // console.log('get subject hitt',req);
    try {
        const getAllGaways = await OEMGatewayData.aggregate([{
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
                assetId: 1,
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
            data: getAllGaways
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

async function getOemGateway(req) {
    // console.log('get subject hitt', req.query);
    try {
        // const match  ={'$match': {}}

        const searchText = req.query.search || '';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'installationDate';
        const type = req.query.type ? req.query.type : "";
        const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
        const toDate = req.query.toDate ? Number(req.query.toDate) : "";
        const order = req.query.order ? Number(req.query.order) : -1;
        const sortObj = { [sort]: order };
        query = []
        query.push({
            '$match': {
                'companyId': Number(req.query.companyId),
                "assetName": { $regex: searchText, $options: 'i' },
                //  'Date': { '$gte': fDate, '$lte': tDate },
            },
        }, { "$sort": sortObj },
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'assetId',
                    'foreignField': 'Gateway',
                    'as': 'assetDetails'
                }
            },
              {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'assetDetails.MapCustomer',
                        'foreignField': '_id',
                        'as': 'userDetails'
                    }
                },
                {
                    '$lookup': {
                        'from': 'companies',
                        'localField': 'userDetails.MapCompanyId',
                        'foreignField': '_id',
                        'as': 'companyDetails'
                    }
                },
                {
                    "$project": {
                        assetName: 1,
                        assetId: 1,
                        assetTypeId: 1,
                        installationDate: 1,
                        "assetDetails.AssetName": 1,
                        "assetDetails._id": 1,
                        "assetDetails.AssetId": 1,
                        "assetDetails.InstallationDate": 1,
                        "assetDetails.MapCustomer": 1,
                        "userDetails._id": 1,
                        "userDetails.first_name": 1,
                        "userDetails.last_name": 1,
                        'userDetails.MapCompanyId': 1,
                        "companyDetails._id": 1,
                        "companyDetails.companyName": 1,
                    }
                },
                {
                    $facet: {
                        data: [
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ]
                    }
                }

        )
        if(fromDate && toDate){
            query[0].$match.installationDate =   { '$gte': fromDate, '$lte': toDate }
        }
        if (type == "map" || type == "unmap") {
            map = {
                '$match': {
                    '$expr': {
                        '$eq': [{ $size: "$assetDetails" }, type =="map" ? 1 : 0]
                    }
                }
            }
            query.splice(3, 0, map);
       
        } 
        // console.log(query)
        const getAllGaways = await OEMGatewayData.aggregate(query)
        // console.log(match)
        // const getAllGaways = await OEMGatewayData.aggregate([
        //     match,
        //     { "$sort": sortObj },
        //     {
        //         '$lookup': {
        //             'from': 'companyAssets',
        //             'localField': 'assetId',
        //             'foreignField': 'Gateway',
        //             'as': 'assetDetails'
        //         }
        //     },
        //     {
        //         '$match': {
        //             '$expr': {
        //                 '$eq': [{ $size: "$assetDetails" }, 0]
        //             }
        //         }
        //     },
        //     {
        //         '$lookup': {
        //             'from': 'users',
        //             'localField': 'assetDetails.MapCustomer',
        //             'foreignField': '_id',
        //             'as': 'userDetails'
        //         }
        //     },
        //     {
        //         '$lookup': {
        //             'from': 'companies',
        //             'localField': 'userDetails.MapCompanyId',
        //             'foreignField': '_id',
        //             'as': 'companyDetails'
        //         }
        //     },
        //     {
        //         "$project": {
        //             assetName: 1,
        //             assetId: 1,
        //             assetTypeId: 1,
        //             installationDate: 1,
        //             "assetDetails.AssetName": 1,
        //             "assetDetails._id": 1,
        //             "assetDetails.AssetId": 1,
        //             "assetDetails.InstallationDate": 1,
        //             "assetDetails.MapCustomer": 1,
        //             "userDetails._id": 1,
        //             "userDetails.first_name": 1,
        //             "userDetails.last_name": 1,
        //             'userDetails.MapCompanyId': 1,
        //             "companyDetails._id": 1,
        //             "companyDetails.companyName": 1,
        //         }
        //     },
        //     //       {
        //     //   $facet: {
        //     //     data: [
        //     //       { $skip: skip },
        //     //       { $limit: limit }
        //     //     ],
        //     //     totalCount: [
        //     //       { $count: "count" }
        //     //     ]
        //     //   }
        //     // }
        // ]);
        // console.log(getAllGaways)
        return {
            msg: 'successfully Find',
            // data: getAllGaways
            data: getAllGaways.length > 0 ? getAllGaways[0].data.length > 0 ?  getAllGaways[0].data : [] : [],
            total: getAllGaways.length > 0 ? getAllGaways[0].totalCount.length > 0 ? getAllGaways[0].totalCount[0].count : 0 : 0
        }
    } catch (error) {
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

module.exports = {
    insertOEMGateway,
    getGatewayDropdown,
    getOemGateway
}



