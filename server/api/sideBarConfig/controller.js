const sideBarConfigData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash')


async function insertSideBarOptionConfig(req){
    try{
        const sideBarConfig = new sideBarConfigData(req.body);     
         let existSideBarConfig = await sideBarConfigData.find({$and: [{CompanyId : Number(req.body.CompanyId) ,Type  : Number(req.body.Type)}]});
         if(existSideBarConfig.length){
            return {
                msg : "side bar config already exist"
            }
        }else {
            const insertedSideBarConfig = await sideBarConfig.save();
            return {
                msg: 'side bar config successfully inserted',
                id: insertedSideBarConfig.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getSideBarOptionConfig(req){
    try{
        
        const getAllSideBarConfigByCompany = await sideBarConfigData.aggregate([
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),    
                    'Type' : Number(req.query.Type)               
                }
            },
            {
            $lookup: {
                from: "sidebars",
                localField: "SideBar",
                foreignField: "_id",
                as: "SideBarData"
            }
        },
        ])


        // console.log(getAllSideBarConfigByCompany)
if(getAllSideBarConfigByCompany.length > 0){
    getAllSideBarOption = getAllSideBarConfigByCompany[0].SideBarData
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
        }
        


return {
            msg: 'successfully Find',
            data: []
        }
    }catch (error){
        console.log('error occure in get graphGroup',error);
        return Promise.reject('error occure in get graphGroup')
    }
}

// async function updateSideBarOptionConfig(req){
//     try{
//         let SideBarConfigId = req.params.id
//             const updatedGraphGroup = await graphGroupData.findByIdAndUpdate(SideBarConfigId,{$set:{ParameterId:req.body.ParameterId}});
//         if(updatedGraphGroup!=null){
//             return {
//                 msg: 'Updated Successfully ',
//                 data: updatedGraphGroup
//             }
//         // }else{
//         //     return {
//         //         msg : "graph group not exist"
//         //     }
//         // }
//     }
//     }catch (error){
//         console.log('error occure in updategraphGroup',error);
//         return Promise.reject('error occure in updategraphGroup')
//     }
// }

// async function deleteideBarOptionConfig(req){
//     try{
//         const graphGroupId = req.params.id
//         console.log("graphGroupId",graphGroupId);
//         const deletedgraphGroup = await graphGroupData.findByIdAndDelete(graphGroupId);
//         return {
//             msg: 'Deleted successfully '
//         }
//     }catch (error){
//         console.log('error occure in deletegraphGroup',error);
//         return Promise.reject('error occure in deletegraphGroup')
//     }
// }

module.exports = {
    insertSideBarOptionConfig,
    getSideBarOptionConfig,
    // updateSideBarOptionConfig
    // deleteideBarOptionConfig
}

