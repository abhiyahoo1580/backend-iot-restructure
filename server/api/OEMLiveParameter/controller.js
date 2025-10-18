const oemLiveParameterData = require('./model');
const mongoose = require('mongoose');


async function insertOEMLiveParameter(req) {
  try {

    docsUpdate = req.body.insertData
    const opsUpdate = docsUpdate.map(doc => ({
      updateOne: {
        filter: doc,                // full-document match
        update: { $setOnInsert: doc },
        upsert: true
      }
    }));

    const resUpdate = await oemLiveParameterData.bulkWrite(opsUpdate, { ordered: false });

    docsDelete = req.body.removeData
    const opsDelete = docsDelete.map(doc => ({
      deleteOne: {
        filter: doc,
      }
    }));
    const resDelete = await oemLiveParameterData.bulkWrite(opsDelete, { ordered: false });
    //   console.log(`Total deleted: ${resDelete.deletedCount}`);
    //   console.log(`🔹 Inserted (upserted): ${resUpdate.upsertedCount}`);
    //   console.log(`🔹 Existing skipped: ${resUpdate.matchedCount}`);


    return {
      msg: 'successfully inserted',
      inserdData: resUpdate,
      removeData: resDelete
    }
    // }
  } catch (error) {
    // console.log("error in",error);
    return Promise.reject(error);
  }
}

async function getOEMLiveParameter(req) {
  try {
    const getAllenableParameter = await oemLiveParameterData.aggregate([{
      '$match': {
        'assetId': req.params.id
      },
    },
    { "$sort": { "parameterId": 1 } },
    {
      "$project": {

        assetId: 1,
        parameterId: 1,
      }
    }

    ]);

    return {
      msg: 'successfully Find',
      // data: getAllGaways
      data: getAllenableParameter

    }
  } catch (error) {
    // console.log('error occure in get lcd Config',error);
    return Promise.reject('error occure in get lcd Config')
  }
}


module.exports = {
  insertOEMLiveParameter,
  getOEMLiveParameter

}



