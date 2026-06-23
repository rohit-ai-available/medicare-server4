var mongoose=require("mongoose");
const MessageSchema = new mongoose.Schema({
  roomID: { type: String, required: true }, // e.g., "painkiller_delhi_needy_donor"
  medicineName: { type: String, required: true },
  city: { type: String, required: true },
  needyEmail: { type: String, required: true },
  donorEmail: { type: String, required: true },
  senderEmail: { type: String, required: true }, // Who actually typed this message
  text: { type: String, required: true }
}, { timestamps: true });
var ver={ 
    versionkey:false  // to avoid __v fieild in table come by default
}
var userColshema=new userScheema(userColSchema,ver);
 var DonerColRef=mongoose.model("DonerCollection",userColshema); // create collectiion
 module.exports=DonerColRef;