var mongoose=require("mongoose");
var userScheema=mongoose.Schema;
var userColSchema={
    email:{type:String , required:true,index:true,unique:true},
    password: String,
    dos:{type:Date, default:Date.now},
    userType:String
};
var ver={
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var userColRef=mongoose.model("userCollectionNew",userColshema); // create collectiion
 module.exports=userColRef;