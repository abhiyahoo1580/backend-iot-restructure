const meterGroupData = require('./model');

async function insertMeterGroup(req){
    try{
        const meterGroup = new meterGroupData(req.body);     
         let existMeterGroup = await meterGroupData.find({$and: [{CompanyId : req.body.CompanyId, Name : req.body.Name }]});
         if(existMeterGroup.length){
            return {
                msg : "meter group already exist"
            }
        }else {
            const insertedMeterGroup = await meterGroup.save();
            return {
                msg: 'meter Group successfully inserted',
                id: insertedMeterGroup.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getMeterGroup(req){
    try{
        const getAllmeterGroup = req.params.id? await meterGroupData.find({_id:req.params.id})
        :req.query.companyId? await meterGroupData.aggregate([ 
            {
                '$match': {
                    'CompanyId': Number(req.query.companyId),
              
                }
                
            },
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'AssetId',
                    'foreignField': 'AssetId',
                    'as': 'AssetData'
                }
            },
            {$project :{Name:1,CompanyId : 1 ,"AssetData.AssetId" : 1,"AssetData.AssetName" : 1  }}
        ]) 
        :await meterGroupData.find({});
        // console.log(getAllmeterGroup)
        return {
            msg: 'successfully Find',
            data: getAllmeterGroup
        }
    }catch (error){
        console.log('error occure in get meterGroup',error);
        return Promise.reject('error occure in get meterGroup')
    }
}
// updateMeterGroup
async function updateMeterGroup(req){
    try{
   
        let meterGroupId = req.params.id       
        const updatedmeterGroup = await meterGroupData.findByIdAndUpdate(meterGroupId,{$set:{Name:req.body.Name,AssetId:req.body.AssetId}});
        if(updatedmeterGroup!=null){
            return {
                msg: 'Updated Successfully ',
                data: updatedmeterGroup
            }       
    }
    }catch (error){
        console.log('error occure in updatemeterGroup',error);
        return Promise.reject('error occure in updatemeterGroup')
    }
}

// deleteMeterGroup
async function deleteMeterGroup(req){
    try{
        const meterGroupId = req.params.id        
        const deletedmeterGroup = await meterGroupData.findByIdAndDelete(meterGroupId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in deleteMeterGroup',error);
        return Promise.reject('error occure in deleteMeterGroup')
    }
}

module.exports = {
    insertMeterGroup,
    getMeterGroup,
    updateMeterGroup,
    deleteMeterGroup
}