var mongoose=require("mongoose");
var userScheema=mongoose.Schema;
var userColSchema={
    email:{type:String , required:true,index:true,unique:true},
    dos:{type:Date, default:Date.now},
     name: String,
    age: String,
    gender: String,
    currentAddress: String,
    contactNumber: String,
    qualification: String,
    occupation: String,
    aadhaarCard: String,
    profilePic: String
};
var ver={
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var DonerColRef=mongoose.model("DonerCollection",userColshema); // create collectiion
 module.exports=DonerColRef;