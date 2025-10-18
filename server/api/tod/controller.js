const todData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');


async function checkExistingTod (assetId,todData,tod){
    let status = true;
    const existTod = await todData.find({AssetId : assetId });
    await existTod.forEach(element => {
        if(tod.Start > element.Start && tod.Start < element.Stop ){
            return status = false;
        }else if(tod.Stop > element.Start && tod.Stop < element.Stop){
           return status = false;
        }
    });
    return status;
}

async function updateExistingTod(todId,todData){

}
async function insertTod(req){
    // console.log("insertTod hitt");
    try{
        const tod = new todData(req.body);
        const status = await checkExistingTod(req.params.id,todData,tod);
        if(status){
            return {
                msg : "TOD overlapping existing TOD sets"
            }
        }else {
            const insertedTod = await tod.save();
            return {
                msg: 'successfully inserted',
                id: insertedTod.id
            }
        }
    }catch(error){
        // console.log("error in insertTod",error);
        return Promise.reject(error);
    }
}

async function getTod(req){
    // console.log('get Tod hitt',req);
    try{
        const getAllTod = req.params.id? await todData.find({_id:req.params.id}): await todData.find({});
        return {
            msg: 'successfully Find',
            data: getAllTod
        }
    }catch (error){
        console.log('error occure in get Tod',error);
        return Promise.reject('error occure in get Tod')
    }
}

async function updateTod(req){
    // console.log('updateTod hitt');
    try{
        const todId = req.params.id;
        const tod = new todData(req.body);
        const status = await checkExistingTod(req.params.id,todData,tod);
        if(status){
            return {
                msg : "TOD overlapping existing TOD sets"
            }
        }else {
            const updatedTod = await todData.findByIdAndUpdate(todId,{$set:{Start:tod.Start,Stop : tod.Stop,Rate:tod.Rate}});
            if(updateTod!=null){
                return {
                    msg: 'Updated Successfully',
                    id: updatedTod.id
                }
            }else{
                return {
                    msg : "Tod not exist"
                }
            }
        }
    }catch (error){
        console.log('error occure in updateTod',error);
        return Promise.reject('error occure in updateTod')
    }
}

async function deleteTod(req){
    // console.log('deleteTod hitt');
    try{
        const todId = req.params.id
        // console.log("TodId",todId);
        const deletedTod = await todData.findByIdAndDelete(todId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteTod',error);
        return Promise.reject('error occure in deleteTod')
    }
}

module.exports = {
    insertTod,
    getTod,
    updateTod,
    deleteTod
}

