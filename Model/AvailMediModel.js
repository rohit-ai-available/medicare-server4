var mongoose=require("mongoose");
var userScheema=mongoose.Schema;
var userColSchema={
    dos:{type:Date, default:Date.now},
    email: String,
    medicine: String,
    company: String,
    expiryDate: String,
    packing: String,
    quantity: String,
    city:String,
    otherInfo: String
};
var ver={
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var AvailMediColRef=mongoose.model("AvailMediCollection",userColshema); // create collectiion
 module.exports=AvailMediColRef;