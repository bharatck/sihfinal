const mongoose=require('mongoose');

const Schema=mongoose.Schema;


const BagSchema=new Schema({

    tag:{
       type: String
    }
});



module.exports=mongoose.model('bags', BagSchema);


