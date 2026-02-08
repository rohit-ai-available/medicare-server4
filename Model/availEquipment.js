var mongoose=require("mongoose");
var userScheema=mongoose.Schema;
var userColSchema={
    dos:{type:Date, default:Date.now},
   equipmentName: String,
    quantity: String,
    description: String,
    city: String,
    number:String
};
var ver={
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var AvailEquipColRef=mongoose.model("AvailEquipment",userColshema); // create collectiion
 module.exports=AvailEquipColRef;