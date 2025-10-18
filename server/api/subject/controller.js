const subjectData = require('./model');
const mongoose = require('mongoose');

async function insertSubject(req){
    // console.log("insertsubject hitt");
    try{
        const subject = new subjectData(req.body);
        let existSubject = await subjectData.find({$and: [{subjectName : req.body.subjectName, isDeleted: false }]});
        if(existSubject.length){
            return {
                msg : "Subject already exist"
            }
        }else {
            const insertedSubject = await subject.save();
            return {
                msg: 'successfully inserted',
                id: insertedSubject.id
            }
        }
    }catch(error){
        console.log("error in insertSubject",error);
        return Promise.reject('error occured in insertEmployee method');
    }
}

async function getSubject(req){
    // console.log('get subject hitt',req);
    try{
        const getAllSubject = req.params.id? await subjectData.find({$and:[{_id:req.params.id},{isDeleted: false}]}): await subjectData.find({isDeleted: false});
        return {
            msg: 'successfully Find',
            data: getAllSubject
        }
    }catch (error){
        console.log('error occure in get subject',error);
        return Promise.reject('error occure in get subject')
    }
}

async function updateSubject(req){
    // console.log('updateSubject hitt');
    try{
        let subjectId = req.params.id
        // console.log("Update subjectId",subjectId);
        const updatedSubject = await subjectData.findByIdAndUpdate(subjectId,{$set:{subjectName:req.body.subjectName}});
        if(updateSubject!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedSubject
            }
        }else{
            return {
                msg : "Subject not exist"
            }
        }
    }catch (error){
        console.log('error occure in updateSubject',error);
        return Promise.reject('error occure in updateSubject')
    }
}

async function deleteSubject(req){
    // console.log('deleteSubject hitt');
    try{
        let subjectId = req.params.id
        // console.log("subjectId",subjectId);
        const deletedSubject = await subjectData.findByIdAndUpdate(subjectId,{$set:{isDeleted:true}});
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteSubject',error);
        return Promise.reject('error occure in deleteSubject')
    }
}

module.exports = {
    insertSubject,
    getSubject,
    updateSubject,
    deleteSubject
}