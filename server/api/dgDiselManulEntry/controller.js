const DiselManulEntryData = require('./model');

async function insertDiselManulEntry(req){
    try{
        const DiselManulEntry = new DiselManulEntryData(req.body);     
         let existDiselManulEntry  = await DiselManulEntryData.find({$and: [{assetId : req.body.assetId, date : req.body.date }]});
         if(existDiselManulEntry .length){
            return {
                msg : "Disel manul entry already exist"
            }
        }else {
            const insertedDiselManulEntry = await DiselManulEntry.save();
            return {
                msg: 'Disel manul entry successfully inserted',
                id: insertedDiselManulEntry.id
            }
        }
    }catch(error){
        return Promise.reject(error);
    }
}

async function getDiselManulEntry(req){
    try{
        // let time = Number(req.query.fDate);
        let fDate = Number(req.query.fDate);
        let tDate = Number(req.query.tDate);
        // let fDate = date;       
        // let tDate = new Date(time).setHours(23, 59, 59, 0)   
        const getAllDiselManulEntry = await DiselManulEntryData.aggregate([ 
            {
                '$match': {
                    'assetId': req.query.assetId,
                    'date': { '$gte': fDate, '$lte': tDate }
                }
                
            },
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'assetId',
                    'foreignField': 'AssetId',
                    'as': 'AssetData'
                }
            },
            {$project :{diselRecived:1,diselLevel : 1 ,"AssetData.AssetId" : 1,"AssetData.AssetName" : 1 ,date: 1 }}
        ]) ;
        // console.log(getAllmeterGroup)
        return {
            msg: 'successfully Find',
            data: getAllDiselManulEntry
        }
    }catch (error){
        console.log('error occure in get DiselManulEntry',error);
        return Promise.reject('error occure in get DiselManulEntry')
    }
}

async function getDiselManulEntryForReport(assetId,fDate,tDate){
    try{
        // let time = Number(req.query.fDate);
        // let fDate = Number(req.query.fDate);
        // let tDate = Number(req.query.tDate);
        // let fDate = date;       
        // let tDate = new Date(time).setHours(23, 59, 59, 0)   
        const getAllDiselManulEntry = await DiselManulEntryData.aggregate([ 
            {
                '$match': {
                    'assetId': assetId,
                    'date': { '$gte': fDate, '$lte': tDate }
                }
                
            },
            {
                '$lookup': {
                    'from': 'companyAssets',
                    'localField': 'assetId',
                    'foreignField': 'AssetId',
                    'as': 'AssetData'
                }
            },
            {$project :{diselRecived:1,diselLevel : 1 ,"AssetData.AssetId" : 1,"AssetData.AssetName" : 1 ,date: 1 }}
        ]) ;
        // console.log(getAllmeterGroup)
        return {
            msg: 'successfully Find',
            data: getAllDiselManulEntry
        }
    }catch (error){
        console.log('error occure in get DiselManulEntry',error);
        return Promise.reject('error occure in get DiselManulEntry')
    }
}

// updateMeterGroup
async function updateDiselManulEntry(req){
    try{
   
        let DiselManulEntryId = req.params.id       
        const updateddiselManulEntry = await DiselManulEntryData.findByIdAndUpdate(DiselManulEntryId,{$set:{diselLevel:req.body.diselLevel,diselRecived:req.body.diselRecived}});
        if(updateddiselManulEntry!=null){
            return {
                msg: 'Updated Successfully ',
                data: updateddiselManulEntry
            }       
    }
    }catch (error){
        console.log('error occure in updatemeterGroup',error);
        return Promise.reject('error occure in updatemeterGroup')
    }
}

// deleteMeterGroup
async function deleteDiselManulEntry(req){
    try{
        const DiselManulEntryId = req.params.id        
        const deletedDiselManulEntry = await DiselManulEntryData.findByIdAndDelete(DiselManulEntryId);
        return {
            msg: 'Deleted successfully '
        }
    }catch (error){
        console.log('error occure in Disel Manul Entry',error);
        return Promise.reject('error occure in Disel Manul Entry')
    }
}

module.exports = {
    insertDiselManulEntry,
    getDiselManulEntry,
    updateDiselManulEntry,
    deleteDiselManulEntry,
    getDiselManulEntryForReport
}