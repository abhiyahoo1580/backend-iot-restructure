const usplJobData = require('./model');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

async function insertUosplJob(req){
    try{
        const job = new usplJobData(req.body);
        let existJob = await usplJobData.find({$and: [{assetId : req.body.assetId}]});
        if(existJob.length){
            return {
                msg : "Job already exist"
            }
        }else {
           // console.log(sideBar)
            const insertedJob = await job.save();
            return {
                msg: 'successfully inserted',
                id: insertedJob.id
            }
        }
    }catch(error){
        console.log("error in insert side bar",error);
        return Promise.reject(error);
    }
}

async function getUosplJob(req){
    // console.log('get subject hitt',req);
    try{
        const getAllJob = await usplJobData.aggregate([  {
            '$match': {
                'userId': ObjectId(req.query.userId),
               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        
        
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllJob
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function updateUosplJob(req){
    // console.log('updateSubject hitt');
    try{
        let jobId = req.params.id      
        // let existJob = await usplJobData.find({$and: [{assetId : req.body.assetId}]});
        // if(existJob.length ){
        //     return {
        //         msg : "job already exist"
        //     }
        // }else { 
            const updatedJob = await usplJobData.findByIdAndUpdate(jobId,{$set:{
                assetId:req.body.assetId,    
                customerName:req.body.customerName,
                projectDoneBy:req.body.projectDoneBy,
                powerSource:req.body.powerSource,    
                orientedHeadType:req.body.orientedHeadType, 
                machineCode:req.body.machineCode
            }});

            if(updatedJob!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedJob
                }
            }else{
                return {
                    msg : "Operator not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteUosplJob(req){
    // console.log('deleteSubject hitt');
    try{
        let jobId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedJob = await usplJobData.findByIdAndDelete(jobId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertUosplJob,
    getUosplJob,
    updateUosplJob,
    deleteUosplJob
}



