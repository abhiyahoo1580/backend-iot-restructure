var mongoose  =  require('mongoose');
const { Schema } = mongoose;
function dynamicSchema(prefix){  
    if (!mongoose.models["historicalMeterValues"+prefix]) {
     const historicalSchema = new Schema({
            companyId :{type:Number},
            AssetId  :{type:String},
            Date  :{type:Number},
        })
        historicalSchema.index({  AssetId: 1, Date: -1 });
        historicalSchema.index({  AssetId: 1, Date: 1 });
        historicalSchema.index({  Date: 1 });
        historicalSchema.index({ AssetId: 1 });
        return mongoose.model( "historicalMeterValues"+prefix,historicalSchema,'historicalMeterValues' + prefix);
      }else{
        return mongoose.models["historicalMeterValues"+prefix]
      }   
}

module.exports = dynamicSchema;