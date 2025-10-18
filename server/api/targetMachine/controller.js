const machineTargetData = require('./model');
const mongoose = require('mongoose');


async function insertMachineTarget(req){
    try{
        const machineTarge = new machineTargetData(req.body);
        let existMachineTarge = await machineTargetData.find({$and: [{date : req.body.date ,machineId : req.body.machineId}]});
        if(existMachineTarge.length){
            return {
                msg : "Machine Targe already exist"
            }
        }else {
           // console.log(sideBar)
            const insertedMachineTarge = await machineTarge.save();
            return {
                msg: 'successfully inserted',
                id: insertedMachineTarge.id
            }
        }
    }catch(error){
        // console.log("error in insert side bar",error);
        return Promise.reject(error);
    }
}

async function getMachineTarget(req){
    // console.log('get subject hitt',req);
    try{
        const getMachineTarget = await machineTargetData.aggregate([  {
            '$match': {
                'machineId': req.query.machineId,
               'date': { '$gte': Number(req.query.fDate), '$lte': Number(req.query.tDate) },
            },
        },
         {"$sort" :{"date" : 1}},
        
        
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getMachineTarget
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function updateMachineTarget(req){
    // console.log('updateSubject hitt');
    try{
        let machineTargetId = req.params.id      
          let existMachineTarget = await machineTargetData.find({$and: [{date : req.body.date ,machineId : req.body.machineId,value :  req.body.value}]});
        if(existMachineTarget.length ){
            return {
                msg : "Machine target already exist"
            }
        }else { 
            const updatedMachineTarget = await machineTargetData.findByIdAndUpdate(machineTargetId,{$set:{
                // name:req.body.name,    
                // machineName:req.body.machineName,   
                // mobileNo:req.body.mobileNo,
                value :  req.body.value
            }});

            if(updatedMachineTarget!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedMachineTarget
                }
            }else{
                return {
                    msg : "Machine target not exist"
                }
            }
        }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteMachineTarget(req){
    // console.log('deleteSubject hitt');
    try{
        let machineTargetId = req.params.id      
        // console.log("deviceId",LcdConfigId);
        const deletedMachineTarget = await machineTargetData.findByIdAndDelete(machineTargetId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertMachineTarget,
    getMachineTarget,
    updateMachineTarget,
    deleteMachineTarget
}



