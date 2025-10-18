const graphGroupData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');




async function insertGraphGroup(req){
    try{
        const graphGroup = new graphGroupData(req.body);     
         let existgraphGroup = await graphGroupData.find({$and: [{AssetId : req.body.AssetId, Name : req.body.Name }]});
         if(existgraphGroup.length){
            return {
                msg : "group already exist"
            }
        }else {
            const insertedGraphGroup = await graphGroup.save();
            return {
                msg: 'group successfully inserted',
                id: insertedGraphGroup.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getGraphGroup(req){
    try{
        const getAllgraphGroup = req.params.id? await graphGroupData.find({_id:req.params.id}): await graphGroupData.find({});
        return {
            msg: 'successfully Find',
            data: getAllgraphGroup
        }
    }catch (error){
        console.log('error occure in get graphGroup',error);
        return Promise.reject('error occure in get graphGroup')
    }
}

async function updateGraphGroup(req){
    try{
        // const graphGroup = new graphGroupData(req.body);
        let graphGroupId = req.params.id
        // let existgraphGroup = await graphGroupData.find({$and: [{AssetId : req.body.AssetId, Name : req.body.Name }]});
        // if(existgraphGroup.length){
        //     return {
        //         msg : "group Name already exist"
        //     }
        // }else {
        const updatedGraphGroup = await graphGroupData.findByIdAndUpdate(graphGroupId,{$set:{Name:req.body.Name,ParameterId:req.body.ParameterId}});
        if(updatedGraphGroup!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedGraphGroup
            }
        // }else{
        //     return {
        //         msg : "graph group not exist"
        //     }
        // }
    }
    }catch (error){
        console.log('error occure in updategraphGroup',error);
        return Promise.reject('error occure in updategraphGroup')
    }
}

async function deleteGraphGroup(req){
    try{
        const graphGroupId = req.params.id
        console.log("graphGroupId",graphGroupId);
        const deletedgraphGroup = await graphGroupData.findByIdAndDelete(graphGroupId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deletegraphGroup',error);
        return Promise.reject('error occure in deletegraphGroup')
    }
}

module.exports = {
    insertGraphGroup,
    getGraphGroup,
    updateGraphGroup,
    deleteGraphGroup
}

