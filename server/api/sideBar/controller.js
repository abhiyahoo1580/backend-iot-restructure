const sideBarData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash')

async function insertSideBarOption(req){
    try{
        const sideBar = new sideBarData(req.body);
        let existSideBar = await sideBarData.find({$and: [{name : req.body.name, link : req.body.link,lcon : req.body.lcon }]});
        if(existSideBar.length){
            return {
                msg : "side bar already exist"
            }
        }else {
           // console.log(sideBar)
            const insertedSideBar = await sideBar.save();
            return {
                msg: 'successfully inserted',
                id: insertedSideBar.id
            }
        }
    }catch(error){
        // console.log("error in insert side bar",error);
        return Promise.reject(error);
    }
}

async function getSideBarOption(req){
    // console.log('get subject hitt',req);
    try{
        const getAllSideBarOption = req.params.id? await sideBarData.find({$and:[{_id:req.params.id}]}): await sideBarData.aggregate([ {"$sort" :{_id : 1}},]);



        for(let i = 0 ; i < getAllSideBarOption.length;i++){
        if(getAllSideBarOption[i].link != null && getAllSideBarOption[i].parentId != null){
            // getAllSideBarOption[i].subMenu = []
            // console.log("sub Menu",getAllSideBarOption[i])
            var index = _.findIndex(getAllSideBarOption, { _id: getAllSideBarOption[i].parentId});
            // console.log(index)
            if(getAllSideBarOption[index].subMenu == undefined){
                getAllSideBarOption[index].subMenu = [];
                getAllSideBarOption[index].subMenu.push(getAllSideBarOption[i])
            }else{
                getAllSideBarOption[index].subMenu.push(getAllSideBarOption[i])
            }
            // getAllSideBarOption.shift()
        //   console.log(  getAllSideBarOption[index].subMenu ) 
        }else{
            // console.log("Menu",getAllSideBarOption[i])
        }
        }
        // console.log(getAllSideBarOption)
        let sendData = [] 
        for(let i = 0 ; i < getAllSideBarOption.length; i++){
            if((getAllSideBarOption[i].link != null && getAllSideBarOption[i].parentId == null) ||( getAllSideBarOption[i].subMenu != undefined && getAllSideBarOption[i].subMenu.length > 0)){
                sendData.push(getAllSideBarOption[i])
            }
        }
        // console.log(sendData)
        return {
            msg: 'successfully Find',
            data: sendData
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}


async function updateSideBarOption(req){
    // console.log('updateSubject hitt');
    try{
        let sideBarId = req.params.id
        // console.log("Update LcdConfigId",LcdConfigId);
        let existSideBar = await sideBarData.find({$and: [{name : req.body.name, link : req.body.link,lcon : req.body.lcon }]});
        if(existSideBar.length){
            return {
                msg : "side bar already exist"
            }
        }else {
            const updatedSideBar = await sideBarData.findByIdAndUpdate(sideBarId,{$set:{name:req.body.name,link:req.body.link,icon:req.body.icon}});
            if(updatedSideBar!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedSideBar
                }
            }else{
                return {
                    msg : "Lcd Config not exist"
                }
            }
        }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

async function deleteideBarOption(req){
    // console.log('deleteSubject hitt');
    try{
        let LcdConfigId = req.params.id
        // console.log("LcdConfigId",LcdConfigId);
        const deletedLcdConfig = await sideBarData.findByIdAndDelete(LcdConfigId)
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

module.exports = {
    insertSideBarOption,
    getSideBarOption,
    updateSideBarOption,
    deleteideBarOption
}