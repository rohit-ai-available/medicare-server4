var mongoose=require("mongoose");
var userScheema=mongoose.Schema;
var userColSchema={
    email:String,
    dos:{type:Date, default:Date.now},
     contactNumber: String,
    frontFile: String,
    backFile: String,
}
var ver={
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var NeedyColRef=mongoose.model("needyCollection",userColshema); // create collectiion
 module.exports=NeedyColRef;