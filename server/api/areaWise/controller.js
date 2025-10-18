const areaWiseData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');




async function insertAreaWise(req){
    try{
        const areaWise = new areaWiseData(req.body);     
         let existareaWise = await areaWiseData.find({$and: [{CompanyId : req.body.CompanyId, Name : req.body.Name }]});
         if(existareaWise.length){
            return {
                msg : "area already exist"
            }
        }else {
            const insertedAreaWise = await areaWise.save();
            return {
                msg: 'area successfully inserted',
                id: insertedAreaWise.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getAreaWise(req){
    try{
        const getAllAreaWise = req.params.id? await areaWiseData.find({_id:req.params.id}): await areaWiseData.find({});
        return {
            msg: 'successfully Find',
            data: getAllAreaWise
        }
    }catch (error){
        console.log('error occure in get AreaWise',error);
        return Promise.reject('error occure in get AreaWise')
    }
}


async function updateAreaWise(req){
    try{
   
        let AreaWiseId = req.params.id       
        const updatedAreaWise = await areaWiseData.findByIdAndUpdate(AreaWiseId,{$set:{Name:req.body.Name,AssetId:req.body.AssetId}});
        if(updatedAreaWise!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedAreaWise
            }       
    }
    }catch (error){
        console.log('error occure in updateAreaWise',error);
        return Promise.reject('error occure in updateAreaWise')
    }
}

async function deleteAreaWise(req){
    try{
        const updatedareaWiseId = req.params.id
        // console.log("updatedAreaWiseId",updatedareaWiseId);
        const deletedupdatedAreaWise = await areaWiseData.findByIdAndDelete(updatedAreaWiseId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteupdatedAreaWise',error);
        return Promise.reject('error occure in deleteupdatedAreaWise')
    }
}

module.exports = {
    insertAreaWise,
    getAreaWise,
    updateAreaWise,
    deleteAreaWise
}

