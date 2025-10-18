const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');


// var sideBarData = mongoose.model("sideBar",{
//     name  : {type:String ,required: [true, "Name is required"]  },
//     icon  :{type:String,required: [true, "Icon is required"] },
//     link  :{type:String,default: null },
//     parentId  :{type:mongoose.Schema.Types.ObjectId, default: null  }  
// });

// module.exports = sideBarData;

var sideBarConfigData = mongoose.model("sideBarConfig", {
    CompanyId : {
      type : Number,
      require : [true, "Device is required"]
    },
    Type : {type  : Number},
    SideBar : {
      type : [ObjectID],
      required : [true, "At least one parameter is required"]
    }
    });
    
    module.exports = sideBarConfigData;