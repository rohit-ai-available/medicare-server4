const path2 = require("path")
var userColRef=require("../Model/UserModel")
var DonercolRef=require("../Model/donerModel")
var AvailMediColRef=require("../Model/AvailMediModel")
var NeedyColRef=require("../Model/needyModel")
var AvailEquipColRef=require('../Model/availEquipment')
var jwt=require("jsonwebtoken")
var bcrypt=require("bcrypt")
var dotenv=require("dotenv")
dotenv.config()
var nodemailer=require('nodemailer')
var otpStore= {};
var cloudinary2=require("cloudinary").v2;
 cloudinary2.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret,
})
// functions start ====>
function dosignup(req,resp){
    console.log("recieved body")
    console.log(req.body)
   // resp.send("signup successfully********")
    let userRef=userColRef(req.body)
    userRef.save().then((docu)=>{
      console.log("+++++")
        resp.json({status:true,msg:"Record saved",obj:docu})
    }).catch((err)=>{
         resp.json({status:false,msg:err.message})
    })
     
}

function dologin(req,resp){
       console.log(req.body)
       userColRef.findOne({email:req.body.email,password:req.body.password}).then((docu)=>{
         if(docu!=null){
          console.log("find =====>")
             let jsontoken=jwt.sign({email:req.body.email},process.env.SEC_KEY,{expiresIn:"1h"})
           resp.json({status:true,msg:"Login successfully",obj:docu,token:jsontoken})
         }
         else{
           console.log("not find  =====>")
              resp.json({status:false,msg:"Invalid Id and Password"});
         }
       }).catch((err)=>{
         console.log("error =====>")
            resp.json({status:false,msg:err.message});
       })  
   // resp.send(req.query.txtemail+"   "+req.query.txtpsw+"  logedup successfully");
} 
   async function DonerForm(req,resp){
     let fileName="";
      let fileName2="";
     console.log("yes=====>")
     console.log(req.body)
   
     console.log(req.files!=null)
          if(req.files!=null){
           let path1=path2.join(__dirname,"..","uploads",req.files.aadhaarCard.name)
          await req.files.aadhaarCard.mv(path1)
             await cloudinary2.uploader.upload(path1).then(function(picUrlResult){
            fileName=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });
               let path11=path2.join(__dirname,"..","uploads",req.files.profilePic.name)
              await req.files.profilePic.mv(path11)
              await cloudinary2.uploader.upload(path11).then(function(picUrlResult){
            fileName2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });

            console.log("File Uploaded Successfullyy");
          }
           else
              fileName="nopic.jpg"
          req.body.aadhaarCard=fileName;
          req.body.profilePic=fileName2;
            var UserCol=new DonercolRef(req.body);
                 UserCol.save().then((docu)=>{
                   resp.json({status:true,msg:"Record saved",obj:docu});
                 }).catch((err)=>{
                   resp.json({status:false,msg:err.message})
                 })
       //   req.body.ppic=fileName
          // resp.json({status:true,msg:"record saved",obj:req.body})
}
// doner update
 async function DonerUpdate(req,resp){
     let fileName="";
     let fileName2=""; 
     console.log(req.body)
     if(req.files!=null){
               console.log("333333")
                  let path1=path2.join(__dirname,"..","uploads",req.files.profilePic.name)
              await req.files.profilePic.mv(path1)

                await cloudinary2.uploader.upload(path1).then(function(picUrlResult){
            fileName=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });

             let path11=path2.join(__dirname,"..","uploads",req.files.aadhaarCard.name)
              await req.files.aadhaarCard.mv(path11)
              await cloudinary2.uploader.upload(path11).then(function(picUrlResult){
            fileName2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
           
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });

            console.log("File Uploaded Successfullyy");
     }
     // update
          req.body.profilePic=fileName;
          req.body.aadhaarCard=fileName2;
        DonercolRef.updateOne({email:req.body.email},{$set:{name:req.body.name,
          age:req.body.age,gender:req.body.gender,currentAddress:req.body.currentAddress,currentCity:req.body.currentCity,
          contactNumber:req.body.contactNumber,qualification:req.body.qualification,occupation:req.body.occupation
        }}).then((docu)=>{
              if(docu!=null){
                resp.json({status:true,msg:"Record updated "})
              }
              else{
                   resp.json({status:false,msg:"Invalid Id "});
              }
            }).catch((err)=>{
                 resp.json({status:false,msg:err.message});
            })
  }

  // find record
          // find record
   async function donerfind(req,resp){
      console.log("dofind======")
      console.log(req.body)
        await DonercolRef.find({email:req.body.email}).then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
    // function Availd medicine

    function doavailmedi(req,resp){
      console.log(req.body)
           var UserCol=new AvailMediColRef(req.body);
                 UserCol.save().then((docu)=>{
                  // let jsontoken=jwt.sign({email:req.body.email},process.env.SEC_KEY,{expiresIn:"1m"})
                   resp.json({status:true,msg:"Record saved",obj:docu,token:jsontoken});
                 }).catch((err)=>{
                   resp.json({status:false,msg:err.message})
                 })
    }

    // avail medicine detail update
     function doupdateAvailMedi(req,resp){
        console.log(req.body)
                AvailMediColRef.updateOne({email:req.body.email},{$set:{medicine:req.body.medicine,
          company:req.body.company,expiryDate:req.body.expiryDate,packing:req.body.packing,quantity:req.body.quantity,
          city:req.body.city,
          otherInformation:req.body.otherInfo,
        }}).then((docu)=>{
              if(docu!=null){
                resp.json({status:true,msg:"Record updated "})
              }
              else{
                   resp.json({status:false,msg:"Invalid Id "});
              }
            }).catch((err)=>{
                 resp.json({status:false,msg:err.message});
            })      
     }
     // find avail medicine form detail in todo list
        async function findtodo(req,resp){
      console.log("dofind======")
      let email=req.body;
      console.log(req.body.email)
        await AvailMediColRef.findOne({email:req.body.email}).then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            console.log(docu)
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
    // delete available medicine details
            async function dodeletemedi(req,resp){
      console.log("dofind======")
      console.log(req.body.email)
        await AvailMediColRef.findOneAndDelete({email:req.body.email}).then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            console.log(docu)
            resp.json({msg:"Record Deleted"})
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
    // needy profile save
     async function needyrForm(req,resp){
     let fileName="";
      let fileName2="";
     console.log("yes=====>")
     console.log(req.body)
          if(req.files!=null){
             console.log("===--++++")
           let path1=path2.join(__dirname,"..","uploads",req.files.frontFile.name)
          await req.files.frontFile.mv(path1)
             let path11=path2.join(__dirname,"..","uploads",req.files.backFile.name)
              await req.files.backFile.mv(path11)
             await cloudinary2.uploader.upload(path1).then(function(picUrlResult){
            fileName=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            }).catch((err)=>{
               console.log("error  "+JSON.stringify(err))
            });
              await cloudinary2.uploader.upload(path11).then(function(picUrlResult){
            fileName2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName2);
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });

            console.log("File Uploaded Successfullyy");
          }

          req.body.frontFile=fileName;
          req.body.backFile=fileName2;
            var UserCol=new NeedyColRef(req.body);
                 UserCol.save().then((docu)=>{
                   resp.json({status:true,msg:"Record saved",obj:docu});
                 }).catch((err)=>{
                   resp.json({status:false,msg:err.message})
                 })
       //   req.body.ppic=fileName
          // resp.json({status:true,msg:"record saved",obj:req.body})
}
///    update needy profile
  async function needyupdate(req,resp){
      console.log(req.body)
        if(req.files!=null){
             console.log("===--++++")
           let path1=path2.join(__dirname,"..","uploads",req.files.frontFile.name)
          await req.files.frontFile.mv(path1)
             let path11=path2.join(__dirname,"..","uploads",req.files.backFile.name)
              await req.files.backFile.mv(path11)
             await cloudinary2.uploader.upload(path1).then(function(picUrlResult){
            fileName=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            }).catch((err)=>{
               console.log("error  "+JSON.stringify(err))
            });
              await cloudinary2.uploader.upload(path11).then(function(picUrlResult){
            fileName2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName2);
            }).catch((err)=>{
               console.log(JSON.stringify(err))
            });

            console.log("File Uploaded Successfullyy");
          }
          req.body.frontFile=fileName;
          req.body.backFile=fileName2;
            AvailMediColRef.updateOne({email:req.body.email},{$set:{contactNumber:req.body.contactNumber,
          frontFile:req.body.frontFile,backFile:req.body.backFile,
        }}).then((docu)=>{
              if(docu!=null){
                resp.json({status:true,msg:"Record updated "})
              }
              else{
                   resp.json({status:false,msg:"Invalid Id "});
              }
            }).catch((err)=>{
                 resp.json({status:false,msg:err.message});
            })      
  }
  //analyzeImage code
 async function analyzeImage (req,resp){
    try {
    const fileBuffer = files[0].buffer;          // Take first file
    const base64Image = fileBuffer.toString('base64');
    const mimeType = files[0].mimetype;

    // Call Gemini Vision API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: 'Describe this image.',
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No result';

    res.json({ geminiResult: geminiText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  }
  /// pic reader code
  
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI);
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  async function RajeshBansalKaChirag(imgurl)
  {
  const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {address:'',adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
      const imageResp = await fetch(imgurl)
          .then((response) => response.arrayBuffer());
  
      const result = await model.generateContent([
          {
              inlineData: {
                  data: Buffer.from(imageResp).toString("base64"),
                  mimeType: "image/jpeg",
              },
          },
          myprompt,
      ]);
      console.log(result.response.text())
              
              const cleaned = result.response.text().replace(/```json|```/g, '').trim();
              console.log(cleaned)
              const jsonData = JSON.parse(cleaned);
              console.log(jsonData);
  
      return jsonData
  
  }
  //=============
  
  async function picreader(req, resp) {
    console.log("pic reader***********")
      let fileName;
      if (req.files != null) 
          {
        console.log("file yes**********")
          //fileName = req.files.imggg.name;
        //  let locationToSave = __dirname + "/uploads/" + fileName;//full ile path
          
       //   req.files.imggg.mv(locationToSave);//saving file in uploads folder
              let locationToSave=path2.join(__dirname,"..","uploads",req.files.imggg.name)
          await req.files.imggg.mv(locationToSave)
          
          //saving ur file/pic on cloudinary server
          try{
          await cloudinary2.uploader.upload(locationToSave).then(async function (picUrlResult) 
          {      
              console.log("file upload")
               console.log(picUrlResult.url);   
  
              let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
              
              resp.send(jsonData);//save in database
  
          });
  
         
          }
          catch(err)
          {
              resp.send(err.message)
          }
  
      }
  }
  /// fetch cities
   async function medifinder(req,resp){
     // console.log("chl reha ga finder wala")
        await AvailMediColRef.distinct('city').then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+JSON.stringify(docu) )
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------"+err.message)
           resp.json({status:false,msg:err.message})
         })
    }
   async function fetchFinderData(req,resp){
      console.log(req.body)
         await AvailMediColRef.find({city:req.body.city,medicine:req.body.medicine}).then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
   async function dochangePassword(req,resp){
      console.log("yes====>"+JSON.stringify(req.body))
        await userColRef.findOne({email:req.body.email,password:req.body.currentPassword}).then((docu)=>{
          if(docu!=null){
            userColRef.updateOne({email:req.body.email},{$set:{password:req.body.confirmPassword}}).then((docu)=>{
               console.log("updated"+JSON.stringify(docu) )
              resp.json({status:true,msg:"Password Successfully Changed"})
            })
          }
          else{
              console.log("+++++")
             resp.json({status:false,msg:"Wrong Email Id or Password"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
    // equipments available
    function doAvailEquipment(req,resp){
       console.log(req.body)
       let userRef=AvailEquipColRef(req.body)
    userRef.save().then((docu)=>{
        resp.json({status:true,msg:"Record saved",obj:docu})
    }).catch((err)=>{
         resp.json({status:true,msg:err.message})
    })
} 
// equipment code start here 
/// fetch cities
   async function fetchcities(req,resp){
      console.log("chl reha ga finder wala")
        await AvailEquipColRef.distinct('city').then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+JSON.stringify(docu) )
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------"+err.message)
           resp.json({status:false,msg:err.message})
         })
    }
     async function fetchequipmentData(req,resp){
      console.log(req.body)
         await AvailEquipColRef.find({city:req.body.city,equipmentName:req.body.equipmentName}).then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            resp.json(docu)
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }
    // get contact number 
     async function getcontact(req,resp){
      console.log("====> "+req.body.email)
              await DonercolRef.findOne({email:req.body.email}).select('contactNumber').then((docu)=>{
          if(docu!=null){
            console.log("*******8888  "+docu )
            resp.json({status:true,msg:'Record saved',obj:docu})
          }
          else{
              console.log("+++++")
              resp.json({status:false,msg:"Record dont exist"})
          }
         }).catch((err)=>{
            console.log("------")
           resp.json({status:false,msg:err.message})
         })
    }

    //get otp
     async function getotp(req,resp){
   // console.log(process.env.EMAIL_ID)
    console.log(req.body.email)
   
    try {
    const {email}=req.body;
    //console.log(email)
    const otp=Math.floor(100000 + Math.random() * 900000)
    console.log(otp)

      otpStore[email] = otp;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASS, // Gmail App Password
      },
    });

     // Email message
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    };
      // Send email
    var info=await transporter.sendMail(mailOptions);
   
    // console.log(info)
    resp.json({
      success: true,
      message: "OTP sent successfully to your email!",
    });
   } catch (error) {
    resp.json({
      success: false,
      message: "Failed to send OTP",
      error,
    });
  } 
   }

    // do verify 
   function doverify(req,resp){
    const {email,otp}=req.body;
       console.log("verify***"+email+"  "+otp)
    if(!otpStore[email]){
     return resp.json({
        success:false,
        message:"otp not found or expired"
      })
    }
    if(otpStore[email]==otp){
       console.log("++++")
       userColRef.findOne({email:email}).then((docu)=>{
        console.log("inside")
        if(docu){
            let jsontoken=jwt.sign({email:email},process.env.SEC_KEY,{expiresIn:"1h"})
           delete otpStore[email]
            return resp.json({
        success:true,
        message:"otp verified successfully",
        obj:docu,
        token:jsontoken
      })
        }
        else{
            return resp.json({
        success:false,
        message:"email id doesnt exist",
      })

        }
       }).catch((err)=>{
        return resp.json({success:false,msg:err.message})
       })
      // delete otpStore[email]
       
    }
    else{
       console.log("-==")
     return resp.json({
        success:false,
        message:"your otp is incorrect"
      })
    }
   }
module.exports={dosignup,dologin,DonerForm,DonerUpdate,donerfind,doavailmedi,doupdateAvailMedi,findtodo,
  dodeletemedi,needyrForm,needyupdate,picreader,medifinder,fetchFinderData,dochangePassword,doAvailEquipment,
  fetchcities,fetchequipmentData,getcontact,getotp,doverify}