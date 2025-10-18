const oemParameterSequenceData = require('./model');
const deviceData = require('../OEMDevice/model');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const _ = require('lodash');


async function insertOemParameterSequence(req) {
    try {
    const ops = req.body.parameters.map(p => {
    return {
      updateOne: {
        filter: { userId: ObjectId(req.body.userId), assetId: req.body.assetId, parameterId: p.parameterId },
        update: {
          // If it exists, you may want to update sequence if needed
          // If you want to keep existing sequence (i.e. do not override), use $setOnInsert
       $set: {
        sequence: p.sequence,
        // date: Date.now()
      },
          $setOnInsert: {
            userId: ObjectId(req.body.userId),
            assetId: req.body.assetId,
            parameterId: p.parameterId,
            // sequence: p.sequence,
            date: Date.now()
          }
        },
        upsert: true
      }
    };
  });
//   console.log(ops);
  try {
    const result = await oemParameterSequenceData.bulkWrite(ops, { ordered: false });
    // return result;
      return {
            msg: "Successfully find the result",
            data: result
        };
  } catch (err) {
    console.error("bulkWrite error:", err);
    throw err;
  }
   
    } catch (error) {
        return Promise.reject(error);
    }
}

// getLatestAndUnReady
async function getOemParameterSequence(req) {
    try {
        // console.log(Number(req.query.companyId),Boolean(Number(req.query.archive)))
        let parameterSequence = await deviceData.aggregate([
            {
                $match: {
                    AssetId: req.params.id,
                }
            },
            //    { $limit: 1 }
            {
                $lookup: {
                    from: "allRegisters",
                    localField: "AssetTypeId",
                    foreignField: "AssetTypeId",
                    as: "registerDetails"
                }
            },
            { $unwind: "$registerDetails" },
                   {
                $lookup: {
                    from: "parameters",
                    localField: "registerDetails.Parameter",
                    foreignField: "_id",
                    as: "parameterDetails"
                }
            },
             { $unwind: "$parameterDetails" },
            // {
            //     $lookup: {
            //         from: "oemParameterSequenceConfig",
            //         localField: "AssetId",
            //         foreignField: "assetId",
            //         as: "parameterSequenceConfigDetails"
            //     }
            // },
            {$project : {
                _id : 0,
                AssetId : 1,
                "parameterDetails.Name": 1,
                "parameterDetails._id": 1,
                // "parameterSequenceConfigDetails.parameters": 1

            }},
            {$sort: { "parameterDetails.Name": 1 }},
             {
                $lookup:
                {
                    from: 'oemParameterSequenceConfig',
                    let: { parameterId: "$parameterDetails._id" ,
                         assetId: "$AssetId"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$assetId", "$$assetId"] },
                                        // { $eq: ["$AssetId", fDate] },
                                        { $eq: ["$parameterId", "$$parameterId"] }
                                    ]
                                }
                            }
                        },
                    ],
                    as: "parameterSequenceData"
                }
            },
             {$sort: { "parameterSequenceData.sequence": 1 }},
             {$project : {
                parameterSequenceData: 0
             }}
        ])

        // console.log(parameterSequence)
        // for(let i=0;i<=parameterSequence.length;i++){
        //     // console.log('parameterSequence[i]',parameterSequence[i])
        //     if(i == parameterSequence.length){
        //         const data = _.sortBy(parameterSequence, 'parameterDetails.sequence');
        //         parameterSequence = data;
        //         break;
        //     }
        //     else if(parameterSequence[i].parameterSequenceConfigDetails.length > 0){
        //        item = parameterSequence[i].parameterSequenceConfigDetails[0].parameters.find(p => p.parameterId.toString() === parameterSequence[i].parameterDetails._id.toString()) 
        //      parameterSequence[i].parameterDetails['sequence'] = item ? item.sequence : null
        //      delete parameterSequence[i].parameterSequenceConfigDetails;
        //     }else{
        //        delete parameterSequence[i].parameterSequenceConfigDetails; 
        //     }
        //     // let parameterSequenceConfigDetails = parameterSequence[i].parameterSequenceConfigDetails
        //     // let parameterDetails = parameterSequence[i].parameterDetails
        //     // let sequenceObj = parameterSequenceConfigDetails.length > 0 ? parameterSequenceConfigDetails.parameters.find(p => p.parameterId.toString() === parameterDetails._id.toString()) : null
        //     // console.log('sequenceObj',sequenceObj)
        //     // parameterSequence[i].parameterDetails['sequence'] = null
        // }
        return {
            msg: "Successfully find the result",
            data: parameterSequence
        }

    } catch (error) {
        console.warn(`Error cought while getting alerts ${error.message}`)
        return Promise.reject('error occured while getting alerts'); // actual error message 
    }
}

// async function updateOemParameterSequence(req) {
//     // console.log('updateSubject hitt');
//     try {
//         let parameterSequenceConfigId = req.params.id
//         // let existCompany = await OEMCompanyData.find({$and: [{emailId : req.body.emailId }]});
//         // if(existCompany.length){
//         //     return {
//         //         msg : "user already exist"
//         //     }
//         // }else {
//         const updatedParameterSequence = await oemParameterSequenceData.findByIdAndUpdate(parameterSequenceConfigId, {
//             $set: {
//                 parameters: req.body.parameters
//             }
//         });
//         if (updatedParameterSequence != null) {
//             return {
//                 msg: 'Parameter Sequence Updated Successfully ',
//                 data: updatedParameterSequence
//             }
//         } else {
//             return {
//                 msg: "Parameter Sequence not exist"
//             }
//         }
//         // }
//     } catch (error) {
//         // console.log('error occure in update Lcd Config',error);
//         return Promise.reject(error)
//     }
// }

async function deleteOemParameterSequence(req){
    // console.log('deleteSubject hitt');
    try{
        let parameterSequenceConfigId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedOemParameterSequence = await oemParameterSequenceData.deleteMany({assetId : parameterSequenceConfigId})
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete alert Config')
    }
}
module.exports = {
    insertOemParameterSequence,
    getOemParameterSequence,
    // updateOemParameterSequence,
    deleteOemParameterSequence

}



