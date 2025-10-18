const alertConfigData = require('./model');
const client = require('../../core').mqttClient;
const companyAssetData = require('../companyAsset/model')

// const mqtt = require('mqtt');
// var client = mqtt.connect("mqtt://elliotsystemsonline.com");


async function insertAlertConfig(req) {
    try {
        // client.publish("test111", "Hello mqttqqq");
     
        const alert = new alertConfigData(req.body);
        // console.log("alert", alert)
        let existAlertConfig = await alertConfigData.find({ $and: [{ CompanyId: req.body.CompanyId, AssetId: req.body.AssetId, Parameter: req.body.Parameter, RegisterId: req.body.RegisterId }] });
        if (existAlertConfig.length) {
            return {
                msg: "alert configuration already exist"
            }
        } else {
            const insertedalertConfig = await alert.save();
            if(insertedalertConfig.id){
             let result = await configAlertInGateway(req.body.AssetId)          
        }

            return {
                msg: 'successfully inserted',
                id: insertedalertConfig.id
            }
        }
    } catch (error) {
        console.log("error in insert alert Config", error);
        return Promise.reject(error);
    }
}


async function getAlertConfig(req) {
    try {
        const getAllAlertConfig = req.params.id ?
            await alertConfigData.find({ $and: [{ _id: req.params.id }] }) :
            req.query.companyId ?
                await alertConfigData.aggregate([{
                    $match: {
                        CompanyId: Number(req.query.companyId)
                    }
                },
                 {
                    $lookup: {
                        from: "parameters",
                        localField: "Parameter",
                        foreignField: "_id",
                        as: "ParameterName"
                    }
                },
                {
                    $unwind:"$ParameterName"
                }, 
                {
                    $lookup: {
                        from: "companyAssets",
                        localField: "AssetId",
                        foreignField: "AssetId",
                        as: "AssetName"
                    }
                }, 
                {
                    $unwind: "$AssetName"
                }, {
                    $project :{
                        CompayId:1,
                        AssetId:1,
                        Parameter:1,
                        RegisterId:1,
                        upperThresholdValue:1,
                        lowerThresholdValue:1,
                        lowerThresholdWarning:1,
                        upperThresholdWarning:1,
                        ParameterName: "$ParameterName.Name",
                        AssetName:"$AssetName.AssetName"
                    }
                }




                ]) :
                await alertConfigData.find();
                return {
            msg: 'successfully Find',
            data: getAllAlertConfig
        }
    } catch (error) {
        console.log('error occure in get alert Config', error);
        return Promise.reject(error)
    }
}


async function updateAlertConfig(req) {
    try {
        let AlertConfigId = req.params.id;
        const updatedAlertConfig = await alertConfigData.findByIdAndUpdate(AlertConfigId, { $set: req.body });
        if (updatedAlertConfig != null) {
            if(updatedAlertConfig.id){
                let result = await configAlertInGateway(req.body.AssetId)          
           }
            return {
                msg: 'Updated Successfully ',
                data: updatedAlertConfig
            }
        } else {
            return {
                msg: "Alert Config not exist"
            }
        }
    } catch (error) {
        console.log('error occure in update alert Config', error);
        return Promise.reject(error)
    }
}

async function deleteAlertConfig(req) {
    try {
        let AlertConfigId = req.params.id
        const deletedAlertConfig = await alertConfigData.findByIdAndDelete(AlertConfigId)
        if(deletedAlertConfig.id){
            let result = await configAlertInGateway(req.body.AssetId)          
       }
        return {
            msg: 'Deleted successfully ',
            data: deletedAlertConfig
        }
    } catch (error) {
        console.log('error occure in delete AlertConfig', error);
        return Promise.reject(error)
    }
}


async function configAlertInGateway(AssetId){
    try{
        const   getAllAlertConfig =    await alertConfigData.aggregate([{
            $match: {
                AssetId: AssetId
            }},
            {
                $lookup: {
                    from: "companyAssets",
                    localField: "AssetId",
                    foreignField: "AssetId",
                    as: "AssetDetail"
                }
            }
        ])

    // console.log(getAllAlertConfig)
    const temp = getAllAlertConfig.filter(reg => reg.Parameter == 9);
    const humidity = getAllAlertConfig.filter(reg => reg.Parameter == 10);
    if(temp.length > 0 || humidity.length > 0  ){
    // obj = 
      obj ={
        "103" : temp.length > 0 ? temp[0].upperThresholdValue : 100000,
        "104" :temp.length > 0 ? temp[0].lowerThresholdValue : 100000,
        "105" :humidity.length > 0 ? humidity[0].upperThresholdValue : 100000,
        "106" : humidity.length > 0 ? humidity[0].lowerThresholdValue : 100000 
    } 
    topic =  "ELLIOT/TMA/"+getAllAlertConfig[0].AssetDetail[0].Gateway + "/ALERT/UPDATE"
    // console.log(temp,humidity,JSON.stringify(obj))
    client.publish(topic, JSON.stringify(obj), (error) => {
        if (error) {
        //   console.log('Error publishing message:', error);
        } else {
        //   console.log(`Message published to topic test111"`);
        }
      });
      return true;
    }else{
        // companyAsset
        const   AssetDetails =    await companyAssetData.aggregate([{
            $match: {
                AssetId: AssetId
            }},
        ])
        // console.log(AssetDetails)
        if(AssetDetails.length > 0){
            obj ={
                "103" :  100000,
                "104" :  100000,
                "105" :  100000,
                "106" :  100000 
            } 
            topic =  "ELLIOT/TMA/"+AssetDetails[0].Gateway + "/ALERT/UPDATE"
            // console.log(temp,humidity,JSON.stringify(obj))
            client.publish(topic, JSON.stringify(obj), (error) => {
                if (error) {
                //   console.log('Error publishing message:', error);
                } else {
                //   console.log(`Message published to topic test111"`);
                }
              });
              return true;
        }
    }


    }catch(error){
        console.log(error)
    }
}
module.exports = {
    insertAlertConfig,
    getAlertConfig,
    updateAlertConfig,
    deleteAlertConfig,
}