const MSENReadingData = require('./model');
const mongoose = require('mongoose');

async function insertMSEBReading(req){
    // console.log("insertsubject hitt");
    try{
        const msebReading = new MSENReadingData(req.body);
        let existMsebReading = await MSENReadingData.find({$and: [{date : req.body.date}]});
        if(existMsebReading.length){
            return {
                msg : "MSEB Reading already exist"
            }
        }else {
            const insertedMsebReading = await msebReading.save();
            return {
                msg: 'successfully inserted',
                id: insertedMsebReading.id
            }
        }
    }catch(error){
        console.log("error in insertMSEBReading",error);
        return Promise.reject('error occured in MSEB READING method');
    }
}

async function getMSEBReading(req){
    // console.log('get subject hitt',req);
    try{
        const getAllMSEBReading = req.params.id? await MSENReadingData.find({$and:[{_id:req.params.id}]}): await MSENReadingData.aggregate([{
            $match: {
                companyId: Number(req.query.companyId)
            }
        },
          {$sort : {date : 1}}]);
        return {
            msg: 'successfully Find',
            data: getAllMSEBReading
        }
    }catch (error){
        console.log('error occure in get  MSEB Reading',error);
        return Promise.reject('error occure in get MSEB Reading')
    }
}

async function updateMSEBReading(req){
    // console.log('updateSubject hitt');
    try{
        let MSENReadingId = req.params.id
        // console.log("Update subjectId",subjectId);
        const updatedMSEBReading = await MSENReadingData.findByIdAndUpdate(MSENReadingId,{$set:{MSCBReading:req.body.MSCBReading}});
        if(updatedMSEBReading!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedMSEBReading
            }
        }else{
            return {
                msg : "MSCB Reading not exist"
            }
        }
    }catch (error){
        console.log('error occure in updateMSEBReading',error);
        return Promise.reject('error occure in updateMSEBReading')
    }
}

// async function deleteMSEBReading(req){
//     // console.log('deleteSubject hitt');
//     try{
//         let MSENReadingId = req.params.id
//         // console.log("subjectId",subjectId);
//         const deletedSubject = await MSENReadingData.findByIdAndUpdate(MSENReadingId,{$set:{isDeleted:true}});
//         return {
//             msg: 'Deleted successfully '
//         }
//     }catch (error){
//         console.log('error occure in deleteSubject',error);
//         return Promise.reject('error occure in deleteSubject')
//     }
// }

module.exports = {
    insertMSEBReading,
    getMSEBReading,
    updateMSEBReading,
    // deleteMSEBReading
}