const indexTrackerData = require('./model');
const mongoose = require('mongoose');

async function getIndexTracker(collection){
    try{
        const getIndex = await indexTrackerData.aggregate([
            {
                '$match': {
                    'CollectionName': collection,
                                 }
            },
        ])
        const updatedindexs = await indexTrackerData.findByIdAndUpdate(getIndex[0]._id,{$set:{Index:++getIndex[0].Index}});
        return {
            msg: 'successfully Find',
            data: getIndex[0].Index
        }
    }catch (error){
        console.log('error occure in get index',error);
        return Promise.reject('error occure in get index')
    }
}


module.exports = {
    getIndexTracker,
   
}