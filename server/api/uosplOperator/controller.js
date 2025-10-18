const operatorData = require('./model');
const mongoose = require('mongoose');


async function insertUosplOperator(req){
    try{
        const operator = new operatorData(req.body);
        let existOperator = await operatorData.find({$and: [{userId : req.body.userId,  mobileNo : req.body.mobileNo}]});
        if(existOperator.length){
            return {
                msg : "Operator already exist"
            }
        }else {
           // console.log(sideBar)
            const insertedOperator = await operator.save();
            return {
                msg: 'successfully inserted',
                id: insertedOperator.id
            }
        }
    }catch(error){
        // console.log("error in insert side bar",error);
        return Promise.reject(error);
    }
}

async function getUosplOperator(req){
    // console.log('get subject hitt',req);
    try{
        const getAllOperator = await operatorData.aggregate([  {
            '$match': {
                'userId': req.query.userId,
               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        
        
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllOperator
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function updateUosplOperator(req){
    // console.log('updateSubject hitt');
    try{
        let operatorId = req.params.id      
          let existOperator = await operatorData.find({$and: [{userId : req.body.userId,  name:req.body.name, mobileNo : req.body.mobileNo}]});
        if(existOperator.length ){
            return {
                msg : "user already exist"
            }
        }else { 
            const updatedOperator = await operatorData.findByIdAndUpdate(operatorId,{$set:{
                name:req.body.name,    
                machineName:req.body.machineName,   
                mobileNo:req.body.mobileNo,
                machineId : req.body.machineId
            }});

            if(updatedOperator!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedOperator
                }
            }else{
                return {
                    msg : "Operator not exist"
                }
            }
        }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteUosplOperator(req){
    // console.log('deleteSubject hitt');
    try{
        let operatorId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedOperator = await operatorData.findByIdAndDelete(operatorId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertUosplOperator,
    getUosplOperator,
    updateUosplOperator,
    deleteUosplOperator
}



