const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemParameterSequenceSchema = new Schema({
    userId : {type: Schema.Types.ObjectId ,required: true },
    assetId : {type:String , required: true },
    date : {type:Number , default : new Date(new Date()), required: true},
    parameterId: { type: Number, required: true },
    sequence: { type: Number, required: true }
 },{ timestamps: true })
oemParameterSequenceSchema.index({ assetId: 1 });
// oemParameterSequenceSchema.index({ assetId: 1 ,parameter: 1, registerId: 1}, { unique: true });
oemParameterSequenceSchema.index({ userId : 1});
var oemParameterSequence = mongoose.model("oemParameterSequenceConfig",oemParameterSequenceSchema,'oemParameterSequenceConfig');

module.exports = oemParameterSequence;

// module.exports = assetData;

