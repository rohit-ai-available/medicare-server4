const path2 = require("path")
var userColRef=require("../Model/UserModel")
var DonercolRef=require("../Model/donerModel")
var AvailMediColRef=require("../Model/AvailMediModel")
var NeedyColRef=require("../Model/needyModel")
var AvailEquipColRef=require('../Model/availEquipment')
var sgMail=require("@sendgrid/mail")
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Make sure this is in your .env file
sgMail.setApiKey(process.env.PASS)
var jwt=require("jsonwebtoken")
var bcrypt=require("bcrypt")
var dotenv=require("dotenv")
dotenv.config()
// API setup
const logger = require("../utils/logger");
var otpStore= {};
var cloudinary2=require("cloudinary").v2;
 cloudinary2.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret,
})
const {Resend}=require('resend')
// razorpay ============
const Razorpay = require('razorpay');
const crypto = require('crypto');

// const resend=new Resend(process.env.Resend_key)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// functions start ====>
// ROUTE 1: Create an Order
async function order(req,resp){
  console.log("payment ***-***")
  console.log(req.body)
  console.log( process.env.RAZORPAY_KEY_ID,)
  console.log( process.env.RAZORPAY_KEY_SECRET)
    try {
        const options = {
            amount: req.body.amount * 100, // amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) return resp.status(500).send("Error creating order");
        
        resp.json(order);
        console.log("order send ")
    } catch (error) {
      console.log("error")
        resp.status(500).send(error);
    }
};
// ROUTE 2: Verify Payment (The Security Check)
async function ordervalidate(req,resp) {
  console.log("do varify****")
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create the expected signature using your Secret Key
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    // Compare our signature with Razorpay's signature
    if (digest !== razorpay_signature) {
      console.log("failed ***")
        return resp.status(400).json({ msg: "Transaction is not legit!" });
    }

    resp.json({
        msg: "Success",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    });
};

async function dosignup(req,resp){
       console.log("recieved body")
    //  logger.info("Signup request received");
       const {email,password,userType} = req.body;
       
   const token = crypto.randomBytes(32).toString("hex");
      const check=await userColRef.findOne({email:email})
      console.log(check)
      if(check){
      if(check.isVerified==true){
        console.log("yess verify")
        return resp.json({
    message:"already registered"
  });
      }
      
      else{
        console.log("not verify")
          await userColRef.findOneAndDelete({email:email})
          const user = await userColRef.create({
    email,
    password,
    userType,
    verifyToken: token
  });
      }
    }
    if(check==null){
      console.log("empty")
         const user = await userColRef.create({
    email,
    password,
    userType,
    verifyToken: token
  });
    }
        
  console.log("here  *********")
    const verifyLink = `https://medicare-server4.onrender.com/user/verify/${token}`;
                let transporter = nodemailer.createTransport({
                     host: "smtp-relay.brevo.com",
                    port: 2525,
                      secure: false, // Must be false for port 587
                         auth: {
                 // 1. This MUST be your exact Brevo SMTP Username string (e.g., "ae92cc001@smtp-brevo.com")
                   user: process.env.BREVO_EMAIL, 
    
                      // 2. This MUST be a valid "SMTP Key", NOT your Master Account Password or API Key v3
                       pass: process.env.BREVO_API_KEY, 
  },
                      tls: {
    rejectUnauthorized: false
  },
   connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});
              
transporter.verify()
  .then(() => console.log("SMTP READY"))
  .catch(err => console.log("SMTP FAILED:", err));
       
         const info=  await transporter.sendMail({
            from:process.env.EMAIL_ID,
            to:email,
            subject:"Your OTP Code",
            html:    `
<div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px; text-align: center;">
    <div style="max-width: 400px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
        
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700;">
            Verify Your Email
        </h2>

        <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">
            Thank you for creating an account. Please click the button below to verify your email address.
        </p>

        <a href="${verifyLink}" 
           style="display:inline-block; 
                  background:#4f46e5; 
                  color:white; 
                  padding:14px 25px; 
                  border-radius:8px; 
                  text-decoration:none;
                  font-weight:600;">
            Verify Email
        </a>

        <p style="color:#94a3b8; font-size:12px; margin-top:25px;">
            This verification link will expire soon.<br>
            If you did not create this account, please ignore this email.
        </p>

        <div style="margin-top:24px; padding-top:20px; border-top:1px solid #f1f5f9;">
            <span style="font-size:12px; color:#cbd5e1; font-weight:600;">
                Secure Portal Access
            </span>
        </div>

    </div>
</div>
`
           }) 
     return  resp.json({
    message:"verification email sent"
  });
   // resp.send("signup successfully********")
    // let userRef=userColRef(req.body)
    // userRef.save().then((docu)=>{
    //   console.log("+++++")
    //    logger.info("New user registered successfully");
    //     resp.json({status:true,msg:"Record saved",obj:docu})
    // }).catch((err)=>{
    //     logger.error(`Signup failed: ${err.message}`);
    //      resp.json({status:false,msg:err.message})
    // })
     
}
// email verification   
     
async function verifyEmail(req,res){
        console.log("entered *****")
  try{

    const {token} = req.params;

    console.log("Token from URL:", token);
    const user = await userColRef.findOne({
      verifyToken: token
    });
     

    if(!user){
      console.log("invalid verification link")
      return res.status(400).json({
        message:"invalid verification link"
      });
    }

     console.log("token found ********")
    user.isVerified = true;
    user.verifyToken = undefined;


    await user.save();

    // 3. Send the updated responsive HTML page pointing to your Netlify route
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Successful</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7f6;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .icon-container {
      background-color: #e8f5e9;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 24px;
    }
    .icon {
      color: #2e7d32;
      font-size: 40px;
      font-weight: bold;
    }
    h1 { color: #333333; font-size: 24px; margin-bottom: 12px; }
    p { color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
    .redirect-text {
      font-size: 14px;
      color: #999999;
      margin-top: 15px;
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="icon-container">
      <span class="icon">✓</span>
    </div>
    <h1>Email Verified!</h1>
    <p>Your email address has been successfully verified.</p>
    <p class="redirect-text">Taking you back to Medicare in <span id="countdown">4</span> seconds...</p>
  </div>

  <script>
    let seconds = 4;
    const countdownEl = document.getElementById('countdown');
    
    const interval = setInterval(() => {
      seconds--;
      if (seconds >= 0) {
        countdownEl.textContent = seconds;
      }
    }, 1000);

    // Redirecting accurately to your live Netlify frontend login page
    setTimeout(() => {
      clearInterval(interval);
      window.location.href = "https://medicare-rohit-available.netlify.app/login?verified=true"; 
    }, 4000);
  </script>

</body>
</html>
    `);

  }catch(error){

    res.status(500).json({
      message:"server error"
    });

  }

};

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
                   resp.json({status:true,msg:"Record saved",obj:docu});
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
  
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview', });
  
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

                       let transporter = nodemailer.createTransport({
                     host: "smtp-relay.brevo.com",
                    port: 2525,
                      secure: false, // Must be false for port 587
                         auth: {
                 // 1. This MUST be your exact Brevo SMTP Username string (e.g., "ae92cc001@smtp-brevo.com")
                   user: process.env.BREVO_EMAIL, 
    
                      // 2. This MUST be a valid "SMTP Key", NOT your Master Account Password or API Key v3
                       pass: process.env.BREVO_API_KEY, 
  },
                      tls: {
    rejectUnauthorized: false
  },
   connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});
              
transporter.verify()
  .then(() => console.log("SMTP READY"))
  .catch(err => console.log("SMTP FAILED:", err));
       
         const info=  await transporter.sendMail({
            from:process.env.EMAIL_ID,
            to:email,
            subject:"Your OTP Code",
            html:    `
<div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px; text-align: center;">
    <div style="max-width: 400px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.025em;">
            Verification Code
        </h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
            Please use the following code to complete your verification.
        </p>

        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px;">
                ${otp}
            </span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            This code will expire in 10 minutes.<br>
            If you did not request this code, please ignore this email.
        </p>
        
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
            <span style="font-size: 12px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                Secure Portal Access
            </span>
        </div>
    </div>
</div>
`
           })
         
         ///  sending email using resend key
    //   const {data, error}=await resend.emails.send({
    //     from:"onboarding@resend.dev",
    //     to:email,
    //     subject:"Your OTP Code",
    //     html: `<div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
    //          <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px;">
    //                ${otp}
    //        </span>
    //        </div>`
    //   })
    //      if(error){
    //       return resp.json({
    //   success: false,
    //   message: "Failed to send OTP",
    //   error,
    // });
    //      }
    // Email transporter
//     await sgMail.send({
//      to:email,
//      from:process.env.EMAIL_ID,
//      subject:"your otp",
//       html: `
// <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px; text-align: center;">
//     <div style="max-width: 400px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        
//         <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.025em;">
//             Verification Code
//         </h2>
//         <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
//             Please use the following code to complete your verification.
//         </p>

//         <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 24px;">
//             <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px;">
//                 ${otp}
//             </span>
//         </div>

//         <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
//             This code will expire in 10 minutes.<br>
//             If you did not request this code, please ignore this email.
//         </p>
        
//         <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
//             <span style="font-size: 12px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
//                 Secure Portal Access
//             </span>
//         </div>
//     </div>
// </div>
// `
//     });

     // Email message
    // const mailOptions = {
    //   from: process.env.EMAIL_ID,
    //   to: email,
    //   subject: "Your OTP Code",
    //   text: `Your OTP is: ${otp}`,
    // };
      // Send email
    // var info=await transporter.sendMail(mailOptions);
   
    // console.log(info)
   return resp.json({
      success: true,
      message: "OTP sent successfully to your email!",
    });
   } catch (error) {
    return resp.json({
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

   function validate(req,resp){
    console.log("hit++++++++++++++++++++++++")
    return resp.json({msg:"okkkk"})
   }

   const registerUser = async (req, res) => {
  try {

    // user registration code

    logger.info("New user registered successfully");

    res.status(201).json({
      message: "User registered"
    });

  } catch (error) {

    logger.error(error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

///google-login
function googlelogin(req, resp) {
  console.log("/google-login*********");
  console.log(req.body);

  const { credential } = req.body;

  if (!credential) {
    return resp.json({ status: false, msg: "Google token is missing" });
  }

  // 1. Verify the Google token
  client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID, 
  })
  .then((ticket) => {
    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name;

    console.log("Google user verified:", googleEmail);

    // 2. Look for the user in MongoDB using just their email
    return userColRef.findOne({ email: googleEmail }).then((docu) => {
      if (docu != null) {
        // User exists! Proceed to sign them in
        console.log("find =====>");
        let jsontoken = jwt.sign({ email: googleEmail }, process.env.SEC_KEY, { expiresIn: "1h" });
        resp.json({ status: true, msg: "Login successfully", obj: docu, token: jsontoken });
      } else {
        // User doesn't exist! Create a new account for them instantly
        console.log("not find, creating new user =====>");
        
        const newUser = {
          name: googleName,
          email: googleEmail,
          userType: "donor", // Default type so your React frontend layout functions correctly
          isVerified: true
        };

        return userColRef.insertOne(newUser).then((result) => {
          // If you are using Mongoose, change .insertOne to .create
          // Fetch the newly created user to send it back to the frontend
          return userColRef.findOne({ email: googleEmail }).then((newDocu) => {
            let jsontoken = jwt.sign({ email: googleEmail }, process.env.SEC_KEY, { expiresIn: "1h" });
            resp.json({ status: true, msg: "Account created and logged in!", obj: newDocu, token: jsontoken });
          });
        });
      }
    });
  })
  .catch((err) => {
    console.log("error =====>");
    console.error(err);
    resp.json({ status: false, msg: "Google Auth failed: " + err.message });
  });
}

// notification 
   const nodemailer = require('nodemailer');

async function requestmedicine(req, resp) {
  console.log(req.body);
  console.log("**************");
  
  const { medicineName, needyEmail, donorEmail } = req.body;

  // 1. Initialize the transporter
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525,
    secure: false, 
    auth: {
      user: process.env.BREVO_EMAIL, 
      pass: process.env.BREVO_API_KEY, 
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  try {
    // 2. Verify connection configuration (Optional but good for debugging)
    await transporter.verify();
    console.log("SMTP READY");

    // 3. Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_ID, // Your verified sender email
      to: donorEmail,             // Sending it to the donor to notify them
      subject: `Medicine Request: ${medicineName}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px; text-align: center;">
            <div style="max-width: 450px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                
                <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.025em;">
                    Medicine Requested!
                </h2>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
                    Someone has requested a medicine you listed.
                </p>

                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 24px; text-align: left;">
                    <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Medicine:</strong> ${medicineName}</p>
                    <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Requester:</strong> ${needyEmail}</p>
                </div>

                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                    Please coordinate with the recipient via their email to arrange delivery.<br>
                    Thank you for your generosity!
                </p>
                
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                    <span style="font-size: 12px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                        Medicine Donation Network
                    </span>
                </div>
            </div>
        </div>
      `
    });

    console.log("Email sent successfully:", info.messageId);
    
    // 4. Respond back to the frontend/client
    return resp.status(200).json({ 
      success: true, 
      message: "Medicine request email sent successfully!" 
    });

  } catch (error) {
    console.error("SMTP or Mail Sending FAILED:", error);
    
    return resp.status(500).json({ 
      success: false, 
      message: "Failed to send medicine request email." 
    });
  }
}
module.exports={dosignup,verifyEmail,dologin,DonerForm,DonerUpdate,donerfind,doavailmedi,doupdateAvailMedi,findtodo,
  dodeletemedi,needyrForm,needyupdate,picreader,medifinder,fetchFinderData,dochangePassword,doAvailEquipment,
  fetchcities,fetchequipmentData,getcontact,getotp,doverify,validate,order,ordervalidate,registerUser,googlelogin,requestmedicine}