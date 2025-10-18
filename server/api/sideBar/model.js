const mongoose = require('mongoose');


var sideBarData = mongoose.model("sideBar",{
    name  : {type:String ,required: [true, "Name is required"]  },
    icon  :{type:String,required: [true, "Icon is required"] },
    link  :{type:String,default: null },
    parentId  :{type:mongoose.Schema.Types.ObjectId, default: null  }  
});

module.exports = sideBarData;