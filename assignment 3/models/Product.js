const mongoose=require('mongoose');
const productS=new mongoose.Schema({
    name:{type:String, required:true},
    category:{type:String, required:true},
    price:{type:Number, required:true},
    rating:{type:Number, default:0},
    stock:{type:Number, required:true}
})
module.exports=mongoose.model('product',productS)