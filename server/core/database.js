const mongoose = require('mongoose');
const config  = require('../../config')
mongoose.connect(
    config.DATABASE.URL+config.DATABASE.NAME,
    { useNewUrlParser : true, useUnifiedTopology: true },
    err =>{
        if(!err){
            console.log("mongodb connected successfully", );
        } else {
            console.log("mongodb connect:" + JSON.stringify(err, undefined, 2));
        }
    }

);

module.exports = mongoose;