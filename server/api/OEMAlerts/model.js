const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const oemAlertsSchema = new Schema({
    // userId : {type: Schema.Types.ObjectId ,required: true },
    assetId : {type:String , required: true },
    description : {type:String , required: true },
    parameterId : {type:Number  },
    value : {type:Number  },
    threshold : {type:Number  },
    time : {type:Number , required: true},
    // type: {type:String  },
    category : {type:Number  },
    read : {type:Boolean, default: false},
   
},{ timestamps: true })
var oemAlerts = mongoose.model("oemAlerts",oemAlertsSchema,'oemAlerts');

module.exports = oemAlerts;

// module.exports = assetData;

